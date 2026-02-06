import json
from django.contrib import admin
from django.utils.safestring import mark_safe
from django.db import models
from django.forms import widgets
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import (
    User, 
    Student, 
    StudentGroup, 
    EducationalProgram, 
    Curriculum, 
    Subject, 
    Grade,
    Test,
    Question,
    Variant,
    TestResult,
    StudentAnswer,
    Course,
    Lecture,
    LectureFile,
    Teacher,
    Department,
    Homework,
    HomeworkSubmission,
    GroupSchedule
)

# ========================================================
# 1. Пользователи и Профиль студента
# ========================================================

class StudentInline(admin.StackedInline):
    """
    Инлайн позволяет редактировать профиль студента (группу)
    прямо внутри страницы редактирования Пользователя.
    """
    model = Student
    can_delete = False
    verbose_name_plural = 'Профиль студента'
    fk_name = 'user'
    extra = 0 

class TeacherInline(admin.StackedInline):
    model = Teacher
    can_delete = False
    verbose_name_plural = 'Профиль преподавателя'
    fk_name = 'user'
    extra = 0

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    inlines = (StudentInline, TeacherInline)

    # Поля в списке
    list_display = (
        'username', 
        'get_full_name_str', 
        'role', 
        'get_student_group', 
        'department', 
        'display_avatar'
    )

    list_display_links = ('username', 'get_full_name_str')

    # Фильтры
    list_filter = ('role', 'is_active', 'department', 'student_profile__group')

    # Поиск
    search_fields = (
        'username', 
        'first_name', 
        'last_name', 
        'email', 
        'phone',
        'student_profile__group__name'
    )

    # Настройка формы редактирования
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительная информация', {
            'fields': (
                'role', 
                'middle_name', 
                'phone', 
                'avatar', 
                'department', 
            ),
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',),
            'fields': ('role', 'email', 'first_name', 'last_name', 'middle_name'),
        }),
    )
    
    # --- Кастомные методы ---

    def display_avatar(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" style="width: 30px; height: 30px; border-radius: 50%;" />', obj.avatar.url)
        return "-"
    display_avatar.short_description = 'Фото'

    def get_student_group(self, obj):
        if hasattr(obj, 'student_profile') and obj.student_profile.group:
            return obj.student_profile.group.name
        return "-"
    get_student_group.short_description = 'Группа'
    
    def get_full_name_str(self, obj):
        return obj.get_full_name_str()
    get_full_name_str.short_description = 'ФИО'


# ========================================================
# 2. Академическая структура (Программы, Группы, Студенты)
# ========================================================

@admin.register(EducationalProgram)
class EducationalProgramAdmin(admin.ModelAdmin):
    list_display = ('code', 'title')
    search_fields = ('code', 'title')

@admin.register(StudentGroup)
class StudentGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'program')
    list_filter = ('program',)
    search_fields = ('name',)

@admin.register(Curriculum)
class CurriculumAdmin(admin.ModelAdmin):
    list_display = ('program', 'created_at', 'json_preview')
    list_filter = ('program',)
    readonly_fields = ('json_pretty_print',)

    # Делаем поле JSON большим и удобным
    formfield_overrides = {
        models.JSONField: {'widget': widgets.Textarea(attrs={
            'rows': 20, 
            'cols': 100, 
            'style': 'font-family: monospace; font-size: 13px;'
        })},
    }

    fieldsets = (
        (None, {
            'fields': ('program', 'plan_data')
        }),
        ('Предпросмотр структуры', {
            'classes': ('collapse',),
            'fields': ('json_pretty_print',)
        }),
    )

    def json_preview(self, obj):
        if not obj.plan_data:
            return "-"
        keys = list(obj.plan_data.keys())
        return f"Ключи: {', '.join(keys[:5])}..."
    json_preview.short_description = "Структура"

    def json_pretty_print(self, obj):
        if not obj.plan_data:
            return "-"
        json_str = json.dumps(obj.plan_data, indent=4, sort_keys=True, ensure_ascii=False)
        return mark_safe(f'<pre>{json_str}</pre>')
    json_pretty_print.short_description = "Визуализация JSON"

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'group', 'get_program')
    list_filter = ('group', 'group__program')
    # search_fields важен для работы autocomplete_fields в GradeAdmin
    search_fields = ('user__username', 'user__last_name', 'user__first_name', 'group__name')

    def get_program(self, obj):
        return obj.program
    get_program.short_description = 'Программа'

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('display_photo', 'get_full_name', 'position', 'department', 'degree', 'user')
    list_filter = ('department', 'degree', 'position')
    search_fields = ('user__last_name', 'user__first_name', 'user__username', 'department__name', 'position')

    def get_full_name(self, obj):
        return obj.user.get_full_name_str()
    get_full_name.short_description = 'ФИО'

    def display_photo(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;" />', obj.photo.url)
        return "-"
    display_photo.short_description = 'Фото'


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


# ========================================================
# 2.1 Курсы и Лекции
# ========================================================

class LectureFileInline(admin.TabularInline):
    model = LectureFile
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'display_cover', 'get_department', 'get_instructor', 'created_at')
    search_fields = ('code', 'title', 'description', 'instructor__user__last_name')
    autocomplete_fields = ['instructor', 'department']
    filter_horizontal = ('allowed_groups',)

    def get_department(self, obj):
        return obj.department.name if obj.department else "-"
    get_department.short_description = 'Кафедра'

    def get_instructor(self, obj):
        return obj.instructor.user.get_full_name_str() if obj.instructor else "-"
    get_instructor.short_description = 'Преподаватель'

    def display_cover(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" style="width: 50px; height: 30px; object-fit: cover;" />', obj.cover_image.url)
        return "-"
    display_cover.short_description = 'Обложка'

@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'category', 'scheduled_date', 'order')
    list_filter = ('course', 'category')
    search_fields = ('title', 'description', 'course__title')
    inlines = [LectureFileInline]


