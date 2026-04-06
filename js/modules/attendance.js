// Attendance Module - New Advanced Feature
window.renderAttendance = function() {
    const courses = Store.getAll('courses');
    
    const html = `
        <div class="view-header">
            <h2>Daily Attendance Tracker</h2>
        </div>
        
        <div class="card" style="margin-bottom: 24px; padding: 20px;">
            <div style="display: flex; gap: 16px; align-items: flex-end;">
                <div style="flex: 1;">
                    <label style="display:block; font-size:13px; font-weight:600; margin-bottom:8px;">Select Course</label>
                    <select id="attendance-course" style="width:100%; padding:10px; border:1px solid var(--border); border-radius:var(--radius-sm); outline:none;">
                        <option value="">-- Choose a Course --</option>
                        ${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
                    </select>
                </div>
                <div style="flex: 1;">
                    <label style="display:block; font-size:13px; font-weight:600; margin-bottom:8px;">Date</label>
                    <input type="date" id="attendance-date" style="width:100%; padding:10px; border:1px solid var(--border); border-radius:var(--radius-sm); outline:none;" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div>
                    <button class="btn btn-primary" onclick="loadAttendance()"><i class="ph ph-magnifying-glass"></i> Load List</button>
                    <button class="btn btn-secondary" onclick="renderMonthlyAttendanceReport()" style="margin-left:8px;"><i class="ph ph-chart-bar"></i> Monthly Report</button>
                </div>
            </div>
        </div>

        <div id="attendance-list-container">
            <!-- Will be populated by loadAttendance() -->
            <div class="no-data-msg">
                <i class="ph ph-calendar-check"></i>
                <span>Select a course and date to track attendance.</span>
            </div>
        </div>
    `;
    
    document.getElementById('view-attendance').innerHTML = html;
}

window.loadAttendance = function() {
    const courseId = document.getElementById('attendance-course').value;
    const date = document.getElementById('attendance-date').value;
    const container = document.getElementById('attendance-list-container');
    
    if(!courseId || !date) {
        window.alertCustom("Selection Required", "Please select both a course and a date to load the attendance roster.", "warning");
        return;
    }

    const students = Store.getAll('students').filter(s => s.courseId === courseId && s.status === 'Active');
    
    if(students.length === 0) {
        container.innerHTML = `<div class="no-data-msg"><i class="ph ph-users-three"></i><span>No active students enrolled in this course.</span></div>`;
        return;
    }

    // Load existing attendance for this date/course
    const allAttendance = Store.getAll('attendance');
    const records = allAttendance.find(a => a.courseId === courseId && a.date === date)?.records || {};

    const listHtml = students.map(s => {
        const isPresent = records[s.id] !== 'absent'; // default to present if not explicitly marked absent
        return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 12px 16px; border-bottom: 1px solid var(--border);">
            <div style="display:flex; align-items:center; gap: 12px;">
                <div style="width:32px; height:32px; border-radius:50%; background:var(--bg-base); display:flex; align-items:center; justify-content:center; font-weight:600; color:var(--text-muted)">
                    ${s.name.charAt(0)}
                </div>
                <span style="font-weight: 500; color: var(--text-strong);">${s.name}</span>
            </div>
            
            <div style="display:flex; gap: 8px;">
                <button onclick="markAttendance('${courseId}', '${date}', '${s.id}', 'present')" class="btn-icon" style="background: ${isPresent ? 'var(--success)' : 'var(--bg-hover)'}; color: ${isPresent ? 'white' : 'var(--text-muted)'}; width:80px; border-radius:4px;">
                    Present
                </button>
                <button onclick="markAttendance('${courseId}', '${date}', '${s.id}', 'absent')" class="btn-icon" style="background: ${!isPresent ? 'var(--danger)' : 'var(--bg-hover)'}; color: ${!isPresent ? 'white' : 'var(--text-muted)'}; width:80px; border-radius:4px;">
                    Absent
                </button>
            </div>
        </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="card" style="padding: 0;">
            <div style="padding: 16px 24px; background: var(--bg-hover); border-bottom: 1px solid var(--border); display:flex; justify-content:space-between;">
                <h3 style="font-size:14px; font-weight:600;">Student Roster</h3>
                <span class="badge primary">${students.length} Students</span>
            </div>
            ${listHtml}
        </div>
    `;
}

window.markAttendance = function(courseId, date, studentId, status) {
    let allAttendance = Store.getAll('attendance');
    let dayRecordIndex = allAttendance.findIndex(a => a.courseId === courseId && a.date === date);
    
    if(dayRecordIndex === -1) {
        // Create new record for this day
        const newRecord = { id: Date.now().toString(), courseId, date, records: {} };
        newRecord.records[studentId] = status;
        Store.add('attendance', newRecord);
    } else {
        // Update existing record
        let existing = allAttendance[dayRecordIndex];
        existing.records[studentId] = status;
        Store.update('attendance', existing.id, existing);
    }
    
    // Re-render UI
    loadAttendance();
}

window.renderMonthlyAttendanceReport = function() {
    const date = document.getElementById('attendance-date').value;
    const month = date.slice(0, 7); // YYYY-MM
    const container = document.getElementById('attendance-list-container');
    
    const students = Store.getAll('students').filter(s => s.status === 'Active');
    const allAttendance = Store.getAll('attendance');
    
    const reportHtml = students.map(s => {
        let present = 0;
        let total = 0;
        
        allAttendance.forEach(day => {
            if(day.date.startsWith(month)) {
                total++;
                if(day.records[s.id] !== 'absent') present++;
            }
        });
        
        const percent = total === 0 ? 0 : Math.round((present / total) * 100);
        const statusClass = percent > 80 ? 'success' : (percent > 50 ? 'warning' : 'danger');
        
        return `
        <tr>
            <td style="font-weight:600; color:var(--text-strong);">${s.name}</td>
            <td style="text-align:center;">${present}</td>
            <td style="text-align:center;">${total - present}</td>
            <td style="text-align:center;"><span class="badge ${statusClass}">${percent}%</span></td>
        </tr>`;
    }).join('');

    container.innerHTML = `
        <div class="card" style="padding: 0;">
            <div style="padding: 16px 24px; background: var(--bg-hover); border-bottom: 1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                <h3 style="font-size:14px; font-weight:600;">Monthly Performance: ${new Date(month).toLocaleDateString(undefined, {month:'long', year:'numeric'})}</h3>
                <button class="btn btn-secondary btn-sm" onclick="loadAttendance()">Back to Daily</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th style="text-align:center;">Days Present</th>
                        <th style="text-align:center;">Days Absent</th>
                        <th style="text-align:center;">Attendance Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportHtml || '<tr><td colspan="4" style="text-align:center; padding:40px;">No attendance data found for this month.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}
