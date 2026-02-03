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

// let journalData_1 = {
//     "Алгоритмдер және деректер құрылымы": {
//         trend: "up",
//         averageScore: 89.8,
//         attendance: "95%",
//         grades: [
//             95, 
//             { value: 84, comment: "Тақырыпты толық ашпадыңыз." }, // Оценка с комментом
//             92, 
//             98, 
//             { value: 80, comment: "Кешігіп тапсырдыңыз." }        // Оценка с комментом
//         ]
//     },
//     "Объектіге бағытталған бағдарламалау": {
//         trend: "up",
//         averageScore: 78.8,
//         attendance: "95%",
//         grades: [
//             82, 
//             { value: 85, comment: "Ошибка в SQL." }, 
//             65, 
//             { value: 87, comment: "___" }, 
//             75
//         ] // Обычные оценки без комментов
//     },
//     "Дерекқор жүйелері": {
//         trend: "flat",
//         averageScore: 91.6,
//         attendance: "95%",
//         grades: [
//             95, 
//             98, 
//             75, 
//             { value: 95, comment: "!" }, 
//             95
//         ]
//     }
// };

// 1. SVG-иконки для трендов, чтобы не хранить их в основном объекте

let trendIcons = {
    up: `<svg class="trend-icon-journal up-journal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    flat: `<svg class="trend-icon-journal flat-journal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    down: `<svg class="trend-icon-journal down-journal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>`
};

function renderJournal(journalData, containerId) {
    const tabContainer = document.getElementById(containerId);
    if (!tabContainer) {
        console.error(`Контейнер #${containerId} табылмады`);
        return;
    }

    let journalContainer = tabContainer.querySelector('.journal-cards-scroll-area');
    if (!journalContainer) {
        console.warn(`.journal-cards-scroll-area табылмады, .card-journal қолданылады`);
        journalContainer = tabContainer.querySelector('.card-journal');
    }

    // const trendIcons = {
    //     up: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trending-up text-success"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    //     down: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trending-down text-danger"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>`,
    //     flat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minus text-warning"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
    // };

    // Ескі карточкаларды тазалаймыз
    const oldCards = journalContainer.querySelectorAll('.subject-card-journal');
    oldCards.forEach(card => card.remove());

    // Деректер жоқ болса хабарлама
    if (!journalData || Object.keys(journalData).length === 0) {

        journalContainer.innerHTML = '<p class="text-center p-4">Бағалар әзірге қойылмаған.</p>';
        return;
    }

    // HTML генерациясы
    Object.entries(journalData).forEach(([subjectName, subjectDetails]) => {
        const subjectCard = document.createElement('div');
        subjectCard.className = 'subject-card-journal';

        const gradesHtml = subjectDetails.grades.map(gradeItem => {
            let value, commentAttr = '', classAttr = '';

            // Баға объект немесе жай сан екенін тексереміз
            if (typeof gradeItem === 'object' && gradeItem !== null) {
                value = gradeItem.value;
                if (gradeItem.comment) {
                    commentAttr = `data-comment="${gradeItem.comment}"`;
                    classAttr = 'has-comment-journal';
                }
            } else {
                value = gradeItem;
            }

            let color = value >= 90 ? 'green' : value >= 70 ? 'blue' : value > 50 && value < 70 ? 'yellow' : 'gray';

            console.log("Grade value:", color);

            console.log("Grade value:", gradeItem.date);

            return `<span class="grade-badge-journal grade-${color}-journal ${classAttr} ${color}-journal-comment" ${commentAttr} data-date="${gradeItem.date}">${value}</span>`;
        }).join('');

        // Қатысу (attendance) жоқ болса, дефолт мән қоямыз
        const attendance = subjectDetails.attendance || 'N/A';
        // Тренд иконын алу (егер қате келсе, flat қоямыз)
        const trendIcon = trendIcons[subjectDetails.trend] || trendIcons.flat;

        subjectCard.innerHTML = `
            <div class="subject-header-journal">
                <div class="subject-name-wrapper-journal">
                    ${trendIcon}
                    <span class="subject-name-journal">${subjectName}</span>
                </div>
                <div class="subject-stats-journal">
                    <div class="stat-box-journal">
                        <span class="stat-label-journal">Орташа балл</span>
                        <span class="stat-value-journal">${subjectDetails.averageScore}</span>
                    </div>
                    <div class="stat-box-journal">
                        <span class="stat-label-journal">Қатысу</span>
                        <span class="stat-value-journal">${attendance}</span>
                    </div>
                </div>
            </div>
            <div class="grades-list-journal">
                ${gradesHtml}
            </div>
        `;

        journalContainer.appendChild(subjectCard);
    });
}

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
    // const journalContainer = document.getElementById('tab-diary').querySelector('.card-journal');

    // Очищаем старые данные (на случай перезапуска скрипта)
    // journalContainer.innerHTML = '...'; // (Если нужно сохранить заголовок, не очищаем весь контейнер, а удаляем только карточки)
    // const oldCards = journalContainer.querySelectorAll('.subject-card-journal');
    // oldCards.forEach(card => card.remove());

    /** 
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
    
    */

    // 3. Логика обработки клика (Делегирование событий)
    // Создаем один элемент тултипа, который будем перемещать

    /** 
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
        */
});

