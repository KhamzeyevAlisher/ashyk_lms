// 1. Деректер массиві (Менің курстарым)
let myCoursesData = [
    {
        id: 1,
        title: "Кәсіпкерлік",
        description: "Бизнес негіздері",
        image: "https://c8.alamy.com/comp/2FMPWAA/tiny-businesspeople-grows-business-idea-business-characters-invest-in-new-idea-concept-making-money-teamwork-development-project-crowdfunding-and-2FMPWAA.jpg",
        category: "programming",
        status: "active"
    },
    {
        id: 2,
        title: "Маркетинг",
        description: "Нарықты талдау",
        image: "https://avatars.mds.yandex.net/i?id=70ff22730dbf2c50db8d51dd7d8cffd8_l-5676124-images-thumbs&n=13",
        category: "business",
        status: "completed"
    },
    {
        id: 3,
        title: "Экономикалық теория",
        description: "Микро және макро",
        image: "https://avatars.mds.yandex.net/i?id=ca9ae79b40efb8a42079c05462e5bfb7_l-8485406-images-thumbs&n=13",
        category: "design",
        status: "active"
    }
];

// 2. "Менің курстарымды" рендерлеу функциясы
function renderMyCourses(data = myCoursesData) {
    const container = document.getElementById('my-courses-grid');
    if (!container) return;

    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280;">Курстар табылмады.</p>';
        return;
    }

    const html = data.map(course => {
        // Статусқа байланысты белгіше немесе түс қосуға болады (мысал үшін)
        const statusBadge = course.status === 'completed' 
            ? '<span style="font-size: 10px; background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px; float: right;">Аяқталған</span>' 
            : '<span style="font-size: 10px; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; float: right;">Белсенді</span>';

        return `
            <div class="mini-course-card" onclick="alert('Курс ашылуда: ${course.title}')">
                <div class="course-img-wrapper">
                    <img src="${course.image}" alt="${course.title}" class="course-img">
                </div>
                <div class="course-info">
                    <h4>${course.title}</h4>
                    <p>${course.description} ${statusBadge}</p>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// 3. Dropdown (Селект) логикасы
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.custom-select');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.select-trigger');
        const options = dropdown.querySelectorAll('.option');
        const span = trigger.querySelector('span');

        // Ашу/Жабу
        trigger.addEventListener('click', () => {
            // Басқа ашық dropdown-дарды жабу
            dropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            dropdown.classList.toggle('active');
        });

        // Опцияны таңдау
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Мәтінді өзгерту
                span.textContent = option.textContent;
                
                // Active классын ауыстыру
                dropdown.querySelector('.option.selected').classList.remove('selected');
                option.classList.add('selected');
                
                // Dropdown-ды жабу
                dropdown.classList.remove('active');

                // Фильтрацияны іске қосу (қажет болса)
                filterCourses();
            });
        });
    });

    // Сыртқа басқанда жабу
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });
}

// 4. Фильтрация логикасы (Қарапайым мысал)
function filterCourses() {
    const categoryValue = document.querySelector('#myCategorySelect .option.selected').getAttribute('data-value');
    const statusValue = document.querySelector('#myStatusSelect .option.selected').getAttribute('data-value');
    const searchText = document.getElementById('myCourseSearch').value.toLowerCase();

    const filtered = myCoursesData.filter(course => {
        // Категория бойынша
        const matchCategory = categoryValue === 'all' || categoryValue === '' || course.category === categoryValue;
        // Статус бойынша
        const matchStatus = statusValue === 'all' || course.status === statusValue;
        // Іздеу бойынша
        const matchSearch = course.title.toLowerCase().includes(searchText);

        return matchCategory && matchStatus && matchSearch;
    });

    renderMyCourses(filtered);
}

// 5. Іздеу өрісіне тыңдаушы қосу
const searchInput = document.getElementById('myCourseSearch');
if(searchInput){
    searchInput.addEventListener('input', filterCourses);
}

// 6. Модальды терезе placeholder
function openAddCourseModal() {
    alert("Курс қосу модальды терезесі ашылады...");
    // Кейін осы жерге нақты модальды ашу кодын жазасыз
}

// Жүктелгенде іске қосу
document.addEventListener('DOMContentLoaded', () => {
    renderMyCourses();
    setupDropdowns();
});