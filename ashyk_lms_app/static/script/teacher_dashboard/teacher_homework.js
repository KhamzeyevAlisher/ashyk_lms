// ============================================
// Teacher Homework: FRONTEND "DATABASE" & LOGIC
// ============================================

/**
 * ПРЕДПОЛАГАЕМАЯ АРХИТЕКТУРА БД (для бэкенда):
 * 
 * 1. Homework Model:
 *    - id (INT)
 *    - title (STR)
 *    - description (TEXT)
 *    - course_id (FK -> Course)
 *    - group_id (FK -> Group, optional)
 *    - teacher_id (FK -> User/Teacher)
 *    - deadline (DATETIME)
 *    - max_score (INT, default 100)
 *    - file_attachment (FILE, optional)
 *    - created_at (DATETIME)
 * 
 * 2. Submission Model:
 *    - id (INT)
 *    - homework_id (FK -> Homework)
 *    - student_id (FK -> User/Student)
 *    - content (TEXT)
 *    - file_attachment (FILE, optional)
 *    - status (ENUM: 'submitted', 'on_review', 'graded', 'overdue')
 *    - grade (INT, optional)
 *    - teacher_feedback (TEXT, optional)
 *    - submitted_at (DATETIME)
 */

// --- 1. MOCK DATA (Имитация содержимого БД) ---

const DB_HOMEWORKS = [
    {
        id: 201,
        course_name: "Алгоритмдер",
        group_name: "IT-2101",
        title: "Сұрыптау алгоритмдері: Тез сұрыптау (QuickSort)",
        description: "QuickSort алгоритмін іске асыру және оның уақыттық күрделілігін талдау.",
        deadline: "2024-02-15T23:59:59",
        max_score: 100,
        teacher: "Проф. Иванов",
        status: "active", // Для фильтрации: active/closed
        // Статистика высчитывается на бэкенде или через агрегацию
        submissions_count: 22,
        total_students: 25,
        unchecked_count: 5
    },
    {
        id: 202,
        course_name: "JavaScript негіздері",
        group_name: "WEB-2204",
        title: "DOM манипуляциясы және Оқиғалар (Events)",
        description: "Интерактивті тізім жасау (To-Do List) және localStorage қолдану.",
        deadline: "2024-02-10T23:59:59",
        max_score: 100,
        teacher: "Е. Смайылов",
        status: "active",
        submissions_count: 15,
        total_students: 20,
        unchecked_count: 15
    },
    {
        id: 203,
        course_name: "Мәліметтер қоры",
        group_name: "IT-2103",
        title: "SQL Join: Күрделі сұраныстар",
        description: "3-тен астам кестені біріктіретін SQL сұраныстарын жазыңыз.",
        deadline: "2024-02-01T23:59:59",
        max_score: 100,
        teacher: "А. Ахметова",
        status: "closed",
        submissions_count: 30,
        total_students: 30,
        unchecked_count: 0
    }
];

const DB_SUBMISSIONS = [
    {
        id: 5001,
        homework_id: 201,
        student_name: "Арман Серік",
        student_id: 10,
        status: "submitted",
        status_label: "Тексерілмеген",
        submitted_at: "2024-02-09 14:30",
        content: "Мен QuickSort-ты Python-да орындадым. Кодты тіркедім.",
        file_url: "/media/homeworks/qsort_arman.zip",
        grade: null,
        feedback: ""
    },
    {
        id: 5002,
        homework_id: 201,
        student_name: "Айша Мұрат",
        student_id: 11,
        status: "graded",
        status_label: "Тексерілді",
        submitted_at: "2024-02-08 10:15",
        content: "Тапсырма дайын. Оптимизация жасалды.",
        file_url: "/media/homeworks/qsort_aisha.pdf",
        grade: 95,
        feedback: "Жақсы жұмыс!"
    },
    {
        id: 5003,
        homework_id: 202,
        student_name: "Бекарыс Омар",
        student_id: 15,
        status: "submitted",
        status_label: "Тексерілмеген",
        submitted_at: "2024-02-10 09:00",
        content: "To-Do List дайын. Мұнда оқиғаларды тыңдаушылар қосылған.",
        file_url: null,
        grade: null,
        feedback: ""
    }
];

// --- 2. ИНИЦИАЛИЗАЦИЯ И РЕНДЕРИНГ ---

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Если на бэкенде мы загружаем страницу сразу с данными, 
    // то здесь будет просто рендер. Но для SPA-подхода — fetch.
    renderDashboard();

    // Делегирование событий или прямые привязки
    const createForm = document.getElementById('createHomeworkForm');
    if (createForm) createForm.addEventListener('submit', handleAddHomework);

    const gradeForm = document.getElementById('gradeForm');
    if (gradeForm) gradeForm.addEventListener('submit', handleSaveGrade);
}

/**
 * Основная функция рендеринга списка ДЗ
 * @param {string} filter - 'all', 'unchecked', 'checked'
 */
