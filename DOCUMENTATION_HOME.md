# 📄 Документация модуля: Student Dashboard (Панель студента)

**Версия:** 1.0  
**Описание:** Модуль реализует главную страницу личного кабинета студента с функционалом SPA (Single Page Application). Обеспечивает навигацию по вкладкам без перезагрузки страницы, динамическое обновление URL и рендеринг контента (расписание, домашние задания) на основе JavaScript-данных.

---

## 📑 Содержание

1. [Архитектура и структура HTML](#1-архитектура-и-структура-html)
2. [Система навигации (Routing)](#2-система-навигации-routing)
3. [Управление состоянием URL](#3-управление-состоянием-url)
4. [Структура данных (Data Models)](#4-структура-данных-data-models)
5. [Логика рендеринга (Rendering)](#5-логика-рендеринга-rendering)
6. [Руководство по расширению](#6-руководство-по-расширению)

---

## 1. Архитектура и структура HTML

Интерфейс построен на принципе вкладок (tabs). Весь контент загружается сразу (или через `include`), но отображается только активный блок.

### Базовая разметка

```html
<!-- Основной контейнер контента -->
<div class="main-content">

    <!-- Вкладка 1: Главная (Dashboard) -->
    <!-- ID должен соответствовать формату: tab-{tabName} -->
    <div id="tab-home" class="tab-content">
        <!-- Подключение шаблона Django -->
        {% include 'parties/student_dashboard/student_home.html' %}
    </div>

    <!-- Вкладка 2: Профиль (скрыта по умолчанию) -->
    <div id="tab-profile" class="tab-content hidden">
        ...
    </div>

</div>
```

### Компоненты Dashboard (`student_home.html`)

Внутри главной вкладки используется сеточная верстка (`grid/flex`):

*   **Header:** Приветствие и дата.
*   **Stats Grid (`.stats-grid`):** 4 карточки со статистикой (Белсенді курстар, Орындалған тапсырмалар и т.д.).
*   **Content Grid (`.dashboard-grid`):** Разделен на две колонки.
    *   `.column-schedule`: Место для вставки расписания.
    *   `.column-homework`: Место для вставки карточек ДЗ.

> ⚠️ **Важно:** Содержимое колонок расписания и домашних заданий генерируется динамически через JS. В HTML файле эти блоки должны содержать только заголовки.

---

## 2. Система навигации (Routing)

Переключение между разделами осуществляется функцией `openTab(tabName)`.

### Принцип работы `openTab`

Функция принимает строковый идентификатор вкладки и выполняет следующие действия:

1.  **Скрытие вкладок:** Находит все элементы `.tab-content` и добавляет класс `.hidden`.
2.  **Отображение активной:** Удаляет класс `.hidden` у элемента с `id="tab-{tabName}"`.
3.  **Сайдбар:**
    *   Находит все кнопки `.nav-btn` внутри `.sidebar`.
    *   Удаляет класс `.active` у всех кнопок.
    *   Добавляет класс `.active` кнопке, в чьем атрибуте `onclick` содержится текущий `tabName`.
4.  **Заголовок:** Обновляет текст в `#page-header-title` согласно словарю `titles`.
5.  **URL:** Вызывает `updateURLParameter` для смены GET-параметра `?page=...`.

### Пример использования в HTML

Кнопка в боковой панели (sidebar):
```html
<button class="nav-btn" onclick="openTab('home')">
    <i class="fa-solid fa-house"></i> Басты бет
</button>

<button class="nav-btn" onclick="openTab('homework')">
    <i class="fa-solid fa-book"></i> Үй тапсырмалары
</button>
```

---

## 3. Управление состоянием URL

Для сохранения состояния при перезагрузке страницы (F5) или отправке ссылки используется работа с `History API`.

### Функция `updateURLParameter`

Обновляет GET-параметры без перезагрузки страницы.

```javascript
/**
 * @param {string} key - Ключ параметра (например, 'page')
 * @param {string} value - Значение (например, 'schedule')
 */
function updateURLParameter(key, value) {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(key, value);
  const newPath = window.location.pathname + '?' + searchParams.toString();
  history.pushState(null, '', newPath);
}
```

### Инициализация при загрузке

Скрипт проверяет URL при событии `DOMContentLoaded` для восстановления сессии пользователя.

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageToOpen = urlParams.get('page'); // Получаем ?page=...
    
    if (pageToOpen) {
        openTab(pageToOpen); // Открываем конкретную вкладку
    } else {
        openTab('home');     // По умолчанию открываем 'home'
    }
});
```

---

## 4. Структура данных (Data Models)

Данные хранятся в массивах объектов (JSON-формат). В будущем эти данные должны приходить через AJAX/Fetch запрос к API.

### Модель: Расписание (`scheduleDataHome`)

```javascript
[
    {
        time: "09:00",          // String: Время начала
        subject: "Киберқауіпсіздік", // String: Название предмета
        teacher: "Ахметов Е.К.", // String: ФИО преподавателя
        room: "А-305"           // String: Номер аудитории
    }
]
```

### Модель: Домашнее задание (`homeworkDataHome`)

```javascript
[
    {
        subject: "Алгоритмдер", // String: Предмет
        status: "Басталмаған",  // String: Текст статуса для пользователя
        statusColor: "gray",    // String: CSS-класс цвета (gray, yellow, green, red)
        title: "Екілік іздеу...", // String: Описание задания
        dueDate: "28.11.2025"   // String: Дата дедлайна
    }
]
```

---

## 5. Логика рендеринга (Rendering)

Скрипт автоматически заполняет DOM-дерево на основе массивов данных.

### Генерация расписания

1.  Целевой контейнер: `.column-schedule` внутри `#tab-home`.
2.  Для каждого элемента создается `div.list-card.schedule-item`.
3.  Используется `innerHTML` для вставки иконок FontAwesome.

### Генерация домашних заданий

1.  Целевой контейнер: `.column-homework` внутри `#tab-home`.
2.  Для каждого элемента создается `div.list-card`.
3.  **Безопасность:** Для заголовка задания (`title`) используется `textContent`, чтобы предотвратить XSS-атаки, если данные приходят от пользователя.

```javascript
// Пример создания элемента
const title = document.createElement('div');
title.className = 'hw-title';
title.textContent = hw.title; // Безопасная вставка текста
```

---

## 6. Руководство по расширению

### Как добавить новую страницу (вкладку)?

1.  **HTML:** Добавьте новый блок в основной контент.
    ```html
    <div id="tab-settings" class="tab-content hidden">
        <h2>Настройки</h2>
        <!-- Контент настроек -->
    </div>
    ```

2.  **HTML (Sidebar):** Добавьте кнопку навигации.
    ```html
    <div class="nav-btn" onclick="openTab('settings')">
        <i class="fa-solid fa-cog"></i> Настройки
    </div>
    ```

3.  **JavaScript:** Обновите словарь заголовков в функции `openTab`.
    ```javascript
    const titles = {
        // ... старые записи
        'settings': 'Баптаулар' // Новый заголовок
    };
    ```

### Как добавить новый статус для ДЗ?

1.  **CSS:** Убедитесь, что класс существует в стилях.
    ```css
    .badge.red { background-color: #ffebee; color: #c62828; }
    ```

2.  **JavaScript (Data):** Используйте этот цвет в объекте данных.
    ```javascript
    {
        subject: "Математика",
        status: "Мерзімі өтті", // Просрочено
        statusColor: "red",     // Ссылка на CSS класс
        // ...
    }
    ```

### Как подключить реальный API?

Замените статические массивы на вызов `fetch`.

```javascript
document.addEventListener("DOMContentLoaded", async function() {
    // 1. Получение данных
    const response = await fetch('/api/student/schedule');
    const scheduleDataHome = await response.json();

    // 2. Логика рендеринга (остается той же)
    const scheduleContainer = document.querySelector('.column-schedule');
    scheduleDataHome.forEach(item => {
        // ... код генерации карточек
    });
});
```