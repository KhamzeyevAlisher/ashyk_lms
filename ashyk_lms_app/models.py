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
    title = models.CharField(max_length=255, verbose_name="Название теста")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='tests', verbose_name="Предмет")
    duration_minutes = models.PositiveIntegerField(default=30, verbose_name="Длительность (мин)")
    deadline = models.DateTimeField(verbose_name="Дедлайн")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    is_active = models.BooleanField(default=True, verbose_name="Активен")

    class Meta:
        verbose_name = "Тест"
        verbose_name_plural = "Тесты"

    def __str__(self):
        return f"{self.title} ({self.subject.name})"


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