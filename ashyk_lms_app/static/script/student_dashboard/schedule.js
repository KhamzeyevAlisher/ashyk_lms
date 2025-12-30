let typeSchedule = 'day';
// Негізгі күн объектісін сақтаймыз (барлық логика осы күнге негізделеді)
// 2026 жылдың 23 қарашасы (Дүйсенбі) деп алайық, тестілеу дұрыс болуы үшін
let currentDateObj = new Date(2026, 10, 23); // Айлар 0-ден басталады (10 = Қараша)

// 1. Көмекші функциялар (Helpers)
function formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
}

function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
}

function getMonday(d) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function getDayName(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

// 2. Иконкалар мен Деректер
let iconsDay = {
    clock: `<svg class="time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    teacher: `<svg class="footer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`,
    location: `<svg class="footer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
};

let iconsWeek = {
    clock: `<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    user: `<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`,
    location: `<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
};

let lessonTypeMap = {
    lecture: { cssClass: 'type-lecture', badgeText: 'Дәріс' },
    practice: { cssClass: 'type-practice', badgeText: 'Практика' },
    lab: { cssClass: 'type-lab', badgeText: 'Зертханалық' }
};

let ScheduleData = {
    "Алгоритмдер және деректер құрылымы": {
        "lecture": {
            duration: ["01.09.2026-20.12.2026"],
            type: "lecture",
            dayLesson: {
                "Monday": ['09:00-10:30', '13:00-14:30'],
                "Wednesday": ['11:00-12:30']
            },
            teacher: "Ахметова А.Н.",
            room: "A-305"
        },
        "practice": {
            duration: ["01.09.2026-20.11.2026", "01.12.2026-05.12.2026"],
            type: "practice",
            dayLesson: {
                "Friday": ['09:00-10:30'] 
            },
            teacher: "Ахметова А.Н.",
            room: "A-305"
        },
        "lab": {
            duration: ["01.11.2026-20.12.2026"],
            type: "lab",
            dayLesson: {
                "Thursday": ['11:00-12:30'],
                "Tuesday": ['14:00-15:30']
            },
            teacher: "Ахметова А.Н.",
            room: "A-305"
        }
    },
    "Web-бағдарламалау технологиялары": {
        "lecture": {
            duration: ["01.09.2026-20.12.2026"],
            type: "lecture",
            dayLesson: {
                "Thursday": ['13:00-14:30'], 
                "Wednesday": ['14:00-15:30']
            },
            teacher: "Омаров Б.К.",
            room: "Б-201"
        },
        "practice": {
            duration: ["01.09.2026-20.11.2026"],
            type: "practice",
            dayLesson: {
                "Monday": ['11:00-12:30'] 
            },
            teacher: "Ахметова А.Н.",
            room: "A-305"
        },
        "lab": {
            duration: ["01.09.2026-20.10.2026"],
            type: "lab",
            dayLesson: {
                "Tuesday": ['11:00-12:30']
            },
            teacher: "Омаров Б.К.",
            room: "Б-205"
        }
    },
    "Дерекқорларды басқару жүйелері": {
        "lecture": {
            duration: ["01.09.2026-08.09.2026", "10.11.2026-20.12.2026"],
            type: "lecture",
            dayLesson: {
                "Tuesday": ['09:00-10:30'],
                "Friday": ['11:00-12:30']
            },
            teacher: "Сәдуақасова Г.М.",
            room: "Б-305"
        },
        "practice": {
            duration: ["01.09.2026-20.11.2026"],
            type: "practice",
            dayLesson: {
                "Wednesday": ['09:00-10:30']
            },
            teacher: "Сәдуақасова Г.М.",
            room: "Б-305"
        },
        "lab": {
            duration: ["10.11.2026-20.12.2026"],
            type: "lab",
            dayLesson: {
                "Thursday": ['09:00-10:30']
            },
            teacher: "Сәдуақасова Г.М.",
            room: "Б-205"
        }
    }
};

// 3. Негізгі Логика

/**
 * Датаның кезеңге кіретінін тексереді
 */
function isDateInRanges(targetDate, durationArray) {
    if (!durationArray || durationArray.length === 0) return false;

    const checkDate = new Date(targetDate);
    checkDate.setHours(0, 0, 0, 0);
    const checkTime = checkDate.getTime();

    return durationArray.some(range => {
        const [startStr, endStr] = range.split('-');
        const startTime = parseDate(startStr).getTime();
        const endTime = parseDate(endStr).getTime();
        return checkTime >= startTime && checkTime <= endTime;
    });
}

/**
 * Апталық диапазонды көрсетеді (Header)
 */
function updateHeaderDate() {
    const dateSpan = document.querySelector('.current-date span');
    
    if (typeSchedule === 'day') {
        // Күн режимі: Тек нақты күнді көрсетеміз
        const dayNameKZ = currentDateObj.toLocaleDateString('kk-KZ', { weekday: 'long' });
        dateSpan.textContent = `${formatDate(currentDateObj)} (${dayNameKZ})`;
    } else {
        // Апта режимі: Аптаның басы мен аяғын көрсетеміз
        const monday = getMonday(currentDateObj);
        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);
        
        dateSpan.textContent = `Ағымдағы апта • ${formatDate(monday)} - ${formatDate(friday)}`;
    }
}

/**
 * Toggle Schedule
 */
function toggleSchedule(type) {
    const dayBtn = document.querySelector('.toggle-btns .btn:first-child');
    const weekBtn = document.querySelector('.toggle-btns .btn:last-child');
    
    const dayContainer = document.querySelector('.schedule-list');
    const weekContainer = document.querySelector('.week-schedule-container');

    typeSchedule = type;

    if (type === 'day') {
        dayBtn.classList.add('active');
        weekBtn.classList.remove('active');
        dayContainer.style.display = 'flex';
        weekContainer.style.display = 'none';
        
        renderScheduleForDate();
    } else if (type === 'week') {
        weekBtn.classList.add('active');
        dayBtn.classList.remove('active');
        dayContainer.style.display = 'none';
        weekContainer.style.display = 'grid'; 

        renderScheduleWeek();
    }
    
    updateHeaderDate();
}

/**
 * Рендеринг: КҮНДІК кесте
 */
function renderScheduleForDate() {
    const container = document.querySelector('.schedule-list');
    container.innerHTML = '';
    
    // Header date update
    updateHeaderDate();

    // Дата ақпараты
    const targetDate = currentDateObj;
    const dayName = getDayName(targetDate);

    // Дата тақырыбын ішкі контейнерге қосу (опционалды, өйткені header-де бар)
    // Бірақ дизайн бойынша керек болса:
    const dateHeader = document.createElement('div');
    dateHeader.className = 'date-header';
    dateHeader.style.marginBottom = '10px';
    dateHeader.style.fontWeight = 'bold';
    dateHeader.textContent = targetDate.toLocaleDateString('kk-KZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); 
    container.appendChild(dateHeader);

    let todaysLessons = [];

    // Деректерді жинау
    for (const [subjectTitle, subjectData] of Object.entries(ScheduleData)) {
        for (const [typeKey, typeData] of Object.entries(subjectData)) {
            
            if (!isDateInRanges(targetDate, typeData.duration)) continue;

            if (typeData.dayLesson && typeData.dayLesson[dayName]) {
                const times = typeData.dayLesson[dayName];
                times.forEach(timeSlot => {
                    todaysLessons.push({
                        title: subjectTitle,
                        type: typeKey,
                        time: timeSlot,
                        teacher: typeData.teacher,
                        room: typeData.room
                    });
                });
            }
        }
    }

    // Уақыт бойынша сұрыптау
    todaysLessons.sort((a, b) => a.time.localeCompare(b.time));

    // Егер сабақ жоқ болса
    if (todaysLessons.length === 0) {
        const noLessonDiv = document.createElement('div');
        noLessonDiv.className = 'no-lessons';
        noLessonDiv.style.padding = '20px';
        noLessonDiv.style.textAlign = 'center';
        noLessonDiv.style.color = '#666';
        noLessonDiv.textContent = 'Бұл күні сабақ жоқ / Демалыс';
        container.appendChild(noLessonDiv);
        return;
    }

    // Карточкаларды салу
    todaysLessons.forEach(lesson => {
        // ТҮЗЕТУ: window.lessonTypeMap емес, жай ғана lessonTypeMap
        const typeInfo = lessonTypeMap[lesson.type] || { cssClass: "type-" + lesson.type, badgeText: lesson.type };

        const lessonCard = document.createElement('div');
        lessonCard.className = `lesson-card ${typeInfo.cssClass}`;

        lessonCard.innerHTML = `
            <div class="card-content">
                <div class="card-top">
                    <div class="time-wrapper">
                        ${iconsDay.clock} 
                        <span class="time-text">${lesson.time}</span>
                    </div>
                    <span class="badge">${typeInfo.badgeText}</span>
                </div>
                <h3 class="subject-title">${lesson.title}</h3>
                <div class="card-footer">
                    <div class="footer-item">
                        ${iconsDay.teacher}
                        <span>${lesson.teacher}</span>
                    </div>
                    <div class="footer-item">
                        ${iconsDay.location}
                        <span>${lesson.room}</span>
                    </div>
                </div>
            </div>
            <button class="card-btn">Толығырақ</button>
        `;
        container.appendChild(lessonCard);
    });
}

/**
 * Рендеринг: АПТАЛЫҚ кесте
 */
function renderScheduleWeek() {
    const container = document.querySelector('.week-schedule-container');
    container.innerHTML = ''; 
    updateHeaderDate();

    const dayNamesKZ = {
        'Monday': 'Дүйсенбі',
        'Tuesday': 'Сейсенбі',
        'Wednesday': 'Сәрсенбі',
        'Thursday': 'Бейсенбі',
        'Friday': 'Жұма'
    };

    // ТҮЗЕТУ: Ағымдағы таңдалған күннің Дүйсенбісін анықтау
    const mondayDate = getMonday(currentDateObj);

    // 5 күнді генерациялау (Дүйсенбі-Жұма)
    const weekDays = [];
    for (let i = 0; i < 5; i++) {
        const date = new Date(mondayDate);
        date.setDate(mondayDate.getDate() + i);
        weekDays.push({
            date: date,
            dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
            dayNameKZ: dayNamesKZ[date.toLocaleDateString('en-US', { weekday: 'long' })]
        });
    }

    weekDays.forEach(dayInfo => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';

        let lessonsHtml = '';
        let lessonCount = 0;
        let dailyLessons = [];

        // Сабақтарды жинау
        for (const [subjectTitle, subjectData] of Object.entries(ScheduleData)) {
            for (const [typeKey, typeData] of Object.entries(subjectData)) {
                
                if (!isDateInRanges(dayInfo.date, typeData.duration)) continue;

                if (typeData.dayLesson && typeData.dayLesson[dayInfo.dayName]) {
                    const times = typeData.dayLesson[dayInfo.dayName];
                    
                    let styleClass = 'style-blue';
                    if (typeKey === 'practice') styleClass = 'style-green';
                    else if (typeKey === 'lab') styleClass = 'style-purple';

                    times.forEach(time => {
                        dailyLessons.push({
                            time: time,
                            html: `
                                <div class="mini-lesson ${styleClass}">
                                    <div class="mini-top">
                                        <div class="time-row text-accent">
                                            ${iconsWeek.clock}
                                            ${time}
                                        </div>
                                        <span class="badge">${lessonTypeMap[typeKey]?.badgeText || typeKey}</span>
                                    </div>
                                    <h4 class="mini-subject">${subjectTitle}</h4>
                                    <div class="mini-details">
                                        <div class="detail-row">${iconsWeek.user} ${typeData.teacher}</div>
                                        <div class="detail-row">${iconsWeek.location} ${typeData.room}</div>
                                    </div>
                                </div>
                            `
                        });
                        lessonCount++;
                    });
                }
            }
        }

        // Сабақтарды уақыты бойынша сұрыптау
        dailyLessons.sort((a, b) => a.time.localeCompare(b.time));
        dailyLessons.forEach(item => lessonsHtml += item.html);

        dayColumn.innerHTML = `
            <div class="day-header">
                <h3 class="day-name">${dayInfo.dayNameKZ} <span style="font-size: 0.8em; font-weight: normal; color: #777;">(${formatDate(dayInfo.date).slice(0,5)})</span></h3>
                <span class="class-count">${lessonCount} сабақ</span>
            </div>
            <div class="day-body">
                ${lessonsHtml || '<div style="padding: 10px; text-align: center; color: #999;">Сабақ жоқ</div>'}
            </div>
        `;
        container.appendChild(dayColumn);
    });
}

// 4. Оқиға тыңдаушылар (Event Listeners)
document.addEventListener("DOMContentLoaded", function() {
    
    // Алғашқы рендеринг
    renderScheduleForDate();

    // Батырмаларды басқару
    const arrows = document.querySelectorAll('.date-card .arrow');

    arrows.forEach(arrow => {
        arrow.addEventListener('click', function() {
            const direction = this.getAttribute('data-direction');

            if (typeSchedule === 'day') {
                // Күн режимі: +/- 1 күн
                if (direction === 'left') {
                    currentDateObj.setDate(currentDateObj.getDate() - 1);
                } else {
                    currentDateObj.setDate(currentDateObj.getDate() + 1);
                }
                renderScheduleForDate();
                
            } else if (typeSchedule === 'week') {
                // Апта режимі: +/- 7 күн
                if (direction === 'left') {
                    currentDateObj.setDate(currentDateObj.getDate() - 7);
                } else {
                    currentDateObj.setDate(currentDateObj.getDate() + 7);
                }
                renderScheduleWeek();
            }
        });
    });
});