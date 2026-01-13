from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from ..models import Curriculum, Grade

@login_required
def get_curriculum_data(request):
    try:
        # Путь: Curriculum -> program -> groups (StudentGroup) -> students (Student) -> user
        plan_data = Curriculum.objects.filter(
            program__groups__students__user=request.user
        ).values_list('plan_data', flat=True).first()

        if plan_data is None:
            return JsonResponse({
                'curriculum': None,
                'message': 'Учебный план не найден для вашей группы'
            }, status=404)

        return JsonResponse({'curriculum': plan_data, 'status': 'success'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@login_required
def get_student_grades(request):
    try:
        # 1. Студент профилін аламыз
        if not hasattr(request.user, 'student_profile'):
            return JsonResponse({'error': 'Пайдаланушы студент емес'}, status=403)
        
        student = request.user.student_profile

        # 2. Осы студенттің барлық бағаларын пәнмен қоса аламыз
        # created_at бойынша сұрыптау маңызды (хронология)
        grades_qs = Grade.objects.filter(student=student)\
                                 .select_related('subject')\
                                 .order_by('subject__name', 'created_at')

        # 3. Деректерді топтастыруға арналған сөздік
        # Құрылымы: { "Пән аты": [GradeObj, GradeObj, ...] }
        grouped_data = {}
        
        for grade in grades_qs:
            subj_name = grade.subject.name
            if subj_name not in grouped_data:
                grouped_data[subj_name] = []
            grouped_data[subj_name].append(grade)

        # 4. JSON жауапты құрастыру
        response_data = {}

        for subject, grades_list in grouped_data.items():
            # --- Есептеулер ---
            
            # Орташа балл
            values = [g.value for g in grades_list]
            avg_score = round(sum(values) / len(values), 1) if values else 0

            # Трендті анықтау (Соңғы баға vs Алдыңғы баға)
            trend = "flat"
            if len(values) >= 2:
                last_grade = values[-1]
                prev_grade = values[-2]
                if last_grade > prev_grade:
                    trend = "up"
                elif last_grade < prev_grade:
                    trend = "down"
            
            # Бағалар тізімін форматтау (journalData стилінде)
            formatted_grades = []
            for g in grades_list:
                if g.comment:
                    formatted_grades.append({
                        "value": g.value,
                        "comment": g.comment
                    })
                else:
                    formatted_grades.append(g.value)

            # --- Attendance (Қатысу) ---
            # Ескерту: Модельдерде 'Attendance' жоқ. 
            # Сондықтан әзірге статикалық немесе кездейсоқ мән береміз.
            # Болашақта Attendance моделін қосып, осы жерде есептеу керек.
            attendance_placeholder = "95%" 

            # --- Нәтижені жинау ---
            response_data[subject] = {
                "trend": trend,
                "averageScore": avg_score,
                "attendance": attendance_placeholder,
                "grades": formatted_grades
            }

        return JsonResponse(response_data, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)