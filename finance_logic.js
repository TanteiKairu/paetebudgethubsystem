let currentReviewIndex = null;

document.addEventListener('DOMContentLoaded', function() {
    renderQueue();
});

function renderQueue() {
    const data = localStorage.getItem('budgetRequests');
    const submissions = data ? JSON.parse(data) : [];
    const listDiv = document.getElementById('submission-list');
    
    const countPending = document.getElementById('count-pending');
    const totalVal = document.getElementById('total-val');
    const highPriorityVal = document.getElementById('high-priority-val');
    const avgVal = document.getElementById('avg-val');
    const queueHeader = document.getElementById('queue-header');

    if (queueHeader) {
        queueHeader.innerText = `Review Queue (${submissions.length})`;
    }

    if (submissions.length === 0) {
        if (listDiv) listDiv.innerHTML = '<div class="empty-state-card"><p>No budget requests submitted yet.</p></div>';
        if (countPending) countPending.innerText = "0";
        return;
    }

    if (listDiv) listDiv.innerHTML = ''; 
    let totalSum = 0;
    let highCount = 0;

    submissions.forEach((item, index) => {
        const amt = parseFloat(item.amount) || 0;
        totalSum += amt;

        if (item.priority && String(item.priority).toUpperCase() === "HIGH") {
            highCount++;
        }
        
        const card = document.createElement('div');
        card.className = 'budget-item-card';
        card.onclick = () => showDetails(index);
        
        card.innerHTML = `
            <div class="card-meta">
                <span>${item.id || ''}</span>
                <span class="priority-tag" style="background: #ff4d4f; color: #ffffffff; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                    ${item.priority || 'NORMAL'}
                </span>
            </div>
            <h4 style="margin: 8px 0;">${item.title || 'Untitled'}</h4>
            <p style="color: #000000ff; font-size: 13px; margin: 0;">${item.department || 'No Dept'}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px;">
                <span><b>₱${amt.toLocaleString()}</b></span>
                <span style="color: #000000ff;">${item.date || ''}</span>
            </div>
        `;
        if (listDiv) listDiv.appendChild(card);
    });

    if (countPending) countPending.innerText = submissions.length;
    if (highPriorityVal) highPriorityVal.innerText = highCount;
    if (totalVal) totalVal.innerText = `₱${totalSum.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    if (avgVal && submissions.length > 0) {
        const avg = totalSum / submissions.length;
        avgVal.innerText = `₱${avg.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
    }
}

function showDetails(index) {
    const data = localStorage.getItem('budgetRequests');
    const submissions = data ? JSON.parse(data) : [];
    const item = submissions[index];
    const detailsPanel = document.querySelector('.details-container');

    if (!item || !detailsPanel) return;

    detailsPanel.innerHTML = `
    <div style="background: #ffd5a2c2; padding: 20px; border-radius: 12px; color: #000;">
        <div class="detail-header" style="margin-bottom: 15px;">
            <h3 style="margin: 0;">${item.id || ''}: ${item.title}</h3>
            <span class="priority-tag" style="background: #ff4d4f; color: white; padding: 2px 6px; border-radius: 4px; font-size: inherit; font-family: inherit;">
    ${item.priority || 'NORMAL'}
</span>
        </div>

        <div style="display: flex; gap: 5px; background: #eee; padding: 5px; border-radius: 8px; margin-bottom: 20px;">
            <button class="tab-btn active" id="tab-btn-details" onclick="switchTab(this, 'details', ${index})" style="flex:1; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold;">Details</button>
            <button class="tab-btn" id="tab-btn-breakdown" onclick="switchTab(this, 'breakdown', ${index})" style="flex:1; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold;">Breakdown</button>
            <button class="tab-btn" id="tab-btn-docs" onclick="switchTab(this, 'documents', ${index})" style="flex:1; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold;">Documents</button>
        </div>

        <div id="tab-content-area">
            ${renderDetailsContent(item)}
        </div>

        <div class="action-buttons" style="display:flex; gap:10px; margin-top:30px; padding-top:15px; border-top:1px solid #00000033;">
            <button onclick="handleApproveAction(${index})" style="background:#27ae60; color:white; flex:1; padding:12px; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Approve</button>
            <button onclick="openReviewModal(${index})" style="background:blue; color:white; flex:1; padding:12px; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Revise</button>
            <button onclick="handleRejectAction(${index})" style="background:#e74c3c; color:white; flex:1; padding:12px; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Reject</button>
        </div>
    </div>`;
}

