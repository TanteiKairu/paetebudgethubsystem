document.addEventListener('DOMContentLoaded', function() {
    renderQueue();
});

let currentApprovalIndex = null;

function renderQueue() {
    const data = localStorage.getItem('budgetRequests');
    const allSubmissions = data ? JSON.parse(data) : [];
    
    // Filter to show only "Submitted" status items
    const submissions = allSubmissions.filter((item) => {
        const status = (item.status || '').toLowerCase();
        return status === 'submitted';
    });
    
    const listDiv = document.getElementById('submission-list');
    const countPending = document.getElementById('count-pending');
    const totalVal = document.getElementById('total-val');
    const highPriorityVal = document.getElementById('high-priority-val');
    const queueHeader = document.getElementById('queue-header');

    if (queueHeader) {
        queueHeader.innerText = `Review Queue (${submissions.length})`;
    }

    if (submissions.length === 0) {
        if (listDiv) listDiv.innerHTML = '<div class="empty-state-card"><p>No budget requests submitted for approval yet.</p></div>';
        if (countPending) countPending.innerText = "0";
        return;
    }

    if (listDiv) listDiv.innerHTML = ''; 
    let totalSum = 0;
    let highCount = 0;

    submissions.forEach((item) => {
        const amt = parseFloat(item.amount) || 0;
        totalSum += amt;

        if (item.priority && String(item.priority).toUpperCase() === "HIGH") {
            highCount++;
        }
        
        const card = document.createElement('div');
        card.className = 'budget-item-card';
        card.onclick = () => showDetailsByID(item.id);
        
        card.innerHTML = `
            <div class="card-meta">
                <span>${item.id || ''}</span>
                <span class="priority-tag" style="background: #ff4d4f; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                    ${item.priority || 'NORMAL'}
                </span>
            </div>
            <h4 style="margin: 8px 0;">${item.title || 'Untitled'}</h4>
            <p style="color: #666; font-size: 13px; margin: 0;">${item.department || 'No Dept'}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px;">
                <span><b>₱${amt.toLocaleString()}</b></span>
                <span style="color: #666;">${item.date || ''}</span>
            </div>
        `;
        if (listDiv) listDiv.appendChild(card);
    });

    if (countPending) countPending.innerText = submissions.length;
    if (highPriorityVal) highPriorityVal.innerText = highCount;
    if (totalVal) totalVal.innerText = `₱${totalSum.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}

function showDetailsByID(itemId) {
    const data = localStorage.getItem('budgetRequests');
    const submissions = data ? JSON.parse(data) : [];
    const index = submissions.findIndex(s => s.id === itemId);
    if (index !== -1) showDetails(index);
}

function showDetails(index) {
    const data = localStorage.getItem('budgetRequests');
    const submissions = data ? JSON.parse(data) : [];
    const item = submissions[index];
    const detailsPanel = document.querySelector('.details-container');

    if (!item || !detailsPanel) return;

    detailsPanel.innerHTML = `
    <div style="background: #ffd5a2c2; padding: 25px; border-radius: 12px; color: #333; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
            <h2 style="margin: 0; font-size: 22px;">${item.id || 'BDG-2024-001'}</h2>
            <span style="background: #fffbe6; color: #faad14; border: 1px solid #ffe58f; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                ${item.priority || 'MEDIUM'}
            </span>
        </div>
        <h3 style="margin: 0 0 20px 0; font-weight: 500; color: #666;">${item.title}</h3>

        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; font-size: 14px; margin-bottom: 25px;">
            <span style="color: #555;">👤 Department:</span> <span style="text-align: right;">${item.department}</span>
            <span style="color: #555;">👤 Submitter:</span> <span style="text-align: right;">${item.submitter || 'user'}</span>
            <span style="color: #555;">📅 Submitted:</span> <span style="text-align: right;">${item.date || ''}</span>
        </div>

        <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #555;">Requested Amount:</span>
                <strong>₱${parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: #555;">Approved Amount:</span>
                <strong style="color: #27ae60;">₱${parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
            </div>
        </div>

        <div style="display: flex; gap: 12px;">
            <button onclick="openSignatureModal(${index})" style="flex: 2; display: flex; align-items: center; justify-content: center; gap: 8px; background: #00c853; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                 Approve & Sign
            </button>
            <button onclick="handleRejectAction(${index})" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: #ff0000; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                Reject
            </button>
        </div>
    </div>`;
}

function handleSignatureFiles(files) {
    const file = files[0];
    const previewImg = document.getElementById('sig-image-preview');
    const previewText = document.getElementById('sig-preview-content');
    const dropZone = document.getElementById('drop-zone');

    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            if (previewText) previewText.style.display = 'none';
            dropZone.style.borderColor = "#ccc"; // Reset border color on success
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please upload a valid image file (PNG/JPG).");
    }
}

function initSignatureUpload() {
    const dropArea = document.getElementById('drop-zone');
    const fileInput = document.getElementById('sig-upload');

    if (!dropArea || !fileInput) return;

    dropArea.onclick = () => fileInput.click();
    fileInput.onchange = () => handleSignatureFiles(fileInput.files);

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
        dropArea.addEventListener(name, e => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropArea.addEventListener('drop', e => {
        handleSignatureFiles(e.dataTransfer.files);
    });
}

function openSignatureModal(index) {
    const data = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    const item = data[index];
    currentApprovalIndex = index;

    document.getElementById('modal-item-id').innerText = item.id;
    document.getElementById('modal-banner-id').innerText = item.id;
    document.getElementById('modal-banner-amt').innerText = "₱" + parseFloat(item.amount).toLocaleString();
    
    // Reset Modal Fields
    const nameField = document.getElementById('sig-full-name');
    nameField.value = "";
    nameField.style.borderColor = "#ccc";
    
    const dropZone = document.getElementById('drop-zone');
    dropZone.style.borderColor = "#ccc";

    document.getElementById('sig-image-preview').style.display = 'none';
    document.getElementById('sig-image-preview').src = "";
    document.getElementById('sig-preview-content').style.display = 'block';
    
    document.getElementById('sig-modal').style.display = 'flex';
    
    initSignatureUpload();
}

// --- UPDATED: EVERYTHING IS NOW REQUIRED ---
function confirmSignature() {
    const nameInput = document.getElementById('sig-full-name');
    const fullName = nameInput.value.trim();
    const previewImg = document.getElementById('sig-image-preview');
    const sigImage = previewImg.src;
    const dropZone = document.getElementById('drop-zone');

    let isValid = true;

    // Validate Name
    if (fullName === "") {
        nameInput.style.borderColor = "#ff4d4f";
        isValid = false;
    } else {
        nameInput.style.borderColor = "#ccc";
    }

    // Validate Image
    if (previewImg.style.display === 'none' || sigImage === "" || sigImage.includes('window.location.href')) {
        dropZone.style.borderColor = "#ff4d4f";
        isValid = false;
    } else {
        dropZone.style.borderColor = "#ccc";
    }

    if (!isValid) {
        alert("Please provide BOTH your full name and signature image to proceed.");
        return;
    }

    // If valid, proceed with approval
    const data = JSON.parse(localStorage.getItem('budgetRequests'));
    const item = data[currentApprovalIndex];
    const oldStatus = item.status || 'Pending';
    
    data[currentApprovalIndex].status = "Fully Approved";
    data[currentApprovalIndex].signatureName = fullName;
    data[currentApprovalIndex].signatureImage = sigImage;
    data[currentApprovalIndex].approvalDate = new Date().toLocaleDateString();

    localStorage.setItem('budgetRequests', JSON.stringify(data));
    
    addNotification(`Budget request ${item.id} has been fully approved`);
    
    const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
    logs.unshift({
        id: item.id,
        title: item.title || item.description,
        action: 'Fully Approved',
        details: 'Budget approved with e-signature',
        role: 'Approving Official',
        timestamp: new Date().toLocaleString(),
        ip: "192.168.1." + Math.floor(Math.random() * 255),
        statusFrom: oldStatus,
        statusTo: 'Fully Approved'
    });
    localStorage.setItem('activityLogs', JSON.stringify(logs));
    
    alert(`Budget ${item.id} has been signed and approved!`);
    
    closeSignatureModal();
    renderQueue();
    document.querySelector('.details-container').innerHTML = '<div class="empty-state-card"><p>Select a budget request to review</p></div>';
}

function closeSignatureModal() {
    document.getElementById('sig-modal').style.display = 'none';
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
        data[index].rejectionDate = new Date().toLocaleString();
        localStorage.setItem('budgetRequests', JSON.stringify(data));
        
        addNotification(`Budget request ${item.id} has been rejected`);
        
        const logs = JSON.parse(localStorage.getItem('activityLogs')) || [];
        logs.unshift({
            id: item.id,
            title: item.title || item.description,
            action: 'Rejected',
            details: 'Budget request rejected',
            role: 'Approving Official',
            timestamp: new Date().toLocaleString(),
            ip: "192.168.1." + Math.floor(Math.random() * 255),
            statusFrom: oldStatus,
            statusTo: 'Rejected'
        });
        localStorage.setItem('activityLogs', JSON.stringify(logs));
        
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
    notifications = notifications.slice(0, 50);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    window.dispatchEvent(new Event('storage'));
}