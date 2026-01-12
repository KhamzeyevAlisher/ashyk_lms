//Статистика посещаемости 
let attendanceStats = {
    "Қыркүйек": { // Сентябрь
        "all": 45,
        "attendedDays": 42,
        "percent": 93
    },
    "Қазан": { // Октябрь
        "all": 50,
        "attendedDays": 48,
        "percent": 96
    },
    "Қараша": { // Ноябрь
        "all": 40,
        "attendedDays": 38,
        "percent": 95
    }
};

let journalData = {
    "Алгоритмдер және деректер құрылымы": {
        trend: "up",
        averageScore: 4.6,
        attendance: "95%",
        grades: [
            5, 
            { value: 4, comment: "Тақырыпты толық ашпадыңыз." }, // Оценка с комментом
            5, 
            5, 
            { value: 4, comment: "Кешігіп тапсырдыңыз." }        // Оценка с комментом
        ]
    },
    "Объектіге бағытталған бағдарламалау": {
        trend: "up",
        averageScore: 4.8,
        attendance: "100%",
        grades: [5, 5, 4, 5, 5] // Обычные оценки без комментов
    },
    "Дерекқор жүйелері": {
        trend: "flat",
        averageScore: 3.8,
        attendance: "90%",
        grades: [
            4, 
            { value: 4, comment: "Жақсы, бірақ SQL сұраныста қате бар." }, 
            3, 
            4, 
            4
        ]
    }
};

// 1. SVG-иконки для трендов, чтобы не хранить их в основном объекте
let trendIcons = {
    up: `<svg class="trend-icon-journal up-journal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    flat: `<svg class="trend-icon-journal flat-journal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    down: `<svg class="trend-icon-journal down-journal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>`
};

// Генерация отчета о посещаемости
document.addEventListener("DOMContentLoaded", () => {
    //============== Скрипт для посещаемости ==============
    // Получаем контейнер
    const container = document.getElementById('attendance-section-unique');

    if (container) {
        // Создаем и добавляем общий заголовок
        const titleElement = document.createElement('div');
        titleElement.className = 'att-main-title';
        titleElement.innerText = 'Қатысу есебі'; // Отчет о посещаемости
        container.appendChild(titleElement);

        // Перебираем объект с данными
        for (const [month, data] of Object.entries(attendanceStats)) {
            
            // Создаем карточку месяца
            const card = document.createElement('div');
            card.className = 'att-month-card';

            // HTML содержимое карточки
            card.innerHTML = `
                <div class="att-card-header">
                    <span class="att-month-name">${month}</span>
                    <span class="att-fraction-text">${data.attendedDays}/${data.all}</span>
                </div>
                <div class="att-progress-track">
                    <div class="att-progress-fill" style="width: ${data.percent}%;"></div>
                </div>
                <p class="att-percent-subtitle">${data.percent}% қатысу</p>
            `;

            // Добавляем карточку в контейнер
            container.appendChild(card);
        }
    }

    //============== Скрипт для успеваемости ==============

    // Находим контейнер, куда будем вставлять сгенерированные карточки
    const journalContainer = document.getElementById('tab-diary').querySelector('.card-journal');

    // Очищаем старые данные (на случай перезапуска скрипта)
    // journalContainer.innerHTML = '...'; // (Если нужно сохранить заголовок, не очищаем весь контейнер, а удаляем только карточки)
    const oldCards = journalContainer.querySelectorAll('.subject-card-journal');
    oldCards.forEach(card => card.remove());


    // 2. Генерация HTML
    Object.entries(journalData).forEach(([subjectName, subjectDetails]) => {
        
        const subjectCard = document.createElement('div');
        subjectCard.className = 'subject-card-journal';

        const gradesHtml = subjectDetails.grades.map(gradeItem => {
            // Проверяем, является ли оценка объектом или числом
            let value, commentAttr = '', classAttr = '';
            
            if (typeof gradeItem === 'object' && gradeItem !== null) {
                value = gradeItem.value;
                // Добавляем атрибут data-comment и класс has-comment-journal
                if (gradeItem.comment) {
                    commentAttr = `data-comment="${gradeItem.comment}"`;
                    classAttr = 'has-comment-journal';
                }
            } else {
                value = gradeItem;
            }

            return `<span class="grade-badge-journal grade-${value}-journal ${classAttr}" ${commentAttr}>${value}</span>`;
        }).join('');

        subjectCard.innerHTML = `
            <div class="subject-header-journal">
                <div class="subject-name-wrapper-journal">
                    ${trendIcons[subjectDetails.trend]}
                    <span class="subject-name-journal">${subjectName}</span>
                </div>
                <div class="subject-stats-journal">
                    <div class="stat-box-journal">
                        <span class="stat-label-journal">Орташа балл</span>
                        <span class="stat-value-journal">${subjectDetails.averageScore}</span>
                    </div>
                    <div class="stat-box-journal">
                        <span class="stat-label-journal">Қатысу</span>
                        <span class="stat-value-journal">${subjectDetails.attendance}</span>
                    </div>
                </div>
            </div>
            <div class="grades-list-journal">
                ${gradesHtml}
            </div>
        `;

        journalContainer.appendChild(subjectCard);
    });


    // 3. Логика обработки клика (Делегирование событий)
    // Создаем один элемент тултипа, который будем перемещать
    let tooltip = document.createElement('div');
    tooltip.className = 'comment-tooltip-journal';
    document.body.appendChild(tooltip);

    document.addEventListener('click', function(e) {
        const target = e.target;

        // Если кликнули на оценку с комментарием
        if (target.classList.contains('has-comment-journal')) {
            const commentText = target.getAttribute('data-comment');
            
            // Получаем координаты оценки
            const rect = target.getBoundingClientRect();
            
            // Заполняем и позиционируем тултип
            tooltip.textContent = commentText;
            tooltip.classList.add('visible');
            
            // Позиционируем: Сверху по центру от элемента + скролл страницы
            tooltip.style.left = (rect.left + rect.width / 2) + 'px';
            tooltip.style.top = (rect.top + window.scrollY) + 'px';

        } else {
            // Если кликнули в любое другое место - скрываем тултип
            tooltip.classList.remove('visible');
        }
    });
});
