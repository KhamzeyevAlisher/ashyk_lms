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

/**
 * Функция для переключения вкладок (табов) на странице.
 * Управляет видимостью контента и активным состоянием кнопок навигации.
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
 * - .tab-content:  Контейнеры с содержимым вкладок. Функция скрывает все элементы с этим классом,
 *                  а затем показывает один из них.
 * - .hidden:       CSS-класс для скрытия элементов (например, display: none;). 
 *                  Функция добавляет и удаляет этот класс.
 * - .nav-btn:      Кнопки навигации по вкладкам. Функция убирает с них класс 'active'.
 * - .active:       CSS-класс для визуального выделения активной кнопки. 
 *                  Функция добавляет этот класс нужной кнопке.
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

    // 2. Находим и показываем нужный контейнер с контентом.
    // Ищем элемент по id, который формируется как 'tab-' + имя вкладки (например, 'tab-home').
    const activeContent = document.getElementById(`tab-${tabName}`);

    console.log(activeContent, tabName);

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
        'courses':'Курстар'
    };
    // Устанавливаем текст заголовка в соответствии с открытой вкладкой.
    // Если для tabName нет соответствующего заголовка в объекте titles, используется значение по умолчанию 'Ashyk LMS'.
    document.getElementById('page-header-title').innerText = titles[tabName] || 'Ashyk LMS';

    updateURLParameter('page', tabName);
}

/**
 * Функция для переключения вида расписания между "дневным" и "недельным".
 * Управляет активным состоянием кнопок-переключателей и видимостью соответствующих контейнеров.
 * 
 * @param {string} type - Тип отображения, который нужно активировать. 
 *                        Принимает два значения: 'day' или 'week'.
 * 
 * ---
 * Элементы DOM, с которыми взаимодействует функция:
 * 
 * Классы:
 * - .toggle-btns .btn:first-child: Кнопка для переключения на дневной вид ("Күн").
 * - .toggle-btns .btn:last-child:  Кнопка для переключения на недельный вид ("Апта").
 * - .active:                       CSS-класс для визуального выделения активной кнопки-переключателя.
 *                                  Функция добавляет и удаляет этот класс.
 * - .schedule-list:                Контейнер, в котором находится верстка расписания на один день.
 *                                  Функция управляет его свойством `display`.
 * - .week-schedule-container:      Контейнер, в котором находится верстка расписания на всю неделю (в виде колонок).
 *                                  Функция управляет его свойством `display`.
 * ---
 */
function toggleSchedule(type) {
    // Находим все необходимые элементы в DOM один раз для эффективности
    const dayBtn = document.querySelector('.toggle-btns .btn:first-child');
    const weekBtn = document.querySelector('.toggle-btns .btn:last-child');
    
    const dayContainer = document.querySelector('.schedule-list');
    const weekContainer = document.querySelector('.week-schedule-container');

    // Проверяем, какой тип отображения был запрошен
    if (type === 'day') {
        // --- Логика для отображения дневного расписания ---

        // 1. Обновляем классы активности на кнопках: "Күн" становится активной.
        dayBtn.classList.add('active');
        weekBtn.classList.remove('active');

        // 2. Показываем контейнер с дневным расписанием (используя flex) и скрываем недельный.
        dayContainer.style.display = 'flex';
        weekContainer.style.display = 'none';
        
    } else if (type === 'week') {
        // --- Логика для отображения недельного расписания ---

        // 1. Обновляем классы активности на кнопках: "Апта" становится активной.
        weekBtn.classList.add('active');
        dayBtn.classList.remove('active');

        // 2. Скрываем дневной контейнер и показываем недельный.
        dayContainer.style.display = 'none';
        
        // Для недельного контейнера используется 'grid', чтобы расположить дни в колонки.
        weekContainer.style.display = 'grid'; 
    }
}