function switchTab(btn, tabName, index) {
    const data = JSON.parse(localStorage.getItem('budgetRequests'));
    const item = data[index];
    const contentArea = document.getElementById('tab-content-area');
    
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = '#555';
    });
    btn.style.background = 'white';
    btn.style.color = '#000';

    if(tabName === 'details') contentArea.innerHTML = renderDetailsContent(item);
    if(tabName === 'breakdown') contentArea.innerHTML = renderBreakdownContent(item);
    if(tabName === 'documents') contentArea.innerHTML = renderDocumentsContent(item);
}

function renderDetailsContent(item) {
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <p><strong>Department:</strong><br>${item.department}</p>
            <p><strong>Date submitted:</strong><br>${item.date || 'N/A'}</p>
            <p><strong>Total Amount:</strong><br><span style="font-size: 18px; font-weight: bold;">₱${parseFloat(item.amount).toLocaleString()}</span></p>
            <p><strong>Status:</strong><br>Pending Review</p>
        </div>
        <h4 style="margin-top:20px;">Justification</h4>
        <div style="background: #ffffffc2; padding: 15px; border-radius: 8px;">${item.justification || 'No justification provided.'}</div>
    `;
}

// --- FIXED BREAKDOWN SECTION ---
function renderBreakdownContent(item) {
    const items = item.budgetLineItems || []; 
    
    let html = `<div style="display: flex; flex-direction: column; gap: 10px;">`;
    
    if (items.length === 0) {
        html += `<div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">No line items found.</div>`;
    } else {
        items.forEach(line => {
            const qty = parseInt(line.quantity) || 0;
            const unit = parseFloat(line.unitCost) || 0;
            const total = qty * unit;

            html += `
            <div style="background: white; padding: 12px 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div>
                    <strong style="font-size: 14px;">${line.description}</strong><br>
                    <small style="color: #666;">Qty: ${qty} &nbsp; Unit: ₱${unit.toLocaleString()}</small>
                </div>
                <div style="font-weight: bold; font-size: 15px;">
                    ₱${total.toLocaleString()}
                </div>
            </div>`;
        });
    }

    html += `
        <div style="margin-top: 10px; padding-top: 15px; border-top: 1px solid #00000033; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold;">Total Budget</span>
            <strong style="font-size: 20px;">₱${parseFloat(item.amount).toLocaleString()}</strong>
        </div>
    </div>`;
    return html;
}

function renderDocumentsContent(item) {
    return `
        <div style="background: white; padding: 30px; border-radius: 8px; text-align: center; border: 2px dashed #ccc;">
            <span style="font-size: 40px;">📁</span>
            <p style="margin-top:10px; color:#666;">No documents attached to this request.</p>
        </div>
    `;
}

