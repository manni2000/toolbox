from django.urls import path
from . import views

app_name = 'finance'

urlpatterns = [
    # Existing endpoints
    path('calculate-emi/', views.calculate_emi, name='calculate_emi'),
    path('calculate-gst/', views.calculate_gst, name='calculate_gst'),
    path('calculate-salary/', views.calculate_salary, name='calculate_salary'),
    path('convert-currency/', views.convert_currency, name='convert_currency'),
    
    # New finance endpoints
    path('tax-slab-analyzer/', views.tax_slab_analyzer, name='tax_slab_analyzer'),
    path('invoice-generator/', views.invoice_generator, name='invoice_generator'),
    path('stock-cagr/', views.stock_cagr_calculator, name='stock_cagr_calculator'),
    path('budget-planner/', views.budget_planner, name='budget_planner'),
    path('salary-breakup/', views.salary_breakup_generator, name='salary_breakup_generator'),
]
