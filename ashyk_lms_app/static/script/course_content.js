/**
 * ====================================
 * БАЗА ДАННЫХ УРОКОВ
 * ====================================
 * Содержит информацию о всех видео уроках
 * Структура: название урока => объект с данными урока
 */
let item_lessons = {
  "Менеджменттің мәні мен қағидалары": {
    category: "Менеджмент негіздері",
    description: "Менеджменттің негізгі түсініктері, мақсаттары және басқару қағидалары туралы кіріспе сабақ.",
    duration: "45 мин",
    date: "01.12.2025",
    iframe: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/aqZ_qz7vkjk?enablejsapi=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
    files: [
      { name: "slides.pdf", url: "#" },
      { name: "glossary.docx", url: "#" }
    ]
  },
  "JavaScript-тегі ООП: Кластар және мұрагерлік": {
    category: "javascript",
    description: "Бұл сабақта JavaScript тіліндегі объектіге бағытталған бағдарламалаудың негізгі концепциялары қарастырылады, соның ішінде кластар мен мұрагерлік.",
    duration: "50 мин",
    date: "05.12.2025",
    iframe: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/H-Uwil_2qH0?enablejsapi=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
    files: [
      { name: "oop_examples.zip", url: "#" }
    ]
  }
};


/**
 * ====================================
 * ФУНКЦИЯ ОТКРЫТИЯ УРОКА
 * ====================================
 * Отвечает за отображение видео урока с информацией и файлами
 * 
 * @param {string} lessonName - Название урока (должно совпадать с ключом в item_lessons)
 * 
 * DOM элементы, с которыми взаимодействует:
 * - #tab-item-lesson (id) - контейнер для вывода урока
 */
function openLesson(lessonName) {
  const container = document.getElementById('tab-item-lesson');
  const lesson = item_lessons[lessonName];

  // Проверка: найден ли урок в базе данных
  if (!lesson) {
    console.error("Сабақ табылмады / Урок не найден");
    return;
  }

  // ========== ОБРАБОТКА ВИДЕО IFRAME ==========
  let videoEmbedHTML = "";

  // Способ 1: готовый iframe код в объекте урока
  if (lesson.iframe) {
    videoEmbedHTML = lesson.iframe;
    // Добавляем ID для работы YouTube API
    videoEmbedHTML = videoEmbedHTML.replace('<iframe', '<iframe id="my-youtube-player" ');
  } 
  // Способ 2: ссылка на видео (если нужно извлечь ID)
  else if (lesson.link) {
    let videoId = "";
    const link = lesson.link;

    // Проверяем полную URL ссылку (с http/https)
    if (link.includes("http")) {
      try {
        const urlObj = new URL(link);
        if (urlObj.hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get("v");
        }
      } catch (e) {
        console.error("Ошибка парсинга URL", e);
      }
    } 
    // Если просто ID или "ID?параметры"
    else {
      videoId = link.split('?')[0];
    }

    // Генерируем iframe если ID найден
    if (videoId) {
      videoEmbedHTML = `
        <iframe 
          id="my-youtube-player"
          src="https://www.youtube.com/embed/${videoId}" 
          title="YouTube video player" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen>
        </iframe>
      `;
    } else {
      videoEmbedHTML = '<p>Видео жүктелмеді (ID қате)</p>';
    }
  }

  // ========== ПОДГОТОВКА ДАННЫХ ==========
  const category = lesson.category || "Жалпы курс";
  const desc = lesson.description || "";
  const date = lesson.date || "";
  const duration = lesson.duration || "";

  // Генерируем HTML для файлов
  let filesHtml = '';
  if (lesson.files && lesson.files.length > 0) {
    filesHtml = lesson.files.map(f => `
      <a href="${f.url}" class="file-btn" target="_blank">
        <span>📥</span> ${f.name}
      </a>
    `).join('');
  }

  // ========== СБОРКА ФИНАЛЬНОГО HTML ==========
  const contentHTML = `
    <div class="lesson-card_item"> 
      <span class="lesson-category">${category}</span>
      <h1 class="lesson-title">${lessonName}</h1>
      <p class="lesson-description">${desc}</p>

      <!-- Мета информация (время, дата) -->
      <div class="lesson-meta">
        <div class="meta-item">
          <span>🕒</span> ${duration}
        </div>
        <div class="meta-item">
          <span>📅</span> ${date}
        </div>
      </div>

      <!-- Контейнер для видео -->
      <div class="video-wrapper">
        ${videoEmbedHTML}
      </div>

      <!-- БЛОК ОТСЛЕЖИВАНИЯ ВРЕМЕНИ ПРОСМОТРА ВИДЕО -->
      <div class="video-tracking-container">
        <div class="tracking-title">📊 Қарау уақыты</div>
        
        <!-- Два основных показателя: время просмотра и прогресс -->
        <div class="tracking-stats">
          <div class="stat-item">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-label">Қаралды</div>
              <div class="stat-value" id="video-watch-time">0:00</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <div class="stat-label">Прогресс</div>
              <div class="stat-value" id="video-progress-percent">0%</div>
            </div>
          </div>
        </div>

        <!-- Прогресс бар с длительностью видео -->
        <div class="progress-section">
          <div class="progress-label">
            <span>Жалпы қарау уақыты</span>
            <span id="video-duration-display">--:--</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" id="video-progress-bar" style="width: 0%;"></div>
          </div>
        </div>
      </div>

      <!-- Кнопки для скачивания файлов -->
      <div class="files-container">
        ${filesHtml}
      </div>

      <!-- Кнопка возврата в список уроков -->
      <button class="back-btn" onclick="openTab('lessons-list')">← Артқа қайту</button>
    </div>
  `;

  // Вставляем HTML в контейнер
  container.innerHTML = contentHTML;

  // Переключаемся на вкладку с уроком
  if (typeof openTab === "function") {
    openTab('item-lesson');
  } else {
    container.classList.remove('hidden');
  }

  // Инициализируем отслеживание видео после отрисовки DOM
  setTimeout(() => {
    initializeVideoTracking(lessonName);
  }, 100);
}



