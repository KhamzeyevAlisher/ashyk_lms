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
let tests = {};

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
 * @param {number} testId - ID теста из базы данных
 */
async function openTest(testId) {
    const container = document.getElementById('tab-item-test');

    // Показываем лоадер если нужно
    container.innerHTML = '<div style="text-align: center; padding: 50px;">Жүктелуде...</div>';

    try {
        const response = await fetch(`/api/tests/${testId}/`);
        const data = await response.json();

        if (data.status !== 'success') {
            container.innerHTML = `<div style="text-align: center; padding: 50px; color: red;">${data.error || 'Қате'}</div>`;
            return;
        }

        // Обновляем глобальный объект тестов (мини-кэш для текущей сессии)
        tests[data.title] = data.questions;

        // Инициализация состояния
        currentTestName = data.title;
        currentQuestionIndex = 0;
        userAnswers = {};

        // Подготовка контейнера
        container.innerHTML = '';
        container.classList.add('test-container');

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
        openTab('item-test', `nameTest=${data.title}`);

    } catch (error) {
        console.error('Test Details Error:', error);
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: red;">Деректерді жүктеу қатесі</div>';
    }
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