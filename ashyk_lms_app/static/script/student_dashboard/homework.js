
// 1. Глобальная переменная для хранения данных (чтобы модалка имела к ним доступ)
let homeworksDataList = [];

/**
 * Функция для открытия и заполнения модального окна.
 * Она вызывается через атрибут onclick="openHomeworkModalOverley(this)"
 * @param {HTMLElement} buttonElement - Элемент кнопки, на которую нажали.
 */



document.addEventListener("DOMContentLoaded", function () {
    fetchHomeworks();

    const submitBtn = document.getElementById('modal-submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmission);
    }
});

let selectedHomeworkId = null;

// Re-write open function to store ID
function openHomeworkModalOverley(buttonElement) {
    selectedHomeworkId = parseInt(buttonElement.dataset.id);
    const taskDetails = homeworksDataList.find(h => h.id === selectedHomeworkId);

    if (taskDetails) {
        document.getElementById('modal-subject').textContent = taskDetails.courseName;
        document.getElementById('modal-task-description').textContent = taskDetails.title;

        // Clear previous inputs
        const fileInput = document.getElementById('modal-file-input');
        if (fileInput) fileInput.value = '';
        document.getElementById('comment').value = '';

        const modalOverlay = document.getElementById('homework-modal-overlay');
        modalOverlay.classList.add('active');
    } else {
        console.error("Не найдены данные для ID:", selectedHomeworkId);
    }
}

