# 📋 Полный список элементов и функций

## 🎯 Функции (30+)

### Управление уроками
```javascript
✅ openLesson(lessonName)
   └─ Открывает видео урок и отображает информацию
   
✅ item_lessons
   └─ Объект базы данных уроков
```

### Инициализация
```javascript
✅ onYouTubeIframeAPIReady()
   └─ Коллбэк при загрузке YouTube API
   
✅ initializeVideoTracking(lessonName)
   └─ Инициализирует отслеживание для видео
```

### YouTube API события
```javascript
✅ onPlayerReady(event)
   └─ Вызывается когда плеер готов
   
✅ onPlayerStateChange(event)
   └─ Вызывается при смене состояния плеера
   
✅ onPlayerError(event)
   └─ Вызывается при ошибке плеера
```

### Отслеживание времени
```javascript
✅ startTracking()
   └─ Начинает счет времени (интервал 1 сек)
   
✅ stopTracking()
   └─ Останавливает счет времени
   
✅ updateTrackingUI(lessonName)
   └─ Обновляет все элементы интерфейса
   
✅ updateStatusIndicator(isPlaying)
   └─ Обновляет индикатор статуса
```

### Управление данными
```javascript
✅ saveWatchStats(lessonName)
   └─ Сохраняет статистику в localStorage
   
✅ getAllWatchStats()
   └─ Получает всю статистику из localStorage
   
✅ clearWatchStats(lessonName?)
   └─ Удаляет статистику видео(и)
   
✅ exportWatchStats()
   └─ Экспортирует статистику в JSON
```

### Утилиты
```javascript
✅ formatTime(seconds)
   └─ Преобразует секунды в MM:SS формат
```

### События браузера
```javascript
✅ beforeunload event
   └─ Сохраняет данные при закрытии страницы
```

---

## 🎨 ID элементов (8)

### Основные контейнеры
```html
✅ #tab-item-lesson
   └─ Контейнер для отображения урока
   └─ Тип: DIV ID
   └─ Создается: dynamically в openLesson()
   
✅ #my-youtube-player
   └─ iframe элемент для YouTube видео
   └─ Тип: IFRAME ID
   └─ Создается: dynamically в openLesson()
```

### Элементы отслеживания (обновляются)
```html
✅ #video-watch-time
   └─ Текущее время просмотра (MM:SS)
   └─ Пример: "12:45"
   └─ Обновляется: каждую секунду при Play
   
✅ #video-progress-percent
   └─ Процент просмотра видео
   └─ Пример: "87%"
   └─ Обновляется: каждую секунду при Play
   
✅ #video-progress-bar
   └─ CSS атрибут ширины прогресс-бара
   └─ Пример: style="width: 87%"
   └─ Обновляется: каждую секунду при Play
```

### Статичные элементы
```html
✅ #video-duration-display
   └─ Общая длительность видео (MM:SS)
   └─ Пример: "14:30"
   └─ Обновляется: один раз при готовности плеера
```

### Статус и индикаторы
```html
✅ #tracking-status-indicator
   └─ Цветная точка индикатора статуса
   └─ Серая по умолчанию
   └─ Зеленая с пульсацией при .active
   └─ Обновляется: при Play/Pause/End
   
✅ #tracking-status-text
   └─ Текст статуса воспроизведения
   └─ Примеры: "Ожидание видео...", "▶ Видео проигрывается", "⏸ Видео на паузе"
   └─ Обновляется: при изменении состояния
```

---

## 🎨 CSS классы (15+)

### Контейнеры
```css
✅ .lesson-card_item
   └─ Основной контейнер урока
   
✅ .video-wrapper
   └─ Контейнер для iframe (16:9 соотношение)
   
✅ .video-tracking-container
   └─ Основной контейнер отслеживания
   └─ Фон: серый (#f8fafc)
   └─ Граница: 1px solid #e2e8f0
   
✅ .lesson-meta
   └─ Контейнер для информации (дата, время)
   
✅ .files-container
   └─ Контейнер для файлов (flex)
```

### Сетка и раскладка
```css
✅ .tracking-stats
   └─ Grid контейнер (2 колонки)
   └─ Адаптивный (1 колонка на мобилях)
   └─ Пространство между элементами: 16px
   
✅ .stat-item
   └─ Элемент в сетке (flex контейнер)
   └─ Пространство между элементами: 12px
   
✅ .progress-section
   └─ Секция прогресс-бара
   └─ Отступ сверху: 16px
   
✅ .progress-label
   └─ Подпись прогресса (justify-content: space-between)
```

