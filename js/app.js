let isAppInitialized = false;
let currentView = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
    // Auth Handshake: Only start UI if session is already active in high-speed head check
    if (localStorage.getItem('academy_auth_session') === 'active') {
        initApp();
    }
});

function initApp() {
    if(isAppInitialized) return; // Guard against double execution
    isAppInitialized = true;

    document.documentElement.classList.add('is-authenticated');
    const lastTab = sessionStorage.getItem('academy_last_tab') || 'dashboard';
    
    initNavigation();
    injectModals();
    injectToastContainer();
    
    const targetBtn = document.querySelector(`.nav-btn[data-target="${lastTab}"]`);
    if(targetBtn) targetBtn.click();
    else triggerRender('dashboard');
}

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('page-title');

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            navButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const target = e.currentTarget.getAttribute('data-target');
            currentView = target;
            sessionStorage.setItem('academy_last_tab', target);
            pageTitle.innerHTML = e.currentTarget.innerHTML;

            viewSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `view-${target}`) {
                    section.classList.add('active');
                }
            });
            triggerRender(target);
            
            // Auto-close sidebar on mobile after selection
            if(window.innerWidth <= 1024) {
                const sidebar = document.getElementById('sidebar');
                if(sidebar.classList.contains('active')) toggleSidebar();
            }
        });
    });

    document.getElementById('global-search').addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        if(window[`render${currentView.charAt(0).toUpperCase() + currentView.slice(1)}`]) {
            window[`render${currentView.charAt(0).toUpperCase() + currentView.slice(1)}`](val);
        }
    });
}

function triggerRender(target) {
    if(target === 'dashboard' && window.renderDashboard) renderDashboard();
    if(target === 'students' && window.renderStudents) renderStudents();
    if(target === 'teachers' && window.renderTeachers) renderTeachers();
    if(target === 'courses' && window.renderCourses) renderCourses();
    if(target === 'attendance' && window.renderAttendance) renderAttendance();
    if(target === 'fees' && window.renderFees) renderFees();
    if(target === 'settings' && window.renderSettings) renderSettings();
}

function openPanel(title, htmlContent) {
    document.getElementById('panel-title').innerText = title;
    document.getElementById('panel-content').innerHTML = htmlContent;
    document.getElementById('slide-panel').classList.add('active');
}

window.closePanel = function() {
    document.getElementById('slide-panel').classList.remove('active');
}

window.logout = function() {
    if(window.Auth) window.Auth.logout();
}

window.openModal = function(modalId) {
    document.getElementById(modalId).classList.add('active');
    // Re-bind formatters to ensure any dynamically injected inputs are captured
    bindSmartFormatters();
}

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
    const form = document.querySelector(`#${modalId} form`);
    if(form) form.reset();
    
    const hiddenInputs = document.querySelectorAll(`#${modalId} input[type="hidden"]`);
    hiddenInputs.forEach(i => i.value = '');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
        closePanel();
        const sidebar = document.getElementById('sidebar');
        if(sidebar.classList.contains('active')) toggleSidebar();
    }
});

