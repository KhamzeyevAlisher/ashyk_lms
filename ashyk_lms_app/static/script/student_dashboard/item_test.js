/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ТЕСТИРОВАНИЕ МОДУЛІ (script_test.js)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Назначение: тестирование студентов, проверка ответов, отображение результатов
 * 
 * ВЗАИМОДЕЙСТВИЕ С HTML ЭЛЕМЕНТАМИ:
 * ├─ #tab-item-test          → Основной контейнер для отображения теста
 * ├─ #current-quiz-form      → Форма со всеми вопросами (генерируется dynamically)
 * ├─ #test-result-modal      → Модальное окно с результатами
 * ├─ #modal-score-display    → Элемент отображения процента правильных ответов
 * ├─ #modal-text-detail      → Текст деталей результата
 * ├─ .test-container         → Класс основного контейнера
 * ├─ .test-title             → Класс заголовка теста
 * ├─ .question-card          → Класс карточки вопроса
 * ├─ .question-header        → Класс шапки вопроса
 * ├─ .question-number-icon   → Класс номера вопроса
 * ├─ .question-text          → Класс текста вопроса
 * ├─ .question-hint          → Класс подсказки (кол-во правильных ответов)
 * ├─ .variants-list          → Класс контейнера вариантов
 * ├─ .variant-label          → Класс метки варианта ответа
 * ├─ .variant-input          → Класс input элемента (radio/checkbox)
 * └─ .submit-btn             → Класс кнопки отправки теста
 * 
 * ВНЕШНИЕ ФУНКЦИИ (используются из других файлов):
 * ├─ checkTest(testName)     → Проверяет ответы и показывает результаты
 * ├─ openTab(tabName)        → Открывает вкладку теста
 * ├─ initModal()             → Инициализирует модальное окно
 * ├─ closeTestModal()        → Закрывает модальное окно
 * └─ openTest(testName)      → Основная функция (в этом файле)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * ГЛОБАЛЬНЫЙ ОБЪЕКТ С ТЕСТАМИ
 * Структура: { "название теста": { номер вопроса: { question, variants, correct_variants } } }
 * 
 * Структура каждого вопроса:
 * - question: строка с текстом вопроса на казахском языке
 * - variants: массив всех вариантов ответа
 * - correct_variants: массив правильных ответов (может быть 1 или несколько)
 */
