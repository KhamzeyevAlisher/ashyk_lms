from django.db import models
from django.contrib.auth.models import AbstractUser

# ==========================================
# 1. Кастомная модель пользователя
# ==========================================

class User(AbstractUser):
    ROLES = (
        ('student', 'Студент'),
        ('teacher', 'Преподаватель'),
        ('dean', 'Декан'),
        ('admin', 'Администратор'),
    )
    
    role = models.CharField(max_length=20, choices=ROLES, default='student', verbose_name='Роль')
    middle_name = models.CharField(max_length=100, blank=True, verbose_name='Отчество')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='Фото')
    
    # Кафедра/Факультет обычно нужны сотрудникам
    department = models.CharField(max_length=100, blank=True, verbose_name='Кафедра/Факультет')
    
    # Примечание: Поле group_name я убрал намеренно. 
    # Теперь группа привязывается через модель Student -> StudentGroup. 
    # Это позволяет избежать дублирования данных (текст в юзере vs ID в модели).

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def get_full_name_str(self):
        return f"{self.last_name} {self.first_name} {self.middle_name}".strip()

    def __str__(self):
        return self.get_full_name_str() or self.username


# ==========================================
# 2. Академическая часть
# ==========================================

class EducationalProgram(models.Model):
    """
    Модель: Образовательная программа (Направление подготовки)
    Пример: 09.03.01 Информатика и ВТ
    """
    code = models.CharField(
        max_length=50, 
        unique=True, 
        verbose_name="Код программы"
    )
    title = models.CharField(
        max_length=255, 
        blank=True, 
        verbose_name="Название программы"
    )

    class Meta:
        verbose_name = "Образовательная программа"
        verbose_name_plural = "Образовательные программы"

    def __str__(self):
        return f"{self.code} {self.title}"


class Curriculum(models.Model):
    """
    Модель: Учебный план
    Хранит структуру предметов в JSON.
    """
    program = models.ForeignKey(
        EducationalProgram, 
        on_delete=models.CASCADE, 
        related_name='curriculums',
        verbose_name="Образовательная программа"
    )
    
    plan_data = models.JSONField(
        verbose_name="Учебный план (JSON)"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата загрузки")

    class Meta:
        verbose_name = "Учебный план"
        verbose_name_plural = "Учебные планы"

    def __str__(self):
        return f"Учебный план: {self.program.code}"


class StudentGroup(models.Model):
    """
    Модель: Группа студента
    Теперь Группа знает, по какой Программе она учится.
    """
    name = models.CharField(
        max_length=50, 
        unique=True,
        verbose_name="Название группы"
    )
    # ВАЖНОЕ ИЗМЕНЕНИЕ: Группа привязана к программе
    program = models.ForeignKey(
        EducationalProgram,
        on_delete=models.PROTECT, # Нельзя удалить программу, пока есть группы на ней
        related_name='groups',
        verbose_name="Образовательная программа"
    )

    class Meta:
        verbose_name = "Группа студентов"
        verbose_name_plural = "Группы студентов"

    def __str__(self):
        return self.name


class Student(models.Model):
    """
    Модель: Профиль Студента
    Связывает User с академическими данными.
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='student_profile',
        verbose_name="Пользователь"
    )
    group = models.ForeignKey(
        StudentGroup, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='students',
        verbose_name="Группа"
    )
    
    # Поле 'program' здесь больше не нужно, 
    # так как мы можем узнать программу через группу: self.group.program

    class Meta:
        verbose_name = "Профиль студента"
        verbose_name_plural = "Профили студентов"

    def __str__(self):
        return f"Студент: {self.user.get_full_name_str()}"

    @property
    def program(self):
        """
        Удобное свойство, чтобы получать программу напрямую у студента.
        Использование: student_obj.program
        """
        if self.group:
            return self.group.program
        return None


class Department(models.Model):
    """
    Модель: Кафедра / Факультет
    """
    name = models.CharField(
        max_length=255, 
        unique=True, 
        verbose_name="Название кафедры"
    )
    description = models.TextField(
        blank=True, 
        verbose_name="Описание"
    )

    class Meta:
        verbose_name = "Кафедра"
        verbose_name_plural = "Кафедры"

    def __str__(self):
        return self.name


class Teacher(models.Model):
    """
    Модель: Профиль Преподавателя
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='teacher_profile',
        verbose_name="Пользователь"
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='teachers',
        verbose_name="Кафедра"
    )
    degree = models.CharField(
        max_length=150, 
        verbose_name="Білімі / Гылыми дәрежесі (Степень)"
    )
    position = models.CharField(
        max_length=150, 
        blank=True, 
        verbose_name="Лауазымы (Должность)"
    )
    photo = models.ImageField(
        upload_to='teacher_photos/', 
        blank=True, 
        null=True, 
        verbose_name="Фото"
    )

    class Meta:
        verbose_name = "Профиль преподавателя"
        verbose_name_plural = "Профили преподавателей"

    def __str__(self):
        return self.user.get_full_name_str()


