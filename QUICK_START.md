# ⚡ Быстрый старт: Система отслеживания видео

## 🎯 Что это?

Система автоматически отслеживает время просмотра YouTube видео в браузере пользователя. Данные сохраняются локально в `localStorage`.

---

## 📦 Файлы проекта

| Файл | Назначение |
|------|-----------|
| `course_content.js` | Основная логика отслеживания |
| `student_dashboard.html` | HTML с CSS и интеграцией |
| `TRACKING_DOCUMENTATION.md` | **📚 Полная документация** |
| `QUICK_REFERENCE.json` | Справочник ID и функций |
| `TESTING_GUIDE.md` | Примеры тестирования |
| `ARCHITECTURE.md` | Архитектура системы |

---

## 🚀 Как использовать

### 1. Открыть видео урока

```javascript
openLesson("Название урока");
```

**Что происходит:**
- Видео загружается на экран
- Начинает работать отслеживание времени
- Отображается блок с информацией о просмотре

### 2. Пользователь смотрит видео

- Нажимает **Play** → счет начинается
- Нажимает **Pause** → счет приостанавливается
- Закрывает страницу → данные автоматически сохраняются

### 3. Получить статистику

```javascript
// В консоли браузера (F12)
const stats = getAllWatchStats();
console.log(stats);
```

**Результат:**
```json
{
  "Название урока": {
    "totalSeconds": 245,
    "watchedAt": "2025-12-09T10:30:00.000Z"
  }
}
```

---

## 🎨 Что видит пользователь

```
┌─────────────────────────────────┐
│ 📊 Қарау уақыты                 │
├─────────────────────────────────┤
│                                 │
│ ⏱️ Қаралды        📈 Прогресс   │
│ 12:45              87%          │
│                                 │
│ Жалпы қарау уақыты      --:--   │
│ [═══════════════>───] 87%        │
│                                 │
│ ● Видео проигрывается          │
│                                 │
└─────────────────────────────────┘
```

**Элементы:**
- **Қаралды** - сколько секунд уже просмотрено
- **Прогресс** - в процентах от видео
- **Прогресс-бар** - визуальная полоска
- **Индикатор** - пульсирует во время просмотра

---

## 📱 ID элементов (для CSS/JS)

```html
<!-- Основной контейнер -->
<div id="tab-item-lesson">
  <!-- Видео iframe -->
  <div class="video-wrapper">
    <iframe id="my-youtube-player" ...></iframe>
  </div>

  <!-- Блок отслеживания -->
  <div class="video-tracking-container">
    <!-- Время -->
    <div id="video-watch-time">0:00</div>
    
    <!-- Процент -->
    <div id="video-progress-percent">0%</div>
    
    <!-- Длительность -->
    <span id="video-duration-display">--:--</span>
    
    <!-- Прогресс-бар -->
    <div id="video-progress-bar" style="width: 0%;"></div>
    
    <!-- Индикатор статуса -->
    <span id="tracking-status-indicator"></span>
    <span id="tracking-status-text">Ожидание видео...</span>
  </div>
</div>
```

---

## 🔧 Главные функции

### Управление

| Функция | Описание |
|---------|---------|
| `openLesson(name)` | Открыть видео урок |
| `initializeVideoTracking(name)` | Инициализировать отслеживание |

### Данные

| Функция | Описание |
|---------|---------|
| `getAllWatchStats()` | Получить всю статистику |
| `clearWatchStats(name)` | Удалить статистику видео |
| `exportWatchStats()` | Экспортировать в JSON |

### Утилиты

| Функция | Описание |
|---------|---------|
| `formatTime(sec)` | Секунды → "MM:SS" |

---

## 💾 localStorage

**Где:** DevTools (F12) → Application → Local Storage

**Ключ:** `video_<название урока>`

**Пример значения:**
```json
{
  "totalSeconds": 245,
  "watchedAt": "2025-12-09T10:30:00.000Z",
  "lessonName": "Менеджменттің мәні мен қағидалары"
}
```

**Как очистить:**
```javascript
clearWatchStats("Название урока");
```

---

## 🧪 Проверить работу

### Шаг 1: Открыть видео
```javascript
openLesson("Менеджменттің мәні мен қағидалары");
```

