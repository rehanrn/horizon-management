// Students Module
window.renderStudents = function(textFilter = '', courseFilter = '') {
    window.currentStudents = Store.getAll('students');
    const courses = Store.getAll('courses');
    
    const viewContainer = document.getElementById('view-students');
    
    // Inject the structural shell only once to preserve input focus across typing
    if(!document.getElementById('students-table-body')) {
        const shellHtml = `
            <div class="view-header" style="margin-bottom: 24px;">
                <h2>Directory</h2>
                <div style="display:flex; gap: 12px; align-items:center;">
                    <select id="student-course-filter" style="padding: 10px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); outline: none; background: var(--bg-surface-solid); color: var(--text-strong); font-weight: 600; font-size: 13px; cursor: pointer; transition: 0.2s; box-shadow: var(--shadow-sm);">
                        <option value="">All Courses</option>
                        ${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
                    </select>
                    <div style="position:relative;">
                        <i class="ph ph-magnifying-glass" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size: 16px;"></i>
                        <input type="text" id="student-search-filter" placeholder="Search student name..." style="padding: 10px 16px 10px 36px; border: 1px solid var(--border); border-radius: var(--radius-sm); outline: none; font-size: 13px; font-weight: 500; width: 240px; box-shadow: var(--shadow-sm); transition: 0.2s;">
                    </div>
                    <button class="btn btn-primary" onclick="openStudentModal()" style="padding: 10px 20px;"><i class="ph ph-plus" style="font-size: 16px;"></i> Register Student</button>
                </div>
            </div>
            <div class="card table-card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Course</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th style="text-align:right">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="students-table-body">
                    </tbody>
                </table>
            </div>
        `;
        viewContainer.innerHTML = shellHtml;
        
        // Bind Advanced Event Listeners
        document.getElementById('student-course-filter').addEventListener('change', (e) => {
            window.refreshStudentTable(document.getElementById('student-search-filter').value, e.target.value);
        });
        
        document.getElementById('student-search-filter').addEventListener('input', (e) => {
            window.refreshStudentTable(e.target.value, document.getElementById('student-course-filter').value);
        });
        
        // Focus styling additions
        const searchBox = document.getElementById('student-search-filter');
        searchBox.addEventListener('focus', () => searchBox.style.borderColor = 'var(--primary)');
        searchBox.addEventListener('blur', () => searchBox.style.borderColor = 'var(--border)');
    }

    // Sync input values if called externally (e.g. from Global Search)
    const searchInput = document.getElementById('student-search-filter');
    const courseInput = document.getElementById('student-course-filter');
    
    if (textFilter && searchInput && searchInput.value !== textFilter) {
        searchInput.value = textFilter;
    }
    
    window.refreshStudentTable(searchInput ? searchInput.value : textFilter, courseInput ? courseInput.value : courseFilter);
}

