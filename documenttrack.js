document.addEventListener('DOMContentLoaded', function() {
    renderTrackingList();
    document.getElementById('search-input').addEventListener('input', renderTrackingList);
    document.getElementById('status-filter').addEventListener('change', renderTrackingList);
});

function renderTrackingList() {
    const data = localStorage.getItem('budgetRequests');
    const submissions = data ? JSON.parse(data) : [];
    const listDiv = document.getElementById('document-list');
    const searchVal = document.getElementById('search-input').value.toLowerCase();
    const filterVal = document.getElementById('status-filter').value;
    
    listDiv.innerHTML = '';

    const filtered = submissions.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchVal) || 
                              item.id.toLowerCase().includes(searchVal) ||
                              item.department.toLowerCase().includes(searchVal);
        const itemStatus = (item.status || 'pending finance').toLowerCase();
        const matchesFilter = filterVal === 'all' || itemStatus === filterVal;
        return matchesSearch && matchesFilter;
    });

    document.getElementById('doc-count').innerText = filtered.length;

    filtered.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'document-card';
        card.id = `card-${item.id}`;
        card.onclick = () => {
            // Remove active class from others and add to this one
            document.querySelectorAll('.document-card').forEach(c => c.classList.remove('active-card'));
            card.classList.add('active-card');
            showTrackingDetails(item);
        };
        
        const progress = getProgress(item.status);

        card.innerHTML = `
            <div class="card-top">
                <span class="doc-id-link">${item.id}</span>
                <span class="status-badge ${item.status || 'pending finance'}">
                    <i class="fas ${getStatusIcon(item.status)}"></i> ${item.status || 'Pending Finance'}
                </span>
                <i class="far fa-file-alt file-icon-gray"></i>
            </div>
            <h4 class="card-title">${item.title}</h4>
            <p class="card-dept">${item.department}</p>
            <div class="card-footer-meta">
                <span>₱${parseFloat(item.amount).toLocaleString()}</span>
                <span>${item.date}</span>
            </div>
            <div class="progress-section">
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${progress.percent}%"></div>
                </div>
                <span class="progress-label">Progress <span class="stage-count">${progress.stage}</span></span>
            </div>
        `;
        listDiv.appendChild(card);
    });
}

function getProgress(status) {
    if (status === 'approved') return { percent: 100, stage: '4/4 stages' };
    if (status === 'rejected') return { percent: 100, stage: 'Finalized' };
    if (status === 'finance_review') return { percent: 50, stage: '2/4 stages' };
    return { percent: 25, stage: '1/4 stages' };
}

function getStatusIcon(status) {
    if (status === 'approved') return 'fa-check-circle';
    if (status === 'rejected') return 'fa-times-circle';
    return 'fa-clock';
}

function showTrackingDetails(item) {
    const detailsPanel = document.getElementById('document-details-panel');
    
    // Header section matching your 3rd image
    detailsPanel.innerHTML = `
        <div class="details-content-wrapper">
            <div class="details-header-main">
                <div class="header-row">
                    <h2>${item.id}</h2>
                    <span class="status-badge-lg ${item.status || 'pending'}">
                         <i class="fas ${getStatusIcon(item.status)}"></i> ${item.status || 'Pending Finance'}
                    </span>
                </div>
                <h3 class="details-title-sub">${item.title}</h3>
            </div>

            <div class="details-grid-info">
                <div class="info-group">
                    <label>Department:</label>
                    <span>${item.department}</span>
                </div>
                <div class="info-group">
                    <label>Amount:</label>
                    <span>₱${parseFloat(item.amount).toLocaleString()}</span>
                </div>
                <div class="info-group">
                    <label>Submitted:</label>
                    <span>${item.date}</span>
                </div>
            </div>

            <hr class="divider">

            <h4 class="workflow-title">Workflow History</h4>
            <div class="timeline-v2">
                <div class="timeline-step completed">
                    <div class="step-icon"><i class="fas fa-check"></i></div>
                    <div class="step-text">
                        <strong>Submitted</strong>
                        <p>Dr. Maria Santos</p>
                        <small>${item.date} 09:30</small>
                    </div>
                </div>
                <div class="timeline-step completed">
                    <div class="step-icon"><i class="fas fa-check"></i></div>
                    <div class="step-text">
                        <strong>Department Review</strong>
                        <p>Department Head</p>
                        <small>${item.date} 14:20</small>
                    </div>
                </div>
                <div class="timeline-step ${item.status === 'pending finance' ? 'active' : 'completed'}">
                    <div class="step-icon">${item.status === 'pending finance' ? '<i class="fas fa-clock"></i>' : '<i class="fas fa-check"></i>'}</div>
                    <div class="step-text">
                        <strong>Finance Review</strong>
                        <p>Finance Officer</p>
                        <small>${item.status === 'pending finance' ? 'In Progress' : 'Completed'}</small>
                    </div>
                </div>
                <div class="timeline-step">
                    <div class="step-icon"><i class="fas fa-circle"></i></div>
                    <div class="step-text">
                        <strong>Final Approval</strong>
                        <p>Budget Director</p>
                        <small>Pending FInance</small>
                    </div>
                </div>
            </div>

            <div class="details-footer-actions">
                <button class="action-btn view-btn" onclick="window.location.href='financerev.html'"><i class="fas fa-eye"></i> View Details</button>
                <button class="action-btn download-btn" onclick="alert('Downloading...')"><i class="fas fa-download"></i> Download</button>
            </div>
        </div>
    `;
}
function logToAuditTrail(id, title, action, details, statusFrom, statusTo) {
    // 1. Get the current list of logs
    let logs = JSON.parse(localStorage.getItem('activityLogs')) || [];

    // 2. Create the new log entry matching your professional design
    const newLog = {
        id: id,
        title: title,
        action: action, 
        details: details,
        role: "Administrator", // This can be dynamic later
        timestamp: new Date().toLocaleString(),
        ip: "192.168.1." + Math.floor(Math.random() * 255),
        statusFrom: statusFrom,
        statusTo: statusTo,
        statusClass: action === "Approved" ? "status-approved" : "status-submitted"
    };

    // 3. Put new log at the top and save
    logs.unshift(newLog);
    localStorage.setItem('activityLogs', JSON.stringify(logs));
}
// Example: Inside your "Approve" logic
function handleApprove(budgetId, budgetTitle) {
    // ... your logic to update the budget status ...

    // TRIGGER THE CONNECTION:
    recordAuditAction(
        budgetId, 
        budgetTitle, 
        "Approved", 
        "Administrator", 
        "Pending", 
        "Fully Approved"
    );
    
    alert("Document Approved and Logged!");
}