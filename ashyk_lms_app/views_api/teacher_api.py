from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from ..models import Course, Lecture, Test, Teacher
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
            
        lecture = Lecture.objects.create(
            course=course,
            title=data.get('title'),
            description=data.get('description', ''),
            category=data.get('category', ''),
            duration=data.get('duration', ''),
            video_url=data.get('video_url', ''),
            iframe_content=data.get('iframe_content', ''),
            order=data.get('order', 0)
        )
        
        return JsonResponse({
            'status': 'success', 
            'message': 'Лекция успешно создана',
            'lecture': {
                'id': lecture.id,
                'title': lecture.title
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
