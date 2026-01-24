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
        status: "Басталмаған",
        statusColor: "gray",
        title: "Екілік іздеу ағашын (BST) жүзеге асыру",
        dueDate: "28.11.2025"
    },
    {
        subject: "Web-әзірлеу",
        status: "Орындалуда",
        statusColor: "yellow",
        title: "React компоненттерін жасау және API қосу",
        dueDate: "29.11.2025"
    },
    {
        subject: "Дерекқорлар",
        status: "Басталмаған",
        statusColor: "gray",
        title: "Күрделі SQL сұраныстар және JOIN",
        dueDate: "30.11.2025"
    }
];

document.addEventListener("DOMContentLoaded", function () {
    //ДНЕВНОЕ РАСПИСАНИЕ (home)
    // 2. Находим контейнер, куда будем вставлять расписание
    const scheduleContainer = document.getElementById('student-schedule-container');

    // 3. Перебираем каждый элемент в массиве данных и создаем для него HTML-разметку
    scheduleDataHome.forEach(item => {
        // Создаем главный div-контейнер для одного урока
        // <div class="list-card schedule-item"></div>
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'list-card schedule-item';

        // Создаем блок для времени
        // <div class="time-box">...</div>
        const timeBox = document.createElement('div');
        timeBox.className = 'time-box';
        timeBox.innerHTML = `<i class="fa-regular fa-clock"></i> ${item.time}`;

        // Создаем блок с информацией об уроке
        // <div class="schedule-info">...</div>
        const scheduleInfo = document.createElement('div');
        scheduleInfo.className = 'schedule-info';
        scheduleInfo.innerHTML = `
            <h4>${item.subject}</h4>
            <p>${item.teacher} • ${item.room}</p>
        `;

        // Собираем все вместе: вставляем timeBox и scheduleInfo внутрь scheduleItem
        scheduleItem.appendChild(timeBox);
        scheduleItem.appendChild(scheduleInfo);

        // Добавляем готовый элемент урока в общий контейнер на странице
        scheduleContainer.appendChild(scheduleItem);
    });

    //ДОМАШКА (home)
    // 2. Находим контейнер, куда будем вставлять домашние задания
    const homeworkContainer = document.getElementById('student-homework-container');

    // 3. Перебираем каждый элемент в массиве и создаем для него HTML-разметку
    homeworkDataHome.forEach(hw => {
        // Создаем основной контейнер для карточки
        // <div class="list-card"></div>
        const card = document.createElement('div');
        card.className = 'list-card';

        // Создаем заголовок карточки
        // <div class="hw-header">...</div>
        const header = document.createElement('div');
        header.className = 'hw-header';
        header.innerHTML = `
            <span class="subject-name">${hw.subject}</span>
            <span class="badge ${hw.statusColor}">${hw.status}</span>
        `;

        // Создаем название задания
        // <div class="hw-title">...</div>
        const title = document.createElement('div');
        title.className = 'hw-title';
        title.textContent = hw.title; // .textContent безопаснее для вставки простого текста

        // Создаем футер (нижнюю часть) карточки
        // <div class="hw-footer">...</div>
        const footer = document.createElement('div');
        footer.className = 'hw-footer';
        footer.innerHTML = `<i class="fa-regular fa-calendar"></i> Мерзімі: ${hw.dueDate}`;

        // Собираем карточку: добавляем заголовок, название и футер внутрь нее
        card.appendChild(header);
        card.appendChild(title);
        card.appendChild(footer);

        // Добавляем готовую карточку в общий контейнер на странице
        homeworkContainer.appendChild(card);
    });
});