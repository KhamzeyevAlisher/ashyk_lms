// ============================================
// Teacher Homework: FRONTEND LOGIC (API INTEGRATION)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let currentHomeworks = []; // Store fetched homeworks locally for filtering
let currentSubmissions = []; // Store fetched submissions
let filterState = {
    search: '',
    courseId: 'all',
    groupId: 'all',
    status: 'all' // 'all', 'unchecked', 'checked'
};

function initApp() {
    // Initial Data Load
    loadHomeworks();
    loadCoursesAndGroups();
    setupDropdowns(); // Setup filter dropdowns

    // Event Listeners
    const createForm = document.getElementById('createHomeworkForm');
    if (createForm) createForm.addEventListener('submit', handleAddHomework);

    const gradeForm = document.getElementById('gradeForm');
    if (gradeForm) gradeForm.addEventListener('submit', handleSaveGrade);

    // Search Listener
    const searchInput = document.getElementById('homework-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterState.search = e.target.value.toLowerCase();
            applyFilters();
        });
    }
}

// --- API CALLS ---

async function loadHomeworks() {
    const listContainer = document.getElementById('teacher-all-homeworks-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<p style="text-align: center; color: #718096; padding: 40px;">Жүктелуде...</p>';

    try {
        const response = await fetch('/api/teacher/homeworks/');
        const data = await response.json();

        if (data.status === 'success') {
            currentHomeworks = data.homeworks;
            applyFilters(); // Render with initial filters
        } else {
            console.error('Error fetching homeworks:', data.error);
            listContainer.innerHTML = `<p style="text-align: center; color: #e53e3e;">Қате: ${data.error}</p>`;
        }
    } catch (error) {
        console.error('Network error:', error);
        listContainer.innerHTML = `<p style="text-align: center; color: #e53e3e;">Байланыс қатесі</p>`;
    }
}

async function loadCoursesAndGroups() {
    try {
        // Load Courses
        const coursesResponse = await fetch('/api/teacher/my-courses/');
        const coursesData = await coursesResponse.json();

        const courseSelect = document.getElementById('hw-course-select'); // Modal select
        const filterCourseSelect = document.getElementById('filter-course-options'); // Filter select

        if (coursesData.status === 'success') {
            // Populate Modal Select
            if (courseSelect) {
                courseSelect.innerHTML = '<option value="" disabled selected>Курсты таңдаңыз</option>';
                coursesData.courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course.id;
                    option.textContent = course.title;
                    courseSelect.appendChild(option);
                });
            }

            // Populate Filter Select
            if (filterCourseSelect) {
                // Keep the first "All" option
                let html = '<div class="option-homework selected" data-value="all">Барлық курстар</div>';
                coursesData.courses.forEach(course => {
                    html += `<div class="option-homework" data-value="${course.id}">${course.title}</div>`;
                });
                filterCourseSelect.innerHTML = html;
                setupDropdownOptions(document.getElementById('filter-course-select')); // Re-bind events
            }
        }

        // Load Groups
        const groupsResponse = await fetch('/api/teacher/groups/');
        const groupsData = await groupsResponse.json();

        const groupSelect = document.getElementById('hw-group-select'); // Modal select
        const filterGroupSelect = document.getElementById('filter-group-options'); // Filter select

        if (groupsData.status === 'success') {
            // Populate Modal Select
            if (groupSelect) {
                groupSelect.innerHTML = '<option value="">Барлық группалар</option>';
                groupsData.groups.forEach(group => {
                    const option = document.createElement('option');
                    option.value = group.id;
                    option.textContent = group.name;
                    groupSelect.appendChild(option);
                });
            }

            // Populate Filter Select
            if (filterGroupSelect) {
                let html = '<div class="option-homework selected" data-value="all">Барлық топтар</div>';
                groupsData.groups.forEach(group => {
                    html += `<div class="option-homework" data-value="${group.id}">${group.name}</div>`;
                });
                filterGroupSelect.innerHTML = html;
                setupDropdownOptions(document.getElementById('filter-group-select'));
            }
        }

    } catch (error) {
        console.error('Error loading courses or groups:', error);
    }
}

