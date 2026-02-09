
// State
let journalState = {
    groupId: null,
    courseId: null,
    month: null,
    data: null,
    pageIndex: 0,
    pageSize: 7 // Columns per page
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tab-diary')) {
        initJournal();
    }
});

function initJournal() {
    loadFilterOptions();

    // Set default month
    const now = new Date();
    const monthStr = now.toISOString().slice(0, 7);
    const monthInput = document.getElementById('journal-month-select');
    if (monthInput) monthInput.value = monthStr;

    // Form submission
    const gradeForm = document.getElementById('teacher-grade-form');
    if (gradeForm) {
        gradeForm.addEventListener('submit', handleGradeSubmit);
    }
}

async function loadFilterOptions() {
    // Load courses
    try {
        const resp = await fetch('/api/teacher/my-courses/');
        const data = await resp.json();
        if (data.status === 'success') {
            const sel = document.getElementById('journal-course-select');
            sel.innerHTML = '<option value="">Пәнді таңдаңыз...</option>';
            data.courses.forEach(c => {
                sel.innerHTML += `<option value="${c.id}">${c.title}</option>`;
            });
        }
    } catch (e) {
        console.error("Courses load error", e);
    }

    // Load groups
    try {
        const resp = await fetch('/api/teacher/groups/');
        const data = await resp.json();
        if (data.status === 'success') {
            const sel = document.getElementById('journal-group-select');
            sel.innerHTML = '<option value="">Топты таңдаңыз...</option>';
            data.groups.forEach(g => {
                sel.innerHTML += `<option value="${g.id}">${g.name}</option>`;
            });
        }
    } catch (e) {
        console.error("Groups load error", e);
    }
}


async function loadJournal(keepPage = false) {
    const groupId = document.getElementById('journal-group-select').value;
    const courseId = document.getElementById('journal-course-select').value;
    const month = document.getElementById('journal-month-select').value;

    if (!groupId || !courseId) {
        alert("Топты және пәнді таңдаңыз");
        return;
    }

    journalState.groupId = groupId;
    journalState.courseId = courseId;
    journalState.month = month;

    if (!keepPage) {
        journalState.pageIndex = 0; // Reset page only if requested
    }

    const container = document.getElementById('journal-table-container');
    container.innerHTML = '<div class="loader" style="text-align:center; padding:20px;">Жүктелуде... <i class="fa-solid fa-spinner fa-spin"></i></div>';

    try {
        const url = `/api/teacher/journal/?group_id=${groupId}&course_id=${courseId}&month=${month}`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.status === 'success') {
            journalState.data = data;
            renderJournalTable();
        } else {
            container.innerHTML = `<p class="error-msg">${data.error || 'Қате'}</p>`;
        }
    } catch (e) {
        container.innerHTML = `<p class="error-msg">Сервер қатесі: ${e.message}</p>`;
    }
}


function changePage(offset) {
    if (!journalState.data || !journalState.data.dates) return;

    const totalDates = journalState.data.dates.length;
    const maxPage = Math.ceil(totalDates / journalState.pageSize) - 1;

    let newIndex = journalState.pageIndex + offset;
    if (newIndex < 0) newIndex = 0;
    if (newIndex > maxPage) newIndex = maxPage;

    if (newIndex !== journalState.pageIndex) {
        journalState.pageIndex = newIndex;
        renderJournalTable();
    }
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
}

