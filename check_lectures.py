import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ashyk_lms.settings")
django.setup()

from ashyk_lms_app.models import Lecture

for l in Lecture.objects.all():
    print(f"ID: {l.id}, Title: {l.title.encode('utf-8')}, Course: {l.course.title.encode('utf-8')}, Order: {l.order}")
