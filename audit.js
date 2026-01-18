document.addEventListener('DOMContentLoaded', () => {
    refreshAuditTrail();

    // Link Search and Filter
    document.getElementById('auditSearch').addEventListener('input', refreshAuditTrail);
    document.getElementById('actionFilter').addEventListener('change', refreshAuditTrail);


    window.addEventListener('storage', (e) => {
        if (e.key === 'users' || e.key === 'budgetRequests') {
            refreshAuditTrail();
        }
    });
});

function refreshAuditTrail() {
    // 1. Get the data from localStorage
    const budgetRecords = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    const userData = JSON.parse(localStorage.getItem('users')) || []; 
    
    const container = document.getElementById('activity-rows');
    const searchTerm = document.getElementById('auditSearch').value.toLowerCase();
    const filterAction = document.getElementById('actionFilter').value;


    let filteredRecords = budgetRecords.filter(record => {
        const matchesSearch = record.id.toLowerCase().includes(searchTerm) || 
                              (record.projectTitle && record.projectTitle.toLowerCase().includes(searchTerm));
        const matchesFilter = filterAction === 'all' || record.status === filterAction;
        return matchesSearch && matchesFilter;
    });


    document.getElementById('stat-total-activities').innerText = budgetRecords.length;
    
    const fullyApprovedCount = budgetRecords.filter(r => r.status === 'Fully Approved').length;
    document.getElementById('stat-approvals').innerText = fullyApprovedCount;
    
    document.getElementById('stat-submissions').innerText = budgetRecords.length;
    
    const activeUsersCount = userData.filter(u => 
        u.status && u.status.toLowerCase() === 'active'
    ).length;
    
    document.getElementById('stat-active-users').innerText = activeUsersCount;

    document.getElementById('log-count').innerText = `Showing ${filteredRecords.length} activities`;

    if (filteredRecords.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#888;">No matching records found.</div>';
        return;
    }

    container.innerHTML = filteredRecords.map(record => {
        const style = getStatusStyle(record.status);
        return `
            <div class="um-user-item" style="border-bottom: 1px solid rgba(0,0,0,0.05); padding: 15px 0;">
                <div class="um-avatar" style="background: ${style.bg}; color: ${style.text}; font-weight: bold;">
                    ${style.icon}
                </div>
                <div class="um-user-info">
                    <div class="um-name-row">
                        <span class="um-full-name">${record.id}</span>
                        <span class="um-badge-active" style="background: ${style.bg}; color: ${style.text}; border: 1px solid ${style.text}44;">
                            ${record.status}
                        </span>
                        <span class="um-badge-role" style="color: #555; font-weight: 600;">${record.projectTitle || 'No Title'}</span>
                    </div>
                    <div class="um-meta-row">
                        <span>📝 ${record.description || 'No description provided.'}</span>
                    </div>
                    <div class="um-meta-row">
                        <span>👤 Submitted by: ${record.submittedBy || 'Admin'}</span>
                        <span>📅 Date: ${record.date || 'N/A'}</span>
                    </div>
                </div>
                <div class="um-actions">
                    <button class="um-edit" title="View Details" onclick="viewBudget('${record.id}')">👁️</button>
                </div>
            </div>
        `;
    }).join('');
}

function getStatusStyle(status) {
    switch(status) {
        case 'Fully Approved': 
        case 'Approved': 
            return { bg: '#e3fcef', text: '#00875a', icon: '✔' };
        case 'Rejected': 
            return { bg: '#ffebe6', text: '#de350b', icon: '✘' };
        case 'Reviewed': 
            return { bg: '#fff0b3', text: '#856404', icon: '👁' };
        case 'Pending': 
        case 'Submitted':
            return { bg: '#deebff', text: '#0052cc', icon: '📥' };
        default: 
            return { bg: '#f4f5f7', text: '#5e6c84', icon: '•' };
    }
}