window.refreshStudentTable = function(textFilter = '', courseFilter = '') {
    let students = Store.getAll('students');
    const courses = Store.getAll('courses');

    // Filter by Search String
    if(textFilter) {
        students = students.filter(s => s.name.toLowerCase().includes(textFilter.toLowerCase()));
    }
    
    // Filter by Specific Course Dropdown
    if(courseFilter) {
        students = students.filter(s => s.courseId === courseFilter);
    }

    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">
            <div class="no-data-msg">
                <i class="ph ph-users-three"></i>
                <span>No students found matching your filters.</span>
            </div>
        </td></tr>`;
        return;
    }

    tbody.innerHTML = students.map(student => {
        const courseName = courses.find(c => c.id === student.courseId)?.title || 'N/A';
        const badgeClass = student.status === 'Active' ? 'success' : 'danger';
        
        return `
        <tr onclick="viewStudentProfile('${student.id}')">
            <td style="display:flex; align-items:center; gap: 12px;">
                <div style="width: 38px; height: 38px; border-radius: 8px; background: var(--primary-light); color: var(--primary); display:flex; align-items:center; justify-content:center; font-weight: 700; font-size:16px;">
                    ${student.name.charAt(0)}
                </div>
                <div style="display:flex; flex-direction:column; gap:2px;">
                    <span style="font-weight: 600; color: var(--text-strong);">${student.name}</span>
                    <span style="font-size: 12px; color: var(--text-muted);">Joined ${student.joinDate || '-'}</span>
                </div>
            </td>
            <td><span style="font-weight: 500">${courseName}</span></td>
            <td style="color:var(--text-muted); font-size:13px;"><i class="ph ph-phone"></i> ${student.phone || '-'}</td>
            <td><span class="badge ${badgeClass}">${student.status}</span></td>
            <td style="text-align:right" onclick="event.stopPropagation()">
                <button class="btn-icon" onclick="editStudent('${student.id}')"><i class="ph ph-pencil-simple"></i></button>
                <button class="btn-icon" style="color: var(--danger)" onclick="deleteStudent('${student.id}')"><i class="ph ph-trash"></i></button>
            </td>
        </tr>
        `;
    }).join('');
}

window.openStudentModal = function() {
    const courses = Store.getAll('courses');
    document.getElementById('student-course').innerHTML = courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
    openModal('student-modal');
}

window.editStudent = function(id) {
    const student = Store.getById('students', id);
    if (!student) return;
    
    const courses = Store.getAll('courses');
    document.getElementById('student-course').innerHTML = courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('');

    document.getElementById('student-id').value = student.id;
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-cnic').value = student.cnic || '';
    document.getElementById('student-dob').value = student.dob || '';
    document.getElementById('student-gender').value = student.gender || 'Male';
    document.getElementById('student-phone').value = student.phone || '';
    document.getElementById('student-course').value = student.courseId;
    document.getElementById('student-address').value = student.address || '';
    document.getElementById('student-g-name').value = student.guardianName || '';
    document.getElementById('student-g-phone').value = student.guardianPhone || '';
    document.getElementById('student-status').value = student.status;

    openModal('student-modal');
}

window.deleteStudent = function(id) {
    window.confirmCustom(
        'Delete Student?', 
        'This will permanently remove the student from the database. This action cannot be undone.', 
        () => {
            Store.delete('students', id);
            renderStudents();
            window.showToast("Student deleted successfully", "success");
        }
    );
}

window.viewStudentProfile = function(id) {
    const student = Store.getById('students', id);
    if (!student) return;
    const course = Store.getById('courses', student.courseId);
    const courseName = course ? course.title : 'N/A';
    const courseFee = course ? parseFloat(course.fee) : 0;
    
    const fees = Store.getAll('fees').filter(f => f.studentId === id);
    const totalPaid = fees.reduce((sum, f) => sum + parseFloat(f.amount), 0);
    const balance = courseFee - totalPaid;

    const allAttendance = Store.getAll('attendance');
    let totalDays = 0; let presentDays = 0;
    allAttendance.forEach(a => {
        if(a.courseId === student.courseId && a.records[id]) {
            totalDays++;
            if(a.records[id] === 'present') presentDays++;
        }
    });
    const attPercent = totalDays === 0 ? "N/A" : Math.round((presentDays / totalDays) * 100);

    // Calculate Last Activity Date
    const lastFeeDate = fees.length > 0 ? new Date(Math.max(...fees.map(f => new Date(f.createdAt)))) : null;
    let lastAttDate = null;
    allAttendance.forEach(a => {
        if(a.records[id]) {
            const d = new Date(a.date);
            if(!lastAttDate || d > lastAttDate) lastAttDate = d;
        }
    });
    
    let lastActiveDisplay = 'Never';
    const finalLastDate = (lastFeeDate && lastAttDate) ? (lastFeeDate > lastAttDate ? lastFeeDate : lastAttDate) : (lastFeeDate || lastAttDate);
    if(finalLastDate) {
        const diffDays = Math.floor((new Date() - finalLastDate) / (1000 * 60 * 60 * 24));
        lastActiveDisplay = diffDays === 0 ? 'Today' : (diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`);
    }

    const feeHistory = fees.length === 0 ? '<p style="color:var(--text-muted); font-size:13px;">No transaction records found.</p>' :
        fees.map(f => `
            <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border); font-size:14px;">
                <span style="color:var(--text-main); display:flex; align-items:center; gap:8px;">
                    <i class="ph ph-receipt" style="color:var(--text-muted)"></i>
                    ${new Date(f.createdAt).toLocaleDateString()} &middot; ${f.method}
                </span>
                <span style="font-weight:700; color:var(--success)">+$${parseFloat(f.amount).toFixed(2)}</span>
            </div>
        `).join('');

    const html = `
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding-bottom: 24px; border-bottom: 1px solid var(--border); margin-bottom:24px;">
            <div class="profile-avatar-large" style="width: 96px; height: 96px; border-radius: 20px; font-size: 32px; background: linear-gradient(135deg, var(--primary), var(--primary-hover)); color: white; box-shadow: 0 10px 20px rgba(14, 165, 233, 0.2);">
                ${student.name.charAt(0)}
            </div>
            <h2 style="font-size:26px; font-weight:800; margin-top: 16px; color: var(--text-strong); letter-spacing:-0.5px">${student.name}</h2>
            <div style="display:flex; gap: 8px; margin-top:12px">
                <span class="badge ${student.status==='Active' ? 'success' : 'danger'}">${student.status}</span>
                <span class="badge primary">${courseName}</span>
                <span class="badge warning" style="text-transform:none;"><i class="ph ph-clock"></i> Active: ${lastActiveDisplay}</span>
            </div>
        </div>
        
        <h4 style="font-size: 12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-bottom:16px;">Biographical Data</h4>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div class="profile-field"><label>Date of Birth</label><p>${student.dob || '-'}</p></div>
            <div class="profile-field"><label>Gender</label><p>${student.gender || '-'}</p></div>
            <div class="profile-field" style="grid-column: 1 / -1;"><label>CNIC Number</label><p style="font-family: monospace; font-size:15px; letter-spacing:0.5px; color:var(--primary); font-weight:700;">${student.cnic || 'Not Provided'}</p></div>
            <div class="profile-field"><label>Personal Phone</label><p>${student.phone || '-'}</p></div>
            <div class="profile-field"><label>Enrollment Date</label><p>${student.joinDate || '-'}</p></div>
            <div class="profile-field" style="grid-column: 1 / -1;"><label>Residential Address</label><p style="line-height:1.5">${student.address || '-'}</p></div>
        </div>

        <h4 style="font-size: 12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-bottom:16px;">Guardian Connections</h4>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; background: var(--bg-hover); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div class="profile-field" style="margin:0;"><label>Guardian Name</label><p>${student.guardianName || '-'}</p></div>
            <div class="profile-field" style="margin:0;"><label>Emergency Contact</label><p>${student.guardianPhone || '-'}</p></div>
        </div>

        <h4 style="font-size: 12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-bottom:16px;">Performance & Accounts</h4>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom:24px;">
            <div style="background: var(--bg-surface-solid); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: var(--shadow-sm); text-align:center;">
                <p style="font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase; margin-bottom:12px;">Attendance Rate</p>
                <div style="display:inline-flex; width: 64px; height: 64px; border-radius: 50%; border: 4px solid ${attPercent === 'N/A' ? 'var(--border)' : (attPercent >= 80 ? 'var(--success)' : 'var(--warning)')}; align-items:center; justify-content:center; color:var(--text-strong); font-weight:800; font-size:18px;">
                    ${attPercent}${attPercent !== 'N/A' ? '%' : ''}
                </div>
            </div>
            <div style="background: var(--bg-surface-solid); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: var(--shadow-sm); display:flex; flex-direction:column; justify-content:center;">
                <div style="margin-bottom:8px">
                    <p style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase;">Total Paid</p>
                    <p style="font-size:20px; font-weight:800; color:var(--success)">$${totalPaid.toLocaleString()}</p>
                </div>
                <div>
                    <p style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase;">Remaining Deficit</p>
                    <p style="font-size:20px; font-weight:800; color:${balance > 0 ? 'var(--danger)' : 'var(--text-main)'}">$${balance > 0 ? balance.toLocaleString() : '0.00'}</p>
                </div>
            </div>
        </div>

        <h4 style="font-size: 12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-bottom:16px;">Transaction Ledger</h4>
        <div style="margin-bottom:40px;">
            ${feeHistory}
        </div>
    `;

    openPanel('Comprehensive Student Dossier', html);
}
