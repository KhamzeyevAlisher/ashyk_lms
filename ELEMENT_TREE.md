# 🌳 Дерево элементов и их взаимосвязи

## HTML Структура

```
#tab-item-lesson (ID контейнер)
│
└── .lesson-card_item (DIV класс)
    │
    ├── .lesson-category (SPAN)
    │   └── "Менеджмент негіздері"
    │
    ├── .lesson-title (H1)
    │   └── "Менеджменттің мәні мен қағидалары"
    │
    ├── .lesson-description (P)
    │   └── "Менеджменттің негізгі түсініктері..."
    │
    ├── .lesson-meta (DIV)
    │   ├── .meta-item (DIV)
    │   │   ├── SPAN: "🕒"
    │   │   └── SPAN: "45 мин"
    │   │
    │   └── .meta-item (DIV)
    │       ├── SPAN: "📅"
    │       └── SPAN: "01.12.2025"
    │
    ├── .video-wrapper (DIV)
    │   └── #my-youtube-player (IFRAME) ← YouTube плеер
    │       └── [YouTube контент]
    │
    ├── .video-tracking-container (DIV) ← ОТСЛЕЖИВАНИЕ ВИДЕО
    │   │
    │   ├── .tracking-title (DIV)
    │   │   └── "📊 Қарау уақыты"
    │   │
    │   ├── .tracking-stats (DIV grid 2 колонки)
    │   │   │
    │   │   ├── .stat-item (DIV)
    │   │   │   ├── .stat-icon (DIV): "⏱️"
    │   │   │   └── .stat-content (DIV)
    │   │   │       ├── .stat-label (DIV): "Қаралды"
    │   │   │       └── #video-watch-time (DIV id): "0:00" ← ОБНОВЛЯЕТСЯ
    │   │   │
    │   │   └── .stat-item (DIV)
    │   │       ├── .stat-icon (DIV): "📈"
    │   │       └── .stat-content (DIV)
    │   │           ├── .stat-label (DIV): "Прогресс"
    │   │           └── #video-progress-percent (DIV id): "0%" ← ОБНОВЛЯЕТСЯ
    │   │
    │   ├── .progress-section (DIV)
    │   │   │
    │   │   ├── .progress-label (DIV flex между)
    │   │   │   ├── SPAN: "Жалпы қарау уақыты"
    │   │   │   └── #video-duration-display (SPAN id): "--:--" ← ОБНОВЛЯЕТСЯ
    │   │   │
    │   │   └── .progress-bar-container (DIV)
    │   │       └── #video-progress-bar (DIV id) ← ОБНОВЛЯЕТСЯ WIDTH
    │   │           └── .progress-bar-fill (div внутри)
    │   │               └── [анимированная полоска]
    │   │
    │   └── .tracking-hint (DIV)
    │       └── .tracking-status (SPAN)
    │           ├── #tracking-status-indicator (SPAN id): "●"
    │           │   └── класс .active (когда видео проигрывается)
    │           │       └── анимация: pulse (пульсирует)
    │           │
    │           └── #tracking-status-text (SPAN id): "Ожидание видео..."
    │
    ├── .files-container (DIV flex)
    │   └── .file-btn (A링크) x N файлов
    │       ├── SPAN: "📥"
    │       └── "slides.pdf"
    │
    └── .back-btn (BUTTON onclick)
        └── "← Артқа қайту"
```

---

## Классы CSS и их назначение

```
КОНТЕЙНЕРЫ (структура)
├── .lesson-card_item          - основной контейнер урока
├── .video-wrapper             - контейнер для iframe (16:9)
├── .video-tracking-container  - контейнер отслеживания
├── .lesson-meta               - информация (дата, время)
├── .files-container           - контейнер файлов
│
СЕТКА И РАСКЛАДКА
├── .tracking-stats            - grid 2 колонки (адаптивный)
├── .stat-item                 - элемент в сетке (flex)
├── .progress-label            - метка с пробелом между
├── .progress-section          - секция прогресса
│
ТЕКСТОВЫЕ ЭЛЕМЕНТЫ
├── .lesson-category           - категория урока
├── .lesson-title              - заголовок урока
├── .lesson-description        - описание урока
├── .meta-item                 - элемент мета (дата/время)
├── .stat-label                - подпись показателя (малый текст)
├── .stat-value                - значение показателя (крупный)
├── .tracking-title            - заголовок отслеживания
├── .stat-icon                 - иконка показателя
│
ПРОГРЕСС И ИНДИКАТОРЫ
├── .progress-bar-container    - фон прогресса (серый)
├── .progress-bar-fill         - активная полоса (зеленая)
├── .status-indicator          - точка статуса
│   └── .active                - класс когда видео проигрывается
├── .tracking-status           - блок статуса (со статусом)
│
КНОПКИ И ССЫЛКИ
├── .file-btn                  - кнопка файла (белая, hover эффект)
├── .back-btn                  - кнопка назад
```