class Course(models.Model):
    """
    Модель: Курс (Дисциплина с контентом)
    Пример: "Кәсіпкерлік", "Python негіздері"
    """
    title = models.CharField(max_length=255, unique=True, verbose_name="Название")
    code = models.CharField(max_length=50, unique=True, null=True, blank=True, verbose_name="Код курса")
    description = models.TextField(verbose_name="Описание", blank=True)
    cover_image = models.ImageField(upload_to='course_covers/', blank=True, null=True, verbose_name="Обложка")
    
    # Мета-информация
    # department = models.CharField(max_length=100, blank=True, verbose_name="Кафедра")
    # instructor_name = models.CharField(max_length=150, blank=True, verbose_name="ФИО преподавателя")
    
    department = models.ForeignKey(
        'Department', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='courses',
        verbose_name="Кафедра"
    )
    instructor = models.ForeignKey(
        'Teacher', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='courses',
        verbose_name="Преподаватель"
    )

    duration_text = models.CharField(max_length=50, blank=True, verbose_name="Длительность (строка)")
    
    # Тэги (храним как строку через запятую или JSON)
    tags = models.CharField(max_length=255, blank=True, verbose_name="Тэги (через запятую)")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    allowed_groups = models.ManyToManyField(
        'StudentGroup',
        blank=True,
        related_name='allowed_courses',
        verbose_name="Доступно группам (если пусто — никому)"
    )

    class Meta:
        verbose_name = "Курс"
        verbose_name_plural = "Курсы"

    def __str__(self):
        if self.code:
            return f"[{self.code}] {self.title}"
        return self.title


