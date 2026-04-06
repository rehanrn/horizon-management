// Courses Module
window.renderCourses = function(filter = '') {
    window.currentCourses = Store.getAll('courses');
    const students = Store.getAll('students');
    const teachers = Store.getAll('teachers');
    const grid = document.getElementById('view-courses');
    
    if(filter) {
        window.currentCourses = window.currentCourses.filter(c => c.title.toLowerCase().includes(filter));
    }

    const html = `
        <div class="view-header">
            <h2>Courses</h2>
            <button class="btn btn-primary" onclick="openCourseModal()"><i class="ph ph-plus"></i> New Course</button>
        </div>
        
        <div class="grid-cards">
            ${window.currentCourses.length === 0 ? `<div style="grid-column: 1 / -1;"><div class="no-data-msg"><i class="ph ph-book-open"></i><span>No courses available at the moment.</span></div></div>` : 
            
            window.currentCourses.map(course => {
                const enrolled = students.filter(s => s.courseId === course.id).length;
                const capacity = course.capacity || 20;
                const fillPct = Math.min((enrolled / capacity) * 100, 100);
                const isFull = enrolled >= capacity;
                
                const instructor = teachers.find(t => t.id === course.instructor)?.name || 'Unassigned';

                return `
                <div class="card" style="display:flex; flex-direction:column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <span class="badge ${isFull ? 'danger' : 'success'}" style="margin-bottom:8px;">${isFull ? 'Full' : 'Enrollment Open'}</span>
                            <h3 style="font-size: 18px; font-weight: 700; color: var(--text-strong); letter-spacing:-0.5px">${course.title}</h3>
                        </div>
                        <div style="display: flex; gap: 4px;">
                            <button class="btn-icon" onclick="editCourse('${course.id}')"><i class="ph ph-pencil-simple"></i></button>
                            <button class="btn-icon" style="color: var(--danger)" onclick="deleteCourse('${course.id}')"><i class="ph ph-trash"></i></button>
                        </div>
                    </div>
                    
                    <p style="color: var(--text-muted); font-size: 14px; line-height: 1.5; flex: 1;">${course.desc}</p>
                    
                    <div style="background:var(--bg-hover); padding:12px; border-radius:var(--radius-sm); font-size:13px; color:var(--text-main)">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px">
                            <i class="ph ph-user" style="color:var(--primary)"></i> <strong>Instructor:</strong> ${instructor}
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <i class="ph ph-currency-dollar" style="color:var(--success)"></i> <strong>Fee:</strong> $${course.fee}
                        </div>
                    </div>
                    
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; font-weight:600;">
                            <span style="color:var(--primary)">${enrolled} Enrolled</span>
                            <span style="color:var(--text-muted)">Capacity: ${capacity}</span>
                        </div>
                        <div style="height:6px; width:100%; background:var(--border); border-radius:3px; overflow:hidden">
                            <div style="height:100%; width:${fillPct}%; background:${isFull ? 'var(--danger)' : 'var(--primary)'}; border-radius:3px"></div>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
    
    grid.innerHTML = html;
}

window.openCourseModal = function() {
    const teachers = Store.getAll('teachers');
    document.getElementById('course-instructor').innerHTML = '<option value="">Select Instructor...</option>' + teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    openModal('course-modal');
}

window.editCourse = function(id) {
    const course = Store.getById('courses', id);
    if (!course) return;

    const teachers = Store.getAll('teachers');
    document.getElementById('course-instructor').innerHTML = '<option value="">Select Instructor...</option>' + teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

    document.getElementById('course-id').value = course.id;
    document.getElementById('course-title').value = course.title;
    document.getElementById('course-desc').value = course.desc;
    document.getElementById('course-fee').value = course.fee;
    document.getElementById('course-capacity').value = course.capacity || 20;
    document.getElementById('course-instructor').value = course.instructor || '';

    openModal('course-modal');
}

window.deleteCourse = function(id) {
    window.confirmCustom(
        'Delete Course?', 
        'Are you sure you want to delete this course? This will remove it from the catalog.', 
        () => {
            Store.delete('courses', id);
            renderCourses();
            window.showToast("Course deleted", "success");
        }
    );
}
