# Ashyk LMS - Learning Management System

[![Django](https://img.shields.io/badge/Django-4.2.25-green?style=flat-square)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Python-3.13-blue?style=flat-square)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](#license)

**Ashyk LMS** - это система управления обучением (Learning Management System) на базе Django, предназначенная для организации образовательного процесса. Система поддерживает различные роли пользователей (студенты, преподаватели, администраторы) и предоставляет удобный интерфейс для управления курсами, домашними заданиями, лекциями и расписанием.

## 📋 Содержание

- [Возможности](#-возможности)
- [Требования](#-требования)
- [Установка](#-установка)
- [Структура проекта](#-структура-проекта)
- [Использование](#-использование)
- [Архитектура](#-архитектура)
- [API и функции](#-api-и-функции)
- [Конфигурация](#-конфигурация)
- [Разработка](#-разработка)
- [Лицензия](#-лицензия)

## 🎯 Возможности

### Для студентов
- ✅ Панель управления (Student Dashboard)
- ✅ Просмотр активных курсов
- ✅ Доступ к лекциям и материалам
- ✅ Просмотр и отправка домашних заданий
- ✅ Просмотр расписания занятий
- ✅ Ведение электронного дневника/журнала
- ✅ Прохождение тестов и контрольных работ
- ✅ Просмотр профиля и статистики

### Для преподавателей
- ✅ Управление курсами
- ✅ Создание лекций и учебных материалов
- ✅ Создание и проверка домашних заданий
- ✅ Проведение тестов
- ✅ Ведение расписания

### Для администраторов
- ✅ Панель администратора
- ✅ Управление пользователями
- ✅ Управление курсами и структурой
- ✅ Просмотр аналитики и отчетов

## 📦 Требования

- **Python** ≥ 3.8
- **Django** 4.2.25
- **SQLite3** (по умолчанию) или другая БД

```
- django >= 4.2.25
- djangorestframework (опционально)
- pillow (для работы с изображениями)
```

## 🚀 Установка

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd ashyk_lms
```

### 2. Создание виртуального окружения

```bash
# На Windows
python -m venv venv
venv\Scripts\activate

# На Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 4. Миграция базы данных

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Создание суперпользователя

```bash
python manage.py createsuperuser
```

### 6. Запуск сервера разработки

```bash
python manage.py runserver
```

Приложение будет доступно по адресу: `http://127.0.0.1:8000/`

## 📂 Структура проекта

```
ashyk_lms/
├── ashyk_lms_project/          # Главная конфигурация проекта
│   ├── settings.py             # Параметры Django
│   ├── urls.py                 # Маршруты главного приложения
│   ├── asgi.py                 # ASGI конфигурация
│   └── wsgi.py                 # WSGI конфигурация
│
├── ashyk_lms_app/              # Основное приложение
│   ├── models.py               # Модели данных
│   ├── views.py                # Представления (Views)
│   ├── urls.py                 # Маршруты приложения
│   ├── forms.py                # Django формы
│   ├── admin.py                # Конфигурация администратора
│   ├── backends.py             # Пользовательские backend'ы аутентификации
│   │
│   ├── templates/
│   │   └── ashyk_lms_app/
│   │       ├── base.html       # Базовый шаблон
│   │       ├── login.html      # Форма входа
│   │       ├── profile.html    # Профиль пользователя
│   │       ├── admin_panel.html# Панель администратора
│   │       └── student_dashboard.html  # Панель студента
│   │
│   ├── parties/                # Компоненты шаблонов
│   │   ├── student_dashboard/  # Компоненты для панели студента
│   │   │   ├── sidebar_student.html
│   │   │   ├── student_home.html
│   │   │   ├── student_courses.html
│   │   │   ├── student_lectures.html
│   │   │   ├── student_homework.html
│   │   │   ├── student_test.html
│   │   │   ├── student_schedule.html
│   │   │   └── student_diary.html
│   │   └── teacher_dashboard/
│   │
│   ├── static/
│   │   ├── css/                # Стили
│   │   │   ├── base.css
│   │   │   ├── student_dashboard_base.css
│   │   │   └── student_dashboard/
│   │   └── script/             # JavaScript
│   │       └── student_dashboard/
│   │
│   ├── migrations/             # Миграции базы данных
│   └── __pycache__/
│
├── manage.py                   # Управление проектом Django
├── db.sqlite3                  # База данных (по умолчанию)
├── DOCUMENTATION_HOME.md       # Документация панели студента
└── README.md                   # Этот файл
```

## 💻 Использование

### Вход в систему

1. Откройте `http://127.0.0.1:8000/login/`
2. Введите учетные данные пользователя
3. После успешного входа будет произведено перенаправление на соответствующую панель

### Панель студента

**Маршрут:** `/student-dashboard/`

Студент может:
- Просматривать все активные курсы
- Изучать лекции и материалы
- Просматривать домашние задания и отправлять решения
- Проходить тесты и контрольные работы
- Просматривать расписание занятий
- Вести электронный дневник

**Структура:** Приложение реализовано как **Single Page Application (SPA)** с использованием JavaScript для переключения вкладок без перезагрузки страницы.

### Панель администратора

**Маршрут:** `/admin/`

Администратор имеет полный доступ к управлению системой через встроенную Django администрацию.

## 🏗️ Архитектура

### Модель MVC

Приложение следует классической архитектуре Django MVC:

- **Models** (`models.py`) - Определение структуры данных
- **Views** (`views.py`) - Обработка логики и предоставление данных
- **Templates** (`templates/`) - Представление пользовательского интерфейса

### Single Page Application (SPA)

Панель студента реализована как SPA с использованием:
- **HTML** для структуры
- **CSS** для стилей
- **JavaScript** для динамического управления состоянием

### Навигация

Система навигации использует:
- **History API** для управления URL без перезагрузки страницы
- **GET параметры** (`?page=`) для сохранения состояния
- **JavaScript функция `openTab()`** для переключения между разделами

### Аутентификация

- Использует встроенную систему аутентификации Django
- Поддерживает пользовательские backend'ы (`backends.py`)
- Сессионная аутентификация

## 🔧 API и функции

### Ключевые функции JavaScript

**student_dashboard_base.js:**

```javascript
// Переключение между вкладками
openTab(tabName)

// Обновление URL параметра
updateURLParameter(param, value)

// Инициализация при загрузке страницы
initializeDashboard()
```

### Модели данных (примерно)

```python
# Основные модели в models.py:
- User (встроенная модель Django)
- Course
- Lecture
- Homework
- Test
- Schedule
- StudentDiary
```

## ⚙️ Конфигурация

### Главные параметры (settings.py)

```python
# Отладка (ВАЖНО: отключить в production)
DEBUG = True

# Установленные приложения
INSTALLED_APPS = [
    'ashyk_lms_app',
    ...
]

# База данных (по умолчанию SQLite)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Статические файлы
STATIC_URL = '/static/'

# Пользовательские backend'ы аутентификации
AUTHENTICATION_BACKENDS = [
    'ashyk_lms_app.backends.CustomBackend',
]
```

### Переменные окружения

Рекомендуется использовать файл `.env` для чувствительных данных:

```bash
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost/dbname
```

## 🔨 Разработка

### Создание новой функции

1. **Добавить модель** в `ashyk_lms_app/models.py`
2. **Создать миграцию:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
3. **Добавить представление** в `ashyk_lms_app/views.py`
4. **Добавить маршрут** в `ashyk_lms_app/urls.py`
5. **Создать шаблон** в `ashyk_lms_app/templates/`
6. **Добавить стили** в `ashyk_lms_app/static/css/`
7. **Добавить логику JavaScript** в `ashyk_lms_app/static/script/`

### Добавление новой вкладки в Dashboard

1. Создать файл компонента в `templates/parties/student_dashboard/student_newpage.html`
2. Добавить `<div id="tab-newpage" class="tab-content">` в `student_dashboard.html`
3. Добавить кнопку в `sidebar_student.html`
4. Добавить название в словарь `titles` в `student_dashboard_base.js`

### Тестирование

```bash
# Запуск тестов
python manage.py test

# С выводом подробностей
python manage.py test --verbosity=2
```

### Форматирование кода

```bash
# Использование Black для форматирования
pip install black
black ashyk_lms_app/
```

## 📝 Документация

Подробная документация о функциях и компонентах панели студента находится в файле [DOCUMENTATION_HOME.md](DOCUMENTATION_HOME.md).

## 🐛 Решение проблем

### Ошибка: "ModuleNotFoundError: No module named 'django'"

**Решение:** Установите зависимости:
```bash
pip install -r requirements.txt
```

### Ошибка: "No such table" при миграции

**Решение:** Выполните миграцию БД:
```bash
python manage.py migrate
```

### Ошибка: "AttributeError" в views

**Решение:** Очистите кеш Python и пересоздайте миграции:
```bash
find . -type d -name __pycache__ -exec rm -r {} +
python manage.py makemigrations
python manage.py migrate
```

## 📋 Требования к коду

- Используйте PEP 8 стиль кодирования
- Добавляйте docstring'и к функциям и классам
- Пишите unit-тесты для критичного функционала
- Используйте понятные имена переменных

## 🤝 Вклад

Приветствуются pull request'ы и issue'ы! Пожалуйста:

1. Fork репозиторий
2. Создайте ветку для вашей функции (`git checkout -b feature/AmazingFeature`)
3. Сделайте commit (`git commit -m 'Add some AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. Подробнее см. файл [LICENSE](LICENSE).

## ✉️ Контакты

Для вопросов и предложений создавайте issue в репозитории или свяжитесь с командой разработки.

---

**Версия:** 1.0.0  
**Последнее обновление:** Январь 2026  
**Автор:** Ashyk LMS Team
