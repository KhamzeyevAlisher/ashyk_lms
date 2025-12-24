
// 1. Новая структура данных: объект объектов
let homeworkData = {
    "Объектіге бағытталған бағдарламалау (Java)": {
        title: "Зертханалық жұмыс №3: Полиморфизм және интерфейстер",
        teacher: "Оспанов А.С.",
        deadline: "29.11.2025",
        status: "review",
        daysLeft: null,
        grade: null,
        task: "Полиморфизм и интерфейсы в Java" 
    },
    "Алгоритмдер және деректер құрылымы": {
        title: "Аралық бақылау: Графтар және тереңдік бойынша іздеу (DFS)",
        teacher: "Сапаров Е.Қ.",
        deadline: "30.11.2025",
        status: "missed",
        daysLeft: 4,
        grade: null,
        task: "Реализовать поиск в глубину для графа" 
    },
    "Web-технологиялар": {
        title: "Жоба: React.js негізінде SPA әзірлеу",
        teacher: "Әлиева Г.М.",
        deadline: "02.12.2025",
        status: "missed",
        daysLeft: 6,
        grade: null,
        task: "Создать одностраничное приложение на React" 
    },
    "Дерекқорлар жүйесі (PostgreSQL)": {
        title: "Практикалық жұмыс: Күрделі SQL-сұраныстар (JOIN, Group By)",
        teacher: "Нұрланова А.К.",
        deadline: "05.12.2025",
        status: "done",
        daysLeft: null,
        grade: "95/100",
        task: "Написать сложные SQL-запросы с JOIN и Group By" 
    }
};

/**
 * Функция для открытия и заполнения модального окна.
 * Она вызывается через атрибут onclick="openHomeworkModalOverley(this)"
 * @param {HTMLElement} buttonElement - Элемент кнопки, на которую нажали.
 */
function openHomeworkModalOverley(buttonElement) {
    const subjectName = buttonElement.dataset.name;
    const taskDetails = homeworkData[subjectName];

    if (taskDetails) {
        // Заполняем модальное окно данными
        document.getElementById('modal-subject').textContent = subjectName;
        document.getElementById('modal-task-description').textContent = taskDetails.title;

        // Показываем модальное окно
        const modalOverlay = document.getElementById('homework-modal-overlay');
        modalOverlay.classList.add('active');
    } else {
        console.error("Не найдены данные для предмета:", subjectName);
    }
}

const container = document.querySelector('.list_container_homework');

const modalOverlay = document.getElementById('homework-modal-overlay');
const closeBtn = document.getElementById('modal-close-btn');
const cancelBtn = document.getElementById('modal-cancel-btn');

function closeModal() {
    modalOverlay.classList.remove('active');
}

// Закрыть по клику на "крестик", кнопку "Болдырмау" или на темный фон
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', function(event) {
    // Закрываем, только если клик был на самом оверлее, а не на его содержимом
    if (event.target === modalOverlay) {
        closeModal();
    }
});

// 3. Функция для создания HTML одной карточки
// Принимает название предмета (ключ) и объект с деталями (значение)
function createHomeworkCard(subject, details) {
    // --- Логика для определения статуса ---
    let statusBadgeHtml = '';
    switch (details.status) {
        case 'review':
            statusBadgeHtml = `
                <div class="status_badge_homework status_review_homework">
                    <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Тексерілуде
                </div>`;
            break;
        case 'missed':
            statusBadgeHtml = `
                <div class="status_badge_homework status_missed_homework">
                    <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        Тапсырылмаған
                </div>`;
            break;
        case 'done':
            statusBadgeHtml = `
                <div class="status_badge_homework status_done_homework">
                    <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"></path></svg>
                    Тексерілді
                </div>`;
            break;
    }

    // --- Логика для отображения дней или оценки ---
    let metaExtraHtml = '';
    if (details.daysLeft !== null) {
        metaExtraHtml = `
            <div class="meta_item_homework">
                <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>${details.daysLeft} күн қалды</span>
            </div>`;
    }
    if (details.grade !== null) {
        metaExtraHtml = `
            <div class="meta_item_homework grade_text_homework">
                <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span>Баға: ${details.grade}</span>
            </div>`;
    }

    // --- Создаем HTML-структуру карточки ---
    const card = document.createElement('div');
    card.className = 'task_card_homework';
    card.innerHTML = `
        <div class="card_left_homework">
            <div class="subject_name_homework">${subject}</div>
            <h4 class="task_title_homework">${details.title}</h4>
            <div class="teacher_name_homework">${details.teacher}</div>
            <div class="meta_row_homework">
                <div class="meta_item_homework">
                    <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Мерзімі: ${details.deadline}</span>
                </div>
                ${metaExtraHtml}
            </div>
        </div>
        <div class="card_right_homework">
            ${statusBadgeHtml}
            <button class="btn_details_homework" data-name='${subject}'>Толығырақ</button>
        </div>
    `;
    return card;
}

function filterHomeworkCards(status) {
    container.innerHTML = ''; // Очищаем контейнер перед фильтрацией
    for (const [subject, details] of Object.entries(homeworkData)) {
        if (status === 'all' || details.status === status) {
            const cardElement = createHomeworkCard(subject, details);
            container.appendChild(cardElement);
        }
    }
}

function setActiveTab(clickedButton) {
    // 1. '.tab_btn_homework' класы бар барлық батырмаларды табамыз.
    const allTabs = document.querySelectorAll('.tab_btn_homework');

    // 2. Барлық батырмалардан 'active_homework' класын алып тастаймыз.
    allTabs.forEach(tab => {
        tab.classList.remove('active_homework');
    });

    // 3. Тек басылған батырмаға 'active_homework' класын қосамыз.
    clickedButton.classList.add('active_homework');
}

document.addEventListener("DOMContentLoaded", function() {
    // 4. Перебираем объект и генерируем карточки
    // Object.entries() превращает объект в массив пар [ключ, значение]
    for (const [subject, details] of Object.entries(homeworkData)) {
        const cardElement = createHomeworkCard(subject, details);
        container.appendChild(cardElement);
    }


    const detailsButtons = document.querySelectorAll('.btn_details_homework');

    // Перебираем каждую найденную кнопку и добавляем ей обработчик клика
    detailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Внутри этой функции 'this' будет ссылаться именно на ту кнопку,
            // по которой кликнули.
            openHomeworkModalOverley(this);
        });
    });

});