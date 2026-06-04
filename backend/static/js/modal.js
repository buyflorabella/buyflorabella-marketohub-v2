var Modal = (function () {
    var _overlay = null;

    function _remove() {
        if (_overlay && _overlay.parentNode) {
            _overlay.parentNode.removeChild(_overlay);
        }
        _overlay = null;
    }

    function confirm(message, onConfirm) {
        _remove();

        _overlay = document.createElement('div');
        _overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:center;justify-content:center;';

        var box = document.createElement('div');
        box.style.cssText = 'background:#fff;border-radius:8px;padding:1.5rem;width:340px;max-width:90%;font-family:system-ui,sans-serif;';

        var p = document.createElement('p');
        p.style.cssText = 'margin-bottom:1.25rem;font-size:0.95rem;color:#222;';
        p.textContent = message;

        var actions = document.createElement('div');
        actions.style.cssText = 'display:flex;gap:0.5rem;justify-content:flex-end;';

        var cancel = document.createElement('button');
        cancel.textContent = 'Cancel';
        cancel.className = 'btn btn-secondary';
        cancel.onclick = _remove;

        var ok = document.createElement('button');
        ok.textContent = 'Delete';
        ok.className = 'btn btn-danger';
        ok.onclick = function () { _remove(); onConfirm(); };

        actions.appendChild(cancel);
        actions.appendChild(ok);
        box.appendChild(p);
        box.appendChild(actions);
        _overlay.appendChild(box);
        document.body.appendChild(_overlay);

        _overlay.addEventListener('click', function (e) {
            if (e.target === _overlay) _remove();
        });
    }

    return { confirm: confirm, close: _remove };
})();
