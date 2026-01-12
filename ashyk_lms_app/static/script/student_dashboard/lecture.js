// Массив с данными всех лекций
// Каждый объект содержит информацию об одной лекции: категория, курс, название, описание, продолжительность, дата и файлы для скачивания
let lecturesData = [
    {
        category: "Бағдарламалау",
        course: "JavaScript",
        title: "JavaScript-тегі ООП: Кластар және мұрагерлік",
        description: "Объектіге бағытталған бағдарламалауды, кластарды және прототиптерді үйрену",
        duration: "1 сағ 15 мин",
        date: "22.11.2025",
        files: [
            { name: "slides.pdf", url: "#" },
            { name: "code-examples.zip", url: "#" }
        ]
    },
    {
        category: "Бағдарламалау",
        course: "JavaScript",
        title: "Асинхронды бағдарламалау және Promises",
        description: "Асинхронды кодпен, промистермен, async/await-пен жұмыс",
        duration: "1 сағ",
        date: "26.11.2025",
        files: [] 
    }
];

function renderLectures(data) {
    // Получаем контейнер, в который будут добавлены карточки лекций
    const container = document.getElementById('lecture-list');
    
    // Очищаем контейнер перед добавлением новых элементов
    container.innerHTML = '';

    // Проходим по каждой лекции в массиве
    data.forEach(lecture => {
        // Генерируем HTML-разметку для скачиваемых файлов лекции
        // Если файлы есть, создаём контейнер со ссылками на загрузку
        const filesHtml = lecture.files && lecture.files.length > 0 
            ? `<div class="lecture-files">
                ${lecture.files.map(file => `
                    <a href="${file.url}" class="file-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        ${file.name}
                    </a>
                `).join('')}
               </div>` 
            : '';

        // Создаём HTML-разметку для карточки лекции с иконкой, названием, описанием и кнопкой
        const cardHtml = `
            <div class="card lecture-card">
                <div class="lecture-icon-box">
                    <!-- Иконка воспроизведения видео -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="play-icon">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                </div>

                <div class="lecture-content">
                    <!-- Категория лекции -->
                    <div class="lecture-category">${lecture.category}</div>
                    <!-- Название лекции -->
                    <h3 class="lecture-title">${lecture.title}</h3>
                    <!-- Описание содержания лекции -->
                    <p class="lecture-desc">${lecture.description}</p>
                    
                    <!-- Метаинформация: продолжительность и дата лекции -->
                    <div class="lecture-meta">
                        <div class="meta-item">
                            <!-- Иконка часов для отображения продолжительности -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>${lecture.duration}</span>
                        </div>
                        <!-- Дата проведения лекции -->
                        <div class="meta-item">
                            <span>${lecture.date}</span>
                        </div>
                    </div>

                    <!-- Вставляем HTML с файлами для скачивания -->
                    ${filesHtml}

                    <!-- Кнопка для открытия лекции -->
                    <button class="btn-primary btn-watch" onclick="openLesson('${lecture.course}', '${lecture.title}')">Көруді бастау</button>
                </div>
            </div>
        `;

        // Добавляем сгенерированную карточку лекции в контейнер (в конец)
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}


// Запускаем функцию отрисовки лекций после полной загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    // Вызываем функцию с массивом данных лекций
    renderLectures(lecturesData);
});