function setupDropdowns() {
    // Only add global listener once
    if (window.homeworkDropdownsInitialized) return;

    document.addEventListener('click', (e) => {
        // 1. Trigger Click
        const trigger = e.target.closest('.select-trigger-homework');
        if (trigger) {
            const dropdown = trigger.closest('.custom-select-homework');
            // Close other dropdowns
            document.querySelectorAll('.custom-select-homework').forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            dropdown.classList.toggle('active');
            return;
        }

        // 2. Option Click
        const option = e.target.closest('.option-homework');
        if (option) {
            const dropdown = option.closest('.custom-select-homework');
            const triggerSpan = dropdown.querySelector('.select-trigger-homework span');
            const value = option.getAttribute('data-value');
            const text = option.textContent;

            // UI Update
            triggerSpan.textContent = text;
            dropdown.querySelector('.option-homework.selected')?.classList.remove('selected');
            option.classList.add('selected');
            dropdown.classList.remove('active');

            // Logic Update
            if (dropdown.id === 'filter-course-select') {
                filterState.courseId = value;
            } else if (dropdown.id === 'filter-group-select') {
                filterState.groupId = value;
            }
            applyFilters();
            return;
        }

        // 3. Click Outside
        if (!e.target.closest('.custom-select-homework')) {
            document.querySelectorAll('.custom-select-homework').forEach(d => {
                d.classList.remove('active');
            });
        }
    });

    window.homeworkDropdownsInitialized = true;
}

// No longer needed to setup individual options as delegation handles it
function setupDropdownOptions(dropdown) {
    // Left empty for compatibility with existing calls
}

function setFilterStatus(status, btn) {
    if (btn) {
        document.querySelectorAll('.tab_btn_homework').forEach(b => b.classList.remove('active_homework'));
        btn.classList.add('active_homework');
    }
    filterState.status = status;
    applyFilters();
}

function applyFilters() {
    const listContainer = document.getElementById('teacher-all-homeworks-list');
    if (!listContainer) return;

    let results = currentHomeworks.filter(hw => {
        // 1. Search (Title)
        if (filterState.search && !hw.title.toLowerCase().includes(filterState.search)) {
            return false;
        }

        // 2. Course
        if (filterState.courseId !== 'all') {
            if (hw.course_id != filterState.courseId) {
                return false;
            }
        }

        // 3. Group
        if (filterState.groupId !== 'all') {
            if (hw.group_id != filterState.groupId) {
                return false;
            }
        }

        return true;
    });

    // 4. Status Filter
    if (filterState.status === 'unchecked') {
        results = results.filter(h => h.submitted_count > h.graded_count);
    } else if (filterState.status === 'checked') {
        results = results.filter(h => h.submitted_count > 0 && h.submitted_count === h.graded_count);
    }

    // Update Tab Counts and Top Stats
    const stats = {
        all: 0,
        unchecked: 0,
        checked: 0
    };

    // We calculate stats based on the ALREADY filtered results by Course/Group/Search
    // so that counts in tabs match what you see in the list.
    // However, some prefer global counts. Usually, in SPA filters, counts update based on other filters.
    // Let's calculate them based on search/course/group filtering but BEFORE status filtering

    // Actually, let's re-filter for stats calculation to be precise
    let baseResults = currentHomeworks.filter(hw => {
        if (filterState.search && !hw.title.toLowerCase().includes(filterState.search)) return false;
        if (filterState.courseId !== 'all' && hw.course_id != filterState.courseId) return false;
        if (filterState.groupId !== 'all' && hw.group_id != filterState.groupId) return false;
        return true;
    });

    stats.all = baseResults.length;
    stats.unchecked = baseResults.filter(h => h.submitted_count > h.graded_count).length;
    stats.checked = baseResults.filter(h => h.submitted_count > 0 && h.submitted_count === h.graded_count).length;

    updateStatsUI(stats);
    renderDashboard(results);
}

