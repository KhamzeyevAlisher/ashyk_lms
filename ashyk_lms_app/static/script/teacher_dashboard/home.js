//Структура данных расписание home_page
let scheduleDataHome = [
    {
        time: "09:00",
        subject: "Киберқауіпсіздік",
        teacher: "Ахметов Е.К.",
        room: "А-305"
    },
    {
        time: "10:45",
        subject: "Бағдарламалау",
        teacher: "Омарова А.С.",
        room: "Б-201"
    },
    {
        time: "12:30",
        subject: "Ағылшын тілі",
        teacher: "Сүлейменов Б.Т.",
        room: "В-102"
    }
];

//Структура данных домашняя работа home_page
let homeworkDataHome = [
    {
        subject: "Алгоритмдер",
        status: "Орындалуда", // Срочное
        statusColor: "yellow",
        title: "Екілік іздеу ағашын (BST) жүзеге асыру",
        dueDate: "2 күн қалды" // Текст как "2 дня назад"
    },
    {
        subject: "Web-әзірлеу",
        status: "Орындалуда", // Срочное
        statusColor: "yellow",
        title: "React компоненттерін жасау және API қосу",
        dueDate: "1 күн қалды"
    },
    {
        subject: "Дерекқорлар",
        status: "Басталмаған", // Обычное
        statusColor: "gray",
        title: "Күрделі SQL сұраныстар және JOIN",
        dueDate: "Бүгін"
    },
    {
        subject: "Web-дизайн",
        status: "Басталмаған", // Обычное
        statusColor: "gray",
        title: "Figma макетін жасау",
        dueDate: "Бүгін"
    }
];

document.addEventListener("DOMContentLoaded", function() {
    //ДНЕВНОЕ РАСПИСАНИЕ (home)
    // 2. Находим контейнер, куда будем вставлять расписание
    // 2. Находим контейнер
    const scheduleContainer = document.getElementById('schedule-list-container');

    // 3. Перебираем и создаем элементы
    scheduleDataHome.forEach(item => {
        // Создаем блок-обертку (используем тот же класс list-block, что и в домашке)
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'list-block'; 

        scheduleItem.innerHTML = `
            <!-- Левая часть: Иконка часов -->
            <div class="icon-circle icon-blue">
                <i class="fa-regular fa-clock"></i>
            </div>
            
            <!-- Центр: Предмет и преподаватель -->
            <div class="block-info">
                <div class="block-subject">${item.subject}</div>
                <div class="block-desc">${item.teacher} • ${item.room}</div>
            </div>

            <!-- Правая часть: Время -->
            <div class="date-badge badge-blue">
                ${item.time}
            </div>
        `;

        scheduleContainer.appendChild(scheduleItem);
    });

    //ДОМАШКА (home)
    // 2. Находим контейнер, куда будем вставлять домашние задания
    const homeworkContainer = document.getElementById('homework-list-container');

    homeworkDataHome.forEach(hw => {
        const item = document.createElement('div');
        // Добавляем класс list-block, чтобы стилизовать как плашку
        item.className = 'list-block';

        // Логика иконок и цветов бейджа
        let iconHTML = '';
        let dateBadgeClass = '';

        if (hw.statusColor === 'yellow' || hw.statusColor === 'red') {
            // Красный восклицательный знак
            iconHTML = `<div class="icon-circle icon-alert"><i class="fa-solid fa-circle-exclamation"></i></div>`;
            dateBadgeClass = 'badge-red'; // Розовый фон
        } else {
            // Серый документ
            iconHTML = `<div class="icon-circle icon-doc"><i class="fa-regular fa-file-lines"></i></div>`;
            dateBadgeClass = 'badge-gray'; // Серый фон
        }

        item.innerHTML = `
            <!-- Левая часть: Иконка -->
            ${iconHTML}
            
            <!-- Центр: Текст -->
            <div class="block-info">
                <div class="block-subject">${hw.subject}</div>
                <div class="block-desc">${hw.title}</div>
            </div>

            <!-- Правая часть: Дата -->
            <div class="date-badge ${dateBadgeClass}">
                ${hw.dueDate}
            </div>
        `;

        homeworkContainer.appendChild(item);
    })
});