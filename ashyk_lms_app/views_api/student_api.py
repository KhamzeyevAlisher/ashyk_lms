from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from ..models import Curriculum, Grade, Test, Question, Variant, TestResult, StudentAnswer, Course, Lecture, Teacher, Homework, HomeworkSubmission, GroupSchedule, CourseImage
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

        # Fetch saved answers
        saved_answers = {}
        if hasattr(request.user, 'student_profile'):
            student_answers = StudentAnswer.objects.filter(
                student=request.user.student_profile,
                test=test
            )
            for ans in student_answers:
                # We need list of variant IDs
                saved_answers[ans.question.id] = list(ans.selected_variants.values_list('id', flat=True))

        return JsonResponse({
            'id': test.id,
            'title': test.title,
            'questions': questions_data,
            'saved_answers': saved_answers,
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

        # 5. Fetch Final Score
        from ..models import StudentFinalScore
        final_score_obj = StudentFinalScore.objects.filter(username=request.user.username).first()
        final_score = float(final_score_obj.total_score) if final_score_obj else 0.0

        return JsonResponse({
            'subjects': response_data,
            'final_score': final_score,
            'status': 'success'
        }, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_POST
@login_required
def save_student_answer(request):
    
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


@require_POST
@login_required
def submit_test_result(request):
    
    try:
        data = json.loads(request.body)
        test_id = data.get('testId')
        percentage = data.get('percentage') # Expecting percentage passed from frontend
        
        if test_id is None or percentage is None:
             return JsonResponse({'error': 'Missing parameters'}, status=400)

        if not hasattr(request.user, 'student_profile'):
            return JsonResponse({'error': 'Пользователь не является студентом'}, status=403)
        
        student = request.user.student_profile
        test = Test.objects.get(id=test_id)

        # 1. Save Result
        total_questions = test.questions.count()
        score = round(float(percentage) / 100 * total_questions) if total_questions > 0 else 0

        test_result, created = TestResult.objects.update_or_create(
            student=student, 
            test=test,
            defaults={
                'percentage': float(percentage),
                'score': score,
                'max_score': total_questions
            }
        )
        
        # 2. Cleanup Saved Answers from DB
        StudentAnswer.objects.filter(student=student, test=test).delete()

        # 3. Add points to StudentFinalScore (max 30 points for 100%)
        from ..models import StudentFinalScore
        from decimal import Decimal
        
        points_to_add = (Decimal(str(percentage)) / Decimal('100')) * Decimal('30')
        
        score_obj, created_score = StudentFinalScore.objects.get_or_create(
            username=request.user.username,
            defaults={'total_score': Decimal('0.00')}
        )
        score_obj.total_score += points_to_add.quantize(Decimal('0.01'))
        score_obj.save()
        
        return JsonResponse({
            'status': 'success',
            'points_added': float(points_to_add.quantize(Decimal('0.01'))),
            'new_total_score': float(score_obj.total_score)
        })

    except Test.DoesNotExist:
         return JsonResponse({'error': 'Тест не найден'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def get_courses_list(request):
    try:
        if not hasattr(request.user, 'student_profile'):
            return JsonResponse({'error': 'Пользователь не является студентом'}, status=403)
        
        student = request.user.student_profile
        
        # Filter courses: strict match. If allowed_groups is empty, no student sees it.
        courses = Course.objects.filter(
            allowed_groups=student.group
        ).select_related('instructor__user', 'department').distinct().order_by('-created_at')
        data = []
        for c in courses:
            instructor_name = c.instructor.user.get_full_name_str() if c.instructor else "-"
            data.append({
                'id': c.id,
                'title': c.title,
                'description': c.description,
                'instructor': instructor_name,
                'image': c.cover_image.url if c.cover_image else "",
            })
        return JsonResponse({'courses': data, 'status': 'success'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def get_course_detail(request, course_id):
    """
    course_id может быть ID (int) или Title (str)
    """
    try:
        if not hasattr(request.user, 'student_profile'):
            return JsonResponse({'error': 'Доступ запрещен'}, status=403)
            
        student = request.user.student_profile
        
        # Base query with strict access check
        qs = Course.objects.filter(
            allowed_groups=student.group
        ).select_related('instructor__user', 'department').prefetch_related('images')

        if str(course_id).isdigit():
            course = qs.get(id=int(course_id))
        else:
            course = qs.get(title=course_id)

        lectures = course.lectures.all().order_by('order')
        
        program_data = []
        for i, lec in enumerate(lectures, 1):
            state = "active" 
            program_data.append({
                'id': lec.id,
                'topic': lec.title,
                'state': state
            })

        instructor_name = course.instructor.user.get_full_name_str() if course.instructor else "-"
        # Pass instructor ID for fetching details
        instructor_id = course.instructor.id if course.instructor else None
        department_name = course.department.name if course.department else "-"

        data = {
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'coverImage': course.cover_image.url if course.cover_image else "",
            'tags': course.tags.split(',') if course.tags else [],
            'info': {
                'department': department_name,
                'instructor': instructor_name,
                'instructorId': instructor_id, 
                'duration': course.duration_text
            },
            'program': program_data,
            'presentationImages': [
                {'url': img.image.url, 'link': img.link} 
                for img in course.images.all()
            ]
        }
        return JsonResponse({'course': data, 'status': 'success'})

    except Course.DoesNotExist:
        return JsonResponse({'error': 'Курс не найден', 'status': 'error'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def get_lecture_detail(request, lecture_id):
    try:
        # Check if we are searching by ID or by (CourseTitle, LectureTitle) handled by query params
        # But here we use path param lecture_id.
        # If JS calls: /api/lectures/get_by_name/?course=X&lesson=Y (we need a new view for that)
        # OR we just try to resolve it here if lecture_id is "find"
        
        lecture = Lecture.objects.prefetch_related('files').get(id=lecture_id)
        
        files_data = []
        for f in lecture.files.all():
            files_data.append({
                'name': f.name,
                'url': f.file.url
            })
            
        data = {
            'id': lecture.id,
            'title': lecture.title,
            'category': lecture.category,
            'description': lecture.description,
            'duration': lecture.duration,
            'date': lecture.scheduled_date.strftime("%d.%m.%Y") if lecture.scheduled_date else "",
            'link': lecture.video_url, 
            'files': files_data
        }
        
        return JsonResponse({'lecture': data, 'status': 'success'})

    except Lecture.DoesNotExist:
        return JsonResponse({'error': 'Лекция не найдена'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@login_required
def get_lecture_by_name(request):
    """
    Search lecture by course title and lecture title.
    Query params: courseName, nameLesson
    """
    try:
        course_name = request.GET.get('courseName')
        lesson_name = request.GET.get('nameLesson')
        
        if not course_name or not lesson_name:
             return JsonResponse({'error': 'Missing parameters'}, status=400)
             
        lecture = Lecture.objects.get(course__title=course_name, title=lesson_name)
        
        # Reuse logic? Or just return same structure
        # ... copying logic ...
        files_data = []
        for f in lecture.files.all():
            files_data.append({
                'name': f.name,
                'url': f.file.url
            })
            
        data = {
            'id': lecture.id,
            'title': lecture.title,
            'category': lecture.category,
            'description': lecture.description,
            'duration': lecture.duration,
            'date': lecture.scheduled_date.strftime("%d.%m.%Y") if lecture.scheduled_date else "",
            'link': lecture.video_url,
            'files': files_data
        }
        return JsonResponse({'lecture': data, 'status': 'success'})
        
    except Lecture.DoesNotExist:
        return JsonResponse({'error': 'Лекция не найдена'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def get_teacher_detail(request, teacher_id):
    try:
        # Teacher is already imported at the top
        teacher = Teacher.objects.select_related('user', 'department').get(id=teacher_id)
        
        data = {
            'id': teacher.id,
            'fullName': teacher.user.get_full_name_str(),
            'position': teacher.position,
            'degree': teacher.degree,
            'department': teacher.department.name if teacher.department else "-",
            'email': teacher.user.email,
            'phone': teacher.user.phone,
            'photo': teacher.photo.url if teacher.photo else "", 
        }
        return JsonResponse({'teacher': data, 'status': 'success'})
    except Teacher.DoesNotExist:
        return JsonResponse({'error': 'Преподаватель не найден'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def get_homeworks_list(request):
    try:
        if not hasattr(request.user, 'student_profile'):
            return JsonResponse({'error': 'Пользователь не является студентом'}, status=403)
        
        student = request.user.student_profile
        
        # 1. Get homeworks assigned to student's group
        #    Filtering by deadline descending is good for seeing upcoming tasks first, 
        #    but typically we want "active" tasks at the top. Let's sort by deadline (closest first)
        
        # 1. Get homeworks assigned to student's group
        # Logic:
        # A. Student MUST have access to the Course (course__allowed_groups=student.group)
        # B. Homework must be either:
        #    - Explicitly assigned to student's group (allowed_groups=student.group)
        #    - Open to everyone in the course (allowed_groups is empty)
        
        homeworks_qs = Homework.objects.filter(
            course__allowed_groups=student.group
        ).filter(
            Q(allowed_groups=student.group) | Q(allowed_groups__isnull=True)
        ).select_related('course', 'teacher', 'teacher__user').distinct().order_by('deadline')
        
        # 2. Get existing submissions for these homeworks
        submissions_map = {
            sub.homework_id: sub 
            for sub in HomeworkSubmission.objects.filter(student=student, homework__in=homeworks_qs)
            .select_related('grade')
        }

        data = []
        for hw in homeworks_qs:
            submission = submissions_map.get(hw.id)
            
            # Determine status
            # Default: 'missed' if deadline passed and no submission, else 'assigned' (or custom logic)
            # Frontend expects: 'review', 'missed', 'done' (or we can introduce 'todo')
            
            # Basic Logic:
            # - If graded -> 'done' (and show grade)
            # - If submitted but not graded -> 'review'
            # - If not submitted and deadline passed -> 'missed'
            # - If not submitted and deadline future -> 'todo' (NEW status for frontend handling)
            
            from django.utils import timezone
            now = timezone.now()
            
            status = 'todo' 
            grade_value = None
            days_left = None

            if submission:
                if submission.status == 'graded':
                    status = 'done'
                    if submission.grade:
                        grade_value = f"{submission.grade.value}/100" # Assuming 100 max
                elif submission.status in ['submitted', 'on_review']:
                    status = 'review'
                elif submission.status == 'draft':
                    status = 'todo' # Draft is still to do essentially
            else:
                if hw.deadline < now:
                     status = 'missed'
            
            # Calculate days left if future
            if hw.deadline > now:
                delta = hw.deadline - now
                if delta.days > 0:
                    days_left = delta.days
                else:
                    # Hours/minutes logic could be added, but frontend expects integer days
                    days_left = 0 # "< 1 day" effectively
            
            teacher_name = hw.teacher.user.get_full_name_str() if hw.teacher else "Неизвестно"

            data.append({
                'id': hw.id,
                'courseName': hw.course.title,
                'title': hw.title,
                'teacher': teacher_name,
                'deadline': hw.deadline.strftime("%d.%m.%Y"),
                'status': status,
                'daysLeft': days_left,
                'grade': grade_value,
                'taskDescription': hw.description,
                'fileUrl': hw.file.url if hw.file else None,
                'fileName': hw.file.name.split('/')[-1] if hw.file else None
            })

        return JsonResponse({'homeworks': data, 'status': 'success'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_POST
@login_required
def submit_homework(request):
    try:
        # Check authorization
        if not hasattr(request.user, 'student_profile'):
            return JsonResponse({'error': 'Пользователь не является студентом'}, status=403)
        
        student = request.user.student_profile
        
        # Get data from request.POST and request.FILES
        homework_id = request.POST.get('homework_id')
        comment = request.POST.get('comment', '')
        uploaded_file = request.FILES.get('file')
        
        if not homework_id:
            return JsonResponse({'error': 'Missing homework_id'}, status=400)

        # Get the homework obect
        try:
            homework = Homework.objects.get(id=homework_id)
        except Homework.DoesNotExist:
             return JsonResponse({'error': 'Домашнее задание не найдено'}, status=404)

        # Check deadline (Optional strict check, or just allow late submissions)
        # For now, we allow late submissions but frontend might mark them.
        
        # Create or update submission
        submission, created = HomeworkSubmission.objects.get_or_create(
            homework=homework,
            student=student
        )
        
        # Update fields
        submission.content = comment
        if uploaded_file:
            submission.file = uploaded_file
        
        # Determine status. If it was 'graded', we might reset to 'on_review' or keep 'graded'?
        # Usually resubmission resets status to 'on_review' or 'submitted'.
        # Let's set to 'on_review' if it's a resubmission or new submission.
        # But per requirements/models: 'submitted' (Сдано) or 'on_review' (На проверке).
        # Let's align with common logic: Student submits -> 'submitted'. Teacher opens -> 'on_review'.
        submission.status = 'submitted'
        
        # Update submitted_at to now
        from django.utils import timezone
        submission.submitted_at = timezone.now()
        
        submission.save()

        return JsonResponse({'status': 'success', 'message': 'Тапсырма сәтті жіберілді'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def get_schedule(request):
    """
    Получение расписания для группы текущего студента.
    """
    try:
        if not hasattr(request.user, 'student_profile'):
            return JsonResponse({'error': 'Пользователь не является студентом'}, status=403)
        
        student = request.user.student_profile
        if not student.group:
            return JsonResponse({'error': 'Студент не привязан к группе'}, status=404)
        
        schedule = GroupSchedule.objects.filter(group=student.group).first()
        
        if not schedule:
            return JsonResponse({
                'schedule': {}, 
                'status': 'empty',
                'message': 'Расписание для вашей группы еще не заполнено'
            })
            
        return JsonResponse({
            'schedule': schedule.data, 
            'status': 'success'
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
@login_required
def add_lecture_points(request):
    """
    Добавляет +20 баллов студенту за просмотр лекции (100%).
    """
    try:
        from ..models import StudentFinalScore
        from decimal import Decimal
        
        username = request.user.username
        
        # Получаем или создаем запись итогового балла для пользователя
        score_obj, created = StudentFinalScore.objects.get_or_create(
            username=username,
            defaults={'total_score': Decimal('0.00')}
        )
        
        # Добавляем 20 баллов
        score_obj.total_score += Decimal('20.00')
        score_obj.save()
        
        return JsonResponse({
            'status': 'success', 
            'message': '+20 баллов начислено',
            'new_score': float(score_obj.total_score)
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