function renderDashboard(data) {
    const listContainer = document.getElementById('teacher-all-homeworks-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (data.length === 0) {
        listContainer.innerHTML = `<div class="empty-state" style="text-align:center; padding: 40px; color: #718096;">Тапсырмалар табылған жоқ</div>`;
        return;
    }

    data.forEach(hw => {
        const card = createHomeworkCard(hw);
        listContainer.appendChild(card);
    });
}

function createHomeworkCard(data) {
    const div = document.createElement('div');
    div.className = 'task_card_homework';

    // Parse 'stats' string like "5 / 25"
    const [submitted, total] = data.stats.split('/').map(s => s.trim());
    const progressPercent = total > 0 ? Math.round((submitted / total) * 100) : 0;

    div.innerHTML = `
        <div class="card_left_homework">
            <div class="subject_name_homework">${data.course} • ${data.group}</div>
            <h4 class="task_title_homework">${data.title}</h4>
            <div class="meta_row_homework">
                <div class="meta_item_homework">
                    <i class="fa-regular fa-calendar"></i>
                    <span>Мерзімі: <strong>${data.deadline}</strong></span>
                </div>
                <div class="meta_item_homework" title="Жіберілген жұмыстар">
                    <i class="fa-solid fa-users"></i>
                    <span>${data.stats} студент</span>
                </div>
            </div>
            <!-- Progress Bar -->
            <div style="width: 100%; height: 4px; background: #edf2f7; border-radius: 2px; margin-top: 12px;">
                <div style="width: ${progressPercent}%; height: 100%; background: #563eea; border-radius: 2px;"></div>
            </div>
        </div>
        <div class="card_right_homework">
            <button class="btn_details_homework" onclick="openSubmissions(${data.id})">
                Жұмыстарды көру
            </button>
        </div>
    `;
    return div;
}

function updateStatsUI(stats) {
    const elAll = document.getElementById('count-all');
    if (elAll) elAll.textContent = stats.all;

    const elTotal = document.getElementById('stats-total-count');
    if (elTotal) elTotal.textContent = stats.all;

    // Placeholders for other stats as API doesn't fully support them yet
    document.getElementById('count-unchecked').textContent = stats.unchecked;
    document.getElementById('count-checked').textContent = stats.checked;
    document.getElementById('stats-review-count').textContent = stats.unchecked;
}

// --- ACTIONS: CREATE HOMEWORK ---

