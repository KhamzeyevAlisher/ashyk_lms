// item_lessons removed in favor of API
// let item_lessons = { ... };

/**
 * ====================================
 * ФУНКЦИЯ ОТКРЫТИЯ УРОКА
 * ====================================
 * Отвечает за отображение видео урока с информацией и файлами
 */
async function openLesson(courseName, lessonName) {
  const container = document.getElementById('tab-item-lesson');
  console.log(courseName, lessonName);

  container.innerHTML = '<h3>Жүктелуде...</h3>';

  try {
    const response = await fetch(`/api/lectures/get_by_name/?courseName=${encodeURIComponent(courseName)}&nameLesson=${encodeURIComponent(lessonName)}`);
    const result = await response.json();


    if (result.status !== 'success') {
      console.error("Сабақ табылмады / Урок не найден", result.error);
      container.innerHTML = `<h3>Сабақ табылмады</h3><p>${result.error || ''}</p>`;
      return;
    }

    const lesson = result.lecture;

    console.log(lesson);

    // Читаем последнее сохраненное время из localStorage для возобновления
    const savedKey = `video_${lessonName}`;
    const savedStats = localStorage.getItem(savedKey);
    let startTime = 0;
    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats);
        startTime = stats.totalSeconds || 0;
      } catch (e) {
        console.warn("Error parsing saved stats", e);
      }
    }

    // ========== ОБРАБОТКА ВИДЕО IFRAME ==========
    let videoEmbedHTML = "";

    if (lesson.link) {
      // Генерация на основе ссылки с учетом времени старта
      videoEmbedHTML = getYouTubeEmbedHTML(lesson.link, startTime);
    }

    if (!videoEmbedHTML && lesson.link) {
      videoEmbedHTML = `<a href="${lesson.link}" target="_blank">Видеоны ашу (Ссылка)</a>`;
    }

    // Inject ID into iframe if not present (required for tracking)
    if (videoEmbedHTML && videoEmbedHTML.includes('<iframe')) {
      if (!videoEmbedHTML.includes('id="my-youtube-player"')) {
        videoEmbedHTML = videoEmbedHTML.replace('<iframe', '<iframe id="my-youtube-player" ');
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
          // Исправлено: возвращаемся к курсу, а не к общему списку уроков (если пришли из курса)
          <button class="back-btn" onclick="openTab('item-course', 'titleCourse=${courseName}')">← Курсқа қайту</button>
        </div>
      `;

    // Вставляем HTML в контейнер
    container.innerHTML = contentHTML;

    // Переключаемся на вкладку с уроком
    if (typeof openTab === "function") {
      openTab('item-lesson', `titleLesson=${encodeURIComponent(courseName)}&nameLesson=${encodeURIComponent(lessonName)}`);
    } else {
      container.classList.remove('hidden');
    }

    // Инициализируем отслеживание видео после отрисовки DOM
    setTimeout(() => {
      initializeVideoTracking(lessonName);
    }, 100);

  } catch (e) {
    console.error("Open lesson error", e);
    container.innerHTML = '<p>Деректерді жүктеу қатесі.</p>';
  }
}

/**
 * Генерирует HTML код iframe для YouTube на основе ссылки
 * Поддерживает форматы: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
 */
function getYouTubeEmbedHTML(url, startTime = 0) {
  if (!url) return "";

  // Регулярное выражение для извлечения ID видео из разных типов ссылок
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];

    // Формируем параметры: enablejsapi для трекинга, rel=0 для скрытия похожих, start для резюме
    let params = `enablejsapi=1&rel=0`;
    if (startTime > 0) {
      params += `&start=${Math.floor(startTime)}`;
    }

    return `
      <iframe 
        width="100%" 
        height="100%" 
        src="https://www.youtube.com/embed/${videoId}?${params}" 
        title="YouTube video player" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerpolicy="strict-origin-when-cross-origin" 
        allowfullscreen>
      </iframe>`.trim();
  }

  return "";
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

// Максимальное время, до которого студент досмотрел (для блокировки перемотки вперед)
let maxTimeReached = 0;

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

      // ЖЕСТКОЕ ОГРАНИЧЕНИЕ: Пауза при переключении вкладки
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && currentPlayer && currentPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
          currentPlayer.pauseVideo();
          console.log('Видео поставлено на паузу: вкладка не активна');
        }
      });

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

    // Устанавливаем maxTimeReached из сохраненной статистики, чтобы не блокировать досмотренное
    maxTimeReached = totalSecondsWatched;

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

  timerInterval = setInterval(function () {
    if (currentPlayer && typeof currentPlayer.getCurrentTime === 'function') {
      const currentTime = currentPlayer.getCurrentTime();

      // ЖЕСТКОЕ ОГРАНИЧЕНИЕ: Блокировка перемотки вперед
      // Если текущее время больше того, до куда студент дошел (+ буфер 3 сек)
      if (currentTime > maxTimeReached + 3) {
        console.warn('Попытка перемотки вперед заблокирована!');
        currentPlayer.seekTo(maxTimeReached);
        return; // Пропускаем обновление в эту секунду
      }

      // Обновляем общий прогресс если смотрим то, что еще не видели
      if (currentTime > maxTimeReached) {
        maxTimeReached = currentTime;
      }

      totalSecondsWatched = Math.floor(maxTimeReached);
    }

    // Обновляем UI каждую секунду
    updateTrackingUI(currentLesson);

    // Сохраняем прогресс в localStorage каждую секунду для надежности при "жестких" правилах
    saveWatchStats(currentLesson);
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

  // Обновляем существующий объект или создаем новый
  if (!videoWatchStats[lessonName]) {
    videoWatchStats[lessonName] = {};
  }

  videoWatchStats[lessonName].totalSeconds = totalSecondsWatched;
  videoWatchStats[lessonName].watchedAt = new Date().toISOString();
  videoWatchStats[lessonName].lessonName = lessonName;

  localStorage.setItem(
    `video_${lessonName}`,
    JSON.stringify(videoWatchStats[lessonName])
  );

  console.log(`💾 Сохранено: "${lessonName}" - ${totalSecondsWatched}сек`, videoWatchStats[lessonName].isCompleted ? '(Завершено)' : '');
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

      // Если просмотр 95% и более — начисляем баллы
      if (percentage >= 95) {
        completeLecture(lessonName);
      }
    }
}

/**
 * ====================================
 * ФУНКЦИЯ: ЗАВЕРШЕНИЕ ЛЕКЦИИ (НАЧИСЛЕНИЕ БАЛЛОВ)
 * ====================================
 */
async function completeLecture(lessonName) {
  // Проверяем, не начислены ли уже баллы в этой сессии или localStorage
  if (!videoWatchStats[lessonName] || videoWatchStats[lessonName].isCompleted) return;

  console.log(`🎉 Лекция "${lessonName}" просмотрена более чем на 95%. Начисляем баллы...`);
  
  // Ставим флаг, чтобы не отправлять повторно
  videoWatchStats[lessonName].isCompleted = true;
  saveWatchStats(lessonName);

  try {
    const response = await fetch('/api/lectures/complete/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({ lessonName: lessonName })
    });

    const result = await response.json();
    if (result.status === 'success') {
      console.log(`✅ Баллы успешно начислены. Новый баланс: ${result.new_score}`);
    } else {
      console.error('Ошибка при начислении баллов:', result.error);
    }
  } catch (e) {
    console.error('Ошибка сетевого запроса при завершении лекции:', e);
  }
}

/**
 * Утилита для получения CSRF токена
 */
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
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
window.addEventListener('beforeunload', function () {
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