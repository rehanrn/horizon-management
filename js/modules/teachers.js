// Teachers Module
window.renderTeachers = function(filter = '') {
    window.currentTeachers = Store.getAll('teachers');
    
    if(filter) {
        window.currentTeachers = window.currentTeachers.filter(t => t.name.toLowerCase().includes(filter));
    }

    const html = `
        <div class="view-header">
            <h2>Teachers</h2>
            <button class="btn btn-primary" onclick="openModal('teacher-modal')"><i class="ph ph-plus"></i> Add Teacher</button>
        </div>
        <div class="card table-card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Instructor</th>
                        <th>Subject</th>
                        <th>Join Date</th>
                        <th style="text-align:right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${window.currentTeachers.length === 0 ? `<tr><td colspan="4"><div class="no-data-msg"><i class="ph ph-chalkboard-teacher"></i><span>No teachers registered yet.</span></div></td></tr>` : 
                    
                    window.currentTeachers.map(teacher => `
                        <tr onclick="viewTeacherProfile('${teacher.id}')">
                            <td style="display:flex; align-items:center; gap: 12px;">
                                <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--success-bg); color: var(--success); display:flex; align-items:center; justify-content:center; font-weight: 600;">
                                    ${teacher.name.charAt(0)}
                                </div>
                                <div>
                                    <p style="font-weight: 600; color: var(--text-strong);">${teacher.name}</p>
                                    <p style="font-size: 12px; color: var(--text-muted);">${teacher.email || 'No email'}</p>
                                </div>
                            </td>
                            <td><span class="badge primary">${teacher.subject}</span></td>
                            <td>${teacher.joinDate || '-'}</td>
                            <td style="text-align:right" onclick="event.stopPropagation()">
                                <button class="btn-icon" onclick="editTeacher('${teacher.id}')"><i class="ph ph-pencil-simple"></i></button>
                                <button class="btn-icon" style="color: var(--danger)" onclick="deleteTeacher('${teacher.id}')"><i class="ph ph-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('view-teachers').innerHTML = html;
}

window.editTeacher = function(id) {
    const teacher = Store.getById('teachers', id);
    if (!teacher) return;

    document.getElementById('teacher-id').value = teacher.id;
    document.getElementById('teacher-name').value = teacher.name;
    document.getElementById('teacher-subject').value = teacher.subject;
    document.getElementById('teacher-email').value = teacher.email || '';
    document.getElementById('teacher-contact').value = teacher.contact || '';

    openModal('teacher-modal');
}

window.deleteTeacher = function(id) {
    window.confirmCustom(
        'Remove Instructor?', 
        'Are you sure you want to remove this instructor? This will affect courses they are assigned to.', 
        () => {
            Store.delete('teachers', id);
            renderTeachers();
            window.showToast("Instructor removed", "success");
        }
    );
}

window.viewTeacherProfile = function(id) {
    const teacher = Store.getById('teachers', id);
    if (!teacher) return;
    
    // Find courses taught by this teacher
    const taughtCourses = Store.getAll('courses').filter(c => c.instructor === id);

    const coursesHtml = taughtCourses.length === 0 ? '<p style="color:var(--text-muted); font-size:14px;">No courses assigned.</p>' :
        taughtCourses.map(c => `
            <div style="background:var(--bg-hover); padding:12px 16px; border-radius:var(--radius-sm); margin-bottom:8px; border:1px solid var(--border)">
                <h4 style="font-size:14px; font-weight:600; color:var(--text-strong)">${c.title}</h4>
                <p style="font-size:12px; color:var(--text-muted)">Capacity: ${c.capacity}</p>
            </div>
        `).join('');

    const html = `
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding-bottom: 24px; border-bottom: 1px solid var(--border); margin-bottom:24px;">
            <div class="profile-avatar-large" style="background:var(--success-bg); color:var(--success)">${teacher.name.charAt(0)}</div>
            <h2 style="font-size:24px; font-weight:700;">${teacher.name}</h2>
            <span class="badge primary" style="margin-top:8px">${teacher.subject}</span>
        </div>
        
        <div class="profile-field"><label>Email</label><p>${teacher.email || '-'}</p></div>
        <div class="profile-field"><label>Contact</label><p>${teacher.contact || '-'}</p></div>
        <div class="profile-field"><label>Joined</label><p>${teacher.joinDate || '-'}</p></div>
        
        <h4 style="margin-top: 32px; margin-bottom: 16px; color: var(--text-strong)">Assigned Courses</h4>
        <div>${coursesHtml}</div>
    `;

    openPanel('Instructor Profile', html);
}