let tests = {
    'JavaScript-тегі ООП': {
        1: {
            'question': "JavaScript-те ES6 стандарты бойынша класс құру үшін қандай кілт сөз қолданылады?",
            'variants': ['struct', 'class', 'object', 'function', 'define'],
            'correct_variants': ['class']
        },
        2: {
            'question': "Класс ішіндегі объектіні инициализациялау (бастапқы мәндерін беру) үшін қолданылатын арнайы әдіс қалай аталады?",
            'variants': ['init', 'start', 'constructor', 'main', 'create'],
            'correct_variants': ['constructor']
        },
        3: {
            'question': "Бір кластың екінші кластан мұрагерлік алуы (inheritance) үшін қандай кілт сөз қолданылады?",
            'variants': ['inherits', 'implements', 'extends', 'super', 'using'],
            'correct_variants': ['extends']
        },
        4: {
            'question': "Объектінің ағымдағы контекстіне немесе инстансына сілтеме жасайтын кілт сөз?",
            'variants': ['self', 'me', 'it', 'context', 'this'],
            'correct_variants': ['this']
        },
        5: {
            'question': "Объектінің белгілі бір классқа тиесілі екенін тексеретін оператор қандай?",
            'variants': ['typeof', 'instanceof', 'is', 'check', 'belongsTo'],
            'correct_variants': ['instanceof']
        },

        6: {
            'question': "JavaScript-те жаңа объект құрудың дұрыс жолдарын көрсетіңіз:",
            'variants': [
                'const obj = {};',
                'const obj = new Object();',
                'const obj = Object.construct();',
                'const obj = class {};',
                'const obj = create.object();',
                'const obj = [];'
            ],
            'correct_variants': [
                'const obj = {};',
                'const obj = new Object();'
            ]
        },
        7: {
            'question': "JavaScript кластарындағы `static` әдістері туралы дұрыс тұжырымдарды таңдаңыз:",
            'variants': [
                'Олар кластың экземпляры (instance) арқылы шақырылады',
                'Олар тікелей класс аты арқылы шақырылады',
                'Олар `this` сөзі арқылы объект қасиеттеріне қол жеткізе алады',
                'Олар жаңа объект құрылғанда ғана іске қосылады',
                'Олар көбінесе көмекші (utility) функциялар үшін қолданылады',
                'Олар міндетті түрде `constructor` ішінде жазылуы керек'
            ],
            'correct_variants': [
                'Олар тікелей класс аты арқылы шақырылады',
                'Олар көбінесе көмекші (utility) функциялар үшін қолданылады'
            ]
        },
        8: {
            'question': "ES2022 стандарты бойынша жеке (private) өрістер мен әдістер туралы не белгілі?",
            'variants': [
                'Олар `private` кілт сөзімен жазылады',
                'Атауы `#` белгісімен басталады (мысалы, #name)',
                'Оларға кластан тыс жерден қол жеткізу мүмкін емес',
                'Олар `_` (астын сызу) белгісімен басталуы міндетті',
                'Олар мұрагер кластарда (child classes) көрінеді',
                'Бұл мүмкіндік JavaScript-те мүлдем жоқ'
            ],
            'correct_variants': [
                'Атауы `#` белгісімен басталады (мысалы, #name)',
                'Оларға кластан тыс жерден қол жеткізу мүмкін емес'
            ]
        },
        9: {
            'question': "Объектінің қасиеттерін оқу және өзгерту үшін қолданылатын арнайы әдістер (accessors):",
            'variants': [
                'read',
                'get',
                'put',
                'set',
                'write',
                'fetch'
            ],
            'correct_variants': [
                'get',
                'set'
            ]
        },
        10: {
            'question': "`super` кілт сөзі қандай жағдайларда қолданылады?",
            'variants': [
                'Ата-аналық кластың конструкторын шақыру үшін',
                'Глобалды айнымалыларды жариялау үшін',
                'Ата-аналық кластың әдістерін шақыру үшін',
                'Циклды тоқтату үшін',
                'Жаңа класс құру үшін',
                'Объектіні жою үшін'
            ],
            'correct_variants': [
                'Ата-аналық кластың конструкторын шақыру үшін',
                'Ата-аналық кластың әдістерін шақыру үшін'
            ]
        },

        11: {
            'question': "Объектіге бағытталған бағдарламалаудың (ООП) негізгі үш қағидасын көрсетіңіз:",
            'variants': [
                'Компиляция',
                'Инкапсуляция',
                'Итерация',
                'Мұрагерлік (Inheritance)',
                'Рекурсия',
                'Полиморфизм',
                'Хостинг'
            ],
            'correct_variants': [
                'Инкапсуляция',
                'Мұрагерлік (Inheritance)',
                'Полиморфизм'
            ]
        },
        12: {
            'question': "Функцияның контекстін (`this`) басқаруға немесе өзгертуге арналған әдістерді таңдаңыз:",
            'variants': [
                'bind',
                'map',
                'call',
                'filter',
                'apply',
                'reduce',
                'push'
            ],
            'correct_variants': [
                'bind',
                'call',
                'apply'
            ]
        },
        13: {
            'question': "Жебелік функциялардың (Arrow functions) кәдімгі функциялардан айырмашылығы (ООП тұрғысынан):",
            'variants': [
                'Өзінің `this` контексті жоқ',
                'Оларды `new` операторымен шақыруға болмайды',
                'Оларда `constructor` әдісі бар',
                'Оларда `arguments` объектісі жоқ',
                'Оларды айнымалыға теңестіруге болмайды',
                'Олар әрқашан асинхронды',
                'Олар кластың ішінде жазылмайды'
            ],
            'correct_variants': [
                'Өзінің `this` контексті жоқ',
                'Оларды `new` операторымен шақыруға болмайды',
                'Оларда `arguments` объектісі жоқ'
            ]
        },
        14: {
            'question': "Объектіде белгілі бір қасиеттің (property) бар-жоғын тексерудің жолдары:",
            'variants': [
                '"propertyName" in object',
                'object.hasOwnProperty("propertyName")',
                'object.checkProp("propertyName")',
                'object["propertyName"] !== undefined',
                'object.exists("propertyName")',
                'object.contains("propertyName")',
                'object.isSet("propertyName")'
            ],
            'correct_variants': [
                '"propertyName" in object',
                'object.hasOwnProperty("propertyName")',
                'object["propertyName"] !== undefined'
            ]
        },
        15: {
            'question': "Прототиптік мұрагерлікке қатысты кілт сөздер мен әдістер:",
            'variants': [
                'prototype',
                '__proto__',
                'Object.create()',
                'Object.keys()',
                'Object.freeze()',
                'JSON.parse()',
                'Array.from()'
            ],
            'correct_variants': [
                'prototype',
                '__proto__',
                'Object.create()'
            ]
        }
    }
}

