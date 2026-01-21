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
 * ├─ .submit-btn             → Класс кнопки отправки теста
 * └─ #test-navigator          → Контейнер для навигации по вопросам
 * 
 * ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ КҮЙІ (STATE):
 * ├─ currentTestName        → Ағымдағы тест атауы
 * ├─ currentQuestionIndex   → Ағымдағы сұрақ индексі (0-ден бастап)
 * └─ userAnswers            → Пайдаланушы жауаптары { questionKey: [selectedVariants] }
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
    'Экономикалық теория': {
        1: {
            'question': "Экономикалық теория нені зерттейді?",
            'variants': ['Адам ағзасының құрылымын', 'Шексіз қажеттіліктер мен шектеулі ресурстарды басқаруды', 'Табиғат құбылыстарын', 'Химиялық реакцияларды', 'Жұлдыздардың орналасуын'],
            'correct_variants': ['Шексіз қажеттіліктер мен шектеулі ресурстарды басқаруды']
        },
        2: {
            'question': "Баға өскенде тауарға деген сұраныс азаяды, ал баға төмендегенде сұраныс артады. Бұл қай заң?",
            'variants': ['Ұсыныс заңы', 'Сұраныс заңы', 'Оукен заңы', 'Грешем заңы', 'Филлипс заңы'],
            'correct_variants': ['Сұраныс заңы']
        },
        3: {
            'question': "Жалпы ішкі өнім (ЖІӨ / GDP) дегеніміз не?",
            'variants': ['Мемлекеттің бір жылғы барлық шығындары', 'Ел ішінде бір жылда өндірілген тауарлар мен қызметтердің нарықтық құны', 'Халықтың банктегі жинақтары', 'Импортталған тауарлардың көлемі', 'Мемлекеттік қарыз мөлшері'],
            'correct_variants': ['Ел ішінде бір жылда өндірілген тауарлар мен қызметтердің нарықтық құны']
        },
        4: {
            'question': "Инфляция дегеніміз не?",
            'variants': ['Бағаның жалпы деңгейінің ұзақ мерзімді өсуі', 'Бағаның күрт төмендеуі', 'Өндіріс көлемінің артуы', 'Жұмыссыздықтың азаюы', 'Ақша массасының азаюы'],
            'correct_variants': ['Бағаның жалпы деңгейінің ұзақ мерзімді өсуі']
        },
        5: {
            'question': "Бір сатушы билейтін және бәсекелестері жоқ нарықтық құрылым қалай аталады?",
            'variants': ['Олигополия', 'Монополия', 'Монопсония', 'Жетілген бәсеке', 'Дуополия'],
            'correct_variants': ['Монополия']
        },

        6: {
            'question': "Экономикалық ресурстарға (өндіріс факторларына) жататындарды белгілеңіз:",
            'variants': [
                'Жер (табиғи ресурстар)',
                'Еңбек (жұмыс күші)',
                'Капитал (құрал-жабдықтар)',
                'Кәсіпкерлік қабілет',
                'Ауа райы',
                'Көңіл-күй',
                'Саяси партиялар'
            ],
            'correct_variants': [
                'Жер (табиғи ресурстар)',
                'Еңбек (жұмыс күші)',
                'Капитал (құрал-жабдықтар)',
                'Кәсіпкерлік қабілет'
            ]
        },
        7: {
            'question': "Экономикалық жүйелердің негізгі түрлерін көрсетіңіз:",
            'variants': [
                'Дәстүрлі экономика',
                'Жоспарлы (әкімшілік) экономика',
                'Нарықтық экономика',
                'Аралас экономика',
                'Виртуалды экономика',
                'Физикалық экономика',
                'Кездейсоқ экономика'
            ],
            'correct_variants': [
                'Дәстүрлі экономика',
                'Жоспарлы (әкімшілік) экономика',
                'Нарықтық экономика',
                'Аралас экономика'
            ]
        },
        8: {
            'question': "Ақшаның атқаратын негізгі қызметтері қандай?",
            'variants': [
                'Құн өлшемі',
                'Айналым құралы',
                'Төлем құралы',
                'Қор жинау (қазына) құралы',
                'Өндіріс құралы',
                'Эстетикалық қызмет',
                'Тұтыну заттары'
            ],
            'correct_variants': [
                'Құн өлшемі',
                'Айналым құралы',
                'Төлем құралы',
                'Қор жинау (қазына) құралы'
            ]
        },
        9: {
            'question': "Макроэкономика зерттейтін негізгі көрсеткіштер:",
            'variants': [
                'Жеке фирманың табысы',
                'Жұмыссыздық деңгейі',
                'Инфляция қарқыны',
                'Экономикалық өсу',
                'Бір тауардың бағасы',
                'Жеке тұтынушының талғамы'
            ],
            'correct_variants': [
                'Жұмыссыздық деңгейі',
                'Инфляция қарқыны',
                'Экономикалық өсу'
            ]
        },
        10: {
            'question': "Мемлекеттің фискалдық (салық-бюджет) саясатының құралдарына не жатады?",
            'variants': [
                'Салықтар',
                'Мемлекеттік шығыстар',
                'Пайыздық мөлшерлеме',
                'Ақша эмиссиясы',
                'Трансферттік төлемдер',
                'Валюта бағамы'
            ],
            'correct_variants': [
                'Салықтар',
                'Мемлекеттік шығыстар',
                'Трансферттік төлемдер'
            ]
        },

        11: {
            'question': "Экономиканың кез келген қоғамы жауап іздейтін негізгі үш сұрағы:",
            'variants': [
                'Не өндіру керек?',
                'Қалай өндіру керек?',
                'Кім үшін өндіру керек?',
                'Қашан демалу керек?',
                'Қайда сату керек?',
                'Қанша салық төлеу керек?'
            ],
            'correct_variants': [
                'Не өндіру керек?',
                'Қалай өндіру керек?',
                'Кім үшін өндіру керек?'
            ]
        },
        12: {
            'question': "Жұмыссыздықтың негізгі түрлерін таңдаңыз:",
            'variants': [
                'Фрикциялық',
                'Құрылымдық',
                'Циклдық',
                'Тұрақты',
                'Абсолюттік',
                'Жалпылама'
            ],
            'correct_variants': [
                'Фрикциялық',
                'Құрылымдық',
                'Циклдық'
            ]
        },
        13: {
            'question': "Жетілген бәсеке (Perfect Competition) нарығының сипаттамалары:",
            'variants': [
                'Нарықта сатушылар мен сатып алушылар өте көп',
                'Тауарлары біртекті (стандартталған)',
                'Нарыққа кіру және шығу еркін',
                'Бір ғана ірі сатушы бар',
                'Бағаны сатушы бекітеді',
                'Ақпарат жабық түрде болады'
            ],
            'correct_variants': [
                'Нарықта сатушылар мен сатып алушылар өте көп',
                'Тауарлары біртекті (стандартталған)',
                'Нарыққа кіру және шығу еркін'
            ]
        },
        14: {
            'question': "Орталық банктің ақша-несие (монетарлық) саясатының құралдары:",
            'variants': [
                'Қайта қаржыландыру мөлшерлемесі (базалық мөлшерлеме)',
                'Міндетті резервтер нормасы',
                'Ашық нарықтағы операциялар',
                'Салық кодексін өзгерту',
                'Мемлекеттік бюджетті бекіту',
                'Заң шығару'
            ],
            'correct_variants': [
                'Қайта қаржыландыру мөлшерлемесі (базалық мөлшерлеме)',
                'Міндетті резервтер нормасы',
                'Ашық нарықтағы операциялар'
            ]
        },
        15: {
            'question': "Сұраныстың бағалық икемділігіне (elasticity) әсер ететін факторлар:",
            'variants': [
                'Алмастырушы тауарлардың болуы',
                'Тауардың тұтынушы бюджетіндегі үлесі',
                'Уақыт факторы',
                'Сатушының жасы',
                'Дүкеннің атауы',
                'Ауа температурасы'
            ],
            'correct_variants': [
                'Алмастырушы тауарлардың болуы',
                'Тауардың тұтынушы бюджетіндегі үлесі',
                'Уақыт факторы'
            ]
        }
    },
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

