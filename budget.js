document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('budgetLineAddButton');
    const container = document.getElementById('lineItemsContainer');
    const grandTotalDisplay = document.getElementById('grandTotalDisplay');
    let itemCount = 1;

    const calculateTotal = (qty, cost) => {
        const quantity = parseFloat(qty) || 0;
        const unitCost = parseFloat(cost.replace(/[^\d.]/g, '')) || 0; 
        return (quantity * unitCost);
    };

    const updateGrandTotal = () => {
        let grandTotal = 0;
        const totalDisplays = container.querySelectorAll('.item-total-display');
        totalDisplays.forEach(display => {
            const itemTotal = parseFloat(display.innerText.replace(/[^\d.]/g, '')) || 0;
            grandTotal += itemTotal;
        });
        grandTotalDisplay.innerText = `₱${grandTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    const handleInput = (event) => {
        if (!event.target.classList.contains('item-quantity-input') && !event.target.classList.contains('item-cost-input')) return;
        const itemEntry = event.target.closest('.line-item-entry');
        if (!itemEntry) return;
        const qtyInput = itemEntry.querySelector('.item-quantity-input');
        const costInput = itemEntry.querySelector('.item-cost-input');
        const totalDisplay = itemEntry.querySelector('.item-total-display');
        const itemTotal = calculateTotal(qtyInput.value, costInput.value);
        totalDisplay.innerText = `₱${itemTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        updateGrandTotal();
    };
    
    const lineItemTemplate = () => `
        <div class="line-item-entry" data-item-id="${itemCount}">
            <div class="form-row item-header">
                <div class="form-group item-description"><label>Description</label><input type="text" class="item-input" name="item_desc_${itemCount}" placeholder="Item description"></div>
                <div class="form-group item-quantity"><label>Quantity</label><input type="number" class="item-input item-quantity-input" name="item_qty_${itemCount}" value="1" min="1"></div>
                <div class="form-group item-unit-cost"><label>Unit Cost (₱)</label><input type="text" class="item-input item-cost-input" name="item_cost_${itemCount}" value="0" placeholder="0.00"></div>
                <div class="form-group item-total"><label>Total</label><p class="total-amount item-total-display">₱0.00</p></div>
                <div class="form-group item-actions"><button type="button" class="btn-remove-item" data-item-id="${itemCount}">&times;</button></div>
            </div>
        </div>`;

    const addItem = () => { itemCount++; container.insertAdjacentHTML('beforeend', lineItemTemplate()); };
    const removeItem = (event) => {
        if (event.target.closest('.btn-remove-item')) {
            event.target.closest('.line-item-entry').remove();
            updateGrandTotal();
        }
    };
    
    addButton.addEventListener('click', addItem);
    container.addEventListener('input', handleInput); 
    container.addEventListener('click', removeItem); 
    updateGrandTotal();
});

// File Upload Logic
document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('fileDropArea');
    const fileInput = document.getElementById('fileInput');
    const fileListContainer = document.getElementById('fileListContainer');
    
    dropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => dropArea.addEventListener(name, e => { e.preventDefault(); e.stopPropagation(); }));
    dropArea.addEventListener('drop', e => handleFiles(e.dataTransfer.files));

    function handleFiles(files) {
        fileListContainer.innerHTML = '';
        [...files].forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.className = 'uploaded-file-item';
            fileElement.innerHTML = file.size > 10 * 1024 * 1024 ? `<span>❌ ${file.name} (Max 10MB)</span>` : `<span>✅ ${file.name}</span>`;
            fileListContainer.appendChild(fileElement);
        });
    }
});

// THE FINAL SUBMISSION LOGIC
function submitBudget() {
    const titleValue = document.querySelector('input[placeholder*="infrastructure"]').value;
    const justificationValue = document.querySelector('textarea').value;
    
    // Captures the actual typed department from the first input on the page
    const deptInput = document.querySelector('.form-group input[type="text"]');
    const deptValue = deptInput ? deptInput.value : "General Department";

    // Captures the calculated total
    const totalDisplay = document.getElementById('grandTotalDisplay');
    const cleanAmount = totalDisplay ? parseFloat(totalDisplay.innerText.replace(/[₱,]/g, '')) : 0;

    if (!titleValue || !justificationValue || !deptValue) {
        alert("Please fill out all fields (Department, Title, and Justification).");
        return;
    }

    const budgetData = {
        id: "BDG-" + Math.floor(1000 + Math.random() * 9000),
        title: titleValue,
        department: deptValue,
        amount: cleanAmount,
        justification: justificationValue,
        date: new Date().toLocaleDateString(),
        priority: "HIGH",
        status: "PENDING"
    };

    const existing = JSON.parse(localStorage.getItem('budgetRequests')) || [];
    existing.unshift(budgetData);
    localStorage.setItem('budgetRequests', JSON.stringify(existing));

    alert("Success! Budget for " + deptValue + " has been sent to Finance.");
    window.location.href = "financerev.html";
}