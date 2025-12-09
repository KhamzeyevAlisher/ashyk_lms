# 📚 Документация: Система отслеживания времени просмотра видео

## 📋 Содержание
1. [HTML структура](#html-структура)
2. [JavaScript функции](#javascript-функции)
3. [localStorage ключи](#localstorage-ключи)
4. [YouTube API события](#youtube-api-события)
5. [Примеры использования](#примеры-использования)

---

## HTML Структура

### Контейнеры

#### `#tab-item-lesson`
**Тип:** ID контейнера  
**Назначение:** Основной контейнер для отображения урока  
**Местоположение:** student_dashboard.html  
**Содержит:** Всю информацию об уроке (видео, описание, файлы, отслеживание)

```html
<div id="tab-item-lesson"></div>
```

#### `#my-youtube-player`
**Тип:** ID iframe элемента  
**Назначение:** iframe для YouTube видео  
**Создается:** Динамически функцией `openLesson()`  
**Используется:** YouTube API для контроля воспроизведения и получения длительности

```html
<iframe id="my-youtube-player" src="https://www.youtube.com/embed/..."></iframe>
```

---

### Классы для стилизации

#### `.video-wrapper`
**Назначение:** Контейнер для видео iframe  
**Стили:** Поддерживает соотношение 16:9, черный фон, скругленные углы

```html
<div class="video-wrapper">
  <iframe id="my-youtube-player" ...></iframe>
</div>
```

#### `.video-tracking-container`
**Назначение:** Основной контейнер для блока отслеживания  
**Стили:** Серый фон, граница, отступы

```html
<div class="video-tracking-container">
  <!-- содержит все элементы отслеживания -->
</div>
```

#### `.tracking-title`
**Назначение:** Заголовок блока отслеживания ("📊 Қарау уақыты")  
**Стили:** Маленький размер, жирный, прописные буквы

```html
<div class="tracking-title">📊 Қарау уақыты</div>
```

#### `.tracking-stats`
**Назначение:** Контейнер для двух основных показателей (время и прогресс)  
**Стили:** Grid с двумя колонками (адаптивный на мобилях)

```html
<div class="tracking-stats">
  <div class="stat-item">...</div>
  <div class="stat-item">...</div>
</div>
```

#### `.stat-item`
**Назначение:** Отдельный показатель (время или прогресс)  
**Стили:** Flexbox контейнер с иконкой и текстом

```html
<div class="stat-item">
  <div class="stat-icon">⏱️</div>
  <div class="stat-content">
    <div class="stat-label">Қаралды</div>
    <div class="stat-value" id="video-watch-time">0:00</div>
  </div>
</div>
```

#### `.progress-section`
**Назначение:** Контейнер для прогресс-бара с подписью  
**Стили:** Отступ сверху, граница сверху

```html
<div class="progress-section">
  <!-- прогресс-бар и подпись -->
</div>
```

#### `.progress-bar-container`
**Назначение:** Фоновый контейнер прогресс-бара  
**Стили:** Серый фон, высота 6px, скругленные углы

```html
<div class="progress-bar-container">
  <div class="progress-bar-fill"></div>
</div>
```

#### `.progress-bar-fill`
**Назначение:** Визуальная полоска прогресса (динамическая ширина)  
**Стили:** Зеленый градиент, скругленные углы, анимация

```html
<div class="progress-bar-fill" id="video-progress-bar" style="width: 0%;"></div>
```

#### `.tracking-hint`
**Назначение:** Секция подсказок и статуса  
**Стили:** Маленький текст, граница сверху, flexbox

```html
<div class="tracking-hint">
  <span class="tracking-status">...</span>
</div>
```

#### `.tracking-status`
**Назначение:** Блок со статусом воспроизведения  
**Стили:** Светлый фон, маленький размер, скругленные углы

```html
<span class="tracking-status">
  <span class="status-indicator" id="tracking-status-indicator"></span>
  <span id="tracking-status-text">Ожидание видео...</span>
</span>
```

#### `.status-indicator`
**Назначение:** Цветная точка индикатора статуса  
**Стили:** Серая точка (6x6px), становится зеленой и пульсирует при воспроизведении
**Класс `.active`:** Добавляется при воспроизведении видео

```html
<span class="status-indicator" id="tracking-status-indicator"></span>
```

---

## ID Элементов (DOM)

### Элементы отслеживания времени

| ID | Назначение | Обновляется | Пример содержимого |
|----|-----------|-----------|-------------------|
| `#video-watch-time` | Просмотренное время | Каждую секунду | `12:45` |
| `#video-progress-percent` | Процент просмотра | Каждую секунду | `87%` |
| `#video-duration-display` | Общая длительность видео | При готовности плеера | `14:30` |
| `#video-progress-bar` | Прогресс-бар (ширина) | Каждую секунду | `width: 87%` |
| `#tracking-status-indicator` | Точка индикатора статуса | При изменении состояния | класс `.active` |
| `#tracking-status-text` | Текст статуса | При изменении состояния | `▶ Видео проигрывается` |
| `#my-youtube-player` | iframe видео | При открытии урока | YouTube плеер |
| `#tab-item-lesson` | Контейнер урока | При открытии | HTML контент урока |

---

## JavaScript Функции

### Главные функции

#### `openLesson(lessonName)`
**Описание:** Открывает урок и выводит видео с информацией  
**Параметры:**
- `lessonName` (string) - Название урока из `item_lessons`

**Действия:**
1. Получает данные урока из `item_lessons`
2. Обрабатывает iframe (добавляет ID)
3. Генерирует HTML контента
4. Вставляет в `#tab-item-lesson`
5. Инициализирует отслеживание видео

```javascript
openLesson("Менеджменттің мәні мен қағидалары");
```

#### `initializeVideoTracking(lessonName)`
**Описание:** Инициализирует отслеживание для конкретного видео  
**Параметры:**
- `lessonName` (string) - Название урока

**Действия:**
1. Загружает сохраненную статистику из localStorage
2. Находит iframe с ID `my-youtube-player`
3. Создает YouTube плеер через API
4. Подключает обработчики событий

```javascript
initializeVideoTracking("JavaScript-тегі ООП: Кластар және мұрагерлік");
```

---

### YouTube API Обработчики

#### `onYouTubeIframeAPIReady()`
**Вызывается:** Автоматически при загрузке YouTube API  
**Действия:** Готовит систему к инициализации плеера

```javascript
// Нельзя вызывать вручную, вызывается YouTube API
```

#### `onPlayerReady(event)`
**Вызывается:** Когда плеер готов к воспроизведению  
**Параметры:** `event` - объект события от YouTube API
**Действия:**
1. Получает длительность видео
2. Обновляет UI

```javascript
// Нельзя вызывать вручную, встроенное событие
```

#### `onPlayerStateChange(event)`
**Вызывается:** При изменении состояния плеера (play, pause, ended, buffering)  
**Параметры:** `event` - объект события с `event.data` (код состояния)
**Состояния:**
- `YT.PlayerState.PLAYING` (1) - видео воспроизводится
- `YT.PlayerState.PAUSED` (2) - видео на паузе
- `YT.PlayerState.ENDED` (0) - видео закончилось
- `YT.PlayerState.BUFFERING` (3) - идет буферизация

```javascript
// Нельconegаще вызывать вручную
```

#### `onPlayerError(event)`
**Вызывается:** При ошибке плеера  
**Параметры:** `event` - объект события с `event.data` (код ошибки)
**Коды ошибок:**
- `2` - invalid ID
- `5` - HTML5 player error
- `100` - video removed
- `101` - cannot embed

```javascript
// Нельзя вызывать вручную
```

---

### Функции отслеживания

#### `startTracking()`
**Описание:** Начинает счет времени просмотра  
**Действия:**
1. Останавливает предыдущий таймер
2. Создает интервал 1 секунда
3. Увеличивает счетчик
4. Обновляет UI
5. Сохраняет данные каждые 5 секунд

```javascript
startTracking(); // Вызывается автоматически при play
```

#### `stopTracking()`
**Описание:** Останавливает счет времени  
**Действия:**
1. Очищает интервал
2. Сохраняет статистику

```javascript
stopTracking(); // Вызывается автоматически при pause/ended
```

#### `updateTrackingUI(lessonName)`
**Описание:** Обновляет все элементы интерфейса отслеживания  
**Параметры:**
- `lessonName` (string) - название урока

**Обновляемые элементы:**
- `#video-watch-time` - просмотренное время
- `#video-progress-percent` - процент
- `#video-duration-display` - длительность
- `#video-progress-bar` - ширина прогресс-бара

```javascript
updateTrackingUI("JavaScript-тегі ООП: Кластар және мұрагерлік");
```

#### `updateStatusIndicator(isPlaying)`
**Описание:** Обновляет индикатор статуса (точка)  
**Параметры:**
- `isPlaying` (boolean) - true если видео проигрывается

**Действия:**
- Добавляет/убирает класс `.active` к элементу с ID `tracking-status-indicator`

```javascript
updateStatusIndicator(true);  // Видео проигрывается
updateStatusIndicator(false); // Видео на паузе
```

---

### Функции утилиты и хранилища

#### `formatTime(seconds)`
**Описание:** Преобразует секунды в формат MM:SS  
**Параметры:**
- `seconds` (number) - количество секунд

**Возвращает:** (string) форматированное время

```javascript
formatTime(123)   // "2:03"
formatTime(3661)  // "61:01"
```

#### `saveWatchStats(lessonName)`
**Описание:** Сохраняет статистику в localStorage  
**Параметры:**
- `lessonName` (string) - название урока

**Сохраняемые данные:**
```javascript
{
  totalSeconds: 245,
  watchedAt: "2025-12-09T10:30:00.000Z",
  lessonName: "JavaScript-тегі ООП: Кластар және мұрагерлік"
}
```

**localStorage ключ:** `video_<lessonName>`

```javascript
saveWatchStats("Менеджменттің мәні мен қағидалары");
```

#### `getAllWatchStats()`
**Описание:** Получает всю статистику просмотров  
**Параметры:** Нет
**Возвращает:** (object) объект с пример показано ниже

```javascript
const stats = getAllWatchStats();
console.log(stats);
// {
//   "Менеджменттің мәні мен қағидалары": {
//     totalSeconds: 245,
//     watchedAt: "2025-12-09T10:30:00.000Z",
//     lessonName: "Менеджменттің мәні мен қағидалары"
//   },
//   "JavaScript-тегі ООП: Кластар және мұрагерлік": {
//     totalSeconds: 512,
//     watchedAt: "2025-12-09T10:45:00.000Z",
//     lessonName: "JavaScript-тегі ООП: Кластар және мұрагерлік"
//   }
// }
```

#### `clearWatchStats(lessonName)`
**Описание:** Удаляет сохраненную статистику  
**Параметры:**
- `lessonName` (string или undefined) - название урока или пусто для удаления всех

**Действия:**
- Удаляет из localStorage
- Удаляет из переменной `videoWatchStats`

```javascript
clearWatchStats("JavaScript-тегі ООП: Кластар және мұрагерлік"); // Удалить одно видео
clearWatchStats(); // Удалить все
```

#### `exportWatchStats()`
**Описание:** Экспортирует статистику в JSON формате  
**Параметры:** Нет
**Возвращает:** (string) JSON строка

```javascript
const json = exportWatchStats();
console.log(json);
// Выведет отформатированный JSON в консоль
```

---

## localStorage Ключи

### Ключи для сохранения статистики видео

#### Формат ключа
```
video_<название урока>
```

#### Пример ключей
- `video_Менеджменттің мәні мен қағидалары`
- `video_JavaScript-тегі ООП: Кластар және мұрагерлік`

#### Формат значения
```json
{
  "totalSeconds": 245,
  "watchedAt": "2025-12-09T10:30:00.000Z",
  "lessonName": "Менеджменттің мәні мен қағидалары"
}
```

#### Где просмотреть
1. Откройте DevTools (F12)
2. Перейдите на вкладку "Application"
3. В левой панели: Storage → Local Storage → URL вашего сайта
4. Найдите ключи начинающиеся с `video_`

---

## YouTube API События

### Коды состояния плеера

| Код | Константа | Описание |
|-----|-----------|---------|
| -1 | `UNSTARTED` | Плеер не инициализирован |
| 0 | `ENDED` | Видео закончилось |
| 1 | `PLAYING` | Видео воспроизводится |
| 2 | `PAUSED` | Видео на паузе |
| 3 | `BUFFERING` | Идет буферизация |
| 5 | `CUED` | Видео готово (по умолчанию не проигрывается) |

### Поток событий

```
Загрузка плеера
    ↓
onReady → videoDuration получена
    ↓
Пользователь нажимает play
    ↓
onStateChange(PLAYING) → startTracking()
    ↓
Каждую секунду → updateTrackingUI()
    ↓
Пользователь нажимает pause
    ↓
onStateChange(PAUSED) → stopTracking()
    ↓
Пользователь закрывает страницу
    ↓
beforeunload → saveWatchStats()
```

---

## Примеры использования

### Пример 1: Открытие урока

```javascript
// Пользователь кликает на урок в списке
openLesson("JavaScript-тегі ООП: Кластар және мұрагерлік");

// Результат:
// 1. Видео загружается в #tab-item-lesson
// 2. Инициализируется отслеживание
// 3. Загружается сохраненная статистика
// 4. Отслеживание готово
```

### Пример 2: Проверка статистики в консоли

```javascript
// Откройте консоль в DevTools (F12)
const stats = getAllWatchStats();
console.log(stats);

// Результат: объект со всеми видео и временем просмотра
```

### Пример 3: Получение времени для конкретного видео

```javascript
const stats = getAllWatchStats();
const lessonName = "Менеджменттің мәні мен қағидалары";

if (stats[lessonName]) {
  const seconds = stats[lessonName].totalSeconds;
  const formatted = formatTime(seconds);
  console.log(`Видео ${lessonName}: ${formatted}`);
}
```

### Пример 4: Отправка статистики на сервер

```javascript
// После просмотра видео
const stats = getAllWatchStats();

fetch('/api/save-watch-stats', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(stats)
})
.then(response => response.json())
.then(data => console.log('Статистика сохранена на сервере'))
.catch(error => console.error('Ошибка:', error));
```

### Пример 5: Очистка статистики конкретного видео

```javascript
clearWatchStats("JavaScript-тегі ООП: Кластар және мұрагерлік");
console.log("Статистика очищена");

// Проверка
const stats = getAllWatchStats();
console.log(stats); // Видео больше не будет в списке
```

---

## Глобальные переменные

| Переменная | Тип | Назначение |
|-----------|-----|-----------|
| `currentPlayer` | YT.Player | Объект YouTube плеера |
| `timerInterval` | number | ID интервала счета |
| `totalSecondsWatched` | number | Текущее время просмотра (сек) |
| `videoStartTime` | Date | Время начала воспроизведения |
| `videoDuration` | number | Длительность видео (сек) |
| `currentLesson` | string | Название текущего урока |
| `videoWatchStats` | object | Статистика всех видео |
| `item_lessons` | object | База данных уроков |

---

## Диаграмма взаимодействия

```
┌─────────────────────────────────────────────────────────────┐
│                    ПОЛЬЗОВАТЕЛЬ                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ кликает на урок
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           openLesson(lessonName)                            │
│  - Получает данные урока из item_lessons                   │
│  - Генерирует HTML видео и информацию                      │
│  - Вставляет в #tab-item-lesson                            │
│  - Вызывает initializeVideoTracking()                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│       initializeVideoTracking(lessonName)                   │
│  - Загружает статистику из localStorage                    │
│  - Ищет iframe #my-youtube-player                          │
│  - Создает YouTube плеер через API                         │
│  - Подключает обработчики событий                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ YouTube API загружен
                         ↓
┌─────────────────────────────────────────────────────────────┐
│            onYouTubeIframeAPIReady()                        │
│  - API готов                                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Плеер инициализирован
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              onPlayerReady(event)                           │
│  - Получает videoDuration                                  │
│  - Обновляет UI                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Пользователь нажимает play
                         ↓
┌─────────────────────────────────────────────────────────────┐
│         onPlayerStateChange(PLAYING)                        │
│  - Вызывает startTracking()                                │
│  - updateStatusIndicator(true)                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│         Интервал каждую секунду (1000ms)                   │
│  - totalSecondsWatched++                                   │
│  - updateTrackingUI()  ← обновляет DOM                     │
│    - #video-watch-time                                     │
│    - #video-progress-percent                               │
│    - #video-progress-bar                                   │
│  - Каждые 5 сек: saveWatchStats() ← в localStorage        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Пользователь нажимает pause
                         ↓
┌─────────────────────────────────────────────────────────────┐
│         onPlayerStateChange(PAUSED)                         │
│  - Вызывает stopTracking()                                 │
│  - updateStatusIndicator(false)                            │
│  - saveWatchStats()                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Пользователь закрывает страницу
                         ↓
┌─────────────────────────────────────────────────────────────┐
│         beforeunload event                                  │
│  - stopTracking()                                          │
│  - saveWatchStats() ← финальное сохранение                │
└─────────────────────────────────────────────────────────────┘
```

---

## Проверка список

- ✅ HTML контейнеры и ID элементов документированы
- ✅ CSS классы описаны с примерами
- ✅ Все функции объяснены с параметрами и действиями
- ✅ YouTube API события описаны
- ✅ localStorage структура документирована
- ✅ Примеры использования предоставлены
- ✅ Диаграмма взаимодействия показана
