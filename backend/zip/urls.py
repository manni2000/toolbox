from django.urls import path
from . import views

app_name = 'zip'

urlpatterns = [
    path('create/', views.create_zip, name='create_zip'),
    path('extract/', views.extract_zip, name='extract_zip'),
    path('create-password/', views.create_password_zip, name='create_password_zip'),
    path('create-compression/', views.create_compression_zip, name='create_compression_zip'),
]
