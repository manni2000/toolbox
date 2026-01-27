from django.http import JsonResponse
from django.urls import path

def home(request):
    return JsonResponse({"status": "Django running on Vercel 🚀"})

urlpatterns = [
    path("", home),
]