### Текстовые элементы
```css
✅ .lesson-category
   └─ Категория урока
   
✅ .lesson-title
   └─ Заголовок урока (H1)
   
✅ .lesson-description
   └─ Описание урока (P)
   
✅ .meta-item
   └─ Элемент мета-информации
   
✅ .stat-label
   └─ Подпись показателя (маленький текст)
   └─ Размер: 12px
   └─ Цвет: #94a3b8
   
✅ .stat-value
   └─ Значение показателя (крупный текст)
   └─ Размер: 18px
   └─ Вес: 700 (жирный)
   └─ Цвет: #10b981 (зеленый)
   
✅ .tracking-title
   └─ Заголовок блока отслеживания
   └─ Размер: 13px
   └─ Вес: 600
   └─ Трансформ: uppercase
```

### Прогресс и индикаторы
```css
✅ .progress-bar-container
   └─ Фоновый контейнер прогресса
   └─ Высота: 6px
   └─ Фон: #e2e8f0 (серый)
   └─ Скругленные углы: 3px
   
✅ .progress-bar-fill
   └─ Активная полоса прогресса
   └─ Фон: linear-gradient(#10b981, #059669)
   └─ Переход: width 0.3s ease
   
✅ .status-indicator
   └─ Точка индикатора
   └─ Размер: 6x6px
   └─ Форма: круг (border-radius: 50%)
   └─ Цвет по умолчанию: #94a3b8 (серая)
   
✅ .status-indicator.active
   └─ Активное состояние индикатора
   └─ Цвет: #10b981 (зеленая)
   └─ Анимация: pulse 2s infinite
   └─ Функция: opacity пульсирует 1 → 0.5 → 1
```

### Кнопки и ссылки
```css
✅ .file-btn
   └─ Кнопка файла
   └─ Фон: #f3f4f6
   └─ Граница: 1px solid #e5e7eb
   └─ При hover: фон #e5e7eb
   
✅ .back-btn
   └─ Кнопка назад
```

### Дополнительные
```css
✅ .tracking-status
   └─ Блок со статусом
   └─ Фон: #f1f5f9
   └─ Размер: 11px
   └─ Скругленные углы: 4px
   
✅ .tracking-hint
   └─ Секция подсказок
   └─ Граница-top: 1px solid #e2e8f0
   └─ Размер: 11px
   └─ Цвет: #94a3b8
```

---

## 🎯 Глобальные переменные (7)

```javascript
✅ currentPlayer
   └─ Тип: YT.Player объект
   └─ Назначение: объект YouTube плеера
   └─ Начальное значение: null
   
✅ timerInterval
   └─ Тип: number (ID интервала)
   └─ Назначение: ID setInterval для счета
   └─ Начальное значение: null
   
✅ totalSecondsWatched
   └─ Тип: number
   └─ Назначение: текущее время просмотра в секундах
   └─ Начальное значение: 0
   └─ Обновляется: каждую секунду при Play
   
✅ videoStartTime
   └─ Тип: Date объект
   └─ Назначение: время начала воспроизведения
   └─ Начальное значение: null
   
✅ videoDuration
   └─ Тип: number
   └─ Назначение: длительность видео в секундах
   └─ Начальное значение: 0
   └─ Устанавливается: в onPlayerReady()
   
✅ currentLesson
   └─ Тип: string
   └─ Назначение: название текущего урока
   └─ Начальное значение: null
   └─ Используется как ключ везде
   
✅ videoWatchStats
   └─ Тип: object
   └─ Назначение: кеш статистики в памяти
   └─ Структура: { lessonName: { totalSeconds, watchedAt, lessonName } }
   └─ Начальное значение: {}
```

---

## 💾 localStorage ключи

```
Формат ключа:    "video_<название урока>"

Примеры ключей:
  ✅ "video_Менеджменттің мәні мен қағидалары"
  ✅ "video_JavaScript-тегі ООП: Кластар және мұрагерлік"

Формат значения (JSON):
{
  "totalSeconds": 245,      // число (сек)
  "watchedAt": "2025-12-09T10:30:00.000Z",  // строка (ISO дата)
  "lessonName": "название урока"  // строка (копия названия)
}

Где посмотреть:
  F12 → Application → Local Storage → выберите домен → ищите video_*
```

---

## 📊 Карта обновлений DOM

