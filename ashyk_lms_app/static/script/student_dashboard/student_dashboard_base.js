/**
 * Обновляет или добавляет параметр в строку запроса URL без перезагрузки страницы.
 *
 * @param {string} key Ключ параметра, который нужно изменить или добавить.
 * @param {string} value Новое значение для параметра.
 */
function updateURLParameter(key, value) {
  // Создаем объект URLSearchParams из текущей строки запроса
  const searchParams = new URLSearchParams(window.location.search);

  // Устанавливаем новое значение для параметра.
  // Если параметр с таким ключом уже существует, его значение будет обновлено.
  // Если нет, он будет добавлен.
  searchParams.set(key, value);

  // Формируем новый относительный путь с обновленными параметрами
  const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();

  // Обновляем URL в адресной строке браузера
  history.pushState(null, '', newRelativePathQuery);
}

let hrefLinks = {
    "schedule":".schedule-wrapper",
    "curriculum":".curriculum-wrapper",
    "diary":".stats-container-journal",
    "homework":".container_homework",
    "tests":"#tab-tests .dashboard-header",
    "lectures":"#tab-lectures .card",
    "home":"#tab-home .dashboard-header",
}

/**
 * Структура страницы:
 * В <body> два основных дочерних элемента:
 *   - .sidebar (Боковая панель) parties/student_dashboard/sidebar_student.html
 *   - .main-content (Основной контент)
 * 
 * 
 * Функция для переключения вкладок (табов) на странице.
 * Управляет видимостью контента и активным состоянием кнопок навигации.
 * 
 * Алгоритм работы:
 * 1. Сначала находит все элементы с классом .tab-content (внутри main-content).
 * 2. Добавляет всем элементам .tab-content класс .hidden (скрывает их).
 * 3. Находит нужный .tab-content (например, id='tab-home'), убирает класс .hidden и открывает вкладку.
 * 4. Находит все кнопки .nav-btn (внутри sidebar) и убирает с них класс .active.
 * 5. Находит нужную кнопку .nav-btn и добавляет ей класс .active.
 * 6. Обновляет заголовок #page-header-title (внутри main-content).
 * 7. Меняет параметр страницы в URL (например, добавляет ?page=home).
 * 
 * @param {string} tabName - Идентификатор вкладки, которую необходимо отобразить. 
 *                           Соответствует части id контейнера контента (например, 'home' для 'tab-home')
 *                           и передается в onclick атрибуте кнопок.
 * 
 * ---
 * Элементы DOM, с которыми взаимодействует функция:
 * 
 * Классы:
 *   .sidebar:     Контейнер боковой навигационной панели. 
 * 
 *      .nav-btn:      Кнопки навигации по вкладкам. Функция убирает с них класс 'active'.
 *      .active:       CSS-класс для визуального выделения активной кнопки. 
 *                       Функция добавляет этот класс нужной кнопке.
 * 
 * .main - Контейнер основного контента 
 *     .tab-content:  Контейнеры с содержимым вкладок. Функция скрывает все элементы с этим классом,
 *                      а затем показывает один из них.
 *     .hidden:       CSS-класс для скрытия элементов (например, display: none;). 
 *                      Функция добавляет и удаляет этот класс.
 * 
 * 
 * Идентификаторы (ID):
 * - #tab-{tabName}: Динамически генерируемый ID для конкретного контейнера с контентом 
 *                   (например, #tab-home, #tab-lectures). Функция ищет этот элемент, чтобы показать его.
 * - #page-header-title: Элемент (например, <h1>), в котором отображается заголовок текущей страницы.
 *                       Функция обновляет его текстовое содержимое.
 * ---
 */
function openTab(tabName) {
    // 1. Получаем все элементы с классом 'tab-content' и скрываем их.
    // Это гарантирует, что перед показом новой вкладки все остальные будут скрыты.
    const contents = document.querySelectorAll('.tab-content');
    
    contents.forEach(el => el.classList.add('hidden'));

    if (tabName in hrefLinks) {
        document.querySelector(hrefLinks[tabName]).scrollIntoView({behavior: 'smooth'});
    }   

    // 2. Находим и показываем нужный контейнер с контентом.
    // Ищем элемент по id, который формируется как 'tab-' + имя вкладки (например, 'tab-home').
    const activeContent = document.getElementById(`tab-${tabName}`);

    if (activeContent) {
        // Если элемент найден, удаляем класс 'hidden', чтобы сделать его видимым.
        activeContent.classList.remove('hidden');
    }

    // 3. Обновляем активный класс для кнопок навигации.
    // Сначала убираем класс 'active' со всех кнопок.
    const buttons = document.querySelector('.sidebar').querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Затем ищем кнопку, которая вызвала эту функцию, сравнивая значение в атрибуте 'onclick'.
    const activeBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick').includes(tabName));
    if(activeBtn) {
        // Если кнопка найдена, добавляем ей класс 'active' для визуального выделения.
        activeBtn.classList.add('active');
    }

    // 4. Обновляем заголовок страницы в элементе с id 'page-header-title'.
    // Создаем объект-словарь, где ключи - это имена вкладок, а значения - соответствующие заголовки.
    const titles = {
        'home': 'Басты бет',
        'lectures': 'Дәрістер',
        'tests': 'Тесттер',
        'schedule': 'Кесте',
        'diary': 'Журнал',
        'homework': 'Үй тапсырмалары',
        'profile': 'Профиль',
        'courses':'Курстар',

    };
    // Устанавливаем текст заголовка в соответствии с открытой вкладкой.
    // Если для tabName нет соответствующего заголовка в объекте titles, используется значение по умолчанию 'Ashyk LMS'.
    document.getElementById('page-header-title').innerText = titles[tabName] || 'Ashyk LMS';

    updateURLParameter('page', tabName);
}


document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);

    const pageToOpen = urlParams.get('page');
    const itemLesson = urlParams.get('lesson');

    if (pageToOpen) {
        openTab(pageToOpen);
    } else {
        openTab('home');
    }

    if (itemLesson) {
        openLesson(itemLesson);
    }
});