### Шаг 2: Нажать Play

### Шаг 3: Подождать 10 секунд

### Шаг 4: Проверить в консоли
```javascript
document.getElementById('video-watch-time').textContent
// Должно быть: "0:10" или близко к этому
```

### Шаг 5: Проверить localStorage
```javascript
localStorage.getItem('video_Менеджменттің мәні мен қағидалары')
// Должна быть JSON строка с тимеоутом
```

---

## 🌐 Интеграция с бэкендом

Если нужно отправить данные на сервер:

```javascript
// После просмотра
const stats = getAllWatchStats();

fetch('/api/save-watch-stats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(stats)
})
.then(res => res.json())
.then(data => console.log('Сохранено!'));
```

---

## 🎓 Примеры использования

### Получить время для одного видео
```javascript
const stats = getAllWatchStats();
const time = stats["Менеджменттің мәні мен қағидалары"]?.totalSeconds;
console.log(formatTime(time));
```

### Проверить если видео полностью просмотрено
```javascript
const stats = getAllWatchStats();
const lesson = "JavaScript-тегі ООП: Кластар және мұрагерлік";
const isFullyWatched = stats[lesson]?.totalSeconds >= videoDuration;
console.log(isFullyWatched ? "Просмотрено полностью" : "Не полностью");
```

### Получить все видео с сортировкой
```javascript
const stats = getAllWatchStats();
const sorted = Object.entries(stats)
  .sort((a, b) => b[1].totalSeconds - a[1].totalSeconds)
  .map(([name, data]) => ({
    name,
    time: formatTime(data.totalSeconds),
    date: new Date(data.watchedAt).toLocaleDateString('ru-RU')
  }));
console.table(sorted);
```

---

## ⚙️ Переменные состояния

Глобальные переменные которые отслеживают состояние:

```javascript
currentPlayer        // YouTube плеер объект
timerInterval        // ID интервала (или null)
totalSecondsWatched  // Текущее время (сек)
videoDuration        // Длительность видео (сек)
currentLesson        // Название текущего урока
videoWatchStats      // Кеш статистики в памяти
```

---

## 🐛 Частые вопросы

**Q: Где хранятся данные?**  
A: В `localStorage` браузера. Ключи начинаются с `video_`

**Q: Как отправить на сервер?**  
A: Используйте `getAllWatchStats()` и `fetch()` для POST запроса

**Q: Что если пользователь очистит браузер?**  
A: Данные удалятся из localStorage. Используйте серверное хранилище для надежности

**Q: Как ограничить максимум видео?**  
A: Отредактируйте `item_lessons` объект в `course_content.js`

**Q: Работает ли на мобильных?**  
A: Да, YouTube API работает везде где есть браузер

---

## 📚 Документация

- **Полная документация**: `TRACKING_DOCUMENTATION.md`
- **Архитектура**: `ARCHITECTURE.md`
- **Примеры тестирования**: `TESTING_GUIDE.md`
- **Справочник**: `QUICK_REFERENCE.json`

---

## ✅ Чек-лист

- ✅ Видео загружается и проигрывается
- ✅ Отслеживание начинается при Play
- ✅ Отслеживание останавливается при Pause
- ✅ UI обновляется каждую секунду
- ✅ Данные сохраняются в localStorage
- ✅ Статистика загружается при перезагрузке
- ✅ Функции работают из консоли браузера
- ✅ Нет ошибок в консоли браузера

---

## 🎯 Следующие шаги

1. **Открыть видео:** `openLesson("название")`
2. **Тестировать:** Нажать Play и проверить UI
3. **Проверить данные:** `getAllWatchStats()`
4. **Прочитать документацию:** `TRACKING_DOCUMENTATION.md`
5. **Интегрировать с бэкендом:** Отправлять данные на сервер (опционально)

---

## 📞 Поддержка

Если что-то не работает:

1. Откройте DevTools (F12)
2. Посмотрите консоль на ошибки
3. Проверьте наличие всех ID элементов
4. Убедитесь что YouTube API загружен: `console.log(typeof YT)`
5. Посмотрите `TESTING_GUIDE.md` для примеров отладки
