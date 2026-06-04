/**
 * Site Validator - Dashboard client
 * Uses Server-Sent Events (EventSource) for live log streaming.
 */

document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    var commandForm = document.getElementById('commandForm');
    var commandSelect = document.getElementById('command');
    var urlInput = document.getElementById('url');
    var pageUrlGroup = document.getElementById('pageUrlGroup');
    var pageUrlInput = document.getElementById('pageUrl');
    var saveGroup = document.getElementById('saveGroup');
    var runBtn = document.getElementById('runBtn');
    var statusBar = document.getElementById('statusBar');
    var statusText = document.getElementById('statusText');
    var logPanel = document.getElementById('logPanel');
    var clearLogBtn = document.getElementById('clearLog');
    var stdoutCard = document.getElementById('stdoutCard');
    var stdoutContent = document.getElementById('stdoutContent');
    var refreshBtn = document.getElementById('refreshResults');

    var eventSource = null;

    // Show/hide conditional fields based on selected command
    function updateFormFields() {
        var cmd = commandSelect.value;
        pageUrlGroup.classList.toggle('d-none', cmd !== 'analytics');
        saveGroup.classList.toggle('d-none', cmd !== 'html');
    }

    commandSelect.addEventListener('change', updateFormFields);
    updateFormFields();

    // Submit command via SSE
    commandForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Build query params
        var params = new URLSearchParams();
        params.set('command', commandSelect.value);
        params.set('url', urlInput.value);
        if (document.getElementById('verbose').checked) params.set('verbose', '1');
        if (commandSelect.value === 'html' && document.getElementById('saveHtml').checked) {
            params.set('save', '1');
        }
        if (commandSelect.value === 'analytics' && pageUrlInput.value) {
            params.set('page_url', pageUrlInput.value);
        }

        // Clear log and stdout for a fresh run
        logPanel.innerHTML = '';
        stdoutCard.classList.add('d-none');
        stdoutContent.textContent = '';
        setRunning(true, commandSelect.value);

        // Open SSE connection
        if (eventSource) eventSource.close();
        eventSource = new EventSource('/run?' + params.toString());

        eventSource.addEventListener('log', function (e) {
            appendLog(JSON.parse(e.data));
        });

        eventSource.addEventListener('complete', function (e) {
            eventSource.close();
            eventSource = null;
            var data = JSON.parse(e.data);
            if (data.stdout && data.stdout.trim()) {
                stdoutContent.textContent = data.stdout;
                stdoutCard.classList.remove('d-none');
            }
            setRunning(false);
            refreshResultsList();
        });

        eventSource.addEventListener('cmd_error', function (e) {
            eventSource.close();
            eventSource = null;
            var data = JSON.parse(e.data);
            appendLog('[ERROR] ' + data.error);
            if (data.stdout && data.stdout.trim()) {
                stdoutContent.textContent = data.stdout;
                stdoutCard.classList.remove('d-none');
            }
            setRunning(false);
        });

        eventSource.onerror = function () {
            if (eventSource) {
                eventSource.close();
                eventSource = null;
            }
            setRunning(false);
        };
    });

    // Append a line to the log panel
    function appendLog(line) {
        var div = document.createElement('div');
        div.className = 'log-line';

        if (line.startsWith('[INFO]'))       div.classList.add('log-info');
        else if (line.startsWith('[WARN]'))  div.classList.add('log-warn');
        else if (line.startsWith('[ERROR]')) div.classList.add('log-error');
        else if (line.startsWith('[DEBUG]')) div.classList.add('log-debug');
        else if (line.startsWith('[UI]'))    div.classList.add('log-ui');

        div.textContent = line;
        logPanel.appendChild(div);
        logPanel.scrollTop = logPanel.scrollHeight;
    }

    // Toggle running state
    function setRunning(running, command) {
        if (running) {
            runBtn.disabled = true;
            runBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Running...';
            statusBar.classList.remove('d-none');
            statusText.textContent = 'Running "' + command + '"...';
        } else {
            runBtn.disabled = false;
            runBtn.innerHTML = '<i class="bi bi-play-fill"></i> Run';
            statusBar.classList.add('d-none');
        }
    }

    // Clear log panel
    clearLogBtn.addEventListener('click', function () {
        logPanel.innerHTML = '';
        stdoutCard.classList.add('d-none');
        stdoutContent.textContent = '';
    });

    // Clean output directory
    document.getElementById('cleanOutput').addEventListener('click', function () {
        if (!confirm('Delete all output files?')) return;
        fetch('/clean', { method: 'POST' })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                appendLog('[UI] Cleaned output directory: removed ' + data.removed + ' file(s).');
                refreshResultsList();
            })
            .catch(function () {
                appendLog('[ERROR] Failed to clean output directory.');
            });
    });

    // Refresh results list
    refreshBtn.addEventListener('click', function () {
        refreshResultsList();
    });

    function refreshResultsList() {
        fetch('/results-list')
            .then(function (r) { return r.json(); })
            .then(function (files) {
                var list = document.getElementById('resultsList');
                if (!files.length) {
                    list.innerHTML = '<div class="list-group-item text-muted">No output files yet.</div>';
                    return;
                }
                list.innerHTML = files.map(function (f) {
                    var icon = f.is_json
                        ? 'bi-filetype-json text-warning'
                        : 'bi-file-text text-secondary';
                    return '<a href="/results/' + encodeURIComponent(f.name) + '"'
                        + ' class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">'
                        + '<div><i class="bi ' + icon + '"></i>'
                        + ' <span class="ms-1">' + f.name + '</span></div>'
                        + '<small class="text-muted">' + f.modified + '</small></a>';
                }).join('');
            })
            .catch(function () {});
    }
});
