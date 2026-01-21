from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views
from .views_api import student_api, admin_api

urlpatterns = [
    path('', views.CustomLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('admin_dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('student_dashboard/', views.student_dashboard, name='student_dashboard'),
    path('teacher_dashboard/', views.teacher_dashboard, name='teacher_dashboard'),
    path('api/curriculum/', student_api.get_curriculum_data, name='api_curriculum'),
    path('api/journal/', student_api.get_student_grades, name='get_student_grades'),
    path('api/tests/', student_api.get_tests_list, name='api_tests_list'),
    path('api/tests/<int:test_id>/', student_api.get_test_details, name='api_test_details'),
    path('api/admin/upload_tests/', admin_api.upload_tests_json, name='api_upload_tests'),
]