/**
 * ПЕРЕМЕШИВАНИЕ МАССИВА (алгоритм Фишера-Йетса)
 * 
 * @param {Array} array - исходный массив для перемешивания
 * @returns {Array} - новый массив с перемешанными элементами
 * 
 * Назначение: случайное упорядочивание вариантов ответа для каждого вопроса
 * Пример: shuffleArray(['а', 'б', 'в']) → ['в', 'а', 'б']
 */
function shuffleArray(array) {
    // Создаем копию массива, чтобы не изменять исходный
    let arr = [...array];
    
    // Алгоритм перемешивания (идем с конца массива)
    for (let i = arr.length - 1; i > 0; i--) {
        // Выбираем случайный индекс от 0 до i
        const j = Math.floor(Math.random() * (i + 1));
        // Меняем местами элементы с индексами i и j
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    
    return arr;
}

/**
 * ОТКРЫТИЕ ТЕСТА И СОЗДАНИЕ ИНТЕРФЕЙСА
 * 
 * @param {string} testName - название теста (ключ из объекта `tests`)
 * 
 * Назначение: главная функция для загрузки и отображения тестового интерфейса
 * 
 * Процесс:
 * 1. Получает тест из глобального объекта `tests`
 * 2. Очищает контейнер #tab-item-test
 * 3. Создает элементы: заголовок, форма, вопросы, варианты
 * 4. Добавляет кнопку "Аяқтау" для проверки ответов
 * 5. Инициализирует модальное окно для результатов
 * 6. Переключается на вкладку 'item-test'
 * 
 * Взаимодействие с элементами:
 * ├─ Получает: #tab-item-test (контейнер)
 * ├─ Создает: .test-container, .test-title, form#current-quiz-form
 * ├─ Генерирует: 15 вопросов с динамическими элементами
 * ├─ Вызывает: initModal(), openTab()
 * └─ Результат: форма готова к заполнению и проверке
 */
function openTest(testName) {
    // 1. ПОЛУЧЕНИЕ И ПРОВЕРКА ТЕСТА
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Получаем контейнер для отображения теста (ID: tab-item-test)
    const container = document.getElementById('tab-item-test');
    
    // Проверяем, существует ли такой тест в объекте `tests`
    if (!tests[testName]) {
        console.error(`Тест "${testName}" не найден`);
        return;
    }
    
    // Получаем все вопросы текущего теста
    const currentTest = tests[testName];

    // 2. ОЧИСТКА И ПОДГОТОВКА КОНТЕЙНЕРА
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Удаляем все предыдущее содержимое из контейнера
    container.innerHTML = '';
    
    // Добавляем класс для стилизации контейнера
    container.classList.add('test-container');

    // 3. СОЗДАНИЕ И ДОБАВЛЕНИЕ ЗАГОЛОВКА
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Создаем элемент h2 для заголовка теста
    const title = document.createElement('h2');
    title.textContent = testName;
    title.classList.add('test-title');
    // Добавляем заголовок в контейнер
    container.appendChild(title);

    // 4. СОЗДАНИЕ ФОРМЫ
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Создаем основную форму для всех вопросов
    const form = document.createElement('form');
    form.id = 'current-quiz-form';

    // 5. ГЕНЕРАЦИЯ ВОПРОСОВ И ВАРИАНТОВ
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Перебираем каждый вопрос в тесте (ключ = номер вопроса)
    Object.keys(currentTest).forEach((key) => {
        const qData = currentTest[key];
        
        // ─────────────────────────────────────────────────────────────────────
        // 5.1 СОЗДАНИЕ КАРТОЧКИ ВОПРОСА
        // ─────────────────────────────────────────────────────────────────────
        
        // Основной контейнер для одного вопроса
        const card = document.createElement('div');
        card.classList.add('question-card');
        
        // ─────────────────────────────────────────────────────────────────────
        // 5.2 СОЗДАНИЕ ШАПКИ ВОПРОСА (номер + текст + подсказка)
        // ─────────────────────────────────────────────────────────────────────
        
        // Контейнер для шапки
        const header = document.createElement('div');
        header.classList.add('question-header');
        
        // НОМЕР ВОПРОСА (циклическая иконка)
        const numberIcon = document.createElement('div');
        numberIcon.classList.add('question-number-icon');
        numberIcon.textContent = key;  // Порядковый номер вопроса (1, 2, 3...)
        
        // ТЕКСТ ВОПРОСА + ПОДСКАЗКА
        const textBlock = document.createElement('div');
        
        // Сам текст вопроса
        const qText = document.createElement('p');
        qText.classList.add('question-text');
        qText.textContent = qData.question;
        
        // ОПРЕДЕЛЕНИЕ ТИПА ВОПРОСА
        // Если несколько правильных ответов → множественный выбор (чекбоксы)
        // Если один правильный ответ → одиночный выбор (радио кнопки)
        const isMultiple = qData.correct_variants.length > 1;
        
        // ПОДСКАЗКА ДЛЯ ПОЛЬЗОВАТЕЛЯ
        // Показывает сколько правильных ответов нужно выбрать
        const hint = document.createElement('span');
        hint.classList.add('question-hint');
        hint.textContent = isMultiple 
            ? `Бірнеше дұрыс жауап (${qData.correct_variants.length})` 
            : `Бір дұрыс жауап`;

        // Добавляем текст и подсказку в блок
        textBlock.appendChild(qText);
        textBlock.appendChild(hint);
        
        // Добавляем номер и текст в шапку
        header.appendChild(numberIcon);
        header.appendChild(textBlock);
        
        // Добавляем шапку в карточку
        card.appendChild(header);

        // ─────────────────────────────────────────────────────────────────────
        // 5.3 СОЗДАНИЕ ВАРИАНТЫ ОТВЕТОВ
        // ─────────────────────────────────────────────────────────────────────
        
        // Контейнер для всех вариантов ответа
        const variantsContainer = document.createElement('div');
        variantsContainer.classList.add('variants-list');
        
        // Определяем тип input элемента:
        // - checkbox для множественного выбора (несколько правильных)
        // - radio для одиночного выбора (один правильный)
        const inputType = isMultiple ? 'checkbox' : 'radio';
        
        // ПЕРЕМЕШИВАЕМ ВАРИАНТЫ
        // Порядок вариантов случайный для каждого запуска теста
        const shuffledVariants = shuffleArray(qData.variants);

        // Создаем элементы для каждого варианта ответа
        shuffledVariants.forEach(variant => {
            // Метка (label) - это кликаемый элемент
            const label = document.createElement('label');
            label.classList.add('variant-label');

            // INPUT ЭЛЕМЕНТ (radio или checkbox)
            const input = document.createElement('input');
            input.type = inputType;                    // 'radio' или 'checkbox'
            input.name = `question_${key}`;            // Имя вопроса (для группировки)
            input.value = variant;                     // Значение варианта ответа
            input.classList.add('variant-input');

            // ТЕКСТОВОЕ СОДЕРЖИМОЕ ВАРИАНТА
            const span = document.createElement('span');
            span.textContent = variant;

            // Добавляем input и текст в метку
            label.appendChild(input);
            label.appendChild(span);
            
            // Добавляем метку в контейнер вариантов
            variantsContainer.appendChild(label);
        });

        // Добавляем все варианты в карточку
        card.appendChild(variantsContainer);
        
        // Добавляем карточку в форму
        form.appendChild(card);
    });

    // 6. СОЗДАНИЕ КНОПКИ ОТПРАВКИ
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Кнопка для завершения теста и проверки ответов
    const btn = document.createElement('button');
    btn.type = 'button';  // type='button' чтобы не отправлялась форма
    btn.textContent = 'Аяқтау';  // "Завершить" на казахском
    btn.classList.add('submit-btn');
    
    // Обработчик клика - вызывает функцию проверки из student_dashboard.html
    btn.onclick = function() {
        checkTest(testName);  // Внешняя функция для проверки ответов
    };

    // Добавляем кнопку в конец формы
    form.appendChild(btn);
    
    // Добавляем всю форму в контейнер
    container.appendChild(form);

    // 7. ИНИЦИАЛИЗАЦИЯ И ПЕРЕКЛЮЧЕНИЕ
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Инициализируем модальное окно для отображения результатов
    // (Функция из student_dashboard.html)
    initModal();
    
    // Переключаемся на вкладку с тестом
    // (Функция из student_dashboard.html)
    openTab('item-test', `nameTest=${testName}`);
}

function initModal() {
    // Проверяем, есть ли уже модалка на странице
    if (document.getElementById('test-result-modal')) return;

    // Создаем HTML структуру модалки
    const modalHTML = `
        <div id="test-result-modal" class="test-modal-overlay">
            <div class="test-modal-box">
                <div class="test-modal-title">Тест нәтижесі</div>
                <div id="modal-score-display" class="test-modal-score">0%</div>
                <div id="modal-text-detail" class="test-modal-detail">...</div>
                <button class="test-modal-close-btn" onclick="closeTestModal()">Жабу (Закрыть)</button>
            </div>
        </div>
    `;
    
    // Добавляем в конец body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Закрытие по клику на фон
    document.getElementById('test-result-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeTestModal();
        }
    });
}

