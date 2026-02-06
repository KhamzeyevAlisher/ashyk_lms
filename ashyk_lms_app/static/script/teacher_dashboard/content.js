// 1. "Менің курстарымды" рендерлеу функциясы
let currentTeacherCourses = [];
let activeCourseId = null;

async function loadMyCourses() {
    const container = document.getElementById('my-courses-grid');
    if (!container) return;

    container.innerHTML = '<h3>Жүктелуде...</h3>';

    try {
        const response = await fetch('/api/teacher/my-courses/');
        const result = await response.json();

        if (result.status === 'success') {
            currentTeacherCourses = result.courses;
            renderMyCourses(currentTeacherCourses);
        } else {
            container.innerHTML = `<p style="color: red;">${result.error || 'Қате орын алды'}</p>`;
        }
    } catch (e) {
        console.error("Load courses error", e);
        container.innerHTML = '<p style="color: red;">Сервермен байланыс қатесі.</p>';
    }
}

function renderMyCourses(data) {
    const container = document.getElementById('my-courses-grid');
    if (!container) return;

    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280;">Сізде әзірге курстар жоқ.</p>';
        return;
    }

    const html = data.map(course => {
        return `
            <div class="mini-course-card" onclick="openCourseManagement(${course.id})">
                <div class="course-img-wrapper">
                    <img src="${course.image}" alt="${course.title}" class="course-img">
                </div>
                <div class="course-info">
                    <h4>${course.title}</h4>
                    <p style="color: #666; font-size: 13px;">${course.description}</p>
                    <div style="margin-top: 10px; font-size: 11px; color: #999;">
                        ${course.department} • ${course.created_at}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// 2. Курсты басқару (Course Management)
async function openCourseManagement(courseId) {
    activeCourseId = courseId;
    const grid = document.getElementById('my-courses-grid');
    const filters = document.querySelector('.filters-container');
    const panel = document.getElementById('course-manage-panel');
    const header = document.querySelector('.section-header h3');

    if (!panel) return;

    // Show panel, hide grid/filters
    if (grid) grid.classList.add('hidden');
    if (filters) filters.classList.add('hidden');
    panel.classList.remove('hidden');
    if (header) header.classList.add('hidden');

    // Load data
    const titleEl = document.getElementById('manage-course-title');
    const lecturesEl = document.getElementById('manage-lectures-list');

    if (titleEl) titleEl.textContent = 'Жүктелуде...';
    if (lecturesEl) lecturesEl.innerHTML = '<p>Жүктелуде...</p>';

    try {
        const response = await fetch(`/api/teacher/course/${courseId}/`);
        const result = await response.json();

        if (result.status === 'success') {
            const course = result.course;
            if (titleEl) titleEl.textContent = course.title;

            // Render Lectures
            renderManageLectures(course.lectures);

        } else {
            console.error(result.error);
            closeCourseManagement();
        }
    } catch (e) {
        console.error(e);
        closeCourseManagement();
    }
}

function renderManageLectures(lectures) {
    const container = document.getElementById('manage-lectures-list');
    if (!container) return;

    if (lectures.length === 0) {
        container.innerHTML = '<p style="color: #888;">Дәрістер тізімі бос</p>';
        return;
    }

    container.innerHTML = lectures.map(l => `
        <div class="lecture-row" style="padding: 10px; border: 1px solid #eee; margin-bottom: 5px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="status-icon" style="width: 30px; height: 30px; font-size: 12px;">${l.order}</div>
                <div>
                    <h5 style="margin: 0;">${l.title}</h5>
                    <small style="color: #777;">${l.category || ''} • ${l.duration || ''}</small>
                </div>
            </div>
            <div class="actions">
                <i class="fa-solid fa-pen" style="cursor: pointer; color: #007bff; margin-right: 10px;"></i>
                <i class="fa-solid fa-trash" style="cursor: pointer; color: #dc3545;"></i>
            </div>
        </div>
    `).join('');
}

function closeCourseManagement() {
    activeCourseId = null;
    const grid = document.getElementById('my-courses-grid');
    const filters = document.querySelector('.filters-container');
    const panel = document.getElementById('course-manage-panel');
    const header = document.querySelector('.section-header h3');

    if (panel) panel.classList.add('hidden');
    if (grid) grid.classList.remove('hidden');
    if (filters) filters.classList.remove('hidden');
    if (header) header.classList.remove('hidden');
}

// 4. Модальды терезе (Лекция қосу)
function openAddLectureModal() {
    if (!activeCourseId) return;
    const form = document.getElementById('lectureForm');
    if (form) form.reset();

    if (typeof window.openModal === 'function') {
        window.openModal('lectureModal');
    } else {
        const modal = document.getElementById('lectureModal');
        if (modal) modal.classList.remove('hidden');
    }
}

document.getElementById('lectureForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        course_id: activeCourseId,
        title: document.getElementById('lecture-title')?.value || '',
        description: document.getElementById('lecture-desc')?.value || '',
        category: document.getElementById('lecture-cat')?.value || '',
        duration: document.getElementById('lecture-dur')?.value || '',
        video_url: document.getElementById('lecture-video')?.value || '',
        order: parseInt(document.getElementById('lecture-order')?.value) || 1
    };

    try {
        const response = await fetch('/api/teacher/lecture/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (result.status === 'success') {
            if (typeof window.closeModal === 'function') {
                window.closeModal('lectureModal');
            } else {
                document.getElementById('lectureModal')?.classList.add('hidden');
            }
            openCourseManagement(activeCourseId);
        } else {
            alert(result.error);
        }
    } catch (e) {
        console.error(e);
        alert('Сақтау кезінде қате орын алды');
    }
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.custom-select');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.select-trigger');
        const options = dropdown.querySelectorAll('.option');
        const span = trigger?.querySelector('span');

        trigger?.addEventListener('click', () => {
            dropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            dropdown.classList.toggle('active');
        });

        options.forEach(option => {
            option.addEventListener('click', () => {
                if (span) span.textContent = option.textContent;
                dropdown.querySelector('.option.selected')?.classList.remove('selected');
                option.classList.add('selected');
                dropdown.classList.remove('active');
                filterCourses();
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });
}

function filterCourses() {
    const searchText = document.getElementById('myCourseSearch')?.value.toLowerCase() || '';
    const filtered = currentTeacherCourses.filter(course => {
        return course.title.toLowerCase().includes(searchText);
    });
    renderMyCourses(filtered);
}

const searchInput = document.getElementById('myCourseSearch');
if (searchInput) {
    searchInput.addEventListener('input', filterCourses);
}

document.addEventListener('DOMContentLoaded', () => {
    loadMyCourses();
    setupDropdowns();
});