---

## ID элементов и их функции

```
УПРАВЛЕНИЕ ВИДЕО
├── #tab-item-lesson                    - контейнер урока
│   └── Функция: Содержит весь контент урока
│   └── Кто обновляет: openLesson()
│
├── #my-youtube-player                  - iframe видео
│   └── Функция: YouTube плеер
│   └── Кто создает: openLesson() → innerHTML
│   └── Кто управляет: YouTube API
│
ОТСЛЕЖИВАНИЕ ВРЕМЕНИ (обновляется каждую секунду)
├── #video-watch-time                   - просмотренное время (MM:SS)
│   └── Функция: Показывает "12:45"
│   └── Кто обновляет: updateTrackingUI() каждую секунду
│   └── Источник данных: totalSecondsWatched
│   └── Форматирование: formatTime()
│
├── #video-progress-percent             - процент просмотра
│   └── Функция: Показывает "87%"
│   └── Кто обновляет: updateTrackingUI() каждую секунду
│   └── Расчет: (totalSecondsWatched / videoDuration) * 100
│
├── #video-duration-display             - общая длительность
│   └── Функция: Показывает "--:--" → "14:30"
│   └── Кто обновляет: updateTrackingUI()
│   └── Источник данных: videoDuration (от YouTube API)
│   └── Форматирование: formatTime()
│
├── #video-progress-bar                 - полоска прогресса
│   └── Функция: Визуальная полоска (0% → 100%)
│   └── Кто обновляет: updateTrackingUI() каждую секунду
│   └── Атрибут: style.width = "0%" до "100%"
│   └── CSS: linear-gradient зеленый
│
СТАТУС И ИНДИКАТОРЫ
├── #tracking-status-indicator          - точка статуса
│   └── Функция: Показывает активность воспроизведения
│   └── Внешний вид: 6x6px круг
│   └── Состояния:
│       ├── Серая по умолчанию (нет класса .active)
│       ├── Зеленая с пульсацией при класс .active
│   └── Кто обновляет: updateStatusIndicator(boolean)
│   └── Когда обновляется: onPlayerStateChange()
│
├── #tracking-status-text               - текст статуса
│   └── Функция: Показывает что происходит
│   └── Возможные значения:
│       ├── "Ожидание видео..." - начало
│       ├── "▶ Видео проигрывается" - при Play
│       ├── "⏸ Видео на паузе" - при Pause
│   └── Кто обновляет: updateTrackingUI()
```

---

## Поток обновления DOM

```
ИНИЦИАЛИЗАЦИЯ (одноразово при открытии)
┌─────────────────────────────────────┐
│ openLesson(name)                    │
│  └─ Генерирует весь HTML            │
│     └─ container.innerHTML = ...    │
│        └─ #tab-item-lesson ЗАПОЛНЯЕТСЯ
│
│ initializeVideoTracking(name)        │
│  └─ Находит #my-youtube-player      │
│  └─ Создает YouTube плеер           │
│  └─ Подключает обработчики         │
└─────────────────────────────────────┘
                ↓
         YouTube API Event
                ↓
PLAY (пользователь нажимает Play)
┌─────────────────────────────────────┐
│ onPlayerStateChange(PLAYING)        │
│  └─ startTracking()                │
│     └─ setInterval(1000ms)         │
│        └─ totalSecondsWatched++     │
│        └─ updateTrackingUI()        │
│           ├─ #video-watch-time      │
│           ├─ #video-progress-percent
│           ├─ #video-duration-display
│           ├─ #video-progress-bar    │
│           └─ formatTime()           │
│                                     │
│  └─ updateStatusIndicator(true)     │
│     └─ #tracking-status-indicator   │
│        └─ add class .active         │
└─────────────────────────────────────┘
                ↓
           каждую секунду
           (пока не Pause)
                ↓
PAUSE (пользователь нажимает Pause)
┌─────────────────────────────────────┐
│ onPlayerStateChange(PAUSED)         │
│  └─ stopTracking()                 │
│     └─ clearInterval()              │
│     └─ saveWatchStats()             │
│        └─ localStorage.setItem()    │
│                                     │
│  └─ updateStatusIndicator(false)    │
│     └─ #tracking-status-indicator   │
│        └─ remove class .active      │
└─────────────────────────────────────┘
```

