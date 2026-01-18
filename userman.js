let users = [
    {
        id: 1,
        name: "System Administrator",
        username: "admin",
        email: "admin@paete.gov.ph",
        role: "Administrator",
        dept: "IT Department",
        status: "active"
    }
];
 
let currentUserEditing = null;
 
 
const modal = document.getElementById('addUserModal');
 
function openModal(isEdit = false) {
    const title = modal.querySelector('.um-modal-header h3');
    const submitBtn = modal.querySelector('.um-btn-confirm');
   
    if (isEdit) {
        title.innerText = "Edit User";
        submitBtn.innerText = "Update User";
    } else {
        title.innerText = "Add New User";
        submitBtn.innerText = "Create User";
        currentUserEditing = null;
        document.getElementById('addUserForm').reset();
    }
    modal.style.display = 'flex';
}
 
function closeModal() {
    modal.style.display = 'none';
    currentUserEditing = null;
}
 
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}
 
 
function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
 
    currentUserEditing = id;
 
 
    document.getElementById('newFullName').value = user.name;
    document.getElementById('newUsername').value = user.username;
    document.getElementById('newEmail').value = user.email;
    document.getElementById('newRole').value = user.role;
    document.getElementById('newDept').value = user.dept;
    document.getElementById('newStatus').value = user.status;
 
    openModal(true);
}
 
function deleteUser(id) {
    if(confirm("Are you sure you want to remove this user?")) {
        users = users.filter(user => user.id !== id);
        renderUsers();
    }
}
 
 
function renderUsers(filteredUsers = users) {
    const listContainer = document.querySelector('.um-list-container');
    const totalUsersValue = document.querySelector('.um-stat-card:nth-child(1) .um-value');
    const activeUsersValue = document.querySelector('.um-stat-card:nth-child(2) .um-value');
 
    const headerHTML = `
        <div class="um-list-header">
            <h3>System Users</h3>
            <span class="um-count">Showing ${filteredUsers.length} of ${users.length} users</span>
        </div>`;
   
    let rowsHTML = "";
    filteredUsers.forEach(user => {
        rowsHTML += `
            <div class="um-user-item">
                <div class="um-avatar">${user.name.charAt(0)}</div>
                <div class="um-user-info">
                    <div class="um-name-row">
                        <span class="um-full-name">${user.name}</span>
                        <span class="um-badge-active">${user.status}</span>
                        <span class="um-badge-role">${user.role}</span>
                    </div>
                    <div class="um-meta-row">
                        <span>👤 @${user.username}</span>
                        <span>📧 ${user.email}</span>
                        <span>🏢 ${user.dept}</span>
                    </div>
                </div>
                <div class="um-actions">
                    <button class="um-edit" onclick="editUser(${user.id})">✏️</button>
                    <button class="um-delete" onclick="deleteUser(${user.id})">🗑️</button>
                </div>
            </div>`;
    });
 
    listContainer.innerHTML = headerHTML + rowsHTML;
 
 
    if(totalUsersValue) totalUsersValue.innerText = users.length;
    if(activeUsersValue) activeUsersValue.innerText = users.filter(u => u.status === 'active').length;
}
 
 
document.querySelector('.um-search-field').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.dept.toLowerCase().includes(term)
    );
    renderUsers(filtered);
});
 
 
document.getElementById('addUserForm').addEventListener('submit', (e) => {
    e.preventDefault();
 
    const userData = {
        name: document.getElementById('newFullName').value,
        username: document.getElementById('newUsername').value,
        email: document.getElementById('newEmail').value,
        role: document.getElementById('newRole').value,
        dept: document.getElementById('newDept').value,
        status: document.getElementById('newStatus').value
    };
 
    if (currentUserEditing) {
       
        const index = users.findIndex(u => u.id === currentUserEditing);
        users[index] = { ...users[index], ...userData };
    } else {
       
        const newUser = { id: Date.now(), ...userData };
        users.push(newUser);
    }
 
    renderUsers();
    closeModal();
    e.target.reset();
});
 
 
document.querySelector('.um-add-user-btn').onclick = () => openModal(false);
 
 
window.onload = () => renderUsers();