document.addEventListener('DOMContentLoaded', async () => {
    // API URL (Django urls.py-да көрсетілген жол)
    const JOURNAL_API_URL = '/api/journal/';
    const CONTAINER_ID = 'tab-diary'; // HTML-дегі контейнер ID-і
    let dataGrade = null;

    try {
        const response = await fetch(JOURNAL_API_URL);

        // Егер пайдаланушы авторизациядан өтпеген болса (401/403)
        if (response.status === 401 || response.status === 403) {
            console.warn("Авторизация қажет");
            return;
        }

        const data = await response.json();
        dataGrade = data;

        console.log("Journal data received:", data);

        if (response.ok) {
            // 1. Журналды саламыз
            renderJournal(data, CONTAINER_ID);

            // 2. Тултиптерді іске қосамыз (тек бір рет)
            // initJournalTooltips();
        } else {
            console.warn("Журнал деректері алынбады:", data);
            const container = document.getElementById(CONTAINER_ID);
            if (container) container.innerHTML = `<p style="color:red">Қате: ${data.error || 'Белгісіз қате'}</p>`;
        }

    } catch (error) {
        console.error("Критическая ошибка API (Journal):", error);
        const container = document.getElementById(CONTAINER_ID);
        if (container) container.innerHTML = `<p>Сервермен байланыс жоқ.</p>`;
    }

    const gradeModal = document.getElementById('grade-modal-overlay');
    const closeBtn = document.getElementById('modal-grade-close-btn');
    const cancelBtn = document.getElementById('modal-grade-cancel-btn');

    // Өрістер
    const subjectField = document.getElementById('modal-subject-grade');
    const taskNameField = document.getElementById('modal-grade-task-name');
    const gradeValueField = document.getElementById('grade-value');
    const commentField = document.getElementById('grade-comment-area');
    const dateGrade = document.getElementById('grade-date');

    // Барлық баға белгішелерін алу
    // МАҢЫЗДЫ: Бұл код renderJournal() функциясы жұмыс істеп болғаннан кейін орындалуы керек!
    const gradeBadges = document.querySelectorAll('.grade-badge-journal');

    console.log("Found grade badges:", gradeBadges.length);

    // Әр батырмаға click event қосу
    gradeBadges.forEach(badge => {
        badge.addEventListener('click', function () {

            // 1. Деректерді HTML атрибуттардан (dataset) алу
            // renderJournal функциясында біз оларды data-subject, data-comment деп сақтағанбыз
            // const subject = this.dataset.subject || "Пән аты белгісіз";
            const subject = this.parentElement.parentElement.querySelector('.subject-name-journal').innerText || "Пән аты белгісіз";
            const type = this.dataset.type || "Тапсырма";
            const date = this.dataset.date || "";
            const grade = this.innerText || this.dataset.value || "0";
            const comment = this.dataset.comment; // Бос болуы мүмкін

            // 2. Модальды терезені толтыру
            subjectField.textContent = subject;
            taskNameField.textContent = `${type} (${date})`; // Мысалы: Лекция (13.01.2026)
            gradeValueField.textContent = grade;
            dateGrade.textContent = date;

            // Пікірді тексеру
            if (comment && comment.trim() !== "") {
                commentField.textContent = comment;
                commentField.style.color = "#333";
                commentField.style.fontStyle = "normal";
            } else {
                commentField.textContent = "Мұғалім пікір қалдырмаған.";
                commentField.style.color = "#888"; // Сұр түс
                commentField.style.fontStyle = "italic";
            }

            // Бағасына қарай түсін өзгерту
            const gradeCircle = gradeValueField.parentElement;
            const numericGrade = parseInt(grade);

            // Ескі стильдерді тазарту (қате кетпес үшін)
            gradeCircle.style.borderColor = '';
            gradeCircle.style.color = '';

            if (numericGrade >= 90) {
                gradeCircle.style.borderColor = '#28a745';
                gradeCircle.style.color = '#28a745';
            } else if (numericGrade >= 70) {
                gradeCircle.style.borderColor = '#007bff';
                gradeCircle.style.color = '#007bff';
            } else if (numericGrade < 70 && numericGrade > 50) {
                gradeCircle.style.borderColor = '#ebb112';
                gradeCircle.style.color = '#ebb112';
            } else {
                gradeCircle.style.borderColor = '#dc3545';
                gradeCircle.style.color = '#dc3545';
            }

            // 3. Терезені ашу
            gradeModal.classList.add('active');
        });
    });

    // Жабу функциясы
    function closeModal() {
        gradeModal.classList.remove('active');
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Фонды басқанда жабу
    gradeModal.addEventListener('click', (e) => {
        if (e.target === gradeModal) {
            closeModal();
        }
    });
});

/** 
document.addEventListener('DOMContentLoaded', function() {

    console.log("Journal grade modal script loaded.");

    // Модальды терезе элементтері
    const gradeModal = document.getElementById('grade-modal-overlay');
    const closeBtn = document.getElementById('modal-grade-close-btn');
    const cancelBtn = document.getElementById('modal-grade-cancel-btn');
    
    // Өрістер
    const subjectField = document.getElementById('modal-subject-grade');
    const taskNameField = document.getElementById('modal-grade-task-name');
    const gradeValueField = document.getElementById('grade-value');
    const commentField = document.getElementById('grade-comment-area');

    // Барлық баға белгішелерін (badge) алу
    const gradeBadges = document.querySelectorAll('.grade-badge-journal');

    console.log("Found grade badges:", gradeBadges.length);

    // Әр батырмаға click event қосу
    gradeBadges.forEach(badge => {
        badge.addEventListener('click', function() {

            console.log(123);
            // 1. Деректерді алу (мысалы, data-атрибуттардан немесе серверден)
            // Бұл жерде мысал үшін HTML элементінің өзінен немесе data атрибуттан аламыз
            
            // Мысал деректер (сіз бұларды backend-тен аласыз):
            const subject = "Объектіге бағытталған бағдарламалау (Java)";
            const task = "Зертханалық жұмыс №3";
            const grade = this.innerText || "0"; // Badge-тің ішіндегі сан
            const comment = "Тапсырма толық орындалды. Жарайсыз!";

            // 2. Модальды терезені толтыру
            subjectField.textContent = subject;
            taskNameField.textContent = task;
            gradeValueField.textContent = grade;
            commentField.textContent = comment;

            // Бағасына қарай түсін өзгерту (опционалды)
            const gradeCircle = gradeValueField.parentElement;
            if (parseInt(grade) >= 90) {
                gradeCircle.style.borderColor = '#28a745'; // Жасыл
                gradeCircle.style.color = '#28a745';
            } else if (parseInt(grade) >= 70) {
                gradeCircle.style.borderColor = '#007bff'; // Көк
                gradeCircle.style.color = '#007bff';
            } else {
                gradeCircle.style.borderColor = '#dc3545'; // Қызыл
                gradeCircle.style.color = '#dc3545';
            }

            // 3. Терезені ашу
            gradeModal.classList.add('active');
        });
    });

    // Жабу функциясы
    function closeModal() {
        gradeModal.classList.remove('active');
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Фонды басқанда жабу
    gradeModal.addEventListener('click', (e) => {
        if (e.target === gradeModal) {
            closeModal();
        }
    });
});
*/