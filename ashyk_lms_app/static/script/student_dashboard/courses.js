let coursesData = [
    {
        title: "Кәсіпкерлік",
        description: "Бизнес негіздері",
        image: "https://cdn.culture.ru/images/6c3b2d76-23b7-5372-a282-81a13cf3d4f4",
    },
    {
        title: "Маркетинг",
        description: "Нарықты талдау",
        image: "https://avatars.mds.yandex.net/i?id=70ff22730dbf2c50db8d51dd7d8cffd8_l-5676124-images-thumbs&n=13",
    },
    {
        title: "Экономикалық теория",
        description: "Микро және макро",
        image: "https://avatars.mds.yandex.net/i?id=ca9ae79b40efb8a42079c05462e5bfb7_l-8485406-images-thumbs&n=13",
    }
];

// 2. Функция рендеринга
function renderCourses() {
    const container = document.querySelector('#tab-courses .courses-grid');
    
    // Очищаем контейнер перед рендерингом (на случай повторного вызова)
    if (!container) return;
    container.innerHTML = '';

    // Генерируем HTML для каждого курса
    const coursesHTML = coursesData.map(course => {
        // Если есть действие action, добавляем атрибут onclick, иначе пустая строка
        const clickAttr =  `onclick="renderCourseByTitle('${course.title}')"`;

        return `
            <div class="mini-course-card" ${clickAttr}>
                <div class="course-img-wrapper">
                    <img src="${course.image}" alt="${course.title}" class="course-img">
                </div>
                <div class="course-info">
                    <h4>${course.title}</h4>
                    <p>${course.description}</p>
                </div>
            </div>
        `;
    }).join('');

    // Вставляем полученный HTML в контейнер
    container.innerHTML = coursesHTML;
}


// 3. Запуск рендеринга после загрузки страницы
document.addEventListener('DOMContentLoaded', renderCourses);