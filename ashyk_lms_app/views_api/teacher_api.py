from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from ..models import Course, Lecture, Test, Teacher, Homework, HomeworkSubmission, StudentGroup, Grade, Student
import json

@login_required
def get_my_courses(request):
    try:
        # Assuming only teachers can access this, but good to check
        if not hasattr(request.user, 'teacher_profile'):
            return JsonResponse({'error': 'Доступ запрещен. Вы не являетесь преподавателем.'}, status=403)
            
        teacher = request.user.teacher_profile
        courses = Course.objects.filter(instructor=teacher)
        
        data = []
        for c in courses:
            data.append({
                'id': c.id,
                'title': c.title,
                'description': c.description[:100] + ('...' if len(c.description) > 100 else ''),
                'image': c.cover_image.url if c.cover_image else '/static/img/default-course-cover.jpg',
                'department': c.department.name if c.department else '-',
                'created_at': c.created_at.strftime('%d.%m.%Y'),
                # Add stats if needed later
            })
            
        return JsonResponse({'courses': data, 'status': 'success'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def get_course_management_details(request, course_id):
    try:
        if not hasattr(request.user, 'teacher_profile'):
            return JsonResponse({'error': 'Доступ запрещен'}, status=403)
            
        teacher = request.user.teacher_profile
        course = Course.objects.get(id=course_id, instructor=teacher)
        
        # Fetch lectures
        lectures = Lecture.objects.filter(course=course).order_by('id')
        lectures_data = [{
            'id': l.id,
            'title': l.title,
            'category': l.get_category_display() if hasattr(l, 'get_category_display') else l.category,
            'duration': l.duration,
            'order': l.id, # Using ID as simple order for now
        } for l in lectures]
        
        # Fetch tests related to this course/subject
        # Note: Test model connects to Subject, which usually maps to Course
        # Here we'll just return tests filtered by subject title matching course title for simplicity
        # or better: we should have a clearer relation, but using title for now or assuming Subject exists.
        from ..models import Subject
        try:
            subject = Subject.objects.get(name=course.title)
            tests = Test.objects.filter(subject=subject)
            tests_data = [{
                'id': t.id,
                'title': t.title,
                'deadline': t.deadline.strftime('%d.%m.%Y %H:%M') if t.deadline else '-',
            } for t in tests]
        except Subject.DoesNotExist:
            tests_data = []

        data = {
            'id': course.id,
            'title': course.title,
            'lectures': lectures_data,
            'tests': tests_data
        }
        
        return JsonResponse({'course': data, 'status': 'success'})
    except Course.DoesNotExist:
        return JsonResponse({'error': 'Курс не найден или доступ ограничен'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def create_lecture(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Метод не поддерживается'}, status=405)
        
    try:
        if not hasattr(request.user, 'teacher_profile'):
            return JsonResponse({'error': 'Доступ запрещен'}, status=403)
            
        data = json.loads(request.body)
        course_id = data.get('course_id')
        teacher = request.user.teacher_profile
        
        try:
            course = Course.objects.get(id=course_id, instructor=teacher)
        except Course.DoesNotExist:
            return JsonResponse({'error': 'Курс не найден или у вас нет прав'}, status=404)
            
        from django.db import connection
        from django.utils import timezone
        
        # Используем Raw SQL, чтобы обойти ошибку с отсутствующим полем iframe_content в модели,
        # но присутствующим в БД как NOT NULL
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO ashyk_lms_app_lecture 
                (course_id, title, description, category, duration, video_url, "order", created_at, iframe_content)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, '')
            """, [
                course.id,
                data.get('title'),
                data.get('description', ''),
                data.get('category', ''),
                data.get('duration', ''),
                data.get('video_url', ''),
                data.get('order', 0),
                timezone.now()
            ])
            lecture_id = cursor.lastrowid
        
        return JsonResponse({
            'status': 'success', 
            'message': 'Лекция успешно создана',
            'lecture': {
                'id': lecture_id,
                'title': data.get('title')
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def get_groups_list(request):
    """
    Get list of student groups for dropdown
    """
    try:
        # Permission check
        if not hasattr(request.user, 'teacher_profile'):
             return JsonResponse({'error': 'Доступ запрещен'}, status=403)
             
        teacher = request.user.teacher_profile
        # Filter groups: only return groups that are enrolled in courses taught by this teacher
        groups = StudentGroup.objects.filter(allowed_courses__instructor=teacher).distinct().order_by('name')
        
        data = [{'id': g.id, 'name': g.name} for g in groups]
        
        return JsonResponse({'groups': data, 'status': 'success'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def create_homework(request):
    """
    Create a new homework assignment
    """
    try:
        if not hasattr(request.user, 'teacher_profile'):
            return JsonResponse({'error': 'Доступ запрещен'}, status=403)
        
        teacher = request.user.teacher_profile
        
        # Determine if it's Multipart (file upload) or JSON
        # Usually file uploads come as POST form data
        if request.method == 'POST':
            course_id = request.POST.get('course_id')
            group_id = request.POST.get('group_id') # Optional, if empty -> for all groups or specific logic?
            title = request.POST.get('title')
            description = request.POST.get('description')
            deadline_str = request.POST.get('deadline') # Format: YYYY-MM-DD or similar
            uploaded_file = request.FILES.get('file')

            if not course_id or not title or not deadline_str:
                 return JsonResponse({'error': 'Заполните обязательные поля'}, status=400)

            course = Course.objects.get(id=course_id)
            
            # Optional: if group_id is empty, it means "All groups" (based on frontend "Барлық группалар")
            # Since we implemented "Empty allowed_groups = No one", we must explicitly add ALL groups if user selected "All".
            
            hw = Homework.objects.create(
                course=course,
                # group field removed
                teacher=teacher,
                title=title,
                description=description,
                deadline=deadline_str,
                file=uploaded_file
            )

            if group_id:
                group = StudentGroup.objects.get(id=group_id)
                hw.allowed_groups.add(group)
            # else:
            #    "All groups" selected -> leave empty (means Everyone in course)

            return JsonResponse({'status': 'success', 'message': 'Домашнее задание создано'})
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def get_teacher_homeworks(request):
    """
    List of homeworks created by this teacher
    """
    try:
        if not hasattr(request.user, 'teacher_profile'):
            return JsonResponse({'error': 'Доступ запрещен'}, status=403)
        
        teacher = request.user.teacher_profile
        
        # Filter homeworks by this teacher
        homeworks = Homework.objects.filter(teacher=teacher).select_related('course').prefetch_related('allowed_groups').order_by('-created_at')
        
        data = []
        for hw in homeworks:
            # Stats: total students in allowed groups
            groups = hw.allowed_groups.all()
            
            total_students = 0
            
            if not groups:
                # Everyone in course
                # We need to count all students in all groups allowed for this COURSE
                # Logic: Course -> allowed_groups -> students
                course_groups = hw.course.allowed_groups.all()
                if not course_groups:
                    # If course has no allowed groups -> It is for "No one" per current Course logic!
                    # Wait, earlier I set Course empty = No one.
                    total_students = 0 
                    group_display = "Курс недоступен никому"
                else:
                    for cg in course_groups:
                        total_students += cg.students.count()
                    group_display = "Все группы курса"
            else:
                # Specific groups
                group_names = []
                for g in groups:
                     group_names.append(g.name)
                     total_students += g.students.count()
                
                group_display = ", ".join(group_names)
                if len(groups) > 3:
                    group_display = f"{len(groups)} групп"

            submissions = HomeworkSubmission.objects.filter(homework=hw).exclude(status='draft')
            submitted_count = submissions.count()
            graded_count = submissions.filter(status='graded').count()
            
            data.append({
                'id': hw.id,
                'course': hw.course.title,
                'course_id': hw.course.id,
                'group': group_display, 
                'title': hw.title,
                'deadline': hw.deadline.strftime('%d.%m.%Y'),
                'stats': f"{submitted_count} / {total_students}",
                'submitted_count': submitted_count,
                'graded_count': graded_count,
                'total_students': total_students,
                'group_id': groups[0].id if groups.count() == 1 else 'all',
                'group_ids': [g.id for g in groups]
            })

        return JsonResponse({'homeworks': data, 'status': 'success'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def get_homework_submissions(request, homework_id):
    """
    Get list of submissions for a specific homework
    """
    try:
        if not hasattr(request.user, 'teacher_profile'):
            return JsonResponse({'error': 'Доступ запрещен'}, status=403)
            
        homework = Homework.objects.get(id=homework_id)
        
        # Check permissions (did this teacher create it?)
        if homework.teacher != request.user.teacher_profile:
             return JsonResponse({'error': 'Нет доступа к этому заданию'}, status=403)

        submissions = HomeworkSubmission.objects.filter(homework=homework).select_related('student__user', 'grade').order_by('submitted_at')
        
        # Also need list of students who did NOT submit? 
        # For MVP let's return submissions only.
        
        data = []
        for sub in submissions:
            data.append({
                'id': sub.id,
                'student_name': sub.student.user.get_full_name_str(),
                'status': sub.get_status_display(), # 'Сдано', 'На проверке' etc
                'status_code': sub.status,
                'submitted_at': sub.submitted_at.strftime('%d.%m.%Y %H:%M'),
                'grade': sub.grade.value if sub.grade else None,
                'content': sub.content,
                'file_url': sub.file.url if sub.file else None,
                'file_name': sub.file.name.split('/')[-1] if sub.file else None
            })
            
        return JsonResponse({'submissions': data, 'status': 'success', 'homework_title': homework.title})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def grade_submission(request):
    """
    Grade a student's submission
    """
    if request.method != 'POST':
         return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        submission_id = data.get('submission_id')
        grade_value = data.get('grade')
        comment = data.get('comment', '')
        
        if not submission_id or grade_value is None:
             return JsonResponse({'error': 'Missing parameters'}, status=400)

        submission = HomeworkSubmission.objects.select_related('homework__course').get(id=submission_id)
        
        # Use the model method to handle Grade creation/update
        submission.set_grade(int(grade_value), comment)
        
        return JsonResponse({'status': 'success', 'message': 'Оценка сохранена'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
