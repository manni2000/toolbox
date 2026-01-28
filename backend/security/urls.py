from django.urls import path
from . import views

app_name = 'security'

urlpatterns = [
    # Existing endpoints
    path('generate-password/', views.generate_password, name='generate_password'),
    path('check-password-strength/', views.check_password_strength, name='check_password_strength'),
    path('generate-hash/', views.generate_hash, name='generate_hash'),
    path('base64-encode/', views.base64_encode, name='base64_encode'),
    path('base64-decode/', views.base64_decode, name='base64_decode'),
    path('generate-uuid/', views.generate_uuid, name='generate_uuid'),
    
    # New security endpoints
    path('password-strength-explainer/', views.password_strength_explainer, name='password_strength_explainer'),
    path('data-breach-check/', views.data_breach_check, name='data_breach_check'),
    path('file-hash-comparison/', views.file_hash_comparison, name='file_hash_comparison'),
    path('exif-location-remover/', views.exif_location_remover, name='exif_location_remover'),
    path('text-redaction/', views.text_redaction, name='text_redaction'),
    path('qr-phishing-scanner/', views.qr_phishing_scanner, name='qr_phishing_scanner'),
    path('secure-notes/', views.secure_notes_tool, name='secure_notes'),
    path('url-reputation/', views.url_reputation_checker, name='url_reputation'),
]