function renderDashboard(filter = 'all') {
    // ВАЖНО: ID изменен, чтобы не конфликтовать с виджетом на главной странице (teacher_home.html)
    const listContainer = document.getElementById('teacher-all-homeworks-list');

    if (!listContainer) {
        console.warn('Teacher Homework List container not found!');
        return;
    }

    listContainer.innerHTML = '';

    // Подсчет статистики для бейджей (имитация серверного ответа)
    const stats = {
        all: DB_HOMEWORKS.length,
        unchecked: DB_HOMEWORKS.filter(h => h.unchecked_count > 0).length,
        checked: DB_HOMEWORKS.filter(h => h.unchecked_count === 0).length,
        total_unchecked: DB_HOMEWORKS.reduce((sum, h) => sum + h.unchecked_count, 0)
    };

    updateStatsUI(stats);

    // Фильтрация данных
    let filteredData = DB_HOMEWORKS;
    if (filter === 'unchecked') filteredData = DB_HOMEWORKS.filter(h => h.unchecked_count > 0);
    if (filter === 'checked') filteredData = DB_HOMEWORKS.filter(h => h.unchecked_count === 0);

    if (filteredData.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">Тапсырмалар табылған жоқ</div>`;
        return;
    }

    filteredData.forEach(hw => {
        const card = createHomeworkCard(hw);
        listContainer.appendChild(card);
    });
}

/**
 * Создание HTML карточки на основе объекта данных
 * Это "шаблон", который вы будете использовать в бэкенде (например, через Jinja или DRF)
 */
function createHomeworkCard(data) {
    const div = document.createElement('div');
    div.className = 'task_card_homework';

    const isDone = data.unchecked_count === 0;
    const statusBadge = isDone
        ? `<div class="status_badge_homework status_done_homework">
            <i class="fa-solid fa-check-double"></i> Тексерілді
           </div>`
        : `<div class="status_badge_homework status_review_homework">
            <i class="fa-solid fa-clock"></i> Тексеру қажет: ${data.unchecked_count}
           </div>`;

    // Вычисляем прогресс для визуала (опционально)
    const progressPercent = Math.round((data.submissions_count / data.total_students) * 100);

    div.innerHTML = `
        <div class="card_left_homework">
            <div class="subject_name_homework">${data.course_name} • ${data.group_name}</div>
            <h4 class="task_title_homework">${data.title}</h4>
            <div class="meta_row_homework">
                <div class="meta_item_homework">
                    <i class="fa-regular fa-calendar"></i>
                    <span>Мерзімі: <strong>${formatDateTime(data.deadline)}</strong></span>
                </div>
                <div class="meta_item_homework" title="Жіберілген жұмыстар">
                    <i class="fa-solid fa-users"></i>
                    <span>${data.submissions_count} / ${data.total_students} студент</span>
                </div>
            </div>
            <!-- Мини прогресс-бар -->
            <div style="width: 100%; height: 4px; background: #edf2f7; border-radius: 2px; margin-top: 12px;">
                <div style="width: ${progressPercent}%; height: 100%; background: #563eea; border-radius: 2px;"></div>
            </div>
        </div>
        <div class="card_right_homework">
            ${statusBadge}
            <button class="btn_details_homework" onclick="openSubmissions(${data.id})">
                Жұмыстарды көру
            </button>
        </div>
    `;
    return div;
}

// --- 3. УПРАВЛЕНИЕ ПОД-ВИДАМИ (Submissions) ---

function openSubmissions(homeworkId) {
    const homework = DB_HOMEWORKS.find(h => h.id === homeworkId);
    if (!homework) return;

    // Установка данных заголовка
    document.getElementById('submissions-title').textContent = homework.title;

    const tableBody = document.getElementById('submissions-table-body');
    tableBody.innerHTML = '';

    const submissions = DB_SUBMISSIONS.filter(s => s.homework_id === homeworkId);

    if (submissions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Бұл тапсырмаға әлі жауаптар келген жоқ.</td></tr>';
    } else {
        submissions.forEach(sub => {
            const row = createSubmissionRow(sub);
            tableBody.appendChild(row);
        });
    }

    document.getElementById('homework-main-view').classList.add('hidden');
    document.getElementById('homework-submissions-view').classList.remove('hidden');
}

function createSubmissionRow(sub) {
    const tr = document.createElement('tr');

    // Логика цвета статуса
    const statusColor = sub.status === 'graded' ? '#38a169' : '#e53e3e';
    const actionBtn = sub.status === 'graded'
        ? `<button class="tab_btn_homework" style="font-size: 12px; padding: 6px 14px;" onclick="openGradingModal(${sub.id})">Өңдеу</button>`
        : `<button class="btn_details_homework" style="font-size: 12px; padding: 6px 14px; width: auto;" onclick="openGradingModal(${sub.id})">Бағалау</button>`;

    tr.innerHTML = `
        <td>
            <div style="font-weight: 600; color: #2d3748;">${sub.student_name}</div>
            <div style="font-size: 11px; color: #a0aec0;">ID: ${sub.student_id}</div>
        </td>
        <td>
            <span style="color: ${statusColor}; font-weight: 600; font-size: 13px;">
                ${sub.status_label}
            </span>
        </td>
        <td style="color: #718096; font-size: 13px;">${sub.submitted_at}</td>
        <td>
            <div style="font-weight: 700; font-size: 16px;">${sub.grade || '-'}</div>
        </td>
        <td style="text-align: center;">
            ${actionBtn}
        </td>
    `;
    return tr;
}

