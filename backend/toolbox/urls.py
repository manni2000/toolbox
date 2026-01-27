"""
URL configuration for toolbox project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'status': 'Django running on Vercel 🚀',
        'message': 'ToolBox API is running',
        'version': '1.0.0',
        'endpoints': [
            '/api/image/',
            '/api/pdf/',
            '/api/video/',
            '/api/audio/',
            '/api/zip/',
        ]
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('api/', api_root, name='api_root_with_slash'),
    path('api/image/', include('image.urls')),
    path('api/pdf/', include('pdf.urls')),
    path('api/video/', include('video.urls')),
    path('api/audio/', include('audio.urls')),
    path('api/zip/', include('zip.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
