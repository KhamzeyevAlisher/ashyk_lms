// courseData removed in favor of API
// let courseData = { ... }; 

async function renderCourseByTitle(courseTitle) {
    const container = document.getElementById('tab-item-course');
    if (!container) return;

    container.innerHTML = '<h3>Жүктелуде...</h3>';

    try {
        // Добавляем стили динамически, чтобы избежать проблем с кэшированием CSS
        if (!document.getElementById('course-detail-styles')) {
            const style = document.createElement('style');
            style.id = 'course-detail-styles';
            style.innerHTML = `
                .course-tabs-container {
                    display: flex;
                    gap: 12px;
                    background: #f1f5f9;
                    padding: 6px;
                    border-radius: 14px;
                    margin: 25px 0;
                    width: fit-content;
                    border: 1px solid #e2e8f0;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                }
                .tab-btn-item {
                    background: transparent;
                    border: none;
                    padding: 10px 24px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .tab-btn-item:hover {
                    color: #1e293b;
                    background: rgba(255, 255, 255, 0.6);
                }
                .tab-btn-item.active {
                    background: white;
                    color: #6366f1;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .course-tab-content {
                    display: none;
                    animation: courseFadeIn 0.4s ease-out;
                }
                .course-tab-content.active {
                    display: block;
                }
                @keyframes courseFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                #presentation-tab {
                    margin: -30px -30px 0 -30px; /* Прижимаем к краям дашборда */
                    background: white;
                    width: calc(100% + 60px);
                }
                .presentation-container {
                    background: white;
                    border: none;
                    border-radius: 0;
                    overflow: visible;
                    height: auto;
                    width: 100%;
                    display: block;
                    box-shadow: none;
                }
                .presentation-container iframe {
                    width: 100%;
                    height: 10000px; /* Очень длинный для естественного скролла сайта */
                    border: none;
                    display: block;
                    margin: 0;
                    padding: 0;
                }
                .no-presentation-empty {
                    text-align: center;
                    padding: 80px 40px;
                    color: #94a3b8;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    background: white;
                    margin: 30px;
                    border-radius: 20px;
                }
            `;
            document.head.appendChild(style);
        }

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

            <!-- Вкладки (Tabs) -->
            <div class="course-tabs-container">
                <button class="tab-btn-item active" onclick="switchCourseTab(event, 'presentation')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    Презентация
                </button>
                <button class="tab-btn-item" onclick="switchCourseTab(event, 'program')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    Курс бағдарламасы
                </button>
            </div>

            <!-- Контент вкладок -->
            <div id="presentation-tab" class="course-tab-content active">
                <div class="presentation-container">
                    ${data.presentationUrl 
                        ? `<iframe src="${data.presentationUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH,0&zoom=100" type="application/pdf"></iframe>`
                        : `<div class="no-presentation-empty">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                            <p>Бұл курс үшін презентация жүктелмеген</p>
                          </div>`
                    }
                </div>
            </div>

            <div id="program-tab" class="course-tab-content">
                <div class="lectures-container">
                    <h3 class="section-title">Курс бағдарламасы</h3>
                    <div class="lecture-stack">
                        ${lecturesHTML}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = fullHTML;

        // Добавляем функцию переключения вкладок в глобальную область, если её там нет
        window.switchCourseTab = function(event, tabName) {
            // Находим родительский контейнер для поиска только его вкладок
            const parent = event.currentTarget.closest('#tab-item-course');
            
            // Убираем активный класс у кнопок
            const buttons = parent.querySelectorAll('.tab-btn-item');
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс нажатой кнопке
            event.currentTarget.classList.add('active');
            
            // Скрываем все вкладки курса
            const contents = parent.querySelectorAll('.course-tab-content');
            contents.forEach(content => content.classList.remove('active'));
            
            // Показываем нужную вкладку
            parent.querySelector(`#${tabName}-tab`).classList.add('active');
        };

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