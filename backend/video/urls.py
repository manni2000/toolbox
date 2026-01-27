from django.urls import path
from . import views

app_name = 'video'

urlpatterns = [
    path('to-audio/', views.video_to_audio, name='video_to_audio'),
    path('trim/', views.trim_video, name='trim_video'),
    path('speed/', views.change_video_speed, name='change_video_speed'),
    path('thumbnail/', views.extract_thumbnail, name='extract_thumbnail'),
    path('resolution/', views.change_resolution, name='change_resolution'),
    path('download/', views.download_video, name='download_video'),
]