async function handleSubmission() {
    if (!selectedHomeworkId) {
        alert("Ошибка: задание не выбрано");
        return;
    }

    const fileInput = document.getElementById('modal-file-input');
    const commentInput = document.getElementById('comment');

    const file = fileInput.files[0];
    const comment = commentInput.value;

    if (!file && !comment) {
        alert("Файл немесе пікір енгізіңіз");
        return;
    }

    const formData = new FormData();
    formData.append('homework_id', selectedHomeworkId);
    formData.append('comment', comment);
    if (file) {
        formData.append('file', file);
    }

    // CSRF Token
    // We need to get it from cookie or DOM. Django typically sets csrftoken cookie.
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
    const csrftoken = getCookie('csrftoken');

    try {
        const submitBtn = document.getElementById('modal-submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Жіберілуде...";

        const response = await fetch('/api/homeworks/submit/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            alert(result.message || "Сәтті жіберілді!");
            closeModal();
            fetchHomeworks(); // Refresh list/stats
        } else {
            alert("Қате: " + (result.error || "Белгісіз қате"));
        }
    } catch (error) {
        console.error("Submission error:", error);
        alert("Жіберу кезінде қате орын алды");
    } finally {
        const submitBtn = document.getElementById('modal-submit-btn');
        submitBtn.disabled = false;
        submitBtn.textContent = "Жіберу";
    }
}

const container = document.querySelector('.list_container_homework');

const modalOverlay = document.getElementById('homework-modal-overlay');
const closeBtn = document.getElementById('modal-close-btn');
const cancelBtn = document.getElementById('modal-cancel-btn');

function closeModal() {
    modalOverlay.classList.remove('active');
}

// Закрыть по клику на "крестик", кнопку "Болдырмау" или на темный фон
if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
if (modalOverlay) {
    modalOverlay.addEventListener('click', function (event) {
        // Закрываем, только если клик был на самом оверлее, а не на его содержимом
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
}

// 3. Функция для создания HTML одной карточки
function createHomeworkCard(details) {
    // --- Логика для определения статуса ---
    let statusBadgeHtml = '';
    // Statuses from API: 'todo', 'review', 'missed', 'done'
    switch (details.status) {
        case 'review':
            statusBadgeHtml = `
                <div class="status_badge_homework status_review_homework">
                    <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Тексерілуде
                </div>`;
            break;
        case 'missed':
            statusBadgeHtml = `
                <div class="status_badge_homework status_missed_homework">
                    <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        Тапсырылмаған
                </div>`;
            break;
        case 'done':
            statusBadgeHtml = `
                <div class="status_badge_homework status_done_homework">
                    <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"></path></svg>
                    Тексерілді
                </div>`;
            break;
        default: // 'todo' or unknown
            statusBadgeHtml = `
                <div class="status_badge_homework" style="background: #eef2ff; color: #4f46e5;">
                    <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Орындау керек
                </div>`;
            break;
    }

    // --- Логика для отображения дней или оценки ---
    let metaExtraHtml = '';
    // Days left - only relevant if NOT done/review/missed (i.e. if todo) ?? 
    // Or always show if present? Let's show if present.
    if (details.daysLeft !== null && details.daysLeft !== undefined) {
        metaExtraHtml += `
            <div class="meta_item_homework">
                <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>${details.daysLeft} күн қалды</span>
            </div>`;
    }

    if (details.grade) {
        metaExtraHtml += `
            <div class="meta_item_homework grade_text_homework">
                <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span>Баға: ${details.grade}</span>
            </div>`;
    }

    // --- Создаем HTML-структуру карточки ---
    const card = document.createElement('div');
    card.className = 'task_card_homework';
    card.innerHTML = `
        <div class="card_left_homework">
            <div class="subject_name_homework">${details.courseName}</div>
            <h4 class="task_title_homework">${details.title}</h4>
            <div class="teacher_name_homework">${details.teacher}</div>
            <div class="meta_row_homework">
                <div class="meta_item_homework">
                    <svg class="icon_svg_homework" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Мерзімі: ${details.deadline}</span>
                </div>
                ${metaExtraHtml}
            </div>
        </div>
        <div class="card_right_homework">
            ${statusBadgeHtml}
            <button class="btn_details_homework" data-id='${details.id}'>Толығырақ</button>
        </div>
    `;
    return card;
}

function renderCards(list) {
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666; margin-top:20px;">Тапсырмалар жоқ</p>';
        return;
    }

    list.forEach(details => {
        const cardElement = createHomeworkCard(details);
        container.appendChild(cardElement);
    });

    // Re-attach listeners
    const detailsButtons = document.querySelectorAll('.btn_details_homework');
    detailsButtons.forEach(button => {
        button.addEventListener('click', function () {
            openHomeworkModalOverley(this);
        });
    });
}

function filterHomeworkCards(status) {
    if (status === 'all') {
        renderCards(homeworksDataList);
    } else {
        const filtered = homeworksDataList.filter(item => item.status === status);
        renderCards(filtered);
    }
}

function setActiveTab(clickedButton) {
    const allTabs = document.querySelectorAll('.tab_btn_homework');
    allTabs.forEach(tab => {
        tab.classList.remove('active_homework');
    });
    clickedButton.classList.add('active_homework');
}

// FETCH DATA from API
async function fetchHomeworks() {
    try {
        const response = await fetch('/api/homeworks/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.status === 'success') {
            homeworksDataList = data.homeworks;
            updateStatistics(homeworksDataList);
            renderCards(homeworksDataList);
        } else {
            console.error('API Error:', data.error);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        container.innerHTML = '<p style="text-align:center; color:red;">Деректерді жүктеу қатесі</p>';
    }
}

function updateStatistics(list) {
    // Update tab counts
    const allCount = list.length;
    const missedCount = list.filter(i => i.status === 'missed').length;
    const reviewCount = list.filter(i => i.status === 'review').length;
    const doneCount = list.filter(i => i.status === 'done').length;

    // Assuming tabs are in specific order or have IDs. 
    // Here we'll stick to the existing onclick handlers logic but update text content if possible.
    // Ideally, tabs should have IDs. Let's try to update by text analysis or querySelectorOrder.

    const tabs = document.querySelectorAll('.tab_btn_homework');
    if (tabs.length >= 4) {
        tabs[0].textContent = `Барлығы (${allCount})`;
        tabs[1].textContent = `Тапсырылмаған (${missedCount})`;
        tabs[2].textContent = `Тексерілуде (${reviewCount})`;
        tabs[3].textContent = `Тексерілді (${doneCount})`;
    }

    // Update status cards (Yellow/Blue/Green)
    const warningCardValue = document.querySelector('.card_warning_homework .card_value_homework');
    if (warningCardValue) warningCardValue.textContent = missedCount;

    const reviewCardValue = document.querySelector('.card_review_homework .card_value_homework');
    if (reviewCardValue) reviewCardValue.textContent = reviewCount;

    // Average score calculation (optional improvement)
    // There is a success card "Орташа балл", we could calculate it from done tasks
    const gradedTasks = list.filter(i => i.status === 'done' && i.grade);
    let avg = 0;
    if (gradedTasks.length > 0) {
        let sum = 0;
        let count = 0;
        gradedTasks.forEach(t => {
            // grade is "95/100" string
            const parts = t.grade.split('/');
            if (parts.length > 0) {
                const val = parseFloat(parts[0]);
                if (!isNaN(val)) {
                    sum += val;
                    count++;
                }
            }
        });
        if (count > 0) avg = Math.round(sum / count);
    }

    const successCardValue = document.querySelector('.card_success_homework .card_value_homework');
    // If we want real average:
    // if (successCardValue) successCardValue.textContent = avg + "%";
}

document.addEventListener("DOMContentLoaded", function () {
    fetchHomeworks();
});
