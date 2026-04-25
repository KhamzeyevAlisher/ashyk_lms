import os
import sys
import django
import json

sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ashyk_lms_project.settings")
django.setup()

from ashyk_lms_app.views_api.student_api import get_course_detail
from ashyk_lms_app.models import User
from django.test import RequestFactory

factory = RequestFactory()
user = User.objects.filter(first_name='Арман', last_name='Серік').first()

request = factory.get('/api/courses/1/')
request.user = user

# Simulate the login_required decorator by ensuring request.user is set
# We call the view function directly
response = get_course_detail(request, 1)
print(response.content.decode('utf-8'))