/**
 * ====================================
 * ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ОТСЛЕЖИВАНИЯ ВИДЕО
 * ====================================
 */

// YouTube плеер объект
let currentPlayer = null;

// Интервал для счета времени просмотра
let timerInterval = null;

// Общее время просмотра текущего видео (в секундах)
let totalSecondsWatched = 0;

// Время начала воспроизведения видео
let videoStartTime = null;

// Длительность видео (в секундах)
let videoDuration = 0;

// Название текущего урока
let currentLesson = null;

// Объект для хранения статистики просмотров по каждому видео
// Структура: "lesson_name" => { totalSeconds, watchedAt, lessonName }
let videoWatchStats = {};

/**
 * ====================================
 * ЗАГРУЗКА YouTube API
 * ====================================
 * Подключает глобальный YouTube IFrame API для работы с видеоплеером
 */
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

/**
 * ====================================
 * КОЛЛБЭК YOUTUBE API
 * ====================================
 * Вызывается автоматически при загрузке YouTube API
 * Здесь инициализация произойдет при открытии урока
 */
function onYouTubeIframeAPIReady() {
  // API готов, инициализация произойдет при открытии урока в initializeVideoTracking()
  console.log('YouTube IFrame API готов');
}

/**
 * ====================================
 * ИНИЦИАЛИЗАЦИЯ ОТСЛЕЖИВАНИЯ ВИДЕО
 * ====================================
 * Запускается после открытия урока
 * Загружает сохраненную статистику и инициализирует плеер
 * 
 * @param {string} lessonName - Название урока
 * 
 * DOM элементы, с которыми взаимодействует:
 * - #my-youtube-player (id) - iframe элемент видео
 */
function initializeVideoTracking(lessonName) {
  currentLesson = lessonName;
  
  // Загружаем сохраненное время просмотра из localStorage
  const savedStats = localStorage.getItem(`video_${lessonName}`);
  if (savedStats) {
    videoWatchStats[lessonName] = JSON.parse(savedStats);
    totalSecondsWatched = videoWatchStats[lessonName].totalSeconds || 0;
    console.log(`Загружена статистика для "${lessonName}": ${totalSecondsWatched}сек`);
  } else {
    // Создаем новую запись если это первый просмотр
    videoWatchStats[lessonName] = {
      totalSeconds: 0,
      watchedAt: new Date().toISOString()
    };
    totalSecondsWatched = 0;
    console.log(`Новый просмотр для "${lessonName}"`);
  }

  // Ищем iframe элемент видео
  const iframe = document.getElementById('my-youtube-player');
  if (!iframe) {
    console.error('iframe не найден с ID "my-youtube-player"');
    updateTrackingUI(lessonName);
    return;
  }

  // Инициализируем YouTube плеер через API
  if (typeof YT !== 'undefined' && YT.Player) {
    try {
      currentPlayer = new YT.Player('my-youtube-player', {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError
        }
      });
      console.log('YouTube плеер инициализирован');
    } catch (e) {
      console.error('Ошибка инициализации плеера:', e);
      updateTrackingUI(lessonName);
    }
  } else {
    // YouTube API еще не загружен, повторяем попытку
    console.warn('YouTube API еще не готов, повторная попытка...');
    setTimeout(() => initializeVideoTracking(lessonName), 500);
  }
}

