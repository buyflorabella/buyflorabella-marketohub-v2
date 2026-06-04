var _usersCache = {};

function loadUsers() {
    fetch('/admin/users/data', { credentials: 'include' })
        .then(function (r) { return r.json(); })
        .then(function (users) {
            _usersCache = {};
            users.forEach(function(u) { _usersCache[u.email] = u; });
            renderUsers(users);
        })
        .catch(function () { showFlash('Failed to load users.', 'error'); });
}

function renderUsers(users) {
    var tbody = document.getElementById('users-tbody');
    if (!users.length) {
        tbody.innerHTML = '<tr><td colspan="3" style="color:#999;">No users found.</td></tr>';
        return;
    }
    tbody.innerHTML = users.map(function (u) {
        var badge = u.is_admin
            ? '<span class="badge badge-admin">admin</span>'
            : '<span class="badge badge-user">user</span>';
        var profileBadge = u.profile_complete
            ? '<span class="badge" style="background:#d1fae5;color:#065f46;">profile ✓</span>'
            : '<span class="badge" style="background:#fef3c7;color:#92400e;">no profile</span>';
        var email = escHtml(u.email);
        return '<tr>' +
            '<td>' + email + '</td>' +
            '<td>' + badge + ' ' + profileBadge + '</td>' +
            '<td>' +
            '<button class="btn btn-secondary" style="margin-right:0.3rem;" onclick="openEditModal(\'' + escAttr(u.email) + '\')">Edit</button>' +
            '<button class="btn btn-danger" onclick="confirmDelete(\'' + escAttr(u.email) + '\')">Delete</button>' +
            '</td></tr>';
    }).join('');
}

function createUser() {
    var email   = document.getElementById('new-email').value.trim();
    var isAdmin = document.getElementById('new-is-admin').checked;
    if (!email) { showFlash('Email is required.', 'error'); return; }

    fetch('/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, is_admin: isAdmin })
    })
    .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
    .then(function (res) {
        if (res.ok && res.data.success) {
            document.getElementById('new-email').value = '';
            document.getElementById('new-is-admin').checked = false;
            showFlash('User created.', 'success');
            loadUsers();
        } else {
            showFlash(res.data.message || 'Failed to create user.', 'error');
        }
    });
}

function confirmDelete(email) {
    Modal.confirm('Delete user ' + email + '? This cannot be undone.', function () {
        fetch('/admin/users/' + encodeURIComponent(email), {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
        .then(function (res) {
            if (res.ok && res.data.success) {
                showFlash('User deleted.', 'success');
                loadUsers();
            } else {
                showFlash(res.data.message || 'Failed to delete user.', 'error');
            }
        });
    });
}

function openEditModal(email) {
    var u = _usersCache[email] || {};
    var pd = u.profile_data || {};

    document.getElementById('edit-original-email').value = email;
    document.getElementById('edit-email').value = email;
    document.getElementById('edit-is-admin').checked = !!u.is_admin;
    document.getElementById('edit-name').value  = pd.name  || '';
    document.getElementById('edit-phone').value = pd.phone || '';
    document.getElementById('edit-notes').value = pd.notes || '';
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

function saveEdit() {
    var original = document.getElementById('edit-original-email').value;
    var email    = document.getElementById('edit-email').value.trim();
    var isAdmin  = document.getElementById('edit-is-admin').checked;
    var profileData = {
        name:  document.getElementById('edit-name').value.trim(),
        phone: document.getElementById('edit-phone').value.trim(),
        notes: document.getElementById('edit-notes').value.trim(),
    };

    fetch('/admin/users/' + encodeURIComponent(original), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, is_admin: isAdmin, profile_data: profileData })
    })
    .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
    .then(function (res) {
        if (res.ok && res.data.success) {
            closeEditModal();
            showFlash('User updated.', 'success');
            loadUsers();
        } else {
            showFlash(res.data.message || 'Failed to update user.', 'error');
        }
    });
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escAttr(str) {
    return String(str).replace(/'/g, "\\'");
}

document.addEventListener('DOMContentLoaded', loadUsers);
