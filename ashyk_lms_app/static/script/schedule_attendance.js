document.addEventListener("DOMContentLoaded", () => {
    // Структура данных, как требовалось (ключи - месяцы на казахском)
    let attendanceStats = {
        "Қыркүйек": { // Сентябрь
            "all": 45,
            "attendedDays": 42,
            "percent": 93
        },
        "Қазан": { // Октябрь
            "all": 50,
            "attendedDays": 48,
            "percent": 96
        },
        "Қараша": { // Ноябрь
            "all": 40,
            "attendedDays": 38,
            "percent": 95
        }
    };

    // Получаем контейнер
    const container = document.getElementById('attendance-section-unique');

    if (container) {
        // Создаем и добавляем общий заголовок
        const titleElement = document.createElement('div');
        titleElement.className = 'att-main-title';
        titleElement.innerText = 'Қатысу есебі'; // Отчет о посещаемости
        container.appendChild(titleElement);

        // Перебираем объект с данными
        for (const [month, data] of Object.entries(attendanceStats)) {
            
            // Создаем карточку месяца
            const card = document.createElement('div');
            card.className = 'att-month-card';

            // HTML содержимое карточки
            card.innerHTML = `
                <div class="att-card-header">
                    <span class="att-month-name">${month}</span>
                    <span class="att-fraction-text">${data.attendedDays}/${data.all}</span>
                </div>
                <div class="att-progress-track">
                    <div class="att-progress-fill" style="width: ${data.percent}%;"></div>
                </div>
                <p class="att-percent-subtitle">${data.percent}% қатысу</p>
            `;

            // Добавляем карточку в контейнер
            container.appendChild(card);
        }
    }
});