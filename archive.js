/**
 * ARCHIVE.JS - Finalized Connection for Paete Budget Hub
 */

// 1. DATA SOURCE: Only use budgetRequests from budget submission page
const getSourceData = () => {
    const requests = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    // Filter out invalid entries (NaN amounts, missing required fields)
    return requests.filter(item => {
        const amount = parseFloat(item.amount || 0);
        return item.id && 
               (item.title || item.description || item.projectTitle) && 
               !isNaN(amount) && 
               amount >= 0;
    });
};

function refreshArchiveUI() {
    const listContainer = document.getElementById('archive-list-display');
    const resultsText = document.getElementById('archive-results-text');
    const searchTerm = document.getElementById('archiveSearch')?.value.toLowerCase() || "";
    const statusFilter = document.getElementById('statusFilter')?.value || "all";

    const allData = getSourceData();

    // 2. FILTER: show all documents but respect search/status filters
    const filteredData = allData.filter(item => {
        const matchesSearch = !searchTerm || 
            (item.id && item.id.toLowerCase().includes(searchTerm)) || 
            (item.description && item.description.toLowerCase().includes(searchTerm)) ||
            (item.projectTitle && item.projectTitle.toLowerCase().includes(searchTerm)) ||
            (item.department && item.department.toLowerCase().includes(searchTerm)) ||
            (item.dept && item.dept.toLowerCase().includes(searchTerm));
        const matchesStatus = statusFilter === "all" || (item.status && item.status === statusFilter);

        return matchesSearch && matchesStatus;
    });

    // 3. UPDATE STATS CARDS USING ALL SUBMISSIONS
    updateStats(allData);

    // 4. RENDER LIST (Audit Trail Style)
    listContainer.innerHTML = '';
    resultsText.innerText = `Showing ${filteredData.length} archived documents`;

    if (filteredData.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #4e342e; opacity: 0.6;">
                <p>No records match your criteria.</p>
                <small>Submit or archive a document to see it here.</small>
            </div>`;
        return;
    }

    filteredData.forEach(item => {
        const style = getStatusStyle(item.status);
        const amount = parseFloat(String(item.amount || "0").replace(/[^0-9.]/g, ''));
        
        const card = document.createElement('div');
        card.className = 'um-user-item';
        card.style = "background: white; padding: 15px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-left: 5px solid #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05);";
        
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: ${style.bg}; color: ${style.text}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${style.icon}
                </div>
                <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #2563eb; font-weight: bold; font-family: monospace;">${item.id}</span>
                        <span style="background: ${style.bg}; color: ${style.text}; padding: 2px 8px; border-radius: 10px; font-size: 0.7em; font-weight: bold;">${item.status || 'Archived'}</span>
                        <span style="font-size: 0.75em; color: #666; font-weight: 600;">FY 2026</span>
                    </div>
                    <h4 style="margin: 5px 0; color: #4e342e;">${item.description || item.projectTitle || 'No Title'}</h4>
                    <div style="font-size: 0.85em; color: #5d4037; display: flex; gap: 12px;">
                        <span>🏢 ${item.department || item.dept || 'IT Dept'}</span>
                        <span>💰 ₱${amount.toLocaleString()}</span>
                        <span>📅 Archived: ${item.date || 'Recent'}</span>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="viewDocument('${item.id}')" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #ddd; background: white; cursor: pointer; font-size: 0.85em;">View</button>
                <button onclick="exportItem('${item.id}')" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #ddd; background: white; cursor: pointer; font-size: 0.85em;">Export</button>
                <button onclick="restoreDocument('${item.id}')" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #ddd; background: #eff6ff; color: #2563eb; cursor: pointer; font-size: 0.85em;">🔄</button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function updateStats(data) {
    let totalValue = 0;
    let approvedCount = 0;
    const depts = new Set();

    data.forEach(item => {
        // Sum ALL amounts (including rejected)
        const amount = parseFloat(String(item.amount || "0").replace(/[^0-9.]/g, '')) || 0;
        totalValue += amount;
        
        // Count only fully approved requests
        const status = (item.status || '').toLowerCase();
        if (status === 'approved' || status === 'fully approved') {
            approvedCount++;
        }
        
        // Track unique departments
        const dept = item.department || item.dept || 'Admin';
        if (dept) {
            depts.add(dept);
        }
    });

    // Total archived = every submitted request (all statuses)
    document.getElementById('archived-total-count').innerText = data.length;
    // Approved = only fully approved requests
    document.getElementById('archived-approved-count').innerText = approvedCount;
    // Departments = distinct departments involved (like audit trail)
    document.getElementById('archived-dept-count').innerText = depts.size;
    // Total value = sum of ALL amounts (including rejected)
    document.getElementById('archived-total-value').innerText = totalValue >= 1000000 
        ? `₱${(totalValue / 1000000).toFixed(1)}M` 
        : totalValue >= 1000 
            ? `₱${(totalValue / 1000).toFixed(1)}K`
            : `₱${totalValue.toFixed(0)}`;
}

// Visual helpers from Audit Trail
function getStatusStyle(status) {
    const s = status ? status.toLowerCase() : "";
    if (s.includes('approved')) return { bg: '#dcfce7', text: '#166534', icon: '✔' };
    if (s.includes('rejected')) return { bg: '#fee2e2', text: '#991b1b', icon: '✘' };
    return { bg: '#eff6ff', text: '#1e40af', icon: '📥' };
}

// Restore Functionality
function restoreDocument(docId) {
    let data = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    let index = data.findIndex(i => i.id === docId);
    if (index !== -1) {
        data[index].isArchived = false;
        localStorage.setItem('budgetRequests', JSON.stringify(data));
    }
    refreshArchiveUI();
}

// Initial Load and Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    refreshArchiveUI();
    document.getElementById('archiveSearch')?.addEventListener('input', refreshArchiveUI);
    document.getElementById('statusFilter')?.addEventListener('change', refreshArchiveUI);

    // Sync across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'budgetRequests') refreshArchiveUI();
    });
});