// Глобальное состояние теста
let currentTestName = null;
let currentQuestionIndex = 0;
let userAnswers = {};

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
    const container = document.getElementById('tab-item-test');

    if (!tests[testName]) {
        console.error(`Тест "${testName}" не найден`);
        return;
    }

    // Инициализация состояния
    currentTestName = testName;
    currentQuestionIndex = 0;
    userAnswers = {};

    // Подготовка контейнера
    container.innerHTML = '';
    container.classList.add('test-container');

    // Күтіп алу(Header)
    // const headerRow = document.createElement('div');
    // headerRow.classList.add('test-header-row');

    // const title = document.createElement('h2');
    // title.textContent = testName;
    // title.classList.add('test-title');
    // headerRow.appendChild(title);

    // container.appendChild(headerRow);

    // Навигатор (Сұрақтар торшасы)
    const navigator = document.createElement('div');
    navigator.id = 'test-navigator';
    navigator.classList.add('test-navigator');
    container.appendChild(navigator);

    // Контейнер для активного вопроса
    const questionContainer = document.createElement('div');
    questionContainer.id = 'active-question-container';
    container.appendChild(questionContainer);

    // Пагинация (Келесі/Алдыңғы)
    const paginationControls = document.createElement('div');
    paginationControls.classList.add('pagination-controls');

    const prevBtn = document.createElement('button');
    prevBtn.id = 'prev-q-btn';
    prevBtn.textContent = 'Алдыңғы';
    prevBtn.classList.add('btn-nav');
    prevBtn.onclick = () => navigateQuestion(-1);

    const nextBtn = document.createElement('button');
    nextBtn.id = 'next-q-btn';
    nextBtn.textContent = 'Келесі';
    nextBtn.classList.add('btn-nav');
    nextBtn.onclick = () => navigateQuestion(1);

    const finishBtn = document.createElement('button');
    finishBtn.id = 'finish-test-btn';
    finishBtn.textContent = 'Тестті аяқтау';
    finishBtn.classList.add('submit-btn');
    finishBtn.style.display = 'none';
    finishBtn.onclick = () => checkTest(currentTestName);

    paginationControls.appendChild(prevBtn);
    paginationControls.appendChild(nextBtn);
    paginationControls.appendChild(finishBtn);
    container.appendChild(paginationControls);

    // Отрисовка первого вопроса
    renderNavigator();
    showQuestion(0);

    initModal();
    openTab('item-test', `nameTest=${testName}`);
}

