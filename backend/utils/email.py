import smtplib
from email.mime.text import MIMEText
from flask import current_app


def send_email(to_email, subject, body):
    host = current_app.config.get("SMTP_HOST", "")
    port = current_app.config.get("SMTP_PORT", 587)
    user = current_app.config.get("SMTP_USER", "")
    password = current_app.config.get("SMTP_PASS", "")

    if not host or not user:
        current_app.logger.warning("SMTP not configured — email not sent to %s", to_email)
        return False

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = to_email

    try:
        with smtplib.SMTP(host, port) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(user, password)
            smtp.sendmail(user, [to_email], msg.as_string())
    except Exception as exc:
        current_app.logger.error("send_email failed to=%s: %s", to_email, exc)
        return False

    return True
