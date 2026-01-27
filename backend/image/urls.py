from django.urls import path
from . import views

app_name = 'image'

urlpatterns = [
    path('remove-background/', views.remove_background, name='remove_background'),
    path('to-base64/', views.image_to_base64, name='image_to_base64'),
    path('from-base64/', views.base64_to_image, name='base64_to_image'),
    path('generate-qr/', views.generate_qr_code, name='generate_qr_code'),
    path('resize/', views.resize_image, name='resize_image'),
    path('compress/', views.compress_image, name='compress_image'),
    path('convert/', views.convert_image_format, name='convert_image_format'),
]
