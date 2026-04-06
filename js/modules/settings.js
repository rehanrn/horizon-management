// Settings Module - Enterprise Branding & Data Management
window.renderSettings = function() {
    const html = `
        <div class="view-header">
            <h2>System Settings & Management</h2>
        </div>
        
        <div class="grid-cards" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
            
            <!-- Branding & Identity -->
            <div class="card">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
                    <i class="ph ph-buildings" style="font-size:24px; color:var(--primary);"></i>
                    <h3 style="font-size:16px;">Institution Branding</h3>
                </div>
                <div class="form-group">
                    <label>Institute Name</label>
                    <input type="text" id="setting-name" value="THE HORIZON INSTITUTE & SOFTWARE HOUSE" placeholder="Enter Full Name">
                </div>
                <button class="btn btn-primary" onclick="window.showToast('Branding updated in local session', 'success')" style="width:100%; margin-top:10px;">Update Brand</button>
            </div>

            <!-- Database Lifeboat -->
            <div class="card">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
                    <i class="ph ph-database" style="font-size:24px; color:var(--primary);"></i>
                    <h3 style="font-size:16px;">Backup & Recovery</h3>
                </div>
                <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Download your entire database as a JSON file for safety.</p>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <button class="btn btn-primary" onclick="Store.exportData()">
                        <i class="ph ph-download-simple"></i> Download Full Backup
                    </button>
                    
                    <div style="position:relative;">
                        <input type="file" id="import-db-file" style="display:none" onchange="handleDBImport(event)">
                        <button class="btn btn-secondary" onclick="document.getElementById('import-db-file').click()" style="width:100%;">
                            <i class="ph ph-upload-simple"></i> Restore from Backup
                        </button>
                    </div>
                </div>
            </div>

            <!-- Critical Actions -->
            <div class="card" style="border-color: rgba(244, 63, 94, 0.2);">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
                    <i class="ph ph-warning-octagon" style="font-size:24px; color:var(--danger);"></i>
                    <h3 style="font-size:16px; color:var(--danger);">Factory Reset</h3>
                </div>
                <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Wipe all students, teachers, and records. This cannot be undone.</p>
                <button class="btn btn-danger" onclick="triggerReset()" style="width:100%;">
                    <i class="ph ph-trash"></i> Reset System Data
                </button>
            </div>

        </div>
    `;
    
    document.getElementById('view-settings').innerHTML = html;
}

window.handleDBImport = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        window.confirmCustom(
            "Restore Backup?",
            "This will overwrite all current data with the backup file. Proceed?",
            () => {
                if (Store.importData(content)) {
                    window.showToast("Database Restored Successfully!", "success");
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    window.showToast("Invalid backup file.", "error");
                }
            }
        );
    };
    reader.readAsText(file);
}

window.triggerReset = function() {
    window.confirmCustom(
        "Confirm Factory Reset?",
        "This will permanently delete all records. Are you absolutely sure?",
        () => {
            Store.clearAll();
            window.showToast("System Reset Complete", "success");
            setTimeout(() => window.location.reload(), 1000);
        }
    );
}
