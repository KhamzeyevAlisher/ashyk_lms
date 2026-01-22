from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from ..models import Curriculum, Grade, Test, Question, Variant, TestResult, StudentAnswer
import json
import random
from django.db.models import Q

@login_required
def get_tests_list(request):
    try:
        if not hasattr(request.user, 'student_profile'):
            return JsonResponse({'error': 'Пользователь не является студентом'}, status=403)
        
        student = request.user.student_profile
        
        # Filter tests:
        # 1. Active tests
        # 2. MATCH student's group OR MATCH student individually OR (optional) public tests if group is null
        # BUT user requirement said "only specific group", so we strictly filter.
        # We also include tests where student_group is NULL assuming they are "General" tests for everyone 
        # (or remove that if strictly group-bound).
        # Let's include: Group match OR Individual match OR Group is Null (Global).
        
        tests_qs = Test.objects.filter(
            Q(is_active=True) & 
            (Q(student_group=student.group) | Q(student=student))
        ).select_related('subject')
        
        # Получаем результаты студента для этих тестов
        results_map = {res.test_id: res for res in TestResult.objects.filter(student=student)}

        tests_data = []
        for test in tests_qs:
            result = results_map.get(test.id)
            tests_data.append({
                'id': test.id,
                'title': test.title,
                'subject': test.subject.name,
                'questions': test.questions.count(),
                'duration': f"{test.duration_minutes} мин",
                'deadline': test.deadline.strftime("%d.%m.%Y"),
                'grade': f"{int(result.percentage)}%" if result else None,
                'status': 'completed' if result else 'active',
                'iconType': 'green' if result else 'purple'
            })

        return JsonResponse({'tests': tests_data, 'status': 'success'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def get_test_details(request, test_id):
    try:
        test = Test.objects.prefetch_related('questions__variants').get(id=test_id, is_active=True)
        
        questions_data = {}
        for i, q in enumerate(test.questions.all(), 1):
            variants = list(q.variants.all())
            random.shuffle(variants)
            
            questions_data[i] = {
                'id': q.id,
                'question': q.text,
                'variants': [{'id': v.id, 'text': v.text} for v in variants],
                'correct_variants': [v.id for v in variants if v.is_correct]
            }

        return JsonResponse({
            'id': test.id,
            'title': test.title,
            'questions': questions_data,
            'status': 'success'
        })

    except Test.DoesNotExist:
        return JsonResponse({'error': 'Тест не найден'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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
        # 1. Студент профилін алу
        if not hasattr(request.user, 'student_profile'):
            return JsonResponse({'error': 'Пайдаланушы студент емес'}, status=403)
        
        student = request.user.student_profile

        # 2. Бағаларды алу (пән және дата бойынша сұрыпталған)
        grades_qs = Grade.objects.filter(student=student)\
                                 .select_related('subject')\
                                 .order_by('subject__name', 'created_at')

        grouped_data = {}
        for grade in grades_qs:
            subj_name = grade.subject.name
            if subj_name not in grouped_data:
                grouped_data[subj_name] = []
            grouped_data[subj_name].append(grade)

        # 4. JSON жауапты құрастыру
        response_data = {}

        for subject, grades_list in grouped_data.items():
            values = [g.value for g in grades_list]
            avg_score = round(sum(values) / len(values), 1) if values else 0

            # Тренд есептеу
            trend = "flat"
            if len(values) >= 2:
                last_grade = values[-1]
                prev_grade = values[-2]
                if last_grade > prev_grade: trend = "up"
                elif last_grade < prev_grade: trend = "down"
            
            # --- БАҒАЛАРДЫ ФОРМАТТАУ (Күнін қосу осы жерде) ---
            formatted_grades = []
            for g in grades_list:
                grade_entry = {
                    "value": g.value,
                    "date": g.created_at.strftime("%d.%m.%Y"), # Күн-ай-жыл форматы
                    "type": g.get_grade_type_display(),      # Жұмыс түрі (Лекция, Практика т.б.)
                }
                if g.comment:
                    grade_entry["comment"] = g.comment
                
                formatted_grades.append(grade_entry)

            # Attendance (әзірге статикалық)
            attendance_placeholder = "95%" 

            response_data[subject] = {
                "trend": trend,
                "averageScore": avg_score,
                "attendance": attendance_placeholder,
                "grades": formatted_grades
            }

        return JsonResponse(response_data, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def save_student_answer(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Метод не поддерживается'}, status=405)
    
    try:
        data = json.loads(request.body)
        test_id = data.get('testId')
        question_id = data.get('questionId')
        variant_ids = data.get('variants', [])

        print(variant_ids)

        if not hasattr(request.user, 'student_profile'):
            return JsonResponse({'error': 'Пользователь не является студентом'}, status=403)
        
        student = request.user.student_profile
        
        # Get or create the answer entry
        answer, created = StudentAnswer.objects.get_or_create(
            student=student,
            test_id=test_id, 
            question_id=question_id
        )
        
        # Update selected variants
        if variant_ids:
            variants = Variant.objects.filter(id__in=variant_ids)
            answer.selected_variants.set(variants)
        else:
            answer.selected_variants.clear()

        # Explicitly save to update 'updated_at' timestamp
        answer.save()
        
        return JsonResponse({'status': 'success'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)