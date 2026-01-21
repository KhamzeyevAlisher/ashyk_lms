from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from datetime import timedelta
from ..models import Test, Question, Variant, Subject
import json

@csrf_exempt
@login_required
def upload_tests_json(request):
    """
    API endpoint to upload tests via JSON.
    Expected structure:
    {
        "Test Name": {
            "1": { "question": "...", "variants": [...], "correct_variants": [...] },
            ...
        },
        ...
    }
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            created_count = 0
            
            # Default subject fallback
            # In a real app, you might want to map this better or accept subject_id in input
            default_subject_name = "Жалпы пәндер"
            subject, _ = Subject.objects.get_or_create(name=default_subject_name)

            for test_title, questions_map in data.items():
                
                # Try to fuzzy match subject from title or use default
                # For now, using default subject for all uploaded tests to ensure success
                # You can improve this logic later
                
                # Create or Update Test
                test, created = Test.objects.get_or_create(
                    title=test_title,
                    defaults={
                        'subject': subject,
                        'duration_minutes': 45,
                        'deadline': timezone.now() + timedelta(days=14),
                        'is_active': True
                    }
                )

                if not created:
                    # If test exists, we might want to clear old questions or just append?
                    # For safety, let's just append or update.
                    pass
                
                created_count += 1

                # Process Questions
                for q_key, q_data in questions_map.items():
                    q_text = q_data.get('question')
                    if not q_text:
                        continue

                    question = Question.objects.create(
                        test=test,
                        text=q_text,
                        points=1,
                        is_multiple_choice=len(q_data.get('correct_variants', [])) > 1
                    )

                    # Process Variants
                    all_variants = q_data.get('variants', [])
                    correct_variants = q_data.get('correct_variants', [])

                    for variant_text in all_variants:
                        is_correct = variant_text in correct_variants
                        Variant.objects.create(
                            question=question,
                            text=variant_text,
                            is_correct=is_correct
                        )

            return JsonResponse({
                'status': 'success', 
                'message': f'Successfully uploaded {created_count} tests.'
            })

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'}, status=405)
