// Dashboard Module
window.renderDashboard = function() {
    const students = Store.getAll('students');
    const teachers = Store.getAll('teachers');
    const courses = Store.getAll('courses');
    const fees = Store.getAll('fees');

    const totalRevenue = fees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    const activeStudents = students.filter(s => s.status === 'Active').length;

    // Real-Time 6 Months Charting Algorithm
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sixMonthsLabels = [];
    const sixMonthsData = [0, 0, 0, 0, 0, 0];
    
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        sixMonthsLabels.push(monthNames[d.getMonth()]);
    }
    
    // Accumulate real fee data securely
    fees.forEach(fee => {
        const d = new Date(fee.createdAt);
        const monthDiff = (currentDate.getFullYear() - d.getFullYear()) * 12 + (currentDate.getMonth() - d.getMonth());
        
        if (monthDiff >= 0 && monthDiff <= 5) {
            const targetIndex = 5 - monthDiff;
            sixMonthsData[targetIndex] += parseFloat(fee.amount);
        }
    });

    const maxVal = Math.max(...sixMonthsData) > 0 ? (Math.max(...sixMonthsData) * 1.2) : 1000; // default ceiling if 0

    const chartHtml = sixMonthsData.map((val, idx) => {
        const pct = (val / maxVal) * 100;
        return `
            <div class="chart-bar-wrapper">
                <span class="chart-label" style="font-size: 10px; color: var(--primary)">$${val.toLocaleString()}</span>
                <div class="chart-bar" style="height: ${pct}%; background: linear-gradient(to top, var(--primary), #818cf8);"></div>
                <span class="chart-label" style="font-weight:600">${sixMonthsLabels[idx]}</span>
            </div>
        `;
    }).join('');

    const dashboardHtml = `
        <div class="view-header" style="margin-bottom: 24px;">
            <h2>Overview & Analytics</h2>
            <div style="display:flex; gap:12px;">
                <button class="btn btn-secondary" onclick="exportDataToCSV()"><i class="ph ph-download-simple"></i> Export System Report</button>
            </div>
        </div>
        
        <!-- NEW QUICK ACTIONS PANEL -->
        <div style="background: var(--bg-surface-solid); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 32px; display:flex; flex-wrap: wrap; align-items:center; gap: 20px; box-shadow: var(--shadow-sm);">
            <div style="display:flex; align-items:center; gap: 16px; min-width: 150px;">
                <h3 style="font-size: 14px; color: var(--text-muted); font-weight: 700; text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; gap:8px;"><i class="ph ph-lightning" style="color:var(--warning); font-size:18px;"></i> Quick Actions</h3>
                <div style="height: 24px; width: 2px; background: var(--border);" class="hide-mobile"></div>
            </div>
            <div style="display:flex; flex-wrap: wrap; gap: 12px; flex: 1;">
                <button class="btn btn-primary" onclick="openStudentModal()" style="box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25); border-radius: var(--radius-full); padding: 10px 20px; flex: 1; min-width: 160px; justify-content: center;"><i class="ph ph-user-plus" style="font-size: 18px;"></i> Register Student</button>
                <button class="btn btn-secondary" onclick="openFeeModal()" style="border-radius: var(--radius-full); padding: 10px 20px; border-color: rgba(16, 185, 129, 0.3); background: var(--success-bg); color: var(--success); flex: 1; min-width: 160px; justify-content: center;"><i class="ph ph-wallet" style="font-size: 18px;"></i> Collect Payment</button>
                <button class="btn btn-secondary" onclick="openModal('course-modal')" style="border-radius: var(--radius-full); padding: 10px 20px; flex: 1; min-width: 160px; justify-content: center;"><i class="ph ph-notebook" style="font-size: 18px; color: var(--primary)"></i> Create Course</button>
            </div>
        </div>
        </div>

        <div class="dashboard-grid">
            <div class="card stat-card" style="background: linear-gradient(135deg, #4f46e5, #3b82f6); color: white; border:none; box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2)">
                <span class="stat-label" style="color: rgba(255,255,255,0.8)">Active Students</span>
                <span class="stat-value" style="color: white; font-size:40px;">${activeStudents}</span>
            </div>
            <div class="card stat-card">
                <span class="stat-label">Total Revenue</span>
                <span class="stat-value" style="color: var(--success); font-size:40px;">$${totalRevenue.toLocaleString()}</span>
            </div>
            <div class="card stat-card">
                <span class="stat-label">Total Teachers</span>
                <span class="stat-value" style="font-size:40px;">${teachers.length}</span>
            </div>
            <div class="card stat-card">
                <span class="stat-label">Active Courses</span>
                <span class="stat-value" style="font-size:40px;">${courses.length}</span>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; padding-bottom: 24px;">
            <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h3 style="font-size: 18px; font-weight: 800; color:var(--text-strong); display:flex; align-items:center; gap:8px;"><i class="ph ph-chart-bar" style="color:var(--primary)"></i> Revenue History</h3>
                    <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">A real-time analysis of collected academy income over 6 months.</p>
                </div>
                <div class="chart-container" style="border-bottom:none; margin-top:40px;">
                    ${chartHtml}
                </div>
            </div>
            <div class="card">
                <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 20px; color:var(--text-strong)">Recent Activity</h3>
                <ul style="list-style:none; display:flex; flex-direction:column; gap: 12px;">
                    ${generateActivityLog(students, teachers, fees)}
                </ul>
            </div>
        </div>
    `;

    document.getElementById('view-dashboard').innerHTML = dashboardHtml;
    
    setTimeout(() => {
        document.querySelectorAll('.chart-bar').forEach(b => {
             const h = b.style.height;
             b.style.height = '0';
             setTimeout(()=> { b.style.height = h; }, 50);
        });
    }, 100);
}