# ========================================================
# 3. Журнал и Оценки (НОВОЕ)
# ========================================================

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    # Какие колонки показывать в таблице
    list_display = ('get_student_name', 'get_group', 'subject', 'value', 'grade_type', 'created_at')
    
    # Фильтры справа (очень удобно фильтровать по предмету или группе)
    list_filter = ('grade_type', 'subject', 'student__group', 'created_at')
    
    # Поле поиска
    search_fields = ('student__user__last_name', 'student__user__first_name', 'subject__name')
    
    # Оптимизация выбора: вместо длинного выпадающего списка — поиск
    # Требует search_fields в StudentAdmin и SubjectAdmin
    autocomplete_fields = ['student', 'subject']
    
    # Сортировка по умолчанию (сначала новые)
    ordering = ('-created_at',)

    # Методы для удобного отображения в list_display
    def get_student_name(self, obj):
        return obj.student.user.get_full_name_str()
    get_student_name.short_description = 'Студент'
    
    def get_group(self, obj):
        return obj.student.group.name if obj.student.group else "-"
    get_group.short_description = 'Группа'


# ========================================================
# 4. Тестирование (Testing)
# ========================================================

class VariantInline(admin.TabularInline):
    model = Variant
    extra = 4

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'test', 'points', 'is_multiple_choice')
    list_filter = ('test',)
    search_fields = ('text', 'test__title')
    inlines = [VariantInline]

@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'student_group', 'student', 'deadline', 'is_active', 'status')
    list_filter = ('subject', 'is_active', 'status', 'student_group', 'deadline')
    search_fields = ('title', 'subject__name', 'student_group__name', 'student__user__last_name')
    autocomplete_fields = ['student_group', 'student', 'subject']

@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('student', 'test', 'score', 'percentage', 'finished_at')
    list_filter = ('test', 'finished_at')

@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ('get_student_name', 'get_group', 'test', 'question_preview', 'get_selected_count', 'updated_at')
    list_filter = ('test', 'student__group', 'created_at', 'updated_at')
    search_fields = ('student__user__last_name', 'student__user__first_name', 'test__title', 'question__text')
    autocomplete_fields = ['student', 'test', 'question']
    readonly_fields = ('created_at', 'updated_at')
    filter_horizontal = ('selected_variants',)
    ordering = ('-updated_at',)
    
    def get_student_name(self, obj):
        return obj.student.user.get_full_name_str()
    get_student_name.short_description = 'Студент'
    
    def get_group(self, obj):
        return obj.student.group.name if obj.student.group else "-"
    get_group.short_description = 'Группа'
    
    def question_preview(self, obj):
        return obj.question.text[:50] + '...' if len(obj.question.text) > 50 else obj.question.text
    question_preview.short_description = 'Вопрос'
    
    def get_selected_count(self, obj):
        return obj.selected_variants.count()
    get_selected_count.short_description = 'Выбрано вариантов'


# ========================================================
# 5. Домашние задания (Homework)
# ========================================================

@admin.register(Homework)
class HomeworkAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'teacher', 'deadline', 'created_at')
    list_filter = ('course', 'teacher', 'deadline')
    search_fields = ('title', 'description', 'course__title', 'teacher__user__last_name')
    autocomplete_fields = ['course', 'teacher']
    filter_horizontal = ('allowed_groups',)

@admin.register(HomeworkSubmission)
class HomeworkSubmissionAdmin(admin.ModelAdmin):
    list_display = ('homework', 'student', 'status', 'submitted_at', 'get_grade')
    list_filter = ('status', 'submitted_at', 'homework__course')
    search_fields = ('student__user__last_name', 'student__user__first_name', 'homework__title')
    autocomplete_fields = ['homework', 'student', 'grade']
    readonly_fields = ('submitted_at',)

    def get_grade(self, obj):
        return obj.grade.value if obj.grade else "-"
    get_grade.short_description = 'Оценка'


@admin.register(GroupSchedule)
class GroupScheduleAdmin(admin.ModelAdmin):
    list_display = ('group', 'updated_at')
    search_fields = ('group__name',)
    readonly_fields = ('json_pretty_print',)

    formfield_overrides = {
        models.JSONField: {'widget': widgets.Textarea(attrs={
            'rows': 20, 
            'cols': 100, 
            'style': 'font-family: monospace; font-size: 13px;'
        })},
    }

    fieldsets = (
        (None, {
            'fields': ('group', 'data')
        }),
        ('Предпросмотр JSON', {
            'classes': ('collapse',),
            'fields': ('json_pretty_print',)
        }),
    )

    def json_pretty_print(self, obj):
        if not obj.data:
            return "-"
        json_str = json.dumps(obj.data, indent=4, sort_keys=True, ensure_ascii=False)
        return mark_safe(f'<pre>{json_str}</pre>')
    json_pretty_print.short_description = "Визуализация JSON"
