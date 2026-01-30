from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views
from .views_api import student_api, admin_api, teacher_api

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
    path('api/tests/save_answer/', student_api.save_student_answer, name='api_save_answer'),
    path('api/tests/submit/', student_api.submit_test_result, name='api_submit_test'),
    path('api/courses/', student_api.get_courses_list, name='api_courses_list'),
    path('api/courses/<str:course_id>/', student_api.get_course_detail, name='api_course_detail'),
    path('api/lectures/get_by_name/', student_api.get_lecture_by_name, name='api_lecture_by_name'),
    path('api/lectures/<int:lecture_id>/', student_api.get_lecture_detail, name='api_lecture_detail'),
    path('api/teacher/<int:teacher_id>/', student_api.get_teacher_detail, name='api_teacher_detail'),
    path('api/teacher/my-courses/', teacher_api.get_my_courses, name='api_teacher_my_courses'),
    path('api/teacher/course/<int:course_id>/', teacher_api.get_course_management_details, name='api_course_management'),
    path('api/teacher/lecture/create/', teacher_api.create_lecture, name='api_create_lecture'),
    path('api/admin/upload_tests/', admin_api.upload_tests_json, name='api_upload_tests'),
]