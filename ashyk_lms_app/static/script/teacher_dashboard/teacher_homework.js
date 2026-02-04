
// ============================================
// Teacher Homework Management Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the homework tab (or initialized globally)
    // We can lazily load when the tab is clicked, or load immediately.
    // Let's assume global init but fetch data when needed.

    // Bind Tab Click to Load Data
    const homeworkTabBtn = document.querySelector('button[onclick="openTab(\'homework\')"]');
    // Assuming there is a tab button with this onclick handler based on other tabs logic.
    // If not, we might need to find the specific tab button ID or class.
    // Let's try to find it generically or just load if the tab is already active.

    // Since sidebar buttons might trigger openTab, we can just call loadHomeworks() 
    // if the homework tab is active on load, or expose it globally.

    if (document.getElementById('tab-homework') && !document.getElementById('tab-homework').classList.contains('hidden')) {
        loadHomeworks();
    }

    // Attach form listeners
    const createForm = document.getElementById('createHomeworkForm');
    if (createForm) createForm.addEventListener('submit', handleCreateHomework);

    const gradeForm = document.getElementById('gradeForm');
    if (gradeForm) gradeForm.addEventListener('submit', handleGradeSubmission);
});

// Helper: Get CSRF Token
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

// --------------------------------------------
// LOAD HOMEWORKS LIST
// --------------------------------------------
const MOCK_HOMEWORKS = [
    {
        id: 991,
        course: "Алгоритмдер және деректер құрылымы",
        group: "IT-2101",
        title: "Сұрыптау алгоритмдері (Bubble Sort)",
        deadline: "15.11.2023",
        stats: "24 / 25",
        status_category: 'checked' // Fake property for filtering
    },
    {
        id: 992,
        course: "Web-бағдарламалау",
        group: "IT-2102",
        title: "JavaScript DOM манипуляциясы",
        deadline: "18.11.2023",
        stats: "15 / 25",
        status_category: 'unchecked'
    },
    {
        id: 993,
        course: "Объектіге бағытталған бағдарламалау",
        group: "SE-2201",
        title: "Интерфейстер және полиморфизм",
        deadline: "20.11.2023",
        stats: "10 / 22",
        status_category: 'unchecked'
    },
    {
        id: 994,
        course: "Мәліметтер қоры",
        group: "IT-2103",
        title: "SQL сұраныстар: Join",
        deadline: "10.11.2023",
        stats: "25 / 25",
        status_category: 'checked'
    }
];

let globalHomeworks = [];

async function loadHomeworks() {
    const container = document.getElementById('homework-list-container');
    container.innerHTML = '<p>Жүктелуде...</p>';

    try {
        const response = await fetch('/api/teacher/homeworks/');
        const data = await response.json();

        if (data.status === 'success') {
            // Merge API data with Mock data
            // For API data, we default status_category to 'unchecked' for demo purposes 
            // unless we have specific logic
            const apiHomeworks = data.homeworks.map(hw => ({
                ...hw,
                status_category: 'unchecked' // Defaulting API data to unchecked for now
            }));

            globalHomeworks = [...apiHomeworks, ...MOCK_HOMEWORKS];

            filterHomeworks('all'); // Initial render
        } else {
            container.innerHTML = `<p style="color:red">Қате: ${data.error}</p>`;
        }
    } catch (e) {
        console.error(e);
        // On error, still show mock data
        globalHomeworks = [...MOCK_HOMEWORKS];
        filterHomeworks('all');
    }
}

function filterHomeworks(category, btn = null) {
    // Update active tab UI
    if (btn) {
        document.querySelectorAll('.tab_btn_homework').forEach(b => b.classList.remove('active_homework'));
        btn.classList.add('active_homework');
    } else {
        // Find the 'all' button if no btn passed (initial load)
        const allBtn = document.querySelector('.tab_btn_homework[onclick*="all"]');
        if (allBtn) {
            document.querySelectorAll('.tab_btn_homework').forEach(b => b.classList.remove('active_homework'));
            allBtn.classList.add('active_homework');
        }
    }

    const container = document.getElementById('homework-list-container');
    container.innerHTML = '';

    // Calculate counts
    const countAll = globalHomeworks.length;
    const countUnchecked = globalHomeworks.filter(h => h.status_category === 'unchecked').length;
    const countChecked = globalHomeworks.filter(h => h.status_category === 'checked').length;

    // Update count badges
    if (document.getElementById('count-all')) document.getElementById('count-all').textContent = countAll;
    if (document.getElementById('count-unchecked')) document.getElementById('count-unchecked').textContent = countUnchecked;
    if (document.getElementById('count-checked')) document.getElementById('count-checked').textContent = countChecked;

    // Filter data
    let filtered = globalHomeworks;
    if (category !== 'all') {
        filtered = globalHomeworks.filter(h => h.status_category === category);
    }

    renderHomeworkList(filtered);
}


