let courseData = {
    "Кәсіпкерлік": {
        description: "Бұл курс кәсіпкерлік қызметті ұйымдастыру, басқару психологиясы және кадрлық саясаттың заманауи әдістерін қамтиды.",
        coverImage: "https://cdn.culture.ru/images/6c3b2d76-23b7-5372-a282-81a13cf3d4f4",
        tags: ["Кәсіпкерлік", "Менеджмент"],
        info: {
            department: "Экономика және басқару",
            instructor: "Примжанова Амина Абуталиновна",
            duration: "8 апта (16 сағат)"
        },
        program: [
            { id: 1, topic: "Кәсіпкерлік мәдениет пен этикасы", state: "completed" },
            { id: 2, topic: "Кәсіпкерліктің ұйымдық - құқықтық нысандары", state: "completed" },
            { id: 3, topic: "Менеджмент мәні мен қағидалары", state: "completed" },
            { id: 4, topic: "Менеджменттің мәні мен қағидалары (Жалғасы)", state: "active" }, 
            { id: 5, topic: "HR менеджментке кіріспе", state: "locked" },
            { id: 6, topic: "Кәсіпкерлік ұйымды кадрмен қамтамасыз ету", state: "locked" },
            { id: 7, topic: "Инновациялық менеджменттегі негізгі түсініктер", state: "locked" },
            { id: 8, topic: "Басқарудағы стратегиялық тәжірибелердің даму тарихы", state: "locked" }
        ]
    }
};

function renderCourseByTitle(courseTitle) {
    const container = document.getElementById('tab-item-course');
    
    if (!container) return;

    // Получаем данные по ключу (Названию)
    const data = courseData[courseTitle];

    if (!data) {
        container.innerHTML = `<h3>Курс "${courseTitle}" табылмады</h3>`;
        return;
    }

    // 1. Формируем HTML тэгов
    const tagsHTML = data.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    // 2. Формируем HTML лекций
    const lecturesHTML = data.program.map(lecture => {
        let icon = '';
        let btn = '';
        let rowClass = 'lecture-row';

        if (lecture.state === 'completed') {
            rowClass += ' completed';
            icon = `<div class="status-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`;
            btn = `<button class="btn-review" onclick="openLesson('${courseTitle}', '${lecture.topic}')">Қайталау</button>`;
        } else if (lecture.state === 'active') {
            icon = `<div class="status-icon play"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>`;
            btn = `<button class="btn-start" onclick="openLesson('${courseTitle}', '${lecture.topic}')">Бастау</button>`;
        } else {
            icon = `<div class="status-icon lock"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>`;
        }

        return `
            <div class="${rowClass}">
                ${icon}
                <div class="lecture-content">
                    <span class="lecture-number">${lecture.id}-дәріс</span>
                    <h4>${lecture.topic}</h4>
                </div>
                ${btn}
            </div>
        `;
    }).join('');

    // 3. Собираем общий HTML
    const fullHTML = `
        <!-- Карточка курса -->
        <div class="card course-header">
            <div class="course-cover">
                <img src="${data.coverImage}" alt="${courseTitle}">
            </div>
            <div class="course-details">
                <div class="course-tags">
                    ${tagsHTML}
                </div>
                <h2>${courseTitle}</h2>
                <p class="description">${data.description}</p>
                
                <div class="instructor-info">
                    <div class="info-row">
                        <span class="label">Кафедра:</span>
                        <span class="value">${data.info.department}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Оқытушы:</span>
                        <span class="value">${data.info.instructor}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Ұзақтығы:</span>
                        <span class="value">${data.info.duration}</span>
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
    openTab('item-course');
}