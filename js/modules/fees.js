// Fees Module
window.renderFees = function(filter = '') {
    window.currentFees = Store.getAll('fees');
    const students = Store.getAll('students');
    
    // Sort newly retrieved fees so the latest are always on top
    const sortedFees = [...window.currentFees].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let displayFees = sortedFees;
    if(filter) {
        displayFees = sortedFees.filter(f => {
            const student = students.find(s => s.id === f.studentId);
            return student && student.name.toLowerCase().includes(filter.toLowerCase());
        });
    }

    const html = `
        <div class="view-header" style="margin-bottom: 24px;">
            <h2>Fee Collections</h2>
            <div style="display:flex; gap: 12px; align-items:center;">
                <div style="position:relative;">
                    <i class="ph ph-magnifying-glass" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size: 16px;"></i>
                    <input type="text" id="fee-search-filter" placeholder="Search by student..." style="padding: 10px 16px 10px 36px; border: 1px solid var(--border); border-radius: var(--radius-sm); outline: none; font-size: 13px; font-weight: 500; width: 240px; box-shadow: var(--shadow-sm); transition: 0.2s;" oninput="renderFees(this.value)" value="${filter}">
                </div>
                <button class="btn btn-primary" onclick="openFeeModal()" style="padding: 10px 20px;"><i class="ph ph-wallet" style="font-size: 16px;"></i> Collect Payment</button>
            </div>
        </div>
        <div class="card table-card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Student Name</th>
                        <th>Collected Amount</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th style="text-align:right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${displayFees.length === 0 ? `<tr><td colspan="7">
                        <div class="no-data-msg" style="border:none">
                            <i class="ph ph-receipt"></i>
                            <span>No transactions found matching your filters.</span>
                        </div>
                    </td></tr>` : 
                    
                    displayFees.map(fee => {
                        const student = students.find(s => s.id === fee.studentId);
                        let displayName = `<span style="font-weight: 600; color: var(--text-strong);">${fee.payerName || 'Walk-in / Unknown'}</span>`;
                        
                        if(student) {
                            displayName += `<br><span style="font-size: 11px; color: var(--text-muted);">Linked: ${student.name}</span>`;
                        } else if(fee.studentId) {
                            displayName += `<br><span style="font-size: 11px; color: var(--danger);">Linked student deleted</span>`;
                        }
                        
                        let methodIcon = '<i class="ph ph-money"></i>';
                        if(fee.method === 'Card') methodIcon = '<i class="ph ph-credit-card"></i>';
                        if(fee.method === 'Bank Transfer') methodIcon = '<i class="ph ph-bank"></i>';

                        return `
                        <tr>
                            <td style="color:var(--text-muted); font-size:13px; font-weight:500;">
                                <div style="display:flex; flex-direction:column; gap:2px;">
                                    <span style="color:var(--text-main); font-weight:600;">${new Date(fee.createdAt).toLocaleDateString()}</span>
                                    <span style="font-size: 11px;">${new Date(fee.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </td>
                            <td>${displayName}</td>
                            <td><span style="font-weight: 700; color: var(--success); font-size: 16px;">PKR ${parseFloat(fee.amount).toLocaleString()}</span></td>
                            <td><div style="display:inline-flex; align-items:center; gap:6px; color:var(--text-main); background: var(--bg-hover); padding: 4px 10px; border-radius: var(--radius-sm); font-size:12px; font-weight:600; border: 1px solid var(--border);">${methodIcon} ${fee.method}</div></td>
                            <td><span class="badge success"><i class="ph ph-check-circle"></i> ${fee.status}</span></td>
                            <td style="text-align:right">
                                <button class="btn-icon" onclick="printReceipt('${fee.id}')" title="Print Professional Receipt"><i class="ph ph-printer"></i></button>
                                <button class="btn-icon" onclick="editFee('${fee.id}')" title="Edit Transaction"><i class="ph ph-pencil-simple"></i></button>
                                <button class="btn-icon" style="color: var(--danger)" onclick="deleteFee('${fee.id}')" title="Delete Transaction"><i class="ph ph-trash"></i></button>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('view-fees').innerHTML = html;
    
    // Sync external focus styling
    setTimeout(() => {
        const searchBox = document.getElementById('fee-search-filter');
        if(searchBox) {
            searchBox.addEventListener('focus', () => searchBox.style.borderColor = 'var(--primary)');
            searchBox.addEventListener('blur', () => searchBox.style.borderColor = 'var(--border)');
            if(filter) {
                // Return cursor focus to end seamlessly to retain continuous typing
                searchBox.focus();
                searchBox.setSelectionRange(searchBox.value.length, searchBox.value.length);
            }
        }
    }, 10);
}

window.openFeeModal = function() {
    const students = Store.getAll('students').filter(s => s.status === 'Active');
    document.getElementById('fee-student').innerHTML = '<option value="">-- Generic Walk-in / Not Linked --</option>' + students.map(s => `<option value="${s.id}">${s.name} (ID: ${s.id.slice(-4)})</option>`).join('');
    
    // Ensure we clear out any old IDs if opening new form after an edit
    document.getElementById('fee-id').value = '';
    document.getElementById('fee-payer').value = '';
    document.getElementById('fee-amount').value = '';
    
    openModal('fee-modal');
}

window.editFee = function(id) {
    const fee = Store.getById('fees', id);
    if(!fee) return;
    
    // We get all students (even inactive ones) in case we are editing a very old historical transaction
    const students = Store.getAll('students'); 
    document.getElementById('fee-student').innerHTML = '<option value="">-- Generic Walk-in / Not Linked --</option>' + students.map(s => `<option value="${s.id}">${s.name} (ID: ${s.id.slice(-4)})</option>`).join('');
    
    document.getElementById('fee-id').value = fee.id;
    document.getElementById('fee-payer').value = fee.payerName || '';
    document.getElementById('fee-student').value = fee.studentId || '';
    document.getElementById('fee-amount').value = fee.amount;
    document.getElementById('fee-method').value = fee.method;
    
    openModal('fee-modal');
}

window.deleteFee = function(id) {
    window.confirmCustom(
        'Delete Transaction?', 
        'Warning: Deleting this financial transaction cannot be undone. Are you absolutely sure?', 
        () => {
            Store.delete('fees', id);
            renderFees(document.getElementById('fee-search-filter')?.value || '');
            window.showToast("Transaction deleted", "success");
        }
    );
}

window.printReceipt = function(feeId) {
    const fee = Store.getById('fees', feeId);
    const student = Store.getById('students', fee.studentId);
    const studentName = student?.name || fee.payerName || "Walk-in Customer";
    
    const printWindow = window.open('', '_blank', 'width=800,height=800');
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Receipt - ${studentName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; background: #fff; }
            .receipt-container { max-width: 650px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; }
            .brand h1 { font-size: 20px; font-weight: 800; margin: 0; color: #0f172a; letter-spacing: -0.5px; }
            .brand p { font-size: 11px; color: #64748b; margin: 4px 0 0 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
            .badge { background: #f1f5f9; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; color: #475569; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
            .detail-item .label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
            .detail-item .value { font-size: 15px; font-weight: 600; color: #1e293b; }
            .amount-section { background: #f8fafc; border-radius: 12px; padding: 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border: 1px solid #f1f5f9; }
            .amount-label { font-size: 14px; font-weight: 800; color: #475569; }
            .amount-value { font-size: 28px; font-weight: 800; color: #10b981; }
            .footer { text-align: center; border-top: 1px dashed #e2e8f0; padding-top: 30px; margin-top: 40px; }
            .footer p { font-size: 12px; color: #94a3b8; margin: 0; }
            .no-print-btn { display: block; margin: 20px auto; padding: 10px 24px; background: #0ea5e9; color: #white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
            @media print { .no-print-btn { display: none; } }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <div class="brand">
                    <h1>THE HORIZON INSTITUTE</h1>
                    <p>Software House & Management System</p>
                </div>
                <div class="badge">E-RECEIPT #${feeId.slice(-6).toUpperCase()}</div>
            </div>

            <div class="details-grid">
                <div class="detail-item">
                    <div class="label">Date of Payment</div>
                    <div class="value">${new Date(fee.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Payment Method</div>
                    <div class="value">${fee.method}</div>
                </div>
                <div class="detail-item" style="grid-column: span 2;">
                    <div class="label">Received From</div>
                    <div class="value" style="font-size: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">${studentName}</div>
                </div>
            </div>

            <div class="amount-section">
                <div class="amount-label">Total Amount Received</div>
                <div class="amount-value">PKR ${parseFloat(fee.amount).toLocaleString()}</div>
            </div>

            <div class="footer">
                <p style="font-weight: 800; color: #475569; margin-bottom: 8px;">Thank You for Your Payment</p>
                <p>This is an electronically generated receipt by THE HORIZON INSTITUTE management software. No signature is required.</p>
            </div>
        </div>
        <button class="no-print-btn" onclick="window.print()">Print This Receipt</button>
    </body>
    </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
}
