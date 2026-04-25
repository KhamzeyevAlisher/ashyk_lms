import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ashyk_lms_project.settings")
django.setup()

import sys
sys.stdout.reconfigure(encoding='utf-8')

from ashyk_lms_app.models import Course, Lecture, Student, User

# Find the student 'Серік Арман' from the screenshot
user = User.objects.filter(first_name='Арман', last_name='Серік').first()
if not user:
    # Try different combination if needed, but first name/last name should work
    user = User.objects.filter(username='student').first() # Fallback to a default student

print(f"User: {user}")
if hasattr(user, 'student_profile'):
    student = user.student_profile
    print(f"Student Group: {student.group}")
    
    # Courses allowed for this student
    courses = Course.objects.filter(allowed_groups=student.group)
    print(f"Allowed Courses: {[repr(c.title) for c in courses]}")
    
    for course in courses:
        print(f"\nCourse ID: {course.id}")
        print(f"Course Title: {repr(course.title)}")
        lectures = course.lectures.all().order_by('order')
        print(f"Lectures count: {lectures.count()}")
        for l in lectures:
            print(f"  - ID: {l.id}, Title: {repr(l.title)}, Order: {l.order}")
else:
    print("User is not a student")
