
const USER_CREDENTIALS = {
    "admin": { user: "admin", pass: "admin123", redirect: "dashboard_admin.html"},
   "dept": { user: "dept", pass: "dept123", redirect: "dashboard_dept.html" },
    "finance": { user: "finance", pass: "finance123", redirect: "dashboard_finance.html" },
    "staff": { user: "staff", pass: "staff123", redirect: "dashboard_staff.html" },
     "approver": { user: "approver", pass: "approver123", redirect: "dashboard_approver.html" }
};

function determineRole(userId) {
  
    const lowerId = userId.toLowerCase();
    

    if (lowerId.startsWith("admin")) return "admin";
    if (lowerId.startsWith("dept")) return "dept";
    if (lowerId.startsWith("finance")) return "finance";
    if (lowerId.startsWith("staff")) return "staff";
    if (lowerId.startsWith("appr")) return "approver"; 
    
    return null; 
}


function checkEnter(event) {

    if (event.keyCode === 13) {
        event.preventDefault(); 

        login(); 
    }
}
function login() {
    let user = document.getElementById("loginUser").value.trim();
    let pass = document.getElementById("loginPass").value.trim();

    if (!user || !pass) {
        alert("Username and Password are required.");
        return;
    }

    const role = determineRole(user);

    if (!role) {
        alert("Invalid Username format. Please ensure your username includes a valid role prefix (e.g., admin, dept, finance, staff, or approver).");
        return;
    }

    const expectedCredentials = USER_CREDENTIALS[role];

    if (expectedCredentials && user === expectedCredentials.user && pass === expectedCredentials.pass) {
        alert("Login successful! Redirecting to " + role.toUpperCase() + " Dashboard.");
        
        window.location.href = expectedCredentials.redirect;
        
    } else {
        alert("Incorrect User ID or Password.");
    }
}

function changePassword() {
    let user = document.getElementById("cpUser").value;
    let email = document.getElementById("cpEmail").value;
    let newPass = document.getElementById("newPass").value;
    let confirm = document.getElementById("confirmPass").value;

    if (!user || !email || !newPass || !confirm) {
        alert("Please fill all fields.");
        return;
    }

    if (newPass !== confirm) {
        alert("Passwords do not match.");
        return;
    }

    if (user === localStorage.getItem("username") && email === localStorage.getItem("email")) {
        localStorage.setItem("password", newPass);
        alert("Password updated! Please login again.");
        window.location.href = "login.html";
    } else {
        alert("User not found.");
    }

}

let rowCounter = 1;

function addRow() {
    rowCounter++;
    
    const template = document.getElementById('item-row-template');
    const newRow = template.cloneNode(true);
    newRow.id = `item-row-${rowCounter}`;
    newRow.style.display = 'table-row';
    newRow.classList.add('item-row');
    newRow.setAttribute('data-row-id', rowCounter);
    
    const inputs = newRow.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = (input.type === 'number' && input.name.includes('quantity')) ? '1' : 
                      (input.type === 'number') ? '0.00' : '';
        input.setAttribute('required', 'required');
    });

    newRow.querySelector('.total-cell').textContent = '0.00';
    
    document.querySelector('#line-items-table tbody').appendChild(newRow);
    updateGrandTotal();
}

function removeRow(button) {
    const row = button.closest('.item-row');
    const visibleRows = document.querySelectorAll('.item-row:not(#item-row-template)');
    
    if (visibleRows.length > 1) {
        row.remove();
    } else {
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = (input.type === 'number' && input.name.includes('quantity')) ? '1' : 
                          (input.type === 'number') ? '0.00' : '';
        });
        row.querySelector('.total-cell').textContent = '0.00';
    }
    updateGrandTotal();
}

function calculateTotal(input) {
    const row = input.closest('.item-row');
    const quantityInput = row.querySelector('input[name="quantity[]"]');
    const priceInput = row.querySelector('input[name="unit_price[]"]');
    const totalCell = row.querySelector('.total-cell');

    const quantity = parseFloat(quantityInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;

    const total = (quantity * price);
    totalCell.textContent = total.toFixed(2);
    
    updateGrandTotal();
}

function updateGrandTotal() {
    let grandTotal = 0;
    
    document.querySelectorAll('.item-row:not(#item-row-template) .total-cell').forEach(cell => {
        grandTotal += parseFloat(cell.textContent) || 0;
    });

    document.getElementById('grand-total-amount').textContent = `$${grandTotal.toFixed(2)}`;
}

window.onload = updateGrandTotal;


