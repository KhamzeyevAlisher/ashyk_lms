import json
from django.contrib import admin
from django.utils.safestring import mark_safe
from django.db import models
from django.forms import widgets
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, Student, StudentGroup, EducationalProgram, Curriculum

# ========================================================
# Инлайн для редактирования профиля студента прямо в Юзере
# ========================================================
class StudentInline(admin.StackedInline):
    model = Student
    can_delete = False
    verbose_name_plural = 'Профиль студента'
    fk_name = 'user'
    # Показываем этот блок только если хотим
    extra = 0 

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Добавляем инлайн, чтобы редактировать группу внутри пользователя
    inlines = (StudentInline, )

    # 1. Поля в списке
    list_display = (
        'username', 
        'get_full_name_str', # Используем метод модели или стандартный
        'role', 
        'get_student_group', # Наш кастомный метод (см. ниже)
        'department', 
        'display_avatar'
    )

    # 2. Кликабельные ссылки
    list_display_links = ('username', 'get_full_name_str')

    # 3. Фильтры
    # Обратите внимание: фильтровать по 'student_profile__group' можно, но сложно для UI
    list_filter = ('role', 'is_active', 'department', 'student_profile__group')

    # 4. Поиск
    search_fields = (
        'username', 
        'first_name', 
        'last_name', 
        'email', 
        'phone',
        # Поиск по названию группы (через связь)
        'student_profile__group__name'
    )

    # 5. Редактирование
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

    # 6. Создание
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',),
            'fields': ('role', 'email', 'first_name', 'last_name', 'middle_name'),
        }),
    )
    
    # --- Кастомные методы для колонок ---

    def display_avatar(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" style="width: 30px; height: 30px; border-radius: 50%;" />', obj.avatar.url)
        return "-"
    display_avatar.short_description = 'Фото'

    def get_student_group(self, obj):
        """Получает название группы из связанной модели Student"""
        if hasattr(obj, 'student_profile') and obj.student_profile.group:
            return obj.student_profile.group.name
        return "-"
    get_student_group.short_description = 'Группа'
    
    def get_full_name_str(self, obj):
        return obj.get_full_name_str()
    get_full_name_str.short_description = 'ФИО'


# ========================================================
# Регистрация остальных моделей
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
    readonly_fields = ('json_pretty_print',) # Поле только для чтения (красивый вид)

    # 1. Настройка поля ввода (делаем его большим и моноширинным)
    formfield_overrides = {
        models.JSONField: {'widget': widgets.Textarea(attrs={
            'rows': 20, 
            'cols': 100, 
            'style': 'font-family: monospace; font-size: 13px;'
        })},
    }

    # Показываем поле ввода И красивую версию при редактировании
    fieldsets = (
        (None, {
            'fields': ('program', 'plan_data')
        }),
        ('Предпросмотр структуры', {
            'classes': ('collapse',), # Свернуто по умолчанию
            'fields': ('json_pretty_print',)
        }),
    )

    def json_preview(self, obj):
        """Показывает краткую информацию в общем списке"""
        if not obj.plan_data:
            return "-"
        # Просто показываем ключи верхнего уровня (например: "1 семестр, 2 семестр")
        keys = list(obj.plan_data.keys())
        return f"Ключи: {', '.join(keys[:5])}..."
    json_preview.short_description = "Структура"

    def json_pretty_print(self, obj):
        """Красивый вывод JSON с отступами (только для чтения)"""
        if not obj.plan_data:
            return "-"
        # Преобразуем JSON в строку с отступами и поддержкой кириллицы
        json_str = json.dumps(obj.plan_data, indent=4, sort_keys=True, ensure_ascii=False)
        # Оборачиваем в тег <pre>, чтобы сохранить форматирование
        return mark_safe(f'<pre>{json_str}</pre>')
    
    json_pretty_print.short_description = "Визуализация JSON"

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    """
    Отдельная админка для студентов (если не хотите искать через Users)
    """
    list_display = ('user', 'group', 'get_program')
    list_filter = ('group', 'group__program')
    search_fields = ('user__username', 'user__last_name', 'group__name')

    def get_program(self, obj):
        return obj.program
    get_program.short_description = 'Программа'