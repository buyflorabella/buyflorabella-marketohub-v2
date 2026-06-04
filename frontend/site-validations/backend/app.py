"""Flask Web UI for the Site Validations Toolkit."""

import json
import os
import subprocess
import tempfile
from datetime import datetime

from flask import (
    Flask,
    Response,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    send_from_directory,
    session,
    stream_with_context,
    url_for,
)

from auth import login_required, verify_credentials
from config import (
    CONFIG_FILE,
    DEBUG,
    HOST,
    OUTPUT_DIR,
    PORT,
    SECRET_KEY,
    VALID_COMMANDS,
    VALIDATOR_SCRIPT,
)

app = Flask(__name__)
app.secret_key = SECRET_KEY


# Handle stale SocketIO polling from cached JS — return the error format
# that the SocketIO client recognizes as fatal, so it stops retrying.
@app.route("/socket.io/")
def socketio_gone():
    return jsonify({"code": 0, "message": "Transport unknown"}), 400


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------

@app.route("/login", methods=["GET", "POST"])
def login():
    if session.get("logged_in"):
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        if verify_credentials(username, password):
            session["logged_in"] = True
            session["username"] = username
            flash("Logged in successfully.", "success")
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid credentials.", "danger")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("Logged out.", "info")
    return redirect(url_for("login"))


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

@app.route("/")
@login_required
def dashboard():
    default_url = _get_config_value("DEFAULT_URL", "")
    result_files = _list_output_files()
    return render_template(
        "dashboard.html",
        commands=VALID_COMMANDS,
        default_url=default_url,
        result_files=result_files,
    )


# ---------------------------------------------------------------------------
# Run command (SSE streaming)
# ---------------------------------------------------------------------------

