document.addEventListener("DOMContentLoaded", function() {
    //Скрипт дневного расписание
    // 1. Вспомогательные объекты (иконки и типы уроков) остаются без изменений
    const iconsDay = {
        clock: `<svg class="time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        teacher: `<svg class="footer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`,
        location: `<svg class="footer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
    };

    const lessonTypeMap = {
        lecture: { cssClass: 'type-lecture', badgeText: 'Дәріс' },
        practice: { cssClass: 'type-practice', badgeText: 'Практика' },
        lab: { cssClass: 'type-lab', badgeText: 'Зертханалық' }
    };

    // 2. Новая структура данных, предоставленная вами
    const dailyScheduleData = {
        "25 қараша 2025": [
            {
                "Алгоритмдер және деректер құрылымы": {
                    time: "09:00-10:30",
                    type: "lecture",
                    teacher: "Ахметова А.Н.",
                    room: "А-305"
                }
            },
            {
                "Web-бағдарламалау технологиялары": {
                    time: "10:45-12:15",
                    type: "practice",
                    teacher: "Омаров Б.К.",
                    room: "Б-201"
                }
            },
            {
                "Дерекқорларды басқару жүйелері": {
                    time: "12:30-14:00",
                    type: "lab",
                    teacher: "Сәдуақасова Г.М.",
                    room: "В-102"
                }
            }
        ]
    };

    // 3. Находим главный контейнер
    const container = document.getElementById('tab-schedule').querySelector('.schedule-list');

    // 4. Перебираем дни в объекте dailyScheduleData
    // Ключ 'dateString' будет "25 қараша 2025", а 'lessonsArray' - массив уроков
    for (const dateString in dailyScheduleData) {
        
        // 4.1. Создаем и добавляем заголовок с датой для текущего дня
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        dateHeader.textContent = dateString;
        container.appendChild(dateHeader);

        // Получаем массив уроков для этого дня
        const lessonsArray = dailyScheduleData[dateString];

        // 4.2. Перебираем массив уроков
        lessonsArray.forEach(lessonObject => {
            
            // Каждый 'lessonObject' - это объект с одним ключом (название предмета)
            // Используем Object.entries(), чтобы легко извлечь и ключ, и значение
            const [subjectTitle, lessonDetails] = Object.entries(lessonObject)[0];
            
            // Получаем информацию о типе урока из карты
            const typeInfo = lessonTypeMap[lessonDetails.type];

            // Создаем главный div для карточки
            const lessonCard = document.createElement('div');
            lessonCard.className = `lesson-card ${typeInfo.cssClass}`;

            // Формируем всю внутреннюю разметку карточки
            lessonCard.innerHTML = `
                <div class="card-content">
                    <div class="card-top">
                        <div class="time-wrapper">
                            ${iconsDay.clock}
                            <span class="time-text">${lessonDetails.time}</span>
                        </div>
                        <span class="badge">${typeInfo.badgeText}</span>
                    </div>
                    <h3 class="subject-title">${subjectTitle}</h3>
                    <div class="card-footer">
                        <div class="footer-item">
                            ${iconsDay.teacher}
                            <span>${lessonDetails.teacher}</span>
                        </div>
                        <div class="footer-item">
                            ${iconsDay.location}
                            <span>${lessonDetails.room}</span>
                        </div>
                    </div>
                </div>
                <button class="card-btn">Толығырақ</button>
            `;

            // 4.3. Добавляем готовую карточку в контейнер
            container.appendChild(lessonCard);
        });
    }



    //Скрипт недельного расписание
    const weekScheduleData = [
        {
            day: "Дүйсенбі",
            lessons: [
                {
                    time: "09:00-10:30",
                    type: "Дәріс",
                    subject: "Объектіге бағытталған бағдарламалау",
                    teacher: "Иванов А.П.",
                    room: "А-305",
                    styleClass: "style-blue" // style-blue, style-green, style-purple
                },
                {
                    time: "10:45-12:15",
                    type: "Практика",
                    subject: "Python тілінде бағдарламалау",
                    teacher: "Петров С.С.",
                    room: "Б-201",
                    styleClass: "style-green"
                }
            ]
        },
        {
            day: "Сейсенбі",
            lessons: [
                {
                    time: "09:00-10:30",
                    type: "Дәріс",
                    subject: "Компьютерлік архитектура",
                    teacher: "Ахметова Г.К.",
                    room: "А-210",
                    styleClass: "style-blue"
                },
                {
                    time: "10:45-12:15",
                    type: "Зертханалық",
                    subject: "Linux операциялық жүйелері",
                    teacher: "Ким В.А.",
                    room: "Л-105",
                    styleClass: "style-purple"
                }
            ]
        },
        {
            day: "Сәрсенбі",
            lessons: [
                {
                    time: "09:00-10:30",
                    type: "Практика",
                    subject: "Frontend әзірлеу (React JS)",
                    teacher: "Омаров Б.Н.",
                    room: "Б-404",
                    styleClass: "style-green"
                },
                {
                    time: "10:45-12:15",
                    type: "Дәріс",
                    subject: "Ақпараттық қауіпсіздік негіздері",
                    teacher: "Сыздықов Е.М.",
                    room: "А-101",
                    styleClass: "style-blue"
                }
            ]
        },
        {
            day: "Бейсенбі",
            lessons: [
                {
                    time: "09:00-10:30",
                    type: "Зертханалық",
                    subject: "Мобильді қосымшаларды әзірлеу",
                    teacher: "Әлиев Р.Т.",
                    room: "Л-303",
                    styleClass: "style-purple"
                },
                {
                    time: "10:45-12:15",
                    type: "Дәріс",
                    subject: "Жасанды интеллект негіздері",
                    teacher: "Қасымов Д.А.",
                    room: "А-405",
                    styleClass: "style-blue"
                }
            ]
        },
        {
            day: "Жұма",
            lessons: [
                {
                    time: "09:00-10:30",
                    type: "Практика",
                    subject: "Backend (Node.js & Express)",
                    teacher: "Омаров Б.Н.",
                    room: "Б-404",
                    styleClass: "style-green"
                }
            ]
        }
    ];

    // SVG белгішелері (Қайталанатын кодты азайту үшін)
    const iconsWeek = {
        clock: `<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        user: `<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`,
        location: `<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
    };

    // 2. РЕНДЕРИНГ ФУНКЦИЯСЫ
    function renderSchedule() {
        const container = document.querySelector('.week-schedule-container');
        
        // Контейнерді тазалау
        container.innerHTML = ''; 
        
        weekScheduleData.forEach(dayData => {
            // Күн бағанын құру
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';

            // Сабақтардың HTML кодын жинау
            let lessonsHtml = '';
            dayData.lessons.forEach(lesson => {
                lessonsHtml += `
                    <div class="mini-lesson ${lesson.styleClass}">
                        <div class="mini-top">
                            <div class="time-row text-accent">
                                ${iconsWeek.clock}
                                ${lesson.time}
                            </div>
                            <span class="badge">${lesson.type}</span>
                        </div>
                        <h4 class="mini-subject">${lesson.subject}</h4>
                        <div class="mini-details">
                            <div class="detail-row">${iconsWeek.user} ${lesson.teacher}</div>
                            <div class="detail-row">${iconsWeek.location} ${lesson.room}</div>
                        </div>
                    </div>
                `;
            });

            // Күн тақырыбы мен денесін құрастыру
            dayColumn.innerHTML = `
                <div class="day-header">
                    <h3 class="day-name">${dayData.day}</h3>
                    <span class="class-count">${dayData.lessons.length} сабақ</span>
                </div>
                <div class="day-body">
                    ${lessonsHtml}
                </div>
            `;

            container.appendChild(dayColumn);
        });

        
    }

    // Функцияны іске қосу
    renderSchedule();

});