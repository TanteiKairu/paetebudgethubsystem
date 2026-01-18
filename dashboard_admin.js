// Dashboard Admin JavaScript

function updateDashboardStats() {
    // Only use budgetRequests - actual submissions from the budget submission page
    const requests = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    
    // Filter out invalid entries (those with missing required fields, NaN amounts, or invalid data)
    const validData = requests.filter(item => {
        const amount = parseFloat(item.amount || 0);
        return item.id && 
               (item.title || item.description || item.projectTitle) && 
               !isNaN(amount) && 
               amount >= 0 &&
               (item.date || item.submissionDate);
    });
    
    let total = validData.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    
    validData.forEach(item => {
        const status = (item.status || '').toLowerCase();
        if (status === 'pending' || status === 'revision requested' || status === 'submitted' || !status) {
            pending++;
        } else if (status === 'fully approved') {
            approved++;
        } else if (status === 'rejected') {
            rejected++;
        }
    });
    
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-pending').innerText = pending;
    document.getElementById('stat-approved').innerText = approved;
    document.getElementById('stat-rejected').innerText = rejected;
    
    updateRecentRequests(validData);
}

function updateRecentRequests(allData) {
    const recentContainer = document.getElementById('recent-requests');
    const recentCount = document.getElementById('recent-count');
    
    if (!recentContainer || !recentCount) return;
    
    // Sort by date (most recent first) and take first 5
    const sorted = [...allData].sort((a, b) => {
        const dateA = new Date(a.date || a.submissionDate || 0);
        const dateB = new Date(b.date || b.submissionDate || 0);
        return dateB - dateA;
    }).slice(0, 5);
    
    if (sorted.length === 0) {
        recentContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No recent requests</div>';
        recentCount.innerText = 'Showing 0';
        return;
    }
    
    recentContainer.innerHTML = '';
    sorted.forEach(item => {
        const status = item.status || 'Pending';
        const statusLower = status.toLowerCase();
        let statusColor = '#faad14';
        if (statusLower.includes('approved')) statusColor = '#52c41a';
        else if (statusLower.includes('rejected')) statusColor = '#f5222d';
        
        const card = document.createElement('div');
        card.className = 'um-user-item';
        card.style = 'padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.05);';
        card.innerHTML = `
            <div class="um-user-info">
                <div class="um-name-row">
                    <span class="um-full-name">${item.id || 'N/A'} – ${item.title || item.description || item.projectTitle || 'Untitled'}</span>
                    <span class="um-badge-active" style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75em;">${status}</span>
                </div>
                <div class="um-meta-row">
                    <span>🏢 ${item.department || item.dept || 'N/A'}</span>
                    <span>📅 ${item.date || item.submissionDate || 'N/A'}</span>
                    <span>💰 ₱${(parseFloat(item.amount || 0) || 0).toLocaleString()}</span>
                </div>
            </div>
        `;
        recentContainer.appendChild(card);
    });
    
    recentCount.innerText = `Showing ${sorted.length}`;
}

function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notification-badge');
    const list = document.getElementById('notifications-list');
    
    if (unreadCount > 0) {
        badge.style.display = 'flex';
        badge.innerText = unreadCount > 99 ? '99+' : unreadCount;
    } else {
        badge.style.display = 'none';
    }
    
    if (notifications.length === 0) {
        list.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No notifications</div>';
        return;
    }
    
    list.innerHTML = '';
    notifications.slice(0, 20).forEach(notif => {
        const item = document.createElement('div');
        item.style = `padding: 12px 15px; border-bottom: 1px solid #eee; cursor: pointer; ${!notif.read ? 'background: #f0f7ff;' : ''}`;
        item.onclick = () => markNotificationRead(notif.id);
        item.innerHTML = `
            <div style="font-size: 14px; color: #333; margin-bottom: 4px;">${notif.message}</div>
            <div style="font-size: 12px; color: #999;">${notif.timestamp}</div>
        `;
        list.appendChild(item);
    });
}

function markNotificationRead(id) {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
        notifications[index].read = true;
        localStorage.setItem('notifications', JSON.stringify(notifications));
        loadNotifications();
    }
}

function clearAllNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
        localStorage.setItem('notifications', JSON.stringify([]));
        loadNotifications();
    }
}

function toggleNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const btn = document.getElementById('notifications-btn');
    const dropdown = document.getElementById('notifications-dropdown');
    if (dropdown && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardStats();
    loadNotifications();
    
    // Update stats when data changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'budgetRequests' || e.key === 'notifications') {
            updateDashboardStats();
            loadNotifications();
        }
    });
    
    // Also update on page focus (for same-tab updates)
    window.addEventListener('focus', () => {
        updateDashboardStats();
        loadNotifications();
    });
    
    // Refresh every 5 seconds
    setInterval(() => {
        updateDashboardStats();
        loadNotifications();
    }, 5000);
});
function forceUpdateBudgetChart() {
    // 1. SETTINGS
    const TOTAL_LIMIT = 1000000; // 1 Million Limit
    let totalUsed = 0;
    
    // 2. THE UNIVERSAL SCANNER
    // This loops through EVERYTHING in your browser storage to find the data
    console.log("--- STARTING BUDGET SCAN ---");
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        try {
            const parsedData = JSON.parse(value);
            
            // Check if this is a list of requests
            if (Array.isArray(parsedData)) {
                parsedData.forEach(item => {
                    // Check if this item is "Fully Approved"
                    if (item.status && item.status.trim() === "Fully Approved") {
                        console.log("Found Approved Request:", item);
                        
                        // CLEAN THE AMOUNT: Turns "₱100,000" into 100000
                        // The regex /[^0-9.]/g removes EVERYTHING except numbers and dots
                        let cleanAmount = String(item.amount).replace(/[^0-9.]/g, '');
                        let numericAmount = parseFloat(cleanAmount);

                        if (!isNaN(numericAmount)) {
                            totalUsed += numericAmount;
                        }
                    }
                });
            }
        } catch (e) {
            // Ignore items that aren't JSON (like user settings)
        }
    }
    
    console.log("Total Used Calculated:", totalUsed);

    // 3. CALCULATE REMAINING
    const totalUnused = Math.max(0, TOTAL_LIMIT - totalUsed);

    // 4. UPDATE TEXT LABELS
    // Ensure these elements exist in your HTML!
    if(document.getElementById('limit-display')) 
        document.getElementById('limit-display').innerText = `Limit: ₱${TOTAL_LIMIT.toLocaleString()}`;
    
    if(document.getElementById('used-display')) 
        document.getElementById('used-display').innerText = `₱${totalUsed.toLocaleString()}`;
    
    if(document.getElementById('unused-display')) 
        document.getElementById('unused-display').innerText = `₱${totalUnused.toLocaleString()}`;

    // 5. DRAW THE PIE CHART
    const ctx = document.getElementById('budgetPieChart');
    if (ctx) {
        // Destroy old chart to prevent "ghosting"
        if (window.myPieChart instanceof Chart) {
            window.myPieChart.destroy();
        }

        window.myPieChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Used Budget', 'Unused Budget'],
                datasets: [{
                    data: [totalUsed, totalUnused],
                    backgroundColor: ['#d9534f', '#5cb85c'], // Red & Green
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }, // We used custom HTML text instead
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ₱${context.raw.toLocaleString()}`
                        }
                    }
                }
            }
        });
    }
}

// Run immediately when page loads
document.addEventListener('DOMContentLoaded', forceUpdateBudgetChart);

// Run whenever you click ANY button (just in case)
document.addEventListener('click', () => setTimeout(forceUpdateBudgetChart, 500));