function renderHomeworkList(homeworks) {
    const container = document.getElementById('homework-list-container');
    container.innerHTML = '';

    // Update Stats (Basic logic - handled in filterHomeworks now for the counters, but we can update card stats too if needed)
    // document.getElementById('stats-total-count').textContent = homeworks.length; // This would update based on filtered view

    // Update Top Cards stats based on GLOBAL data, not filtered view? 
    // Usually dashboard stats show global state.
    const totalCount = globalHomeworks.length;
    const reviewCount = globalHomeworks.filter(h => h.status_category === 'unchecked').length;

    if (document.getElementById('stats-total-count')) document.getElementById('stats-total-count').textContent = totalCount;
    if (document.getElementById('stats-review-count')) document.getElementById('stats-review-count').textContent = reviewCount;

    if (homeworks.length === 0) {
        container.innerHTML = '<div style="background:white; padding:40px; text-align:center; border-radius:12px; color:#666;">Бұл санатта тапсырмалар жоқ.</div>';
        return;
    }

    homeworks.forEach(hw => {
        // Parse stats string "X / Y"
        const [submitted, total] = (hw.stats || "0 / 0").split(' / ');

        let statusBadge = '';
        if (hw.status_category === 'checked') {
            statusBadge = `<div class="status_badge_homework status_done_homework">
                    <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Тексерілді
                </div>`;
        } else {
            statusBadge = `<div class="status_badge_homework status_review_homework">
                    <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Тексеру қажет: ${submitted} / ${total}
                </div>`;
        }

        const card = document.createElement('div');
        card.className = 'task_card_homework';

        card.innerHTML = `
            <div class="card_left_homework">
                <div class="subject_name_homework">${hw.course}</div>
                <h4 class="task_title_homework">${hw.title}</h4>
                <div class="teacher_name_homework">Топ: ${hw.group}</div>
                <div class="meta_row_homework">
                    <div class="meta_item_homework">
                        <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span>Мерзімі: ${hw.deadline}</span>
                    </div>
                </div>
            </div>
            <div class="card_right_homework">
                ${statusBadge}
                <button class="btn_details_homework" onclick="viewSubmissions(${hw.id}, '${hw.title.replace(/'/g, "\\'")}')">Жұмыстарды көру</button>
            </div>
        `;

        container.appendChild(card);
    });
}

// --------------------------------------------
// CREATE HOMEWORK
// --------------------------------------------
async function openCreateHomeworkModal() {
    openModal('createHomeworkModal');

    // Load courses/groups if empty
    const courseSelect = document.getElementById('hw-course-select');
    if (courseSelect.options.length <= 1) {
        // Fetch Courses
        try {
            const res = await fetch('/api/teacher/courses/');
            const data = await res.json();
            if (data.status === 'success') {
                data.courses.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.title;
                    courseSelect.appendChild(opt);
                });
            }
        } catch (e) { console.error('Error loading courses', e); }

        // Fetch Groups
        const groupSelect = document.getElementById('hw-group-select');
        try {
            const res = await fetch('/api/teacher/groups-list/');
            const data = await res.json();
            if (data.status === 'success') {
                data.groups.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g.id;
                    opt.textContent = g.name;
                    groupSelect.appendChild(opt);
                });
            }
        } catch (e) { console.error('Error loading groups', e); }
    }
}