def _sse_event(event, data):
    """Format a Server-Sent Event."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@app.route("/run")
@login_required
def run_command():
    command = request.args.get("command", "").strip()
    url = request.args.get("url", "").strip()
    verbose = request.args.get("verbose") == "1"
    save = request.args.get("save") == "1"
    page_url = request.args.get("page_url", "").strip()

    if command not in VALID_COMMANDS:
        return Response(
            _sse_event("cmd_error", {"error": f"Invalid command: {command}"}),
            mimetype="text/event-stream",
        )

    # Build argument list
    args = [VALIDATOR_SCRIPT, command]
    if url:
        args.append(url)
    if verbose:
        args.append("--verbose")
    if save and command == "html":
        args.append("--save")
    if page_url and command == "analytics":
        args.extend(["--page", page_url])

    def generate():
        label = " ".join(args[1:])
        yield _sse_event("log", f"[UI] Starting: ./validator.sh {label}")

        # Redirect stdout to a temp file so we only need to read the stderr
        # pipe in the loop below — avoids the classic deadlock where a large
        # stdout (e.g. the html command) fills the OS pipe buffer.
        fd, stdout_path = tempfile.mkstemp(suffix=".txt", prefix="sv_stdout_")
        os.close(fd)

        try:
            with open(stdout_path, "w") as stdout_f:
                proc = subprocess.Popen(
                    args,
                    stdout=stdout_f,
                    stderr=subprocess.PIPE,
                    text=True,
                    cwd=os.path.dirname(VALIDATOR_SCRIPT),
                )

                # Stream stderr (log lines) to the browser in real time
                for line in proc.stderr:
                    stripped = line.rstrip("\n")
                    if stripped:
                        yield _sse_event("log", stripped)

                proc.wait()

            # Read captured stdout
            with open(stdout_path, "r", errors="replace") as f:
                stdout_data = f.read()

            if proc.returncode == 0:
                yield _sse_event("log", f"[UI] Command '{command}' completed successfully.")
                yield _sse_event("complete", {"stdout": stdout_data})
            else:
                yield _sse_event("log", f"[UI] Command '{command}' failed (exit code {proc.returncode}).")
                yield _sse_event("cmd_error", {
                    "error": f"Exit code {proc.returncode}",
                    "stdout": stdout_data,
                })

        except FileNotFoundError:
            yield _sse_event("cmd_error", {"error": f"Script not found: {VALIDATOR_SCRIPT}"})
        except Exception as e:
            yield _sse_event("cmd_error", {"error": str(e)})
        finally:
            if os.path.isfile(stdout_path):
                os.unlink(stdout_path)

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ---------------------------------------------------------------------------
# Results
# ---------------------------------------------------------------------------

@app.route("/results/<filename>")
@login_required
def view_result(filename):
    safe_name = os.path.basename(filename)
    filepath = os.path.join(OUTPUT_DIR, safe_name)

    if not os.path.isfile(filepath):
        flash(f"File not found: {safe_name}", "danger")
        return redirect(url_for("dashboard"))

    with open(filepath, "r", errors="replace") as f:
        content = f.read()

    if safe_name.endswith(".json"):
        try:
            data = json.loads(content)
            return render_template("results/json_report.html",
                                   filename=safe_name, data=data,
                                   raw_json=json.dumps(data, indent=2))
        except json.JSONDecodeError:
            pass

    return render_template("results/text_output.html",
                           filename=safe_name, content=content)


@app.route("/results-list")
@login_required
def results_list():
    return jsonify(_list_output_files())


@app.route("/results/<filename>/raw")
@login_required
def download_result(filename):
    safe_name = os.path.basename(filename)
    return send_from_directory(OUTPUT_DIR, safe_name, as_attachment=True)


@app.route("/clean", methods=["POST"])
@login_required
def clean_output():
    if not os.path.isdir(OUTPUT_DIR):
        return jsonify({"removed": 0})
    count = 0
    for name in os.listdir(OUTPUT_DIR):
        filepath = os.path.join(OUTPUT_DIR, name)
        if os.path.isfile(filepath):
            os.remove(filepath)
            count += 1
    return jsonify({"removed": count})


# ---------------------------------------------------------------------------
# Config editor
# ---------------------------------------------------------------------------

@app.route("/config", methods=["GET", "POST"])
@login_required
def config_editor():
    if request.method == "POST":
        new_values = {}
        for key in request.form:
            if key.startswith("cfg_"):
                config_key = key[4:]  # strip "cfg_" prefix
                new_values[config_key] = request.form[key]

        if new_values:
            _update_config_file(new_values)
            flash("Configuration saved.", "success")
        return redirect(url_for("config_editor"))

    config_lines = _read_config_lines()
    return render_template("config_editor.html", config_lines=config_lines)


# ---------------------------------------------------------------------------
# Config helpers
# ---------------------------------------------------------------------------

def _get_config_value(key, default=""):
    """Read a single value from thresholds.conf."""
    if not os.path.isfile(CONFIG_FILE):
        return default
    with open(CONFIG_FILE, "r") as f:
        for line in f:
            stripped = line.strip()
            if stripped.startswith("#") or "=" not in stripped:
                continue
            k, v = stripped.split("=", 1)
            if k.strip() == key:
                v = v.split("#")[0].strip()
                return v.strip('"').strip("'")
    return default


def _read_config_lines():
    """Read thresholds.conf and return structured list of lines."""
    lines = []
    if not os.path.isfile(CONFIG_FILE):
        return lines

    with open(CONFIG_FILE, "r") as f:
        for line in f:
            raw = line.rstrip("\n")
            stripped = raw.strip()

            if not stripped or stripped.startswith("#"):
                lines.append({"type": "comment", "raw": raw})
            elif "=" in stripped:
                key, value = stripped.split("=", 1)
                comment = ""
                if "#" in value:
                    value, comment = value.rsplit("#", 1)
                    comment = comment.strip()
                lines.append({
                    "type": "setting",
                    "key": key.strip(),
                    "value": value.strip(),
                    "comment": comment,
                    "raw": raw,
                })
            else:
                lines.append({"type": "comment", "raw": raw})

    return lines


def _update_config_file(new_values):
    """Update thresholds.conf, preserving comments and structure."""
    if not os.path.isfile(CONFIG_FILE):
        return

    with open(CONFIG_FILE, "r") as f:
        original_lines = f.readlines()

    updated_lines = []
    for line in original_lines:
        stripped = line.strip()
        if stripped and not stripped.startswith("#") and "=" in stripped:
            key = stripped.split("=", 1)[0].strip()
            if key in new_values:
                comment_part = ""
                if "#" in stripped.split("=", 1)[1]:
                    _, comment_part = stripped.split("=", 1)[1].rsplit("#", 1)
                    comment_part = "    # " + comment_part.strip()
                updated_lines.append(f"{key}={new_values[key]}{comment_part}\n")
                continue
        updated_lines.append(line)

    with open(CONFIG_FILE, "w") as f:
        f.writelines(updated_lines)


def _list_output_files():
    """List files in the output directory, sorted newest first."""
    files = []
    if not os.path.isdir(OUTPUT_DIR):
        return files

    for name in os.listdir(OUTPUT_DIR):
        filepath = os.path.join(OUTPUT_DIR, name)
        if os.path.isfile(filepath):
            stat = os.stat(filepath)
            files.append({
                "name": name,
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "is_json": name.endswith(".json"),
            })

    files.sort(key=lambda x: x["modified"], reverse=True)
    return files


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Site Validations Web UI starting on http://{HOST}:{PORT}")
    print(f"Login: admin / validator2026 (change via VALIDATOR_USERNAME/PASSWORD env vars)")
    app.run(host=HOST, port=PORT, debug=DEBUG)