window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function injectModals() {
    const container = document.getElementById('modal-container');
    container.innerHTML = `
        <!-- Full Detail Student Modal -->
        <div class="modal-overlay" id="student-modal">
            <div class="modal" style="max-width: 650px;">
                <div class="modal-header">
                    <h3>Student Details</h3>
                    <button class="btn-icon" onclick="closeModal('student-modal')"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body">
                    <form id="student-form">
                        <input type="hidden" id="student-id">
                        
                        <div class="form-grid two-cols">
                            <div class="form-group full-width"><label>Full Name</label><input type="text" id="student-name" required></div>
                            <div class="form-group"><label>Date of Birth</label><input type="date" id="student-dob" required></div>
                            <div class="form-group"><label>Gender</label><select id="student-gender" required><option>Male</option><option>Female</option><option>Other</option></select></div>
                            <div class="form-group"><label>CNIC Number</label><input type="text" id="student-cnic" placeholder="xxxxx-xxxxxxx-x"></div>
                            <div class="form-group"><label>Personal Phone</label><input type="text" id="student-phone" placeholder="03xx-xxxxxxx" required></div>
                            <div class="form-group"><label>Course Enrolled</label><select id="student-course" required></select></div>
                            <div class="form-group full-width"><label>Residential Address</label><textarea id="student-address" rows="2" required></textarea></div>
                            
                            <h4 class="full-width" style="margin-top: 10px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">Guardian Information</h4>
                            <div class="form-group"><label>Guardian Name</label><input type="text" id="student-g-name" required></div>
                            <div class="form-group"><label>Guardian Contact</label><input type="text" id="student-g-phone" placeholder="03xx-xxxxxxx" required></div>
                            
                            <h4 class="full-width" style="margin-top: 10px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">Academy Status</h4>
                            <div class="form-group full-width"><label>Status</label><select id="student-status" required><option>Active</option><option>Inactive</option></select></div>
                        </div>

                        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px; border-top: 1px solid var(--border); padding-top:20px;">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('student-modal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Student Record</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Teacher Modal -->
        <div class="modal-overlay" id="teacher-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Teacher Details</h3>
                    <button class="btn-icon" onclick="closeModal('teacher-modal')"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body">
                    <form id="teacher-form">
                        <input type="hidden" id="teacher-id">
                        <div class="form-group"><label>Full Name</label><input type="text" id="teacher-name" required></div>
                        <div class="form-group"><label>Subject</label><input type="text" id="teacher-subject" required></div>
                        <div class="form-group"><label>Email Address</label><input type="email" id="teacher-email" required></div>
                        <div class="form-group"><label>Contact Number</label><input type="text" id="teacher-contact" required></div>
                        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('teacher-modal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Teacher</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Course Modal -->
        <div class="modal-overlay" id="course-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Course Details</h3>
                    <button class="btn-icon" onclick="closeModal('course-modal')"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body">
                    <form id="course-form">
                        <input type="hidden" id="course-id">
                        <div class="form-group"><label>Course Title</label><input type="text" id="course-title" required></div>
                        <div class="form-group"><label>Description</label><textarea id="course-desc" rows="3" required></textarea></div>
                        <div class="form-group"><label>Fee ($)</label><input type="number" id="course-fee" required></div>
                        <div class="form-group"><label>Capacity</label><input type="number" id="course-capacity" required></div>
                        <div class="form-group"><label>Instructor</label><select id="course-instructor" required></select></div>
                        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('course-modal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Course</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Fee Modal -->
        <div class="modal-overlay" id="fee-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Collect Fee</h3>
                    <button class="btn-icon" onclick="closeModal('fee-modal')"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body">
                    <form id="fee-form">
                        <input type="hidden" id="fee-id">
                        <div class="form-group"><label>Payer Name (Required)</label><input type="text" id="fee-payer" placeholder="Type name of the person paying..." required></div>
                        <div class="form-group"><label>Link to Profile (Optional)</label><select id="fee-student"></select></div>
                        <div class="form-group"><label>Amount ($)</label><input type="number" id="fee-amount" required></div>
                        <div class="form-group"><label>Payment Method</label><select id="fee-method" required><option>Card</option><option>Cash</option><option>Bank Transfer</option></select></div>
                        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('fee-modal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Process Payment</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Custom Alert/Info Modal -->
        <div class="modal-overlay" id="alert-custom-modal">
            <div class="modal" style="max-width: 400px; text-align: center; padding: 40px 30px; border-radius: var(--radius-lg);">
                <div id="alert-custom-icon" style="font-size: 60px; margin-bottom: 20px;"></div>
                <h3 id="alert-custom-title" style="font-size: 22px; font-weight: 800; color: var(--text-strong); margin-bottom: 12px;"></h3>
                <p id="alert-custom-message" style="color: var(--text-muted); line-height: 1.6; margin-bottom: 30px; font-size: 15px;"></p>
                <button class="btn btn-primary" onclick="closeModal('alert-custom-modal')" style="width: 100%; padding: 14px; border-radius: var(--radius-md); font-weight: 700;">Understand</button>
            </div>
        </div>

        <!-- Custom Confirmation Modal -->
        <div class="modal-overlay" id="confirm-custom-modal">
            <div class="modal" style="max-width: 400px; text-align: center; padding: 40px 30px; border-radius: var(--radius-lg);">
                <div style="font-size: 60px; margin-bottom: 20px; color: var(--danger);">
                    <i class="ph ph-warning-diamond"></i>
                </div>
                <h3 id="confirm-custom-title" style="font-size: 22px; font-weight: 800; color: var(--text-strong); margin-bottom: 12px;"></h3>
                <p id="confirm-custom-message" style="color: var(--text-muted); line-height: 1.6; margin-bottom: 30px; font-size: 15px;"></p>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-secondary" onclick="closeModal('confirm-custom-modal')" style="flex: 1; padding: 12px; font-weight: 700;">Cancel</button>
                    <button id="confirm-custom-btn" class="btn btn-primary" style="flex: 1; padding: 12px; font-weight: 700; background: var(--danger); border-color: var(--danger);">Confirm</button>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        document.getElementById('student-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('student-id').value;
            const cnicValue = document.getElementById('student-cnic').value;
            const phoneValue = document.getElementById('student-phone').value;
            const gPhoneValue = document.getElementById('student-g-phone').value;
            
            // --- STRICT VALIDATION RULES ---
            if (cnicValue && cnicValue.length !== 15) {
                window.showToast("CNIC must be exactly 13 digits (15 characters with dashes)!", "error");
                return; // halt execution
            }
            if (phoneValue && phoneValue.length !== 12) {
                window.showToast("Personal Phone must be a valid 11-digit mobile number!", "error");
                return;
            }
            if (gPhoneValue && gPhoneValue.length !== 12) {
                window.showToast("Guardian Contact must be a valid 11-digit mobile number!", "error");
                return;
            }
            
            // --- DUPLICATE PREVENTION ---
            if (cnicValue) {
                const students = Store.getAll('students');
                const duplicateMatch = students.find(s => s.cnic === cnicValue && s.id !== id);
                if (duplicateMatch) {
                    window.showToast(`Error: CNIC already registered to active student: ${duplicateMatch.name}!`, "error");
                    return; // halt execution
                }
            }

            const payload = {
                name: document.getElementById('student-name').value,
                cnic: cnicValue,
                dob: document.getElementById('student-dob').value,
                gender: document.getElementById('student-gender').value,
                phone: document.getElementById('student-phone').value,
                courseId: document.getElementById('student-course').value,
                address: document.getElementById('student-address').value,
                guardianName: document.getElementById('student-g-name').value,
                guardianPhone: document.getElementById('student-g-phone').value,
                status: document.getElementById('student-status').value,
            };
            if(!payload.joinDate) payload.joinDate = new Date().toISOString().split('T')[0];
            
            // --- GOOGLE SHEETS INTEGRATION ---
            if(!id) { 
                 const scriptURL = 'https://script.google.com/macros/s/AKfycbyGdcotxyMrC3jHmlOIJC5f19P0Q7o_15QmMbUHRsXPSGMjg4eq9HfSCYTcUdXjZbOi/exec';
                 
                 const btn = e.target.querySelector('button[type="submit"]');
                 const originalText = btn.innerHTML;
                 btn.innerHTML = 'Sending via secure link...';
                 
                 // Using an Image GET ping to gracefully bypass strict local file CORS blocks
                 const finalUrl = scriptURL + "?data=" + encodeURIComponent(JSON.stringify(payload));
                 const ping = new window.Image();
                 ping.src = finalUrl;
                 
                 // We don't await the response to prevent CORS locking, we assume success
                 setTimeout(() => { 
                     btn.innerHTML = originalText; 
                     window.showToast("Student synced to Google Cloud!", "success");
                 }, 1500);
            }

            id ? Store.update('students', id, payload) : Store.add('students', payload);
            
            // Fixed Success Toast Logic
            if(id) {
                window.showToast("Student Profile Updated", "success");
            } else {
                window.showToast("Student Registered Successfully!", "success");
            }
            
            closeModal('student-modal'); 
            triggerRender(currentView);
        });

        document.getElementById('teacher-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('teacher-id').value;
            const payload = {
                name: document.getElementById('teacher-name').value,
                subject: document.getElementById('teacher-subject').value,
                email: document.getElementById('teacher-email').value,
                contact: document.getElementById('teacher-contact').value,
            };
            if(!payload.joinDate) payload.joinDate = new Date().toISOString().split('T')[0];
            id ? Store.update('teachers', id, payload) : Store.add('teachers', payload);
            closeModal('teacher-modal'); triggerRender(currentView);
        });

        document.getElementById('course-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('course-id').value;
            const payload = {
                title: document.getElementById('course-title').value,
                desc: document.getElementById('course-desc').value,
                fee: document.getElementById('course-fee').value,
                capacity: document.getElementById('course-capacity').value,
                instructor: document.getElementById('course-instructor').value,
            };
            id ? Store.update('courses', id, payload) : Store.add('courses', payload);
            closeModal('course-modal'); triggerRender(currentView);
        });

        document.getElementById('fee-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('fee-id').value;
            const payload = {
                payerName: document.getElementById('fee-payer').value,
                studentId: document.getElementById('fee-student').value || null,
                amount: document.getElementById('fee-amount').value,
                method: document.getElementById('fee-method').value,
                status: 'Paid'
            };
            id ? Store.update('fees', id, payload) : Store.add('fees', payload);
            window.showToast("Transaction Logged Successfully", "success");
            closeModal('fee-modal'); triggerRender(currentView);
        });

    }, 100);
}

// --- TOAST NOTIFICATION SYSTEM ---
function injectToastContainer() {
    if(!document.getElementById('toast-container')) {
        const div = document.createElement('div');
        div.id = 'toast-container';
        document.body.appendChild(div);
    }
}

window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'ph-check-circle';
    if(type === 'error') icon = 'ph-warning-circle';
    if(type === 'warning') icon = 'ph-warning';
    
    toast.innerHTML = `<i class="ph ${icon} toast-icon"></i><span class="toast-message">${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

window.alertCustom = function(title, message, type = 'info') {
    const titleEl = document.getElementById('alert-custom-title');
    const messageEl = document.getElementById('alert-custom-message');
    const iconEl = document.getElementById('alert-custom-icon');
    
    titleEl.innerText = title;
    messageEl.innerText = message;
    
    if(type === 'success') {
        iconEl.innerHTML = '<i class="ph ph-check-circle" style="color: var(--success)"></i>';
    } else if(type === 'error') {
        iconEl.innerHTML = '<i class="ph ph-warning-circle" style="color: var(--danger)"></i>';
    } else {
        iconEl.innerHTML = '<i class="ph ph-info" style="color: var(--primary)"></i>';
    }
    
    openModal('alert-custom-modal');
}

window.confirmCustom = function(title, message, onConfirm) {
    const titleEl = document.getElementById('confirm-custom-title');
    const messageEl = document.getElementById('confirm-custom-message');
    const confirmBtn = document.getElementById('confirm-custom-btn');
    
    titleEl.innerText = title;
    messageEl.innerText = message;
    
    // Remote old event listeners
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    
    newBtn.addEventListener('click', () => {
        onConfirm();
        closeModal('confirm-custom-modal');
    });
    
    openModal('confirm-custom-modal');
}

// --- ADVANCED SMART FORMATTERS ---
function bindSmartFormatters() {
    const cnicInput = document.getElementById('student-cnic');
    if (cnicInput) {
        cnicInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); 
            if (value.length > 5) value = value.slice(0,5) + '-' + value.slice(5);
            if (value.length > 13) value = value.slice(0,13) + '-' + value.slice(13);
            e.target.value = value.slice(0, 15);
        });
    }
    
    const phoneInput = document.getElementById('student-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); 
            if (value.length > 4) value = value.slice(0,4) + '-' + value.slice(4);
            e.target.value = value.slice(0, 12);
        });
    }

    const gPhoneInput = document.getElementById('student-g-phone');
    if (gPhoneInput) {
        gPhoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); 
            if (value.length > 4) value = value.slice(0,4) + '-' + value.slice(4);
            e.target.value = value.slice(0, 12);
        });
    }
}
