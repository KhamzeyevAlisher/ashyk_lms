async function renderCourses() {
    const container = document.querySelector('#tab-courses .courses-grid');
    if (!container) return;

    container.innerHTML = '<p>Жүктелуде...</p>';

    try {
        const response = await fetch('/api/courses/');
        const data = await response.json();

        if (data.status !== 'success') {
            container.innerHTML = `<p>${data.error || 'Қате орын алды'}</p>`;
            return;
        }

        const coursesData = data.courses;

        if (coursesData.length === 0) {
            container.innerHTML = '<p>Курстар жоқ.</p>';
            return;
        }

        const coursesHTML = coursesData.map(course => {
            const clickAttr = `onclick="renderCourseByTitle('${course.title}')"`;
            return `
                <div class="mini-course-card" ${clickAttr}>
                    <div class="course-img-wrapper">
                        <img src="${course.image || '/static/img/default-course.jpg'}" alt="${course.title}" class="course-img">
                    </div>
                    <div class="course-info">
                        <h4>${course.title}</h4>
                        <p>${course.instructor || ''}</p>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = coursesHTML;

    } catch (error) {
        console.error("Courses loading error:", error);
        container.innerHTML = '<p>Сервермен байланыс қатесі.</p>';
    }
}

document.addEventListener('DOMContentLoaded', renderCourses);