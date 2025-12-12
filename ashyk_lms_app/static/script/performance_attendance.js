// Генерация отчета о посещаемости
document.addEventListener("DOMContentLoaded", () => {
    // Структура данных, как требовалось (ключи - месяцы на казахском)
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
});

// Генерация отчета об успеваемости
document.addEventListener("DOMContentLoaded", function() {

    // 1. SVG-иконки для трендов, чтобы не хранить их в основном объекте
    const trendIcons = {
        up: `<svg class="trend-icon-journal up-journal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                 <polyline points="17 6 23 6 23 12"></polyline>
             </svg>`,
        flat: `<svg class="trend-icon-journal flat-journal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <line x1="5" y1="12" x2="19" y2="12"></line>
               </svg>`,
        down: `<svg class="trend-icon-journal down-journal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                   <polyline points="17 18 23 18 23 12"></polyline>
               </svg>`
    };

    // 2. Данные об успеваемости в виде объекта. 
    // Ключ - название предмета.
    const journalData = {
        "Алгоритмдер және деректер құрылымы": {
            trend: "up",
            averageScore: 4.6,
            attendance: "95%",
            grades: [5, 4, 5, 5, 4]
        },
        "Объектіге бағытталған бағдарламалау": {
            trend: "up",
            averageScore: 4.8,
            attendance: "100%",
            grades: [5, 5, 4, 5, 5]
        },
        "Дерекқор жүйелері": {
            trend: "flat",
            averageScore: 3.8,
            attendance: "90%",
            grades: [4, 4, 3, 4, 4]
        }
    };

    // 3. Находим контейнер, куда будем вставлять сгенерированные карточки
    const journalContainer = document.getElementById('tab-diary').querySelector('.card-journal');

    // 4. Перебираем объект journalData
    // Object.entries() преобразует объект в массив пар [ключ, значение]
    Object.entries(journalData).forEach(([subjectName, subjectDetails]) => {
        
        // Создаем главный контейнер для карточки предмета
        const subjectCard = document.createElement('div');
        subjectCard.className = 'subject-card-journal';

        // Генерируем HTML для списка оценок
        // .map() создает из массива оценок массив HTML-строк
        // .join('') объединяет их в одну строку
        const gradesHtml = subjectDetails.grades.map(grade => 
            `<span class="grade-badge-journal grade-${grade}-journal">${grade}</span>`
        ).join('');

        // Формируем полную HTML-структуру карточки с помощью шаблонной строки
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

        // 5. Добавляем готовую карточку в основной контейнер
        journalContainer.appendChild(subjectCard);
    });
});