/**
 * ====================================
 * СОБЫТИЯ ПЛЕЕРА: onReady
 * ====================================
 * Вызывается когда плеер готов к воспроизведению
 * Получаем длительность видео
 * 
 * @param {object} event - объект события от YouTube API
 */
function onPlayerReady(event) {
  try {
    // Получаем длительность видео в секундах
    videoDuration = event.target.getDuration();
    console.log(`Длительность видео: ${formatTime(videoDuration)}`);
    
    // Обновляем UI с новыми данными
    updateTrackingUI(currentLesson);
  } catch (e) {
    console.warn('Не удалось получить длительность видео:', e);
  }
}

/**
 * ====================================
 * СОБЫТИЯ ПЛЕЕРА: onStateChange
 * ====================================
 * Вызывается при изменении состояния плеера
 * (play, pause, ended, buffering, cued)
 * 
 * @param {object} event - объект события от YouTube API
 */
function onPlayerStateChange(event) {
  const playerStates = {
    '-1': 'UNSTARTED',
    '0': 'ENDED',
    '1': 'PLAYING',
    '2': 'PAUSED',
    '3': 'BUFFERING',
    '5': 'CUED'
  };
  
  console.log(`Состояние плеера: ${playerStates[event.data]}`);

  if (event.data == YT.PlayerState.PLAYING) {
    // Видео начало воспроизводиться - начинаем счет
    videoStartTime = new Date();
    startTracking();
    updateStatusIndicator(true);
  } else if (
    event.data == YT.PlayerState.PAUSED ||
    event.data == YT.PlayerState.ENDED ||
    event.data == YT.PlayerState.BUFFERING
  ) {
    // Видео на паузе/конце/буферизации - останавливаем счет
    stopTracking();
    updateStatusIndicator(false);
  }
}

/**
 * ====================================
 * СОБЫТИЯ ПЛЕЕРА: onError
 * ====================================
 * Вызывается при ошибке плеера
 * 
 * @param {object} event - объект события от YouTube API
 */
function onPlayerError(event) {
  console.error('Ошибка плеера YouTube:', event.data);
  // Возможные ошибки: 2 (invalid ID), 5 (HTML5 player), 100 (removed), 101 (cannot embed)
}

/**
 * ====================================
 * ФУНКЦИЯ: НАЧАЛО ОТСЛЕЖИВАНИЯ
 * ====================================
 * Запускает интервал для счета времени просмотра
 * Обновляет UI и сохраняет статистику
 */
function startTracking() {
  // Останавливаем предыдущий таймер, чтобы избежать дублирования
  stopTracking();
  
  console.log(`Начало отслеживания видео: "${currentLesson}"`);
  
  timerInterval = setInterval(function() {
    totalSecondsWatched++;
    
    // Обновляем UI каждую секунду
    updateTrackingUI(currentLesson);
    
    // Сохраняем прогресс в localStorage каждые 5 секунд
    if (totalSecondsWatched % 5 === 0) {
      saveWatchStats(currentLesson);
    }
  }, 1000); // Интервал 1 секунда
}

/**
 * ====================================
 * ФУНКЦИЯ: ОСТАНОВКА ОТСЛЕЖИВАНИЯ
 * ====================================
 * Останавливает интервал счета и сохраняет статистику
 */
function stopTracking() {
  clearInterval(timerInterval);
  timerInterval = null;
  
  if (currentLesson) {
    console.log(`Остановка отслеживания видео: "${currentLesson}" (${totalSecondsWatched}сек)`);
    saveWatchStats(currentLesson);
  }
}

/**
 * ====================================
 * ФУНКЦИЯ: СОХРАНЕНИЕ СТАТИСТИКИ
 * ====================================
 * Сохраняет время просмотра в localStorage
 * Для каждого видео создается отдельная запись с ключом "video_<название>"
 * 
 * @param {string} lessonName - Название урока
 */
function saveWatchStats(lessonName) {
  if (!lessonName) return;
  
  videoWatchStats[lessonName] = {
    totalSeconds: totalSecondsWatched,
    watchedAt: new Date().toISOString(),
    lessonName: lessonName
  };
  
  localStorage.setItem(
    `video_${lessonName}`,
    JSON.stringify(videoWatchStats[lessonName])
  );
  
  console.log(`💾 Сохранено: "${lessonName}" - ${totalSecondsWatched}сек`);
}