```
┌────────────────────────────────────┐
│ updateTrackingUI() - каждую сек    │
├────────────────────────────────────┤
│ Обновляет 5 элементов:             │
│                                    │
│ 1. #video-watch-time               │
│    ← formatTime(totalSecondsWatched)│
│                                    │
│ 2. #video-progress-percent         │
│    ← Math.floor((total/duration)*100)
│                                    │
│ 3. #video-duration-display         │
│    ← formatTime(videoDuration)      │
│                                    │
│ 4. #video-progress-bar             │
│    ← element.style.width = percent+"%" │
│                                    │
│ 5. #tracking-status-text           │
│    ← playerState зависит           │
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ updateStatusIndicator() - при смене│
│ состояния плеера                   │
├────────────────────────────────────┤
│ Обновляет:                         │
│                                    │
│ #tracking-status-indicator         │
│   add/remove класс "active"        │
│   → пульсирует при активности      │
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ saveWatchStats() - каждые 5 сек   │
├────────────────────────────────────┤
│ Обновляет:                         │
│                                    │
│ localStorage.setItem(               │
│   "video_название",                │
│   JSON.stringify({...})            │
│ )                                  │
│                                    │
└────────────────────────────────────┘
```

---

## 🔄 Очередность вызовов функций

```
ИНИЦИАЛИЗАЦИЯ:
openLesson()
  ├─ Генерирует HTML
  ├─ Вставляет в #tab-item-lesson
  └─ Вызывает initializeVideoTracking()
      ├─ Находит #my-youtube-player
      ├─ Создает YT.Player
      └─ Подключает обработчики

ЗАГРУЗКА YOUTUBE API:
YouTube API загружается
  └─ Вызывает onYouTubeIframeAPIReady()

ГОТОВНОСТЬ ПЛЕЕРА:
YT.Player готов
  └─ Вызывает onPlayerReady()
      ├─ Получает videoDuration
      └─ Вызывает updateTrackingUI()
          └─ Обновляет UI элементы

ВОСПРОИЗВЕДЕНИЕ:
Пользователь нажимает Play
  └─ onPlayerStateChange(PLAYING)
      ├─ Вызывает startTracking()
      │  └─ setInterval каждую секунду
      │     ├─ totalSecondsWatched++
      │     ├─ updateTrackingUI()
      │     └─ Каждые 5 сек: saveWatchStats()
      └─ updateStatusIndicator(true)

ПАУЗА:
Пользователь нажимает Pause
  └─ onPlayerStateChange(PAUSED)
      ├─ stopTracking()
      │  └─ clearInterval()
      │  └─ saveWatchStats()
      └─ updateStatusIndicator(false)

ЗАКРЫТИЕ:
Пользователь закрывает страницу
  └─ beforeunload event
      ├─ stopTracking()
      └─ saveWatchStats()
```

---

## ✅ Полный чек-лист

### Функции ✅
- [x] openLesson()
- [x] initializeVideoTracking()
- [x] onYouTubeIframeAPIReady()
- [x] onPlayerReady()
- [x] onPlayerStateChange()
- [x] onPlayerError()
- [x] startTracking()
- [x] stopTracking()
- [x] updateTrackingUI()
- [x] updateStatusIndicator()
- [x] saveWatchStats()
- [x] getAllWatchStats()
- [x] clearWatchStats()
- [x] exportWatchStats()
- [x] formatTime()

### ID элементы ✅
- [x] #tab-item-lesson
- [x] #my-youtube-player
- [x] #video-watch-time
- [x] #video-progress-percent
- [x] #video-progress-bar
- [x] #video-duration-display
- [x] #tracking-status-indicator
- [x] #tracking-status-text

### CSS классы ✅
- [x] .video-wrapper
- [x] .video-tracking-container
- [x] .tracking-stats
- [x] .stat-item
- [x] .progress-bar-container
- [x] .progress-bar-fill
- [x] .status-indicator
- [x] .status-indicator.active
- [x] И все остальные...

### Глобальные переменные ✅
- [x] currentPlayer
- [x] timerInterval
- [x] totalSecondsWatched
- [x] videoDuration
- [x] currentLesson
- [x] videoWatchStats
- [x] item_lessons

### localStorage ✅
- [x] Ключи: video_*
- [x] Значения: JSON
- [x] Сохранение: автоматическое
- [x] Загрузка: автоматическая

---

**Все элементы и функции задокументированы и готовы к использованию!** ✨
