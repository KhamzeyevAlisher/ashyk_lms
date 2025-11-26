from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import login_required
from .forms import UserLoginForm, ProfileUpdateForm

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

    context = {
        'user': request.user,
        'form': form
    }
    # return render(request, 'ashyk_lms_app/profile.html', context)
    return redirect('admin_panel')

@login_required
def admin_panel(request):
    return render(request, 'ashyk_lms_app/admin_panel.html')