function generateActivityLog(students, teachers, fees) {
    let activities = [];
    students.forEach(s => activities.push({ date: s.createdAt, icon: '<i class="ph ph-user-plus" style="color:white; font-size:16px;"></i>', color: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', text: `<strong style="color:var(--text-strong)">${s.name}</strong> was registered.` }));
    fees.forEach(f => activities.push({ date: f.createdAt, icon: '<i class="ph ph-wallet" style="color:white; font-size:16px;"></i>', color: 'linear-gradient(135deg, #10b981, #059669)', text: `Payment of <strong style="color:var(--success)">$${parseFloat(f.amount).toFixed(2)}</strong> collected.` }));

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Real CSV Export Implementation
    window.exportDataToCSV = function() {
        const students = Store.getAll('students');
        const courses = Store.getAll('courses');
        
        if (students.length === 0) {
            window.alertCustom("No Data", "There are no student records to export yet.", "error");
            return;
        }

        // 1. Create CSV Headers
        let csvRows = [];
        csvRows.push("Student Name,CNIC,Gender,Date of Birth,Phone,Course,Join Date,Address");

        // 2. Map data to rows
        students.forEach(s => {
            const courseTitle = courses.find(c => c.id === s.courseId)?.title || "N/A";
            const row = [
                `"${s.name}"`,
                `"${s.cnic || ''}"`,
                `"${s.gender}"`,
                `"${s.dob}"`,
                `"${s.phone}"`,
                `"${courseTitle}"`,
                `"${s.joinDate}"`,
                `"${(s.address || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(","));
        });

        const csvString = csvRows.join("\n");

        // 3. Trigger Professional Download using Blob
        try {
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            
            link.setAttribute("href", url);
            link.setAttribute("download", `Academy_Full_Report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Clean up memory

            window.showToast("Report Exported Successfully", "success");
        } catch (err) {
            console.error("Export Failed", err);
            window.showToast("Export failed. Please try again.", "error");
        }
    }

    if (activities.length === 0) return `<li style="color: var(--text-muted); font-size: 14px; text-align:center; padding-top:20px;">No recent activities logged in base.</li>`;

    return activities.slice(0, 6).map(act => `
        <li style="display: flex; gap: 14px; align-items: flex-start; font-size: 14px; padding-bottom: 12px; border-bottom: 1px dashed var(--border);">
            <div style="width: 36px; height: 36px; border-radius: 12px; background: ${act.color}; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow: var(--shadow-sm);">
                ${act.icon}
            </div>
            <div style="flex:1;">
                <p style="color: var(--text-main); margin-bottom: 4px; line-height: 1.4;">${act.text}</p>
                <span style="font-size: 11px; color: var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">${new Date(act.date).toLocaleDateString()} at ${new Date(act.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </li>
    `).join('');
}
