from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages

def landing_view(request):
    """Página pública. Se o usuário já estiver logado, redireciona direto para a home."""
    if request.user.is_authenticated:
        return redirect('home')
    return render(request, 'landing.html')

def login_view(request):
    """Página de Login com processamento tradicional do Django."""
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        username = request.POST.get('login')
        password = request.POST.get('password')

        # Autentica o usuário com base na tabela auth_user do Django
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f"Bem-vindo(a), {user.username}!")
            return redirect('home')
        else:
            messages.error(request, "Usuário/E-mail ou senha incorretos.")

    return render(request, 'login.html')

@login_required
def home_view(request):
    """Vitrine de Projetos (Restrita para usuários autenticados)."""
    return render(request, 'home.html')

def logout_view(request):
    """Encerra a sessão do usuário."""
    logout(request)
    messages.info(request, "Sessão encerrada com sucesso.")
    return redirect('landing')