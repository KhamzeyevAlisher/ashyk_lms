// courseData removed in favor of API
// let courseData = { ... }; 

async function renderCourseByTitle(courseTitle) {
    const container = document.getElementById('tab-item-course');
    if (!container) return;

    container.innerHTML = '<h3>Жүктелуде...</h3>';

    try {
        // We use courseTitle which matches the API expectation for get_course_detail (handled as str)
        const response = await fetch(`/api/courses/${encodeURIComponent(courseTitle)}/?t=${Date.now()}`);
        const result = await response.json();

        console.log(result);

        if (result.status !== 'success') {
            container.innerHTML = `<h3>Курс "${courseTitle}" табылмады</h3><p>${result.error || ''}</p>`;
            return;
        }

        const data = result.course;

        // 1. Формируем HTML тэгов
        const tagsHTML = data.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        // 2. Формируем HTML лекций
        const lecturesHTML = data.program.map((lecture, index) => {
            let icon = '';
            let btn = '';
            let rowClass = 'lecture-row';

            if (lecture.state === 'completed') {
                rowClass += ' completed';
                icon = `<div class="status-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`;
                btn = `<button class="btn-review" onclick="openLesson('${courseTitle}', '${lecture.topic}')">Қайталау</button>`;
            } else if (lecture.state === 'active') {
                icon = `<div class="status-icon play"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>`;
                // Note: passing topic as name matches legacy
                btn = `<button class="btn-start" onclick="openLesson('${courseTitle}', '${lecture.topic}')">Бастау</button>`;
            } else {
                icon = `<div class="status-icon lock"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>`;
                btn = `<button class="btn-locked" disabled>Құлыптаулы</button>`;
            }

            return `
                <div class="${rowClass}">
                    ${icon}
                    <div class="lecture-content">
                        <span class="lecture-number">${index + 1}-дәріс</span>
                        <h4>${lecture.topic}</h4>
                    </div>
                    ${btn}
                </div>
            `;
        }).join('');

        // 3. Собираем общий HTML
        // Используем дефолтные значения если чего-то нет
        const coverImg = data.coverImage || '/static/img/default-course-cover.jpg';

        const fullHTML = `
            <!-- Карточка курса -->
            <div class="card course-header">
                <div class="course-cover">
                    <img src="${coverImg}" alt="${courseTitle}">
                </div>
                <div class="course-details">
                    <div class="course-tags">
                        ${tagsHTML}
                    </div>
                    <h2>${data.title}</h2>
                    <p class="description">${data.description}</p>
                    
                    <div class="instructor-info">
                        <div class="info-row">
                            <span class="label">Кафедра:</span>
                            <span class="value">${data.info.department || '-'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Оқытушы:</span>
                            <span class="value">
                                ${data.info.instructorId
                ? `<a href="#" onclick="openTeacherModal(${data.info.instructorId}); return false;" style="color: var(--accent-color); text-decoration: underline;">${data.info.instructor || '-'}</a>`
                : (data.info.instructor || '-')
            }
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="label">Ұзақтығы:</span>
                            <span class="value">${data.info.duration || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Список лекций -->
            <div class="lectures-container">
                <h3 class="section-title">Курс бағдарламасы</h3>
                <div class="lecture-stack">
                    ${lecturesHTML}
                </div>
            </div>
        `;

        container.innerHTML = fullHTML;

        // Update URL to match state
        openTab('item-course', `titleCourse=${courseTitle}`);

    } catch (e) {
        console.error("Course load error", e);
        container.innerHTML = '<p>Деректерді жүктеу қатесі.</p>';
    }
}

// Teacher Modal Logic
async function openTeacherModal(teacherId) {
    const modal = document.getElementById('teacher-modal-overlay');
    if (!modal) return;

    // Reset content
    document.getElementById('teacher-name').textContent = 'Жүктелуде...';
    document.getElementById('teacher-photo').src = '';

    modal.classList.add('active');

    try {
        const response = await fetch(`/api/teacher/${teacherId}/`);
        const result = await response.json();

        if (result.status === 'success') {
            const t = result.teacher;
            document.getElementById('teacher-name').textContent = t.fullName;
            document.getElementById('teacher-position').textContent = t.position || "-";
            document.getElementById('teacher-degree').textContent = t.degree || "-";
            document.getElementById('teacher-department').textContent = t.department;

            const emailEl = document.getElementById('teacher-email-link');
            if (emailEl) {
                emailEl.textContent = t.email || '-';
                emailEl.href = t.email ? `mailto:${t.email}` : '#';
            }

            document.getElementById('teacher-phone').textContent = t.phone || '-';
            document.getElementById('teacher-photo').src = t.photo || '/static/img/default-avatar.png';
        } else {
            console.error(result.error);
            document.getElementById('teacher-name').textContent = 'Қате: Деректерді алу мүмкін болмады';
        }
    } catch (e) {
        console.error(e);
    }

    // Close logic
    const closeBtn = document.getElementById('modal-teacher-close-btn');
    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.remove('active');
    }

    // Auto-close on outside click (if typical modal behavior)
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.classList.remove('active');
        }
    }
}