/**
 * ====================================
 * УТИЛИТА: ФОРМАТИРОВАНИЕ ВРЕМЕНИ
 * ====================================
 * Преобразует секунды в формат MM:SS
 * 
 * @param {number} seconds - Количество секунд
 * @return {string} Форматированная строка времени (например: "1:23")
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds) % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * ====================================
 * ФУНКЦИЯ: ОБНОВЛЕНИЕ UI ОТСЛЕЖИВАНИЯ
 * ====================================
 * Обновляет все элементы интерфейса отслеживания видео
 * Вызывается каждую секунду во время просмотра
 * 
 * DOM элементы, с которыми взаимодействует:
 * - #video-watch-time (id) - показывает просмотренное время
 * - #video-progress-percent (id) - показывает процент просмотра
 * - #video-duration-display (id) - показывает общую длительность
 * - #video-progress-bar (id) - визуальная полоска прогресса
 * 
 * @param {string} lessonName - Название урока (используется для логирования)
 */
function updateTrackingUI(lessonName) {
  // Обновляем текст просмотренного времени (MM:SS)
  const watchTimeElement = document.getElementById('video-watch-time');
  if (watchTimeElement) {
    watchTimeElement.textContent = formatTime(totalSecondsWatched);
  }

  // Обновляем отображение длительности видео
  const durationDisplay = document.getElementById('video-duration-display');
  if (durationDisplay) {
    const totalSecs = videoDuration > 0 ? Math.round(videoDuration) : 0;
    durationDisplay.textContent = formatTime(totalSecs);
  }

  // Обновляем прогресс-бар и процент если видео загружено
  if (videoDuration > 0) {
    // Вычисляем процент просмотра (не больше 100%)
    const percentage = Math.min((totalSecondsWatched / videoDuration) * 100, 100);
    
    // Обновляем ширину прогресс-бара
    const progressBar = document.getElementById('video-progress-bar');
    if (progressBar) {
      progressBar.style.width = percentage + '%';
    }

    // Обновляем текст процента
    const percentDisplay = document.getElementById('video-progress-percent');
    if (percentDisplay) {
      percentDisplay.textContent = Math.floor(percentage) + '%';
    }
  }
}

/**
 * ====================================
 * ФУНКЦИЯ: ОБНОВЛЕНИЕ ИНДИКАТОРА СТАТУСА
 * ====================================
 * Обновляет визуальный индикатор (точка) статуса воспроизведения
 * 
 * DOM элементы, с которыми взаимодействует:
 * - #tracking-status-indicator (id) - точка индикатора
 *   - класс .active добавляется при воспроизведении (с пульсацией)
 * 
 * @param {boolean} isPlaying - true если видео проигрывается, false если на паузе
 */
function updateStatusIndicator(isPlaying) {
  const indicator = document.getElementById('tracking-status-indicator');
  if (indicator) {
    if (isPlaying) {
      // Добавляем класс активности (включает анимацию пульсации)
      indicator.classList.add('active');
    } else {
      // Убираем класс активности
      indicator.classList.remove('active');
    }
  }
}

/**
 * ====================================
 * СОБЫТИЕ: СОХРАНЕНИЕ ПРИ ЗАКРЫТИИ СТРАНИЦЫ
 * ====================================
 * Автоматически сохраняет статистику перед уходом со страницы
 */
window.addEventListener('beforeunload', function() {
  if (currentLesson) {
    stopTracking();
    console.log(`📤 Итого просмотрено (${currentLesson}): ${totalSecondsWatched} сек`);
  }
});

/**
 * ====================================
 * ФУНКЦИЯ: ПОЛУЧИТЬ ВСЮ СТАТИСТИКУ
 * ====================================
 * Возвращает объект со статистикой просмотров всех видео из localStorage
 * 
 * @return {object} Объект вида { "lesson_name": { totalSeconds, watchedAt, lessonName }, ... }
 */
function getAllWatchStats() {
  const stats = {};
  
  // Перебираем все ключи в localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    // Ищем только ключи видеостатистики (начинаются с "video_")
    if (key.startsWith('video_')) {
      const lessonName = key.replace('video_', '');
      stats[lessonName] = JSON.parse(localStorage.getItem(key));
    }
  }
  
  return stats;
}

/**
 * ====================================
 * ФУНКЦИЯ: ОЧИСТКА СТАТИСТИКИ
 * ====================================
 * Удаляет сохраненную статистику для конкретного видео
 * 
 * @param {string} lessonName - Название урока для очистки (если не указано, очищает все)
 */
function clearWatchStats(lessonName) {
  if (lessonName) {
    localStorage.removeItem(`video_${lessonName}`);
    delete videoWatchStats[lessonName];
    console.log(`🗑️  Статистика для "${lessonName}" очищена`);
  } else {
    // Очищаем всю видеостатистику
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('video_')) {
        localStorage.removeItem(key);
      }
    }
    videoWatchStats = {};
    console.log('🗑️  Вся видеостатистика очищена');
  }
}