---

## Зависимости между элементами

```
#video-watch-time
├── ЗАВИСИТ ОТ:
│   ├── totalSecondsWatched (переменная)
│   ├── formatTime() (функция)
│   └── updateTrackingUI() (функция)
├── ОБНОВЛЯЕТСЯ:
│   ├── Каждую секунду при Play
│   └── При onPlayerReady()
└── ВЛИЯЕТ НА:
    └── #video-progress-percent (через % расчет)

#video-progress-percent
├── ЗАВИСИТ ОТ:
│   ├── totalSecondsWatched (переменная)
│   ├── videoDuration (переменная)
│   └── updateTrackingUI() (функция)
├── ОБНОВЛЯЕТСЯ:
│   ├── Каждую секунду при Play
│   └── Только если videoDuration > 0
└── ВЛИЯЕТ НА:
    └── #video-progress-bar (пересчитывает %)

#video-duration-display
├── ЗАВИСИТ ОТ:
│   ├── videoDuration (переменная)
│   ├── formatTime() (функция)
│   └── onPlayerReady() (событие)
├── ОБНОВЛЯЕТСЯ:
│   └── Один раз при готовности плеера
└── СТАТИЧЕН:
    └── Не меняется после инициализации

#video-progress-bar
├── ЗАВИСИТ ОТ:
│   ├── #video-progress-percent (вычисляется из него)
│   ├── style.width (CSS атрибут)
│   └── updateTrackingUI() (функция)
├── ОБНОВЛЯЕТСЯ:
│   └── Каждую секунду при Play
└── ВИЗУАЛЬНО:
    └── Расширяется слева направо от 0% до 100%

#tracking-status-indicator
├── ЗАВИСИТ ОТ:
│   ├── currentPlayer.getPlayerState() (YouTube API)
│   └── updateStatusIndicator() (функция)
├── ОБНОВЛЯЕТСЯ:
│   └── При onPlayerStateChange() (Play/Pause/End)
└── ВИЗУАЛЬНО:
    ├── Серая (без класса .active)
    └── Зеленая с пульсацией (класс .active)

#tracking-status-text
├── ЗАВИСИТ ОТ:
│   ├── currentPlayer.getPlayerState() (YouTube API)
│   └── updateTrackingUI() (функция)
├── ОБНОВЛЯЕТСЯ:
│   └── При каждом вызове updateTrackingUI()
└── СОДЕРЖИТ:
    ├── "Ожидание видео..."
    ├── "▶ Видео проигрывается"
    └── "⏸ Видео на паузе"
```

---

## Временная шкала жизненного цикла

```
МОМЕНТ 0: Загрузка страницы
└─ course_content.js загружается
   ├─ item_lessons инициализируется
   ├─ YouTube API script добавляется в DOM
   └─ Все функции готовы

МОМЕНТ 1: Пользователь кликает на урок
└─ openLesson("название")
   ├─ Генерируется HTML (весь контент)
   ├─ #tab-item-lesson ЗАПОЛНЯЕТСЯ
   ├─ CSS стили применяются
   └─ initializeVideoTracking("название")

МОМЕНТ 2: YouTube API загружается (асинхронно)
└─ onYouTubeIframeAPIReady()
   └─ YT объект доступен

МОМЕНТ 3: Плеер инициализируется
└─ new YT.Player('my-youtube-player')
   └─ onPlayerReady() вызывается
      ├─ videoDuration получается
      └─ updateTrackingUI() в первый раз
         ├─ #video-duration-display обновляется
         └─ Остальные элементы обновляются (0:00, 0%, и т.д.)

МОМЕНТ 4: Пользователь нажимает Play
└─ onPlayerStateChange(PLAYING)
   ├─ startTracking() стартует
   │  └─ setInterval каждую секунду:
   │     ├─ totalSecondsWatched++
   │     ├─ updateTrackingUI()
   │     │  └─ Обновить все элементы
   │     └─ Каждые 5 сек: saveWatchStats()
   │        └─ localStorage.setItem()
   └─ updateStatusIndicator(true)
      └─ #tracking-status-indicator.add('active')
         └─ Точка становится зеленой и пульсирует

МОМЕНТ 5-N: Видео проигрывается
└─ (интервал работает каждую секунду)
   ├─ #video-watch-time: "0:01" → "0:02" → ... → "12:45"
   ├─ #video-progress-percent: "0%" → "1%" → ... → "100%"
   ├─ #video-progress-bar: width "0%" → "1%" → ... → "100%"
   └─ #tracking-status-text: "▶ Видео проигрывается"

МОМЕНТ M: Пользователь нажимает Pause
└─ onPlayerStateChange(PAUSED)
   ├─ stopTracking()
   │  ├─ clearInterval() (интервал остановлен)
   │  └─ saveWatchStats() (финальное сохранение)
   │     └─ localStorage.setItem()
   └─ updateStatusIndicator(false)
      └─ #tracking-status-indicator.remove('active')
         └─ Точка становится серой

МОМЕНТ K: Пользователь закрывает страницу
└─ beforeunload event
   ├─ stopTracking()
   └─ saveWatchStats() (финальное сохранение)
      └─ localStorage.setItem()

МОМЕНТ L: Пользователь возвращается
└─ openLesson("название") (снова)
   └─ initializeVideoTracking("название")
      └─ localStorage.getItem("video_название")
         ├─ Данные восстановлены
         ├─ totalSecondsWatched = 245 (сохраненное значение)
         └─ updateTrackingUI()
            └─ Все элементы обновлены с восстановленными данными
```