class Lecture(models.Model):
    """
    Модель: Лекция внутри курса
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lectures', verbose_name="Курс")
    title = models.CharField(max_length=255, verbose_name="Тема лекции")
    description = models.TextField(verbose_name="Описание", blank=True)
    category = models.CharField(max_length=100, blank=True, verbose_name="Категория (н-р, Менеджмент)")
    
    duration = models.CharField(max_length=50, blank=True, verbose_name="Длительность")
    scheduled_date = models.DateField(blank=True, null=True, verbose_name="Дата проведения")
    
    # Видео источники
    video_url = models.URLField(blank=True, verbose_name="Ссылка на видео (YouTube/MP4)")
    
    order = models.PositiveIntegerField(default=0, verbose_name="Порядковый номер")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Лекция"
        verbose_name_plural = "Лекции"
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class LectureFile(models.Model):
    """
    Файлы к лекции (слайды, доп. материалы)
    """
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='files', verbose_name="Лекция")
    file = models.FileField(upload_to='lecture_files/', verbose_name="Файл")
    name = models.CharField(max_length=255, blank=True, verbose_name="Отображаемое имя")

    class Meta:
        verbose_name = "Файл лекции"
        verbose_name_plural = "Файлы лекций"

    def __str__(self):
        return self.name or str(self.file)
    
# ==========================================
# 3. Журнал и Оценки
# ==========================================

class Subject(models.Model):
    """
    Модель: Предмет (Дисциплина)
    Например: "Алгоритмдер және деректер құрылымы"
    """
    name = models.CharField(
        max_length=255, 
        verbose_name="Название предмета"
    )
    # Можно добавить code, если нужен уникальный код предмета
    # code = models.CharField(max_length=20, unique=True, blank=True)

    class Meta:
        verbose_name = "Предмет"
        verbose_name_plural = "Предметы"

    def __str__(self):
        return self.name


class Grade(models.Model):
    """
    Модель: Оценка
    Хранит конкретную оценку студента по предмету с типом работы и комментарием.
    """
    GRADE_TYPES = (
        ('lecture', 'Лекция'),
        ('homework', 'Үй жұмысы'),     # Домашка
        ('practice', 'Тәжірибе'),      # Практика
        ('lab', 'Зертханалық'),        # Лабораторная
        ('srsp', 'СРСП'),              # СРСП
        ('exam', 'Емтихан'),           # Можно добавить экзамен/рубежку
    )

    student = models.ForeignKey(
        Student, 
        on_delete=models.CASCADE, 
        related_name='grades',
        verbose_name="Студент"
    )
    subject = models.ForeignKey(
        Subject, 
        on_delete=models.CASCADE, 
        related_name='grades',
        verbose_name="Предмет"
    )
    value = models.PositiveSmallIntegerField(
        verbose_name="Оценка"
    )
    grade_type = models.CharField(
        max_length=20, 
        choices=GRADE_TYPES, 
        default='practice',
        verbose_name="Тип работы"
    )
    comment = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Комментарий преподавателя"
    )
    created_at = models.DateTimeField(
        auto_now_add=True, 
        verbose_name="Дата выставления"
    )

    class Meta:
        verbose_name = "Оценка"
        verbose_name_plural = "Оценки"
        ordering = ['created_at']

    def __str__(self):
        return f"{self.subject.name} - {self.student.user.last_name}: {self.value}"


# ==========================================
# 4. Тестирование (Testing)
# ==========================================

class Test(models.Model):
    STATUS_CHOICES = [
        ('active', 'Активный'),
        ('retake', 'Пересдача'),
        ('closed', 'Закрыт'),
    ]

    title = models.CharField(max_length=255, verbose_name="Название теста")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='tests', verbose_name="Предмет")
    
    # New fields
    student_group = models.ForeignKey(
        'StudentGroup', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='tests', 
        verbose_name="Группа"
    )
    student = models.ForeignKey(
        'Student', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        default=None,
        related_name='individual_tests', 
        verbose_name="Студент (индивидуально)"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='active', 
        verbose_name="Статус"
    )

    duration_minutes = models.PositiveIntegerField(default=30, verbose_name="Длительность (мин)")
    deadline = models.DateTimeField(verbose_name="Дедлайн")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    is_active = models.BooleanField(default=True, verbose_name="Активен")

    class Meta:
        verbose_name = "Тест"
        verbose_name_plural = "Тесты"

    def __str__(self):
        target = f" - {self.student_group.name}" if self.student_group else ""
        return f"{self.title} ({self.subject.name}){target}"


class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions', verbose_name="Тест")
    text = models.TextField(verbose_name="Текст вопроса")
    points = models.PositiveIntegerField(default=1, verbose_name="Баллы")
    is_multiple_choice = models.BooleanField(default=False, verbose_name="Множественный выбор")

    class Meta:
        verbose_name = "Вопрос"
        verbose_name_plural = "Вопросы"

    def __str__(self):
        return self.text[:50]


class Variant(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='variants', verbose_name="Вопрос")
    text = models.CharField(max_length=255, verbose_name="Текст ответа")
    is_correct = models.BooleanField(default=False, verbose_name="Правильный ответ")

    class Meta:
        verbose_name = "Вариант ответа"
        verbose_name_plural = "Варианты ответов"

    def __str__(self):
        return self.text


class StudentAnswer(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE, related_name='answers', verbose_name="Студент")
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='student_answers', verbose_name="Тест")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='student_answers', verbose_name="Вопрос")
    selected_variants = models.ManyToManyField(Variant, verbose_name="Выбранные варианты")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Время ответа")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Время обновления")

    class Meta:
        verbose_name = "Ответ студента"
        verbose_name_plural = "Ответы студентов"
        unique_together = ('student', 'test', 'question')

    def __str__(self):
        return f"{self.student} - {self.question}"


class TestResult(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='test_results', verbose_name="Студент")
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='results', verbose_name="Тест")
    score = models.PositiveIntegerField(verbose_name="Набранный балл")
    max_score = models.PositiveIntegerField(verbose_name="Максимальный балл")
    percentage = models.FloatField(verbose_name="Процент")
    finished_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата завершения")

    class Meta:
        verbose_name = "Результат теста"
        verbose_name_plural = "Результаты тестов"

    def __str__(self):
        return f"{self.student.user.get_full_name_str()} - {self.test.title}: {self.score}/{self.max_score}"

# ==========================================
# 5. Домашние задания (Homework)
# ==========================================

class Homework(models.Model):
    """
    Модель: Домашнее задание
    Создается преподавателем для конкретного курса.
    """
    course = models.ForeignKey(
        Course, 
        on_delete=models.CASCADE, 
        related_name='homeworks',
        verbose_name="Курс"
    )
    allowed_groups = models.ManyToManyField(
        StudentGroup, 
        blank=True, 
        related_name='homeworks',
        verbose_name="Доступно группам (если пусто — всем участникам курса)"
    )
    teacher = models.ForeignKey(
        Teacher, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_homeworks',
        verbose_name="Преподаватель"
    )
    title = models.CharField(max_length=255, verbose_name="Заголовок")
    description = models.TextField(verbose_name="Описание")
    file = models.FileField(upload_to='homework_tasks/', blank=True, null=True, verbose_name="Файл с заданием")
    deadline = models.DateTimeField(verbose_name="Крайний срок (Дедлайн)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    class Meta:
        verbose_name = "Домашнее задание"
        verbose_name_plural = "Домашние задания"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class HomeworkSubmission(models.Model):
    """
    Модель: Сдача домашнего задания студентом
    """
    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('submitted', 'Сдано'),
        ('on_review', 'На проверке'),
        ('graded', 'Оценено'),
    ]

    homework = models.ForeignKey(
        Homework, 
        on_delete=models.CASCADE, 
        related_name='submissions',
        verbose_name="Задание"
    )
    student = models.ForeignKey(
        Student, 
        on_delete=models.CASCADE, 
        related_name='homework_submissions',
        verbose_name="Студент"
    )
    content = models.TextField(blank=True, verbose_name="Текст ответа")
    file = models.FileField(upload_to='homework_submissions/', blank=True, null=True, verbose_name="Файл с решением")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='submitted',
        verbose_name="Статус"
    )
    grade = models.OneToOneField(
        'Grade',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='homework_submission',
        verbose_name="Оценка в журнале"
    )
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата сдачи")

    class Meta:
        verbose_name = "Сдача задания"
        verbose_name_plural = "Сдачи заданий"
        unique_together = ('homework', 'student')

    def __str__(self):
        return f"{self.student.user.get_full_name_str()} - {self.homework.title}"

    def set_grade(self, value, comment=""):
        """
        Устанавливает оценку за задание и сохраняет её в журнал (Grade).
        """
        # Находим или создаем предмет (Subject) по названию курса
        # Т.к. Homework привязана к Course, а Grade требует Subject
        subject, created = Subject.objects.get_or_create(name=self.homework.course.title)

        if self.grade:
            self.grade.subject = subject  # Принудительно синхронизируем предмет
            self.grade.value = value
            self.grade.comment = comment
            self.grade.save()
        else:
            self.grade = Grade.objects.create(
                student=self.student,
                subject=subject,
                value=value,
                grade_type='homework',
                comment=comment
            )
        
        self.status = 'graded'
        self.save()


class GroupSchedule(models.Model):
    group = models.OneToOneField(
        'StudentGroup', 
        on_delete=models.CASCADE, 
        related_name='schedule',
        verbose_name="Группа"
    )
    data = models.JSONField(
        verbose_name="Данные расписания",
        default=dict
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Расписание группы"
        verbose_name_plural = "Расписания групп"

    def __str__(self):
        return f"Расписание: {self.group.name}"
