from django.urls import path
from . import views

app_name = 'pdf'

urlpatterns = [
    path('merge/', views.merge_pdfs, name='merge_pdfs'),
    path('split/', views.split_pdf, name='split_pdf'),
    path('to-images/', views.pdf_to_images, name='pdf_to_images'),
    path('to-word/', views.pdf_to_word, name='pdf_to_word'),
    path('to-powerpoint/', views.pdf_to_powerpoint, name='pdf_to_powerpoint'),
    path('to-excel/', views.pdf_to_excel, name='pdf_to_excel'),
    path('protect/', views.protect_pdf, name='protect_pdf'),
    path('unlock/', views.unlock_pdf, name='unlock_pdf'),
    path('rotate/', views.rotate_pdf, name='rotate_pdf'),
    path('remove-pages/', views.remove_pages, name='remove_pages'),
]