function openReviewModal(index) {
    const data = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    const item = data[index];
    currentReviewIndex = index;

    // Create modal if it doesn't exist
    let modal = document.getElementById('review-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'review-modal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content" style="background: white; width: 600px; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <div class="modal-header" style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 20px;">
                    <div>
                        <h2 id="review-modal-title" style="color: #4e342e; margin: 0; font-size: 20px;">Finance Review - </h2>
                        <p id="review-modal-subtitle" style="color: #888; margin: 5px 0 0 0; font-size: 14px;">Provide your review comments and recommendations</p>
                    </div>
                    <span class="close-modal" onclick="closeReviewModal()" style="font-size: 28px; cursor: pointer; color: #aaa;">&times;</span>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <label for="review-comments" style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">Review Comments</label>
                        <textarea id="review-comments" placeholder="Enter your review comments..." style="width: 100%; min-height: 120px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: inherit; resize: vertical;"></textarea>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label for="adjusted-amount" style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">Adjusted Amount (Optional)</label>
                        <input type="number" id="adjusted-amount" placeholder="Enter adjusted amount if applicable" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: inherit;">
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 25px;">
                        <button onclick="handleReviewApprove()" style="background: #00c853; color: white; flex: 1; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Approve</button>
                        <button onclick="handleReviewRequestChanges()" style="background: #ff9800; color: white; flex: 1; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Request Changes</button>
                        <button onclick="handleReviewReject()" style="background: #f44336; color: white; flex: 1; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Reject</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('review-modal-title').innerText = `Finance Review - ${item.id || item.title || 'N/A'}`;
    document.getElementById('review-comments').value = '';
    document.getElementById('adjusted-amount').value = '';
    modal.style.display = 'flex';
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleReviewApprove() {
    const comments = document.getElementById('review-comments').value;
    const adjustedAmount = document.getElementById('adjusted-amount').value;
    const data = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    
    if (currentReviewIndex !== null && data[currentReviewIndex]) {
        const item = data[currentReviewIndex];
        const oldStatus = item.status || 'Pending';
        
        data[currentReviewIndex].status = 'Submitted';
        data[currentReviewIndex].reviewComments = comments;
        if (adjustedAmount) {
            data[currentReviewIndex].adjustedAmount = parseFloat(adjustedAmount);
            data[currentReviewIndex].amount = parseFloat(adjustedAmount);
        }
        data[currentReviewIndex].reviewDate = new Date().toLocaleString();
        
        localStorage.setItem('budgetRequests', JSON.stringify(data));
        addNotification(`Budget request ${item.id} has been submitted for approval`);
        recordAuditEntry(item.id, item.title || item.description, 'Submitted', comments || 'Budget submitted to approver', 'Finance Officer', oldStatus, 'Submitted');
        
        alert('Budget request has been submitted for approval!');
        closeReviewModal();
        renderQueue();
        const detailsPanel = document.querySelector('.details-container');
        if (detailsPanel) {
            detailsPanel.innerHTML = '<div class="empty-state-card"><p>Select a budget request to review</p></div>';
        }
    }
}

function handleReviewRequestChanges() {
    const comments = document.getElementById('review-comments').value;
    if (!comments.trim()) {
        alert('Please provide review comments when requesting changes.');
        return;
    }
    
    const adjustedAmount = document.getElementById('adjusted-amount').value;
    const data = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    
    if (currentReviewIndex !== null && data[currentReviewIndex]) {
        const item = data[currentReviewIndex];
        const oldStatus = item.status || 'Pending';
        
        data[currentReviewIndex].status = 'Revision Requested';
        data[currentReviewIndex].reviewComments = comments;
        if (adjustedAmount) {
            data[currentReviewIndex].adjustedAmount = parseFloat(adjustedAmount);
        }
        data[currentReviewIndex].reviewDate = new Date().toLocaleString();
        
        localStorage.setItem('budgetRequests', JSON.stringify(data));
        addNotification(`Changes requested for budget request ${item.id}`);
        recordAuditEntry(item.id, item.title || item.description, 'Revision Requested', comments, 'Finance Officer', oldStatus, 'Revision Requested');
        
        alert('Changes have been requested!');
        closeReviewModal();
        renderQueue();
        const detailsPanel = document.querySelector('.details-container');
        if (detailsPanel) {
            detailsPanel.innerHTML = '<div class="empty-state-card"><p>Select a budget request to review</p></div>';
        }
    }
}

function handleReviewReject() {
    const comments = document.getElementById('review-comments').value;
    const data = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    
    if (currentReviewIndex !== null && data[currentReviewIndex]) {
        const item = data[currentReviewIndex];
        const oldStatus = item.status || 'Pending';
        
        data[currentReviewIndex].status = 'Rejected';
        data[currentReviewIndex].reviewComments = comments || 'Budget request rejected';
        data[currentReviewIndex].reviewDate = new Date().toLocaleString();
        
        localStorage.setItem('budgetRequests', JSON.stringify(data));
        addNotification(`Budget request ${item.id} has been rejected`);
        recordAuditEntry(item.id, item.title || item.description, 'Rejected', comments || 'Budget request rejected', 'Finance Officer', oldStatus, 'Rejected');
        
        alert('Budget request has been rejected!');
        closeReviewModal();
        renderQueue();
        const detailsPanel = document.querySelector('.details-container');
        if (detailsPanel) {
            detailsPanel.innerHTML = '<div class="empty-state-card"><p>Select a budget request to review</p></div>';
        }
    }
}

function handleApproveAction(index) {
    const data = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    if (data[index]) {
        const item = data[index];
        const oldStatus = item.status || 'Pending';
        data[index].status = 'Submitted';
        data[index].reviewDate = new Date().toLocaleString();
        localStorage.setItem('budgetRequests', JSON.stringify(data));
        addNotification(`Budget request ${item.id} has been submitted for approval`);
        recordAuditEntry(item.id, item.title || item.description, 'Submitted', 'Budget submitted to approver', 'Finance Officer', oldStatus, 'Submitted');
        alert('Budget request has been submitted for approval!');
        renderQueue();
        const detailsPanel = document.querySelector('.details-container');
        if (detailsPanel) {
            detailsPanel.innerHTML = '<div class="empty-state-card"><p>Select a budget request to review</p></div>';
        }
    }
}

function handleRejectAction(index) {
    if (!confirm('Are you sure you want to reject this budget request?')) {
        return;
    }
    
    const data = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    if (data[index]) {
        const item = data[index];
        const oldStatus = item.status || 'Pending';
        data[index].status = 'Rejected';
        data[index].reviewComments = 'Budget request rejected';
        data[index].reviewDate = new Date().toLocaleString();
        localStorage.setItem('budgetRequests', JSON.stringify(data));
        addNotification(`Budget request ${item.id} has been rejected`);
        recordAuditEntry(item.id, item.title || item.description, 'Rejected', 'Budget request rejected', 'Finance Officer', oldStatus, 'Rejected');
        alert('Budget request has been rejected!');
        renderQueue();
        const detailsPanel = document.querySelector('.details-container');
        if (detailsPanel) {
            detailsPanel.innerHTML = '<div class="empty-state-card"><p>Select a budget request to review</p></div>';
        }
    }
}

function addNotification(message) {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.unshift({
        id: Date.now(),
        message: message,
        timestamp: new Date().toLocaleString(),
        read: false
    });
    // Keep only last 50 notifications
    notifications = notifications.slice(0, 50);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Trigger storage event for dashboard
    window.dispatchEvent(new Event('storage'));
}

function clearAllData() {
    if (confirm("Are you sure you want to delete all saved budget documents?")) {
        localStorage.removeItem('budgetRequests');
        renderQueue();
        const detailsPanel = document.querySelector('.details-container');
        if (detailsPanel) {
            detailsPanel.innerHTML = '<div class="empty-state-card"><p>Select a budget request to review</p></div>';
        }
    }
}
// This function sends data from Document Tracking/Approval to the Audit Trail
function recordAuditEntry(id, title, action, details, role, statusFrom, statusTo) {
    // 1. Get the shared activity list
    let activities = JSON.parse(localStorage.getItem('activityLogs')) || [];

    // 2. Create the entry based on your professional reference image
    const newEntry = {
        id: id,
        title: title,
        action: action, 
        details: details,
        role: role,
        timestamp: new Date().toLocaleString(),
        ip: "192.168.1." + Math.floor(Math.random() * 255),
        statusFrom: statusFrom,
        statusTo: statusTo,
        // Match CSS color classes
        statusClass: action.toLowerCase() === 'approved' ? 'status-approved' : 'status-review'
    };

    // 3. Save it to the top of the list
    activities.unshift(newEntry);
    localStorage.setItem('activityLogs', JSON.stringify(activities));
}