async function handleCreateHomework(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Жіберілуде...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('course_id', document.getElementById('hw-course-select').value);
    const grp = document.getElementById('hw-group-select').value;
    if (grp) formData.append('group_id', grp);

    formData.append('title', document.getElementById('hw-title').value);
    formData.append('description', document.getElementById('hw-description').value);
    formData.append('deadline', document.getElementById('hw-deadline').value);

    const file = document.getElementById('hw-file').files[0];
    if (file) formData.append('file', file);

    try {
        const response = await fetch('/api/teacher/create_homework/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert('Сәтті сақталды!');
            closeModal('createHomeworkModal');
            document.getElementById('createHomeworkForm').reset();
            loadHomeworks();
        } else {
            alert('Қате: ' + (result.error || 'Unknown error'));
        }
    } catch (e) {
        console.error(e);
        alert('Сервермен байланыс қатесі');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// --------------------------------------------
// SUBMISSIONS & GRADING
// --------------------------------------------
async function viewSubmissions(homeworkId, title) {
    document.getElementById('submissions-title').textContent = `Тапсырмалар: ${title}`;
    const tableBody = document.getElementById('submissions-table-body');
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Жүктелуде...</td></tr>';

    document.getElementById('homework-main-view').classList.add('hidden');
    document.getElementById('homework-submissions-view').classList.remove('hidden');

    try {
        const response = await fetch(`/api/teacher/submissions/${homeworkId}/`);
        const data = await response.json();

        if (data.status === 'success') {
            tableBody.innerHTML = '';
            if (data.submissions.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Жауаптар жоқ</td></tr>';
                return;
            }

            data.submissions.forEach(sub => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #eee';

                let actionBtn = `<button class="btn-primary" style="padding:5px 10px; font-size:0.8em;" onclick='openGradeModal(${JSON.stringify(sub)})'>Бағалау</button>`;
                if (sub.status_code === 'graded') {
                    actionBtn = `<button class="btn-secondary" style="padding:5px 10px; font-size:0.8em;" onclick='openGradeModal(${JSON.stringify(sub)})'>Өңдеу</button>`;
                }

                tr.innerHTML = `
                    <td style="padding:10px;">${sub.student_name}</td>
                    <td style="padding:10px;">${getStatusBadge(sub.status_code, sub.status)}</td>
                    <td style="padding:10px;">${sub.submitted_at}</td>
                    <td style="padding:10px; font-weight:bold;">${sub.grade ? sub.grade : '-'}</td>
                    <td style="padding:10px; text-align:center;">${actionBtn}</td>
                `;
                tableBody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error(e);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Қате орын алды</td></tr>';
    }
}

function getStatusBadge(code, label) {
    let color = '#777';
    if (code === 'submitted' || code === 'on_review') color = '#ff9800'; // Orange
    if (code === 'graded') color = '#4caf50'; // Green
    if (code === 'draft') color = '#9e9e9e'; // Grey

    return `<span style="color:${color}; font-weight:500;">${label}</span>`;
}

function closeSubmissionsView() {
    document.getElementById('homework-submissions-view').classList.add('hidden');
    document.getElementById('homework-main-view').classList.remove('hidden');
}

// --------------------------------------------
// GRADING MODAL
// --------------------------------------------
function openGradeModal(submissionData) {
    openModal('gradeModal');

    document.getElementById('grade-student-name').textContent = submissionData.student_name;
    document.getElementById('grade-content').textContent = submissionData.content || '(Мәтін жоқ)';
    document.getElementById('grade-submission-id').value = submissionData.id;

    const fileContainer = document.getElementById('grade-file-container');
    const fileLink = document.getElementById('grade-file-link');

    if (submissionData.file_url) {
        fileContainer.style.display = 'block';
        fileLink.href = submissionData.file_url;
        fileLink.textContent = submissionData.file_name || 'Жүктеу';
    } else {
        fileContainer.style.display = 'none';
    }

    // Reset or populate inputs
    document.getElementById('grade-value').value = submissionData.grade || '';
    document.getElementById('grade-comment').value = ''; // Note: Comment is not sent in list, maybe fetch detail? 
    // Ideally we included comment in list or fetch separate. For now leave blank to add new comment.
}

async function handleGradeSubmission(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    const data = {
        submission_id: document.getElementById('grade-submission-id').value,
        grade: document.getElementById('grade-value').value,
        comment: document.getElementById('grade-comment').value
    };

    try {
        const response = await fetch('/api/teacher/grade_submission/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert('Баға қойылды!');
            closeModal('gradeModal');
            // Refresh submissions list?
            // We need homeworkId. It's not stored in 'data'. 
            // Workaround: We can't easily refresh without storing currentHomeworkId global.
            // Let's rely on finding current opened homework title or ID from DOM? or just close modal.
            // Better: Store current homework ID in global var when viewing submissions.
            // For now, simple re-fetch if we had ID or just UI update?
            // Let's implement global `currentHomeworkId`.
            if (window.currentHomeworkId) viewSubmissions(window.currentHomeworkId, document.getElementById('submissions-title').textContent.replace('Тапсырмалар: ', ''));
        } else {
            alert('Қате: ' + result.error);
        }
    } catch (e) {
        console.error(e);
        alert('Сақтау қатесі');
    } finally {
        btn.disabled = false;
    }
}

// Enhance viewSubmissions to store ID
const originalViewSubmissions = viewSubmissions;
viewSubmissions = function (id, title) {
    window.currentHomeworkId = id;
    return originalViewSubmissions(id, title);
};

// Global Exposure if needed
window.openCreateHomeworkModal = openCreateHomeworkModal;
window.closeSubmissionsView = closeSubmissionsView;
window.openGradeModal = openGradeModal;
