let testsDataList = {
    "1 semester": [
        {
            title: "Алгоритмдер: Сұрыптау әдістері",
            subject: "Компьютерлік ғылымдар",
            questions: 10,
            duration: "30 мин",
            deadline: "25.11.2025",
            grade: "85%",
            iconType: "green",
            status: "completed"
        },
        {
            title: "JavaScript-тегі ООП",
            subject: "Бағдарламалау",
            questions: 15,
            duration: "45 мин",
            deadline: "30.11.2025",
            grade: null,
            iconType: "purple",
            status: "active"
        },
        {
            title: "Дерекқорлар негіздері: SQL",
            subject: "Бэкенд әзірлеу",
            questions: 12,
            duration: "40 мин",
            deadline: "02.12.2025",
            grade: null,
            iconType: "purple",
            status: "active"
        },
        {
            title: "IT English: Technical Terms",
            subject: "Кәсіби ағылшын тілі",
            questions: 20,
            duration: "25 мин",
            deadline: "20.11.2025",
            grade: "92%",
            iconType: "green",
            status: "completed"
        }
    ]
};

let iconsTestList = {
    green: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    purple: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    play: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
};

/**
 * @param {Object} data - Объект с данными
 * @param {string} semester - Ключ семестра (н-р: "1 semester")
 * @param {string} filterStatus - 'active' или 'completed'. Если null, выведет всё.
 */
function renderTests(semester, filterStatus = null) {
    const container = document.querySelector('#tab-tests').querySelector('#test-list');
    if (!container || !testsDataList[semester]) return;

    // 1. Сначала фильтруем массив, если передан статус
    let filteredArray = testsDataList[semester];
    if (filterStatus) {
        filteredArray = filteredArray.filter(test => test.status === filterStatus);
    }

    // 2. Генерируем HTML
    const html = filteredArray.map(test => {
        const isCompleted = test.status === 'completed';
        
        const actionBtn = isCompleted 
            ? `<button class="btn-test btn-retry">Қайта тапсыру</button>`
            : `<button class="btn-test btn-start" onclick="openTest('${test.title}')">
                ${iconsTestList.play} Тестті бастау
               </button>`;

        const gradeBadge = test.grade 
            ? `<span class="grade-badge">${test.grade}</span>` 
            : '';

        return `
            <div class="test-card">
                <div class="test-info-wrapper">
                    <div class="test-icon icon-${test.iconType}">
                        ${iconsTestList[test.iconType]}
                    </div>
                    <div class="test-content">
                        <div class="test-header">
                            <h3 class="test-title">${test.title}</h3>
                            ${gradeBadge}
                        </div>
                        <div class="test-subject">${test.subject}</div>
                        <div class="test-meta">
                            <span>${test.questions} сұрақ</span>
                            <div class="meta-item">
                                ${iconsTestList.clock}
                                ${test.duration}
                            </div>
                            <span>Мерзімі: ${test.deadline}</span>
                        </div>
                    </div>
                </div>
                <div class="test-action">
                    ${actionBtn}
                </div>
            </div>
        `;
    }).join('');

    // Если после фильтрации пусто, можно вывести сообщение
    container.innerHTML = html || '<p>Бұл санатта тесттер жоқ.</p>';
}

renderTests("1 semester", "active");

//Кастомный options
document.querySelectorAll('.custom-select').forEach(select => {
    const trigger = select.querySelector('.select-trigger');
    const options = select.querySelectorAll('.option');

    // Открыть/закрыть
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        // Закрываем другие, если открыты
        document.querySelectorAll('.custom-select').forEach(s => {
            if (s !== select) s.classList.remove('active');
        });
        select.classList.toggle('active');
    });

    // Выбор пункта
    options.forEach(option => {
        option.addEventListener('click', () => {
            select.querySelector('span').innerText = option.innerText;
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            select.classList.remove('active');
            
            // Здесь можно вызвать функцию фильтрации, используя option.dataset.value
            console.log("Выбранное значение:", option.dataset.value);
        });
    });
});

// Закрытие при клике в любое место экрана
window.addEventListener('click', () => {
    document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
});