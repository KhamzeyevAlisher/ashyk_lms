from django.db import models
from django.contrib.auth.models import AbstractUser

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
    
    # Для студентов/преподавателей
    department = models.CharField(max_length=100, blank=True, verbose_name='Кафедра/Факультет')
    group_name = models.CharField(max_length=50, blank=True, verbose_name='Группа (для студентов)')

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def get_full_name_str(self):
        return f"{self.last_name} {self.first_name} {self.middle_name}".strip()