async function handleAddHomework(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Жіберілуде...';
    submitBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('course_id', document.getElementById('hw-course-select').value);

        const groupVal = document.getElementById('hw-group-select').value;
        if (groupVal) formData.append('group_id', groupVal);

        formData.append('title', document.getElementById('hw-title').value);
        formData.append('description', document.getElementById('hw-description').value);

        const fileInput = document.getElementById('hw-file');
        if (fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        }

        formData.append('deadline', document.getElementById('hw-deadline').value);

        // Get CSRF token
        const csrftoken = getCookie('csrftoken');

        const response = await fetch('/api/teacher/homework/create/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert('Үй тапсырмасы сәтті құрылды!');
            closeModal('createHomeworkModal');
            e.target.reset();
            loadHomeworks(); // Refresh list
        } else {
            alert('Қате: ' + (result.error || 'Белгісіз қате'));
        }

    } catch (error) {
        console.error('Error creating homework:', error);
        alert('Байланыс қатесі орын алды.');
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

// --- ACTIONS: SUBMISSIONS ---

async function openSubmissions(homeworkId) {
    const homework = currentHomeworks.find(h => h.id === homeworkId);
    if (homework) {
        document.getElementById('submissions-title').textContent = homework.title;
    }

    const tableBody = document.getElementById('submissions-table-body');
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Жүктелуде...</td></tr>';

    document.getElementById('homework-main-view').classList.add('hidden');
    document.getElementById('homework-submissions-view').classList.remove('hidden');

    try {
        const response = await fetch(`/api/teacher/homeworks/${homeworkId}/submissions/`);
        const data = await response.json();

        if (data.status === 'success') {
            currentSubmissions = data.submissions;
            renderSubmissions(currentSubmissions);
        } else {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">${data.error}</td></tr>`;
        }
    } catch (error) {
        console.error('Error fetching submissions:', error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Байланыс қатесі</td></tr>`;
    }
}

function renderSubmissions(submissions) {
    const tableBody = document.getElementById('submissions-table-body');
    tableBody.innerHTML = '';

    if (submissions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Бұл тапсырмаға әлі жауаптар келген жоқ.</td></tr>';
        return;
    }

    submissions.forEach(sub => {
        const tr = document.createElement('tr');

        const isGraded = sub.status_code === 'graded';
        const statusColor = isGraded ? '#38a169' : '#e53e3e';
        const btnText = isGraded ? 'Өңдеу' : 'Бағалау';

        tr.innerHTML = `
            <td>
                <div style="font-weight: 600; color: #2d3748;">${sub.student_name}</div>
            </td>
            <td>
                <span style="color: ${statusColor}; font-weight: 600; font-size: 13px;">
                    ${sub.status}
                </span>
            </td>
            <td style="color: #718096; font-size: 13px;">${sub.submitted_at}</td>
            <td>
                <div style="font-weight: 700; font-size: 16px;">${sub.grade || '-'}</div>
            </td>
            <td style="text-align: center;">
                <button class="btn_details_homework" style="font-size: 12px; padding: 6px 14px; width: auto;" onclick="openGradingModal(${sub.id})">
                    ${btnText}
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// --- ACTIONS: GRADING ---

function openGradingModal(submissionId) {
    const sub = currentSubmissions.find(s => s.id === submissionId);
    if (!sub) return;

    // Fill data
    document.getElementById('grade-student-name').textContent = sub.student_name;
    document.getElementById('grade-content').textContent = sub.content || 'Жауап мәтіні жоқ.';
    document.getElementById('grade-submission-id').value = sub.id;
    document.getElementById('grade-value').value = sub.grade || '';
    document.getElementById('grade-comment').value = ''; // API doesn't return comment yet, leaving blank

    // File
    const fileContainer = document.getElementById('grade-file-container');
    const fileLink = document.getElementById('grade-file-link');
    if (sub.file_url) {
        fileContainer.style.display = 'block';
        fileLink.href = sub.file_url;
        fileLink.textContent = sub.file_name || 'Файлды жүктеу';
    } else {
        fileContainer.style.display = 'none';
    }

    openModal('gradeModal');
}

async function handleSaveGrade(e) {
    e.preventDefault();

    const subId = document.getElementById('grade-submission-id').value;
    const score = document.getElementById('grade-value').value;
    const comment = document.getElementById('grade-comment').value;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Сақталуда...';
    submitBtn.disabled = true;

    try {
        const csrftoken = getCookie('csrftoken');
        const response = await fetch('/api/teacher/grade/submit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                submission_id: subId,
                grade: score,
                comment: comment
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert('Баға сақталды!');
            closeModal('gradeModal');
            // Refresh submissions list manually for speed
            const sub = currentSubmissions.find(s => s.id == subId);
            if (sub) {
                sub.grade = score;
                sub.status = 'Оценено';
                sub.status_code = 'graded';
                renderSubmissions(currentSubmissions);
            }
        } else {
            alert('Қате: ' + result.error);
        }

    } catch (error) {
        console.error('Error grading:', error);
        alert('Байланыс қатесі');
    } finally {
        submitBtn.textContent = 'Сақтау';
        submitBtn.disabled = false;
    }
}


// --- UTILITIES ---

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300); // Wait for transition
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        // Small delay to allow display:flex to apply before adding opacity class
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
    }
}

function closeSubmissionsView() {
    document.getElementById('homework-submissions-view').classList.add('hidden');
    document.getElementById('homework-main-view').classList.remove('hidden');
}

// CSRF Helper
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

// Global Exports
window.setFilterStatus = setFilterStatus;
window.openSubmissions = openSubmissions;
window.closeSubmissionsView = closeSubmissionsView;
window.openCreateHomeworkModal = () => openModal('createHomeworkModal');
window.openGradingModal = openGradingModal;
window.closeModal = closeModal;