// --- 4. МОДАЛКИ И ДЕЙСТВИЯ (CRUD имитация) ---

function openGradingModal(submissionId) {
    const sub = DB_SUBMISSIONS.find(s => s.id === submissionId);
    if (!sub) return;

    // Заполнение полей модалки
    document.getElementById('grade-student-name').textContent = sub.student_name;
    document.getElementById('grade-content').textContent = sub.content || 'Жауап мәтіні жоқ.';
    document.getElementById('grade-submission-id').value = sub.id;
    document.getElementById('grade-value').value = sub.grade || '';
    document.getElementById('grade-comment').value = sub.feedback || '';

    // Работа с файлом
    const fileContainer = document.getElementById('grade-file-container');
    const fileLink = document.getElementById('grade-file-link');
    if (sub.file_url) {
        fileContainer.style.display = 'block';
        fileLink.href = sub.file_url;
        fileLink.textContent = sub.file_url.split('/').pop();
    } else {
        fileContainer.style.display = 'none';
    }

    openModal('gradeModal');
}

function handleSaveGrade(e) {
    e.preventDefault();
    const subId = parseInt(document.getElementById('grade-submission-id').value);
    const score = parseInt(document.getElementById('grade-value').value);
    const feedback = document.getElementById('grade-comment').value;

    // Update LOCAL DB
    const subIndex = DB_SUBMISSIONS.findIndex(s => s.id === subId);
    if (subIndex !== -1) {
        DB_SUBMISSIONS[subIndex].grade = score;
        DB_SUBMISSIONS[subIndex].feedback = feedback;
        DB_SUBMISSIONS[subIndex].status = 'graded';
        DB_SUBMISSIONS[subIndex].status_label = 'Тексерілді';

        // Обновляем счетчик в основном ДЗ (имитация логики бэкенда)
        const hwId = DB_SUBMISSIONS[subIndex].homework_id;
        const hwIndex = DB_HOMEWORKS.findIndex(h => h.id === hwId);
        if (hwIndex !== -1 && DB_HOMEWORKS[hwIndex].unchecked_count > 0) {
            DB_HOMEWORKS[hwIndex].unchecked_count -= 1;
        }
    }

    closeModal('gradeModal');
    alert('Баға сақталды!');

    // Ре-рендер для обновления данных в таблице и в списке
    const currentHwId = DB_SUBMISSIONS[subIndex].homework_id;
    openSubmissions(currentHwId); // Refresh table
    renderDashboard(); // Refresh background list
}

function handleAddHomework(e) {
    e.preventDefault();
    // Сбор данных из формы
    const newHw = {
        id: Date.now(),
        title: document.getElementById('hw-title').value,
        course_name: document.getElementById('hw-course-select').options[document.getElementById('hw-course-select').selectedIndex].text,
        group_name: document.getElementById('hw-group-select').options[document.getElementById('hw-group-select').selectedIndex].text || "Жалпы",
        description: document.getElementById('hw-description').value,
        deadline: document.getElementById('hw-deadline').value,
        status: "active",
        submissions_count: 0,
        total_students: 25,
        unchecked_count: 0
    };

    DB_HOMEWORKS.unshift(newHw);
    renderDashboard();
    closeModal('createHomeworkModal');
    e.target.reset();
}

// --- 5. ХЕЛПЕРЫ ---

function updateStatsUI(stats) {
    if (document.getElementById('stats-total-count')) document.getElementById('stats-total-count').textContent = stats.all;
    if (document.getElementById('stats-review-count')) document.getElementById('stats-review-count').textContent = stats.total_unchecked;

    if (document.getElementById('count-all')) document.getElementById('count-all').textContent = stats.all;
    if (document.getElementById('count-unchecked')) document.getElementById('count-unchecked').textContent = stats.unchecked;
    if (document.getElementById('count-checked')) document.getElementById('count-checked').textContent = stats.checked;
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('ru', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function closeSubmissionsView() {
    document.getElementById('homework-submissions-view').classList.add('hidden');
    document.getElementById('homework-main-view').classList.remove('hidden');
}

function filterHomeworks(type, btn) {
    if (btn) {
        document.querySelectorAll('.tab_btn_homework').forEach(b => b.classList.remove('active_homework'));
        btn.classList.add('active_homework');
    }

    const container = document.getElementById('teacher-all-homeworks-list');
    if (!container) return;

    renderDashboard(type); // Assuming this line should be kept from the original function
}

// Глобальное экспозиционирование для onclick в HTML
window.filterHomeworks = filterHomeworks;
window.openSubmissions = openSubmissions;
window.closeSubmissionsView = closeSubmissionsView;
window.openCreateHomeworkModal = () => openModal('createHomeworkModal');
window.openGradingModal = openGradingModal;
