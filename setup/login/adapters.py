from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.exceptions import ImmediateHttpResponse
from django.shortcuts import redirect
from django.contrib import messages

class SchoolDomainAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        # Obtém o e-mail retornado pelo GitHub
        email = sociallogin.account.extra_data.get('email') or sociallogin.user.email
        
        # Defina aqui o domínio oficial da sua escola
        ALLOWED_DOMAIN = "@escola.pr.gov.br"

        # Se não houver e-mail ou se não pertencer ao domínio, bloqueia o acesso
        if not email or not email.lower().endswith(ALLOWED_DOMAIN):
            messages.error(
                request, 
                f"Acesso negado. É necessário utilizar uma conta do GitHub vinculada ao e-mail {ALLOWED_DOMAIN}."
            )
            # Redireciona de volta para a tela de login (ajuste a rota conforme o seu sistema)
            raise ImmediateHttpResponse(redirect('/accounts/login/'))