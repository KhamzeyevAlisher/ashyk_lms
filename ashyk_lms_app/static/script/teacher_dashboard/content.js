// 1. "Менің курстарымды" рендерлеу функциясы
let currentTeacherCourses = [];

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
    const grid = document.getElementById('my-courses-grid');
    const filters = document.querySelector('.filters-container');
    const panel = document.getElementById('course-manage-panel');
    const header = document.querySelector('.section-header h3');

    if (!panel) return;

    // Show panel, hide grid/filters
    grid.classList.add('hidden');
    filters.classList.add('hidden');
    panel.classList.remove('hidden');
    if (header) header.classList.add('hidden');

    // Load data
    document.getElementById('manage-course-title').textContent = 'Жүктелуде...';
    document.getElementById('manage-lectures-list').innerHTML = '<p>Жүктелуде...</p>';
    document.getElementById('manage-tests-list').innerHTML = '<p>Жүктелуде...</p>';

    try {
        const response = await fetch(`/api/teacher/course/${courseId}/`);
        const result = await response.json();

        if (result.status === 'success') {
            const course = result.course;
            document.getElementById('manage-course-title').textContent = course.title;

            // Render Lectures
            renderManageLectures(course.lectures);
            // Render Tests
            renderManageTests(course.tests);

        } else {
            alert(result.error);
            closeCourseManagement();
        }
    } catch (e) {
        console.error(e);
        alert("Деректерді алу мүмкін болмады");
        closeCourseManagement();
    }
}

function renderManageLectures(lectures) {
    const container = document.getElementById('manage-lectures-list');
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
                    <small style="color: #777;">${l.category} • ${l.duration}</small>
                </div>
            </div>
            <div class="actions">
                <i class="fa-solid fa-pen" style="cursor: pointer; color: #007bff; margin-right: 10px;"></i>
                <i class="fa-solid fa-trash" style="cursor: pointer; color: #dc3545;"></i>
            </div>
        </div>
    `).join('');
}

function renderManageTests(tests) {
    const container = document.getElementById('manage-tests-list');
    if (tests.length === 0) {
        container.innerHTML = '<p style="color: #888;">Тесттер тізімі бос</p>';
        return;
    }

    container.innerHTML = tests.map(t => `
        <div class="test-row" style="padding: 10px; border: 1px solid #eee; margin-bottom: 5px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h5 style="margin: 0;">${t.title}</h5>
                <small style="color: #777;">Мерзімі: ${t.deadline}</small>
            </div>
            <div class="actions">
                <i class="fa-solid fa-chart-simple" style="cursor: pointer; color: #28a745; margin-right: 10px;" title="Результаты"></i>
                <i class="fa-solid fa-pen" style="cursor: pointer; color: #007bff; margin-right: 10px;"></i>
                <i class="fa-solid fa-trash" style="cursor: pointer; color: #dc3545;"></i>
            </div>
        </div>
    `).join('');
}

function closeCourseManagement() {
    const grid = document.getElementById('my-courses-grid');
    const filters = document.querySelector('.filters-container');
    const panel = document.getElementById('course-manage-panel');
    const header = document.querySelector('.section-header h3');

    if (!panel) return;

    panel.classList.add('hidden');
    grid.classList.remove('hidden');
    filters.classList.remove('hidden');
    if (header) header.classList.remove('hidden');
}

// 3. Dropdown (Селект) логикасы
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.custom-select');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.select-trigger');
        const options = dropdown.querySelectorAll('.option');
        const span = trigger.querySelector('span');

        trigger.addEventListener('click', () => {
            dropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            dropdown.classList.toggle('active');
        });

        options.forEach(option => {
            option.addEventListener('click', () => {
                span.textContent = option.textContent;
                dropdown.querySelector('.option.selected').classList.remove('selected');
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
    const categoryValue = document.querySelector('#myCategorySelect .option.selected')?.getAttribute('data-value') || 'all';
    const statusValue = document.querySelector('#myStatusSelect .option.selected')?.getAttribute('data-value') || 'all';
    const searchText = document.getElementById('myCourseSearch')?.value.toLowerCase() || '';

    const filtered = currentTeacherCourses.filter(course => {
        // Since API doesn't have status/category yet in current response, just search by title
        const matchSearch = course.title.toLowerCase().includes(searchText);
        return matchSearch;
    });

    renderMyCourses(filtered);
}

// 4. Іздеу өрісіне тыңдаушы қосу
const searchInput = document.getElementById('myCourseSearch');
if (searchInput) {
    searchInput.addEventListener('input', filterCourses);
}

function openAddCourseModal() {
    // Placeholder
}

// Жүктелгенде іске қосу
document.addEventListener('DOMContentLoaded', () => {
    loadMyCourses();
    setupDropdowns();
});