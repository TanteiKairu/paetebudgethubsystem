// shared_logic.js

function updateBudgetStatus(budgetId, newStatus, actorName, comment) {
    // 1. Get existing budget records
    let budgets = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    
    // 2. Find and Update the specific budget
    let budgetIndex = budgets.findIndex(b => b.id === budgetId);
    if (budgetIndex !== -1) {
        let oldStatus = budgets[budgetIndex].status;
        budgets[budgetIndex].status = newStatus;
        localStorage.setItem('budgetRequests', JSON.stringify(budgets));

        // 3. AUTOMATICALLY create the Audit Log entry
        const logs = JSON.parse(localStorage.getItem('auditLogs')) || [];
        const newLog = {
            id: budgetId,
            title: budgets[budgetIndex].projectTitle,
            action: newStatus, 
            details: comment || `Status changed from ${oldStatus} to ${newStatus}`,
            user: actorName,
            timestamp: new Date().toLocaleString(),
            statusChange: `${oldStatus} → ${newStatus}`,
            ip: "192.168.1." + Math.floor(Math.random() * 255)
        };

        logs.unshift(newLog); // Add new activity to the top
        localStorage.setItem('auditLogs', JSON.stringify(logs));
    }
}