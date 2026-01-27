from django.urls import path
from . import views

app_name = 'audio'

urlpatterns = [
    path('convert/', views.convert_audio, name='convert_audio'),
    path('trim/', views.trim_audio, name='trim_audio'),
    path('merge/', views.merge_audio, name='merge_audio'),
    path('speed/', views.change_audio_speed, name='change_audio_speed'),
    path('speech-to-text/', views.speech_to_text, name='speech_to_text'),
]