//Результат теста 

function closeTestModal() {
    const modal = document.getElementById('test-result-modal');
    if (modal) modal.classList.remove('active');
    openTab('tests');
}

function checkTest(testName) {
    const testData = tests[testName];
    let totalPossibleCorrect = 0; 
    let userScore = 0;            

    Object.keys(testData).forEach(key => {
        const question = testData[key];
        const correctAnswers = question.correct_variants; 
        totalPossibleCorrect += correctAnswers.length;

        const userInputs = document.querySelectorAll(`input[name="question_${key}"]:checked`);
        
        userInputs.forEach(input => {
            if (correctAnswers.includes(input.value)) {
                userScore++;
            } else {
                userScore--; 
            }
        });
    });

    if (userScore < 0) userScore = 0;

    let percentage = Math.round((userScore / totalPossibleCorrect) * 100);
    if (isNaN(percentage)) percentage = 0;
    if (percentage < 0) percentage = 0;

    // === ПОКАЗЫВАЕМ РЕЗУЛЬТАТ В МОДАЛКЕ ===
    
    const scoreDisplay = document.getElementById('modal-score-display');
    const textDetail = document.getElementById('modal-text-detail');
    const modal = document.getElementById('test-result-modal');

    // Установка цвета и комментария
    let colorClass = 'color-bad';
    let comment = 'Тақырыпты қайталап оқу керек.';
    
    if (percentage >= 50) { colorClass = 'color-avg'; comment = 'Жақсы нәтиже!'; }
    if (percentage >= 85) { colorClass = 'color-good'; comment = 'Өте жақсы! Тамаша!'; }

    // Сброс классов цвета
    scoreDisplay.className = 'test-modal-score ' + colorClass;
    
    // Заполнение текста
    scoreDisplay.textContent = `${percentage}%`;
    textDetail.innerHTML = `
        Дұрыс жауаптар: <b>${userScore}</b> / ${totalPossibleCorrect}<br>
        <span style="font-size: 0.9em; margin-top: 5px; display:block">${comment}</span>
    `;

    // Открытие модалки
    modal.classList.add('active');
}