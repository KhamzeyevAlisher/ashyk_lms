/**
 * Обновляет или добавляет параметр в строку запроса URL без перезагрузки страницы.
 * 
 * @param {string} key Ключ основного параметра (например, 'page').
 * @param {string} value Значение основного параметра.
 * @param {string|boolean} title (Опционально) Значение для параметра 'title'.
 */
function updateURLParameter(key, value, itemParam = '') {
  // 1. Создаем объект параметров из текущего URL
  const searchParams = new URLSearchParams(window.location.search);

  // 2. Устанавливаем основную страницу (например, ?page=item-lesson)
  searchParams.set(key, value);

  // 3. Правила: какая страница какие параметры принимает (ИСПОЛЬЗУЕМ МАССИВЫ)
  const pageRules = {
    'item-lesson': ['titleLesson', 'nameLesson'],
    'item-course': ['titleCourse'],
    'item-test': ['nameTest']
  };

  // 4. Очистка: Удаляем все параметры, которые управляются правилами.
  // Object.values вернет массив массивов: [['titleLesson', 'nameLesson'], ['titleCourse']...]
  // .flat() превратит это в один список: ['titleLesson', 'nameLesson', 'titleCourse', 'nameTest']
  Object.values(pageRules).flat().forEach(paramKey => {
    searchParams.delete(paramKey);
  });

  // 5. Обрабатываем дополнительные параметры
  if (itemParam) {
    // Получаем список разрешенных ключей для текущей страницы (value)
    const allowedKeys = pageRules[value];

    // Если для текущей страницы (value) есть правила, то обрабатываем.
    // Если правил нет (allowedKeys === undefined), то itemParam полностью ИГНОРИРУЕТСЯ.
    if (allowedKeys) {
      const extraParams = new URLSearchParams(itemParam);

      console.log('Обрабатываем параметры для:', value, 'Разрешено:', allowedKeys);

      extraParams.forEach((val, k) => {
        // Проверяем, входит ли параметр k в массив разрешенных ключей
        if (allowedKeys.includes(k)) {
          searchParams.set(k, val);
        } else {
          console.log(`Параметр "${k}" игнорируется для страницы "${value}"`);
        }
      });
    }
  }

  // 6. Формируем и обновляем URL
  const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
  history.pushState(null, '', newRelativePathQuery);
}

let hrefLinks = {
  "schedule": ".schedule-wrapper",
  "curriculum": ".curriculum-wrapper",
  "diary": ".stats-container-journal",
  "homework": ".container_homework",
  "tests": "#tab-tests .dashboard-header",
  "lectures": "#tab-lectures .card",
  "home": "#tab-home .dashboard-header",
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
function openTab(tabName, itemParam = false) {
  // 1. Получаем все элементы с классом 'tab-content' и скрываем их.
  // Это гарантирует, что перед показом новой вкладки все остальные будут скрыты.
  const contents = document.querySelectorAll('.tab-content');

  contents.forEach(el => el.classList.add('hidden'));

  if (tabName in hrefLinks) {
    try {
      document.querySelector(hrefLinks[tabName]).scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      console.error("Error scrolling to element:", e);
    }
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
  if (activeBtn) {
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
    'courses': 'Курстар',

  };
  // Устанавливаем текст заголовка в соответствии с открытой вкладкой.
  // Если для tabName нет соответствующего заголовка в объекте titles, используется значение по умолчанию 'Ashyk LMS'.
  document.getElementById('page-header-title').innerText = titles[tabName] || 'Ashyk LMS';

  if (itemParam) {
    updateURLParameter('page', tabName, itemParam);
  } else {
    updateURLParameter('page', tabName);
  }
}




/**
 * Инициализация всех кастомных селектов на странице.
 */
function initCustomSelects() {
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

        // Триггерим событие изменения для кастомного селекта (если нужно вешать слушатели)
        const event = new CustomEvent('change', { detail: { value: option.dataset.value } });
        select.dispatchEvent(event);

        // Здесь можно вызвать функцию фильтрации, используя option.dataset.value
        console.log("Выбранное значение:", option.dataset.value);
      });
    });
  });

  // Закрытие при клике в любое место экрана
  window.addEventListener('click', () => {
    document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initCustomSelects();
  // ... остальной код DOMContentLoaded ...
  const urlParams = new URLSearchParams(window.location.search);

  const pageToOpen = urlParams.get('page');


  if (pageToOpen === "item-lesson") {
    const titleLesson = urlParams.get('titleLesson');
    const itemLesson = urlParams.get('nameLesson');
    openLesson(titleLesson, itemLesson);
  } else if (pageToOpen === "item-test") {
    const testName = urlParams.get('nameTest');
    openTab('item-test', 'nameTest=' + testName);
    openTest(testName);
  } else if (pageToOpen === "item-course") {
    const courseTitle = urlParams.get('titleCourse');
    renderCourseByTitle(courseTitle);
  } else if (pageToOpen) {
    openTab(pageToOpen);
  } else {
    openTab('home');
  }
});