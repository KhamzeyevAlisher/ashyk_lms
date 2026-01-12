from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import login_required
from .forms import UserLoginForm, ProfileUpdateForm
from .models import User, Student, Grade
from django.db.models import Avg

class CustomLoginView(LoginView):
    template_name = 'ashyk_lms_app/login.html'
    authentication_form = UserLoginForm
    redirect_authenticated_user = True

#Контроллер для профиля
@login_required
def profile_view(request):
    if request.method == 'POST':
        form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form = ProfileUpdateForm(instance=request.user)

    role = request.user.role
    
    return redirect(f'{role}_dashboard')

@login_required
def admin_dashboard(request):
    return render(request, 'ashyk_lms_app/admin_dashboard.html')

@login_required
def student_dashboard(request):
    student = Student.objects.get(user=request.user)
    try:
        plan = student.group.program.curriculums.first()
        plan_data = plan.plan_data
    except:
        plan_data = None
    print(plan_data)
    return render(request, 'ashyk_lms_app/student_dashboard.html', {'curriculum': plan_data})

@login_required
def teacher_dashboard(request):
    return render(request, 'ashyk_lms_app/teacher_dashboard.html')

def get_journal_data(student_id):
    student = Student.objects.get(id=student_id)
    grades = Grade.objects.filter(student=student).select_related('subject').order_by('created_at')
    
    journal_data = {}
    
    # Группируем оценки по предметам
    for grade in grades:
        subj_name = grade.subject.name
        
        if subj_name not in journal_data:
            journal_data[subj_name] = {
                "grades_raw": [] # Временный список для подсчетов
            }
        
        # Формируем структуру оценки: просто число или объект
        if grade.comment:
            grade_entry = {"value": grade.value, "comment": grade.comment}
        else:
            grade_entry = grade.value
            
        journal_data[subj_name]["grades_raw"].append(grade_entry)

    # Финальная сборка с подсчетом (среднее, тренд и т.д.)
    final_response = {}
    for subj, data in journal_data.items():
        raw_list = data["grades_raw"]
        
        # Пример простого подсчета среднего (упрощенно)
        values = [x['value'] if isinstance(x, dict) else x for x in raw_list]
        avg = sum(values) / len(values) if values else 0
        
        final_response[subj] = {
            "trend": "up", # Тут ваша логика сравнения последних оценок
            "averageScore": round(avg, 1),
            "attendance": "95%", # Тут логика посещаемости
            "grades": raw_list
        }
        
    return final_response