function renderJournalTable() {
    const container = document.getElementById('journal-table-container');
    const data = journalState.data;

    if (!data.students || data.students.length === 0) {
        container.innerHTML = '<p class="text-muted" style="padding:20px; text-align:center;">Бұл топта студенттер жоқ.</p>';
        return;
    }

    // Pagination Logic
    const allDates = data.dates || [];
    const startIndex = journalState.pageIndex * journalState.pageSize;
    const endIndex = Math.min(startIndex + journalState.pageSize, allDates.length);
    const visibleDates = allDates.slice(startIndex, endIndex);

    // Controls HTML
    const totalPages = Math.ceil(allDates.length / journalState.pageSize) || 1;
    const currentPage = journalState.pageIndex + 1;

    let controlsHtml = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; border-radius: 12px 12px 0 0;">
                <button class="btn-sm" onclick="changePage(-1)" ${journalState.pageIndex === 0 ? 'disabled' : ''} style="cursor: pointer; padding: 6px 12px; border: 1px solid #cbd5e0; border-radius: 6px; background: white; ${journalState.pageIndex === 0 ? 'opacity: 0.5;' : ''}">
                    <i class="fa-solid fa-chevron-left"></i> Артқа
                </button>
                <div style="font-size: 14px; font-weight: 600; color: #4a5568;">
                    Кезең: ${visibleDates.length > 0 ? formatDate(visibleDates[0]) : ''} - ${visibleDates.length > 0 ? formatDate(visibleDates[visibleDates.length - 1]) : ''} 
                    <span style="font-weight:400; color:#718096; margin-left: 8px;">(${currentPage} / ${totalPages})</span>
                </div>
                <button class="btn-sm" onclick="changePage(1)" ${journalState.pageIndex >= totalPages - 1 ? 'disabled' : ''} style="cursor: pointer; padding: 6px 12px; border: 1px solid #cbd5e0; border-radius: 6px; background: white; ${journalState.pageIndex >= totalPages - 1 ? 'opacity: 0.5;' : ''}">
                    Алға <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        `;

    let html = `
    <div style="background:white; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        ${controlsHtml}
        <div class="table-responsive" style="overflow-x: auto;">
            <table class="journal-table" style="width: 100%; border-collapse: collapse; min-width: 800px;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding: 12px; text-align: left; position: sticky; left: 0; background: #f8fafc; z-index: 10; min-width: 200px;">Студент</th>
    `;

    visibleDates.forEach(date => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        // Weekday
        const days = ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'];
        const wDay = days[d.getDay()];

        html += `<th style="padding: 12px; text-align: center; min-width: 60px;">
            <div style="font-size: 11px; color: #718096; font-weight: normal;">${wDay}</div>
            ${day}.${month}
        </th>`;
    });

    // Add button column
    html += `
        <th style="padding: 12px; text-align: center; min-width: 80px;">
            <button class="btn-icon" onclick="openGradeModal()" title="Жаңа баға" style="background:none; border:none; cursor:pointer; color:var(--primary-color);">
                <i class="fa-solid fa-plus-circle fa-lg"></i>
            </button>
        </th>
        </tr></thead><tbody>
    `;

    data.students.forEach(student => {
        html += `<tr style="border-bottom: 1px solid #edf2f7;">`;
        // Student name
        html += `
            <td style="padding: 10px; position: sticky; left: 0; background: white; z-index: 5; box-shadow: 2px 0 5px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: 500;">${student.name}</span>
                </div>
            </td>
        `;

        // Cells
        visibleDates.forEach(date => {
            const grade = data.grades.find(g => g.student_id === student.id && g.date === date);
            if (grade) {
                // Determine badge color
                let color = '#4299e1'; // blue
                if (grade.value >= 90) color = '#48bb78'; // green
                else if (grade.value < 50) color = '#f56565'; // red

                html += `
                    <td style="padding: 8px; text-align: center; cursor: pointer;" 
                        onclick="openGradeModal(${student.id}, '${student.name}', '${date}', ${grade.id}, ${grade.value}, '${grade.type}', '${grade.comment || ''}')">
                        <span style="background: ${color}; color: white; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                            ${grade.value}
                        </span>
                    </td>
                `;
            } else {
                // Empty cell
                html += `
                    <td style="padding: 8px; text-align: center; cursor: pointer; color: #cbd5e0;" 
                        onclick="openGradeModal(${student.id}, '${student.name}', '${date}')">
                        -
                    </td>
                `;
            }
        });

        html += `<td></td></tr>`;
    });

    html += `</tbody></table></div></div>`;
    container.innerHTML = html;
}

// Modal functions
function openGradeModal(studentId = null, studentName = null, date = null, gradeId = null, value = null, type = 'practice', comment = '') {
    const modal = document.getElementById('teacher-grade-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex'); // Ensure flex for centering if CSS uses flex

    // Fill fields
    if (studentId) {
        document.getElementById('grade-student-id').value = studentId;
        document.getElementById('grade-student-name').value = studentName || 'Студент';
    } else {
        // General add mode (not specific cell click) - maybe disable student prefill?
        // But for "Add Column" usually we assume entire class logic or pick student?
        // Let's assume general add button is just to open modal, but user needs to pick student?
        // But our modal has readonly student name.
        // If cliked on header (+), maybe we want to add for ALL? Or select student?
        // Complex. Let's strict: Click on cell -> Add/Edit for that student/date.
        // Click on Header (+) -> Maybe assume just informative for now or "Mass fill"? 
        // Let's make the header (+) alert that you should click a cell.
        // OR: Make header (+) open a modal where you SELECT student. 
        if (!studentId) {
            alert("Өтінеміз, кестедегі ұяшықты басыңыз немесе студентті таңдаңыз.");
            closeGradeModal();
            return;
        }
    }

    document.getElementById('grade-date').value = date || new Date().toISOString().split('T')[0];
    document.getElementById('grade-id').value = gradeId || '';
    document.getElementById('grade-value').value = value || '';
    document.getElementById('grade-type').value = type;
    document.getElementById('grade-comment').value = comment;
}

function closeGradeModal() {
    document.getElementById('teacher-grade-modal').classList.add('hidden');
}

async function handleGradeSubmit(e) {
    e.preventDefault();

    const studentId = document.getElementById('grade-student-id').value;
    const gradeId = document.getElementById('grade-id').value;
    const date = document.getElementById('grade-date').value;
    const value = document.getElementById('grade-value').value;
    const type = document.getElementById('grade-type').value;
    const comment = document.getElementById('grade-comment').value;

    const courseId = document.getElementById('journal-course-select').value;

    const payload = {
        student_id: studentId,
        course_id: courseId,
        date: date,
        value: value,
        type: type,
        comment: comment,
        grade_id: gradeId || null
    };

    try {
        const resp = await fetch('/api/teacher/journal/save/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(payload)
        });

        const data = await resp.json();

        if (data.status === 'success') {
            closeGradeModal();
            // Reload table, keeping current page
            loadJournal(true);
        } else {
            alert("Қате: " + (data.error || 'Белгісіз'));
        }
    } catch (e) {
        alert("Сервер қатесі");
        console.error(e);
    }
}

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