/**
 * ОТОБРАЖЕНИЕ КОНКРЕТНОГО ВОПРОСА
 */
function showQuestion(index) {
    const testData = tests[currentTestName];
    const questionKeys = Object.keys(testData);

    if (index < 0 || index >= questionKeys.length) return;

    currentQuestionIndex = index;
    const key = questionKeys[index];
    const qData = testData[key];

    const container = document.getElementById('active-question-container');
    container.innerHTML = '';

    const card = document.createElement('div');
    card.classList.add('question-card');

    // Header
    const header = document.createElement('div');
    header.classList.add('question-header');

    const numberIcon = document.createElement('div');
    numberIcon.classList.add('question-number-icon');
    numberIcon.textContent = key;

    const textBlock = document.createElement('div');
    const qText = document.createElement('p');
    qText.classList.add('question-text');
    qText.textContent = qData.question;

    const isMultiple = qData.correct_variants.length > 1;
    const hint = document.createElement('span');
    hint.classList.add('question-hint');
    hint.textContent = isMultiple ? `Бірнеше дұрыс жауап` : `Бір дұрыс жауап`;

    textBlock.appendChild(qText);
    textBlock.appendChild(hint);
    header.appendChild(numberIcon);
    header.appendChild(textBlock);
    card.appendChild(header);

    // Variants
    const variantsContainer = document.createElement('div');
    variantsContainer.classList.add('variants-list');

    const inputType = isMultiple ? 'checkbox' : 'radio';

    // Используем сохраненные или перемешиваем
    if (!qData._shuffled) {
        qData._shuffled = shuffleArray(qData.variants);
    }

    qData._shuffled.forEach(variant => {
        const label = document.createElement('label');
        label.classList.add('variant-label');

        const input = document.createElement('input');
        input.type = inputType;
        input.name = `question_${key}`;
        input.value = variant;
        input.classList.add('variant-input');

        // Восстанавливаем состояние
        if (userAnswers[key] && userAnswers[key].includes(variant)) {
            input.checked = true;
        }

        input.onchange = () => saveAnswer(key, variant, isMultiple);

        const span = document.createElement('span');
        span.textContent = variant;

        label.appendChild(input);
        label.appendChild(span);
        variantsContainer.appendChild(label);
    });

    card.appendChild(variantsContainer);
    container.appendChild(card);

    updateControls();
    renderNavigator();
}

/**
 * СОХРАНЕНИЕ ОТВЕТА В СОСТОЯНИЕ
 */
function saveAnswer(questionKey, variant, isMultiple) {
    if (!userAnswers[questionKey]) {
        userAnswers[questionKey] = [];
    }

    if (isMultiple) {
        const index = userAnswers[questionKey].indexOf(variant);
        if (index > -1) {
            userAnswers[questionKey].splice(index, 1);
        } else {
            userAnswers[questionKey].push(variant);
        }
    } else {
        userAnswers[questionKey] = [variant];
    }

    renderNavigator();
}

/**
 * ОБНОВЛЕНИЕ КНОПОК НАВИГАЦИИ
 */
function updateControls() {
    const total = Object.keys(tests[currentTestName]).length;

    document.getElementById('prev-q-btn').disabled = currentQuestionIndex === 0;

    const nextBtn = document.getElementById('next-q-btn');
    const finishBtn = document.getElementById('finish-test-btn');

    if (currentQuestionIndex === total - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        finishBtn.style.display = 'none';
    }
}

/**
 * НАВИГАЦИЯ МЕЖДУ СВОРАКАМИ
 */
function navigateQuestion(step) {
    showQuestion(currentQuestionIndex + step);
}

/**
 * ОТРИСОВКА СЕТКИ ВОПРОСОВ
 */
function renderNavigator() {
    const navigator = document.getElementById('test-navigator');
    if (!navigator) return;

    navigator.innerHTML = '';
    const questionKeys = Object.keys(tests[currentTestName]);

    questionKeys.forEach((key, index) => {
        const item = document.createElement('div');
        item.classList.add('nav-item');
        if (index === currentQuestionIndex) item.classList.add('active');
        if (userAnswers[key] && userAnswers[key].length > 0) item.classList.add('answered');

        item.textContent = key;
        item.onclick = () => showQuestion(index);
        navigator.appendChild(item);
    });
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
    document.getElementById('test-result-modal').addEventListener('click', function (e) {
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

        const selectedAnswers = userAnswers[key] || [];

        selectedAnswers.forEach(value => {
            if (correctAnswers.includes(value)) {
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