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
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 40px;">Сізде әзірге курстар жоқ.</p>';
        return;
    }

    const html = data.map(course => {
        return `
            <div class="course-card" onclick="openCourseManagement(${course.id})">
                <div class="course-img-wrapper" style="height: 160px; overflow: hidden;">
                    <img src="${course.image || '/static/img/default-course.png'}" alt="${course.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="course-info" style="padding: 20px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 18px; color: #1a202c;">${course.title}</h4>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${course.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 15px; font-size: 12px; color: #94a3b8;">
                        <span><i class="fa-solid fa-folder-open" style="margin-right: 5px;"></i>${course.department}</span>
                        <span><i class="fa-solid fa-calendar-days" style="margin-right: 5px;"></i>${course.created_at}</span>
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
    const gridContainer = document.querySelector('.container_content:not(#course-manage-panel)');
    const panel = document.getElementById('course-manage-panel');

    if (!panel) return;

    // Show panel, hide grid container with animation
    if (gridContainer) gridContainer.classList.add('hidden');
    panel.classList.remove('hidden');

    // Load data
    const titleEl = document.getElementById('manage-course-title');
    const lecturesEl = document.getElementById('manage-lectures-list');

    if (titleEl) titleEl.textContent = 'Жүктелуде...';
    if (lecturesEl) lecturesEl.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 20px;">Жүктелуде...</p>';

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
        container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">Дәрістер тізімі бос</p>';
        return;
    }

    container.innerHTML = lectures.map(l => `
        <div class="lecture-item">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="lecture-number" style="width: 36px; height: 36px; background: #eef2ff; color: #563eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">${l.order}</div>
                <div>
                    <h5 style="margin: 0; font-size: 15px; color: #1a202c;">${l.title}</h5>
                    <small style="color: #64748b;">${l.category || 'Дәріс'} • ${l.duration || ''}</small>
                </div>
            </div>
            <div class="actions" style="display: flex; gap: 12px;">
                <button title="Өңдеу" style="background: none; border: none; color: #563eea; cursor: pointer; font-size: 16px; padding: 5px;"><i class="fa-solid fa-pen"></i></button>
                <button title="Жөю" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 16px; padding: 5px;"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function closeCourseManagement() {
    activeCourseId = null;
    const gridContainer = document.querySelector('.container_content:not(#course-manage-panel)');
    const panel = document.getElementById('course-manage-panel');

    if (panel) panel.classList.add('hidden');
    if (gridContainer) gridContainer.classList.remove('hidden');
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
    const dropdowns = document.querySelectorAll('.custom-select-content');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.select-trigger-content');
        const options = dropdown.querySelectorAll('.option-content');
        const span = trigger?.querySelector('span');

        trigger?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            dropdown.classList.toggle('active');
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                if (span) span.textContent = option.textContent;
                dropdown.querySelector('.option-content.selected')?.classList.remove('selected');
                option.classList.add('selected');
                dropdown.classList.remove('active');
                filterCourses();
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-content')) {
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