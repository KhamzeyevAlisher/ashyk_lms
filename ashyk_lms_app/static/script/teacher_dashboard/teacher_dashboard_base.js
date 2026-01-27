/**
 * Глобальные функции управления модальными окнами
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
  } else {
    console.error(`Modal with id "${modalId}" not found`);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Экспортируем в window явно для надежности
window.openModal = openModal;
window.closeModal = closeModal;

// Закрытие модального окна по клику вне его контента
window.addEventListener('click', function (event) {
  if (event.target && event.target.classList && event.target.classList.contains('modal')) {
    event.target.classList.add('hidden');
  }
});

/**
 * Обновляет или добавляет параметр в строку запроса URL без перезагрузки страницы.
 */
function updateURLParameter(key, value, itemParam = '') {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(key, value);

  const pageRules = {
    'item-lesson': ['titleLesson', 'nameLesson'],
    'item-course': ['titleCourse'],
    'item-test': ['nameTest']
  };

  Object.values(pageRules).flat().forEach(paramKey => {
    searchParams.delete(paramKey);
  });

  if (itemParam) {
    const allowedKeys = pageRules[value];
    if (allowedKeys) {
      const extraParams = new URLSearchParams(itemParam);
      extraParams.forEach((val, k) => {
        if (allowedKeys.includes(k)) {
          searchParams.set(k, val);
        }
      });
    }
  }

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

function openTab(tabName, itemParam = false) {
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(el => el.classList.add('hidden'));

  const activeContent = document.getElementById(`tab-${tabName}`);
  if (activeContent) {
    activeContent.classList.remove('hidden');
  }

  const buttons = document.querySelector('.sidebar').querySelectorAll('.nav-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  const activeBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick').includes(tabName));
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  const titles = {
    'home': 'Басты бет',
    'content': 'Контент',
    'tests': 'Тесттер',
    'schedule': 'Кесте',
    'silabus': 'Оқу жоспары',
    'diary': 'Журнал',
    'homework': 'Үй тапсырмалары',
    'profile': 'Профиль',
    'courses': 'Курстар',
  };
  document.getElementById('page-header-title').innerText = titles[tabName] || 'Ashyk LMS';
}