---

## Переменные и их связь

```
СОСТОЯНИЕ ВИДЕО
┌──────────────────┐
│ currentLesson    │ ← какой урок открыт
│ "Название..."   │   (используется везде как ключ)
└──────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│ videoWatchStats[currentLesson]                   │
│ {                                                │
│   totalSeconds: 245,      ← основное значение   │
│   watchedAt: "...",       ← когда просматрелось │
│   lessonName: "..."       ← копия названия      │
│ }                                                │
└──────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ (рабочие)                  │
├──────────────────────────────────────────────────┤
│                                                  │
│ totalSecondsWatched = 245   ← текущее время     │
│                                                  │
│ videoDuration = 870         ← длина видео       │
│ (получена от YouTube API)                        │
│                                                  │
│ timerInterval = 12345       ← ID интервала      │
│ (для clearInterval)                              │
│                                                  │
│ currentPlayer               ← YouTube плеер     │
│ (объект YT.Player)                               │
│                                                  │
│ videoStartTime = Date()     ← когда началось   │
│                                                  │
└──────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│ ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ (в updateTrackingUI)       │
├──────────────────────────────────────────────────┤
│                                                  │
│ watched_str = formatTime(245)  = "4:05"         │
│   → #video-watch-time                           │
│                                                  │
│ duration_str = formatTime(870) = "14:30"        │
│   → #video-duration-display                     │
│                                                  │
│ percent = (245 / 870) * 100   = "28.1%"         │
│   → #video-progress-percent                     │
│   → #video-progress-bar width                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## CSS классы и их состояния

```
.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;  ← СЕРАЯ (по умолчанию)
}

.status-indicator.active {
  background: #10b981;  ← ЗЕЛЕНАЯ
  animation: pulse 2s infinite;  ← ПУЛЬСИРУЕТ
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

```
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  transition: width 0.3s ease;
  width: 0%;  ← ДИНАМИЧЕСКОЕ ЗНАЧЕНИЕ
}
```

```
.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;  ← ЗЕЛЕНЫЙ ЦВЕТ
  font-family: 'Courier New', monospace;  ← МОНОФОНТ ДЛЯ ЧИСЕЛ
}
```

---

## Сводная таблица отслеживания

| Элемент | Обновляется | Источник | Частота | Начальное значение |
|---------|-----------|---------|--------|-----------------|
| #video-watch-time | updateTrackingUI() | totalSecondsWatched | Кажду сек | "0:00" |
| #video-progress-percent | updateTrackingUI() | totalSecondsWatched/videoDuration | Кажду сек | "0%" |
| #video-duration-display | updateTrackingUI() + onPlayerReady | videoDuration | Один раз | "--:--" |
| #video-progress-bar | updateTrackingUI() | (total/duration)*100 | Кажду сек | "0%" |
| #tracking-status-indicator | updateStatusIndicator() | isPlaying | При Play/Pause | (серая) |
| #tracking-status-text | updateTrackingUI() | playerState | При изменении | "Ожидание..." |
