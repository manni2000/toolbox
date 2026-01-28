from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json
import requests
import io
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import datetime, timedelta
import calendar
from decimal import Decimal
import random

@api_view(['POST'])
def calculate_emi(request):
    """Calculate Equated Monthly Installment (EMI) for loans"""
    try:
        principal = float(request.data.get('principal', 0))
        annual_rate = float(request.data.get('annual_rate', 0))
        tenure_years = float(request.data.get('tenure_years', 0))
        
        if principal <= 0 or annual_rate <= 0 or tenure_years <= 0:
            return Response({'error': 'All values must be greater than 0'}, status=400)
        
        monthly_rate = annual_rate / 12 / 100
        tenure_months = tenure_years * 12
        
        emi = (principal * monthly_rate * (1 + monthly_rate) ** tenure_months) / ((1 + monthly_rate) ** tenure_months - 1)
        total_amount = emi * tenure_months
        total_interest = total_amount - principal
        
        return Response({
            'emi': round(emi, 2),
            'total_amount': round(total_amount, 2),
            'total_interest': round(total_interest, 2),
            'principal': principal,
            'annual_rate': annual_rate,
            'tenure_years': tenure_years
        })
    except (ValueError, TypeError):
        return Response({'error': 'Invalid input values'}, status=400)

@api_view(['POST'])
def calculate_gst(request):
    """Calculate GST amounts"""
    try:
        amount = float(request.data.get('amount', 0))
        gst_rate = float(request.data.get('gst_rate', 18))
        calculation_type = request.data.get('type', 'exclusive')  # 'exclusive' or 'inclusive'
        
        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=400)
        
        if calculation_type == 'exclusive':
            gst_amount = (amount * gst_rate) / 100
            total_amount = amount + gst_amount
            base_amount = amount
        else:  # inclusive
            total_amount = amount
            base_amount = amount / (1 + gst_rate / 100)
            gst_amount = total_amount - base_amount
        
        return Response({
            'base_amount': round(base_amount, 2),
            'gst_amount': round(gst_amount, 2),
            'total_amount': round(total_amount, 2),
            'gst_rate': gst_rate,
            'type': calculation_type
        })
    except (ValueError, TypeError):
        return Response({'error': 'Invalid input values'}, status=400)

@api_view(['POST'])
def calculate_salary(request):
    """Calculate net salary from CTC"""
    try:
        ctc = float(request.data.get('ctc', 0))
        
        if ctc <= 0:
            return Response({'error': 'CTC must be greater than 0'}, status=400)
        
        # Simplified calculations
        basic = ctc * 0.4  # 40% of CTC
        hra = basic * 0.4   # 40% of Basic
        other_allowances = ctc - basic - hra
        
        # Deductions
        pf = min(basic * 0.12, 1800)  # 12% of Basic, max 1800
        professional_tax = 200 if ctc > 10000 else 0
        
        # Simplified tax calculation
        taxable_income = basic + hra + other_allowances
        tax = 0
        if taxable_income > 250000:
            if taxable_income <= 500000:
                tax = (taxable_income - 250000) * 0.05
            elif taxable_income <= 1000000:
                tax = 12500 + (taxable_income - 500000) * 0.20
            else:
                tax = 112500 + (taxable_income - 1000000) * 0.30
        
        cess = tax * 0.04
        total_tax = tax + cess
        
        total_deductions = pf + professional_tax + total_tax
        net_salary = taxable_income - total_deductions
        
        return Response({
            'ctc': ctc,
            'basic_salary': round(basic, 2),
            'hra': round(hra, 2),
            'other_allowances': round(other_allowances, 2),
            'pf': round(pf, 2),
            'professional_tax': round(professional_tax, 2),
            'income_tax': round(total_tax, 2),
            'total_deductions': round(total_deductions, 2),
            'net_salary': round(net_salary, 2),
            'monthly_net_salary': round(net_salary / 12, 2)
        })
    except (ValueError, TypeError):
        return Response({'error': 'Invalid input values'}, status=400)

@api_view(['POST'])
def convert_currency(request):
    """Convert between currencies (simplified)"""
    try:
        amount = float(request.data.get('amount', 0))
        from_currency = request.data.get('from_currency', 'USD').upper()
        to_currency = request.data.get('to_currency', 'INR').upper()
        
        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=400)
        
        # Simplified exchange rates (in real app, use live API)
        exchange_rates = {
            'USD': 1,
            'INR': 83,
            'EUR': 0.92,
            'GBP': 0.79,
            'JPY': 149
        }
        
        if from_currency not in exchange_rates or to_currency not in exchange_rates:
            return Response({'error': 'Unsupported currency'}, status=400)
        
        # Convert USD -> target
        usd_amount = amount / exchange_rates[from_currency]
        converted_amount = usd_amount * exchange_rates[to_currency]
        
        return Response({
            'amount': amount,
            'from_currency': from_currency,
            'to_currency': to_currency,
            'converted_amount': round(converted_amount, 2),
            'exchange_rate': exchange_rates[to_currency] / exchange_rates[from_currency]
        })
    except (ValueError, TypeError):
        return Response({'error': 'Invalid input values'}, status=400)

@api_view(['POST'])
@csrf_exempt
def tax_slab_analyzer(request):
    """Analyze tax slabs and calculate tax liability"""
    income = request.data.get('income', 0)
    regime = request.data.get('regime', 'old')  # 'old' or 'new'
    age_group = request.data.get('age_group', 'regular')  # 'regular', 'senior', 'super_senior'
    
    try:
        income = float(income)
        if income <= 0:
            return Response({'error': 'Income must be greater than 0'}, status=400)
    except (ValueError, TypeError):
        return Response({'error': 'Invalid income amount'}, status=400)
    
    # Indian tax slabs (simplified for demo)
    if regime == 'old':
        if age_group == 'regular':
            slabs = [
                (0, 250000, 0, 0),
                (250001, 500000, 5, 12500),
                (500001, 1000000, 20, 112500),
                (1000001, float('inf'), 30, 112500)
            ]
        elif age_group == 'senior':
            slabs = [
                (0, 300000, 0, 0),
                (300001, 500000, 5, 10000),
                (500001, 1000000, 20, 110000),
                (1000001, float('inf'), 30, 110000)
            ]
        else:  # super_senior
            slabs = [
                (0, 500000, 0, 0),
                (500001, 1000000, 20, 100000),
                (1000001, float('inf'), 30, 100000)
            ]
    else:  # new regime
        slabs = [
            (0, 300000, 0, 0),
            (300001, 700000, 5, 15000),
            (700001, 1000000, 10, 40000),
            (1000001, 1200000, 15, 70000),
            (1200001, 1500000, 20, 110000),
            (1500001, float('inf'), 30, 150000)
        ]
    
    total_tax = 0
    slab_details = []
    
    for min_income, max_income, rate, cess in slabs:
        if income > min_income:
            taxable_amount = min(income, max_income) - min_income
            if taxable_amount > 0:
                slab_tax = (taxable_amount * rate) / 100
                total_tax += slab_tax
                slab_details.append({
                    'range': f"₹{min_income:,.0f} - ₹{max_income if max_income != float('inf') else '∞':,.0f}",
                    'rate': f"{rate}%",
                    'taxable_amount': taxable_amount,
                    'tax': slab_tax
                })
    
    # Add health and education cess (4%)
    cess_amount = (total_tax * 4) / 100
    total_tax_with_cess = total_tax + cess_amount
    
    return Response({
        'income': income,
        'regime': regime,
        'age_group': age_group,
        'slab_details': slab_details,
        'tax_before_cess': total_tax,
        'cess_amount': cess_amount,
        'total_tax': total_tax_with_cess,
        'effective_rate': (total_tax_with_cess / income) * 100 if income > 0 else 0
    })

@api_view(['POST'])
def invoice_generator(request):
    """Generate professional invoice PDF"""
    try:
        invoice_data = request.data
        
        # Required fields validation
        required_fields = ['invoice_number', 'client_name', 'client_email', 'items']
        for field in required_fields:
            if not invoice_data.get(field):
                return Response({'error': f'{field} is required'}, status=400)
        
        # Create PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=1  # Center
        )
        elements.append(Paragraph("INVOICE", title_style))
        
        # Invoice details
        invoice_info = [
            ['Invoice Number:', invoice_data['invoice_number']],
            ['Date:', invoice_data.get('date', datetime.now().strftime('%Y-%m-%d'))],
            ['Due Date:', invoice_data.get('due_date', '')],
        ]
        
        invoice_table = Table(invoice_info, colWidths=[2*inch, 4*inch])
        invoice_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(invoice_table)
        elements.append(Spacer(1, 20))
        
        # Client details
        elements.append(Paragraph("Bill To:", styles['Heading2']))
        client_info = [
            ['Client Name:', invoice_data['client_name']],
            ['Email:', invoice_data['client_email']],
            ['Phone:', invoice_data.get('client_phone', '')],
            ['Address:', invoice_data.get('client_address', '')],
        ]
        
        client_table = Table(client_info, colWidths=[1.5*inch, 4.5*inch])
        client_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(client_table)
        elements.append(Spacer(1, 20))
        
        # Items table
        elements.append(Paragraph("Items:", styles['Heading2']))
        
        items_data = [['Description', 'Quantity', 'Unit Price', 'Total']]
        items = invoice_data['items']
        
        subtotal = 0
        for item in items:
            quantity = item.get('quantity', 1)
            unit_price = item.get('unit_price', 0)
            total = quantity * unit_price
            subtotal += total
            
            items_data.append([
                item.get('description', ''),
                str(quantity),
                f"₹{unit_price:.2f}",
                f"₹{total:.2f}"
            ])
        
        items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 20))
        
        # Total calculation
        tax_rate = invoice_data.get('tax_rate', 0)
        tax_amount = (subtotal * tax_rate) / 100
        total_amount = subtotal + tax_amount
        
        total_data = [
            ['Subtotal:', f"₹{subtotal:.2f}"],
            ['Tax:', f"{tax_rate}%", f"₹{tax_amount:.2f}"],
            ['Total:', '', f"₹{total_amount:.2f}"]
        ]
        
        total_table = Table(total_data, colWidths=[3*inch, 1*inch, 2*inch])
        total_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(total_table)
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        # Create response
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice_{invoice_data["invoice_number"]}.pdf"'
        
        return response
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def stock_cagr_calculator(request):
    """Calculate Compound Annual Growth Rate for stocks"""
    initial_value = request.data.get('initial_value', 0)
    final_value = request.data.get('final_value', 0)
    years = request.data.get('years', 0)
    
    try:
        initial_value = float(initial_value)
        final_value = float(final_value)
        years = float(years)
        
        if initial_value <= 0 or final_value <= 0 or years <= 0:
            return Response({'error': 'All values must be greater than 0'}, status=400)
    except (ValueError, TypeError):
        return Response({'error': 'Invalid input values'}, status=400)
    
    # Calculate CAGR
    cagr = ((final_value / initial_value) ** (1 / years) - 1) * 100
    
    # Calculate total return
    total_return = ((final_value - initial_value) / initial_value) * 100
    
    # Generate analysis
    if cagr > 15:
        performance = "Excellent"
        color = "green"
    elif cagr > 10:
        performance = "Good"
        color = "blue"
    elif cagr > 5:
        performance = "Moderate"
        color = "orange"
    elif cagr > 0:
        performance = "Low"
        color = "yellow"
    else:
        performance = "Negative"
        color = "red"
    
    return Response({
        'initial_value': initial_value,
        'final_value': final_value,
        'years': years,
        'cagr': round(cagr, 2),
        'total_return': round(total_return, 2),
        'performance': performance,
        'color': color,
        'analysis': {
            'absolute_gain': final_value - initial_value,
            'annualized_gain': (final_value - initial_value) / years,
            'investment_multiple': final_value / initial_value
        }
    })

@api_view(['POST'])
def budget_planner(request):
    """Create and analyze monthly budget"""
    income = request.data.get('income', 0)
    expenses = request.data.get('expenses', [])
    
    try:
        income = float(income)
        if income <= 0:
            return Response({'error': 'Income must be greater than 0'}, status=400)
    except (ValueError, TypeError):
        return Response({'error': 'Invalid income amount'}, status=400)
    
    # Calculate total expenses
    total_expenses = 0
    expense_breakdown = []
    
    for expense in expenses:
        amount = expense.get('amount', 0)
        category = expense.get('category', 'Uncategorized')
        
        try:
            amount = float(amount)
            if amount > 0:
                total_expenses += amount
                expense_breakdown.append({
                    'category': category,
                    'amount': amount,
                    'percentage': (amount / income) * 100
                })
        except (ValueError, TypeError):
            continue
    
    # Calculate savings
    savings = income - total_expenses
    savings_rate = (savings / income) * 100 if income > 0 else 0
    
    # Budget analysis
    if savings_rate >= 20:
        budget_health = "Excellent"
        color = "green"
        recommendation = "Great job! You're saving well. Consider investing your savings."
    elif savings_rate >= 10:
        budget_health = "Good"
        color = "blue"
        recommendation = "Good savings rate. Look for opportunities to increase it to 20%."
    elif savings_rate >= 0:
        budget_health = "Fair"
        color = "orange"
        recommendation = "You're breaking even. Try to reduce expenses or increase income."
    else:
        budget_health = "Deficit"
        color = "red"
        recommendation = "You're spending more than you earn. Review and cut expenses immediately."
    
    # 50/30/20 rule analysis
    needs_percentage = 0
    wants_percentage = 0
    savings_percentage = savings_rate
    
    for expense in expense_breakdown:
        category = expense['category'].lower()
        if any(keyword in category for keyword in ['rent', 'mortgage', 'utilities', 'groceries', 'transport', 'insurance']):
            needs_percentage += expense['percentage']
        else:
            wants_percentage += expense['percentage']
    
    return Response({
        'income': income,
        'total_expenses': total_expenses,
        'savings': savings,
        'savings_rate': round(savings_rate, 2),
        'budget_health': budget_health,
        'color': color,
        'recommendation': recommendation,
        'expense_breakdown': expense_breakdown,
        'rule_50_30_20': {
            'needs': round(needs_percentage, 2),
            'wants': round(wants_percentage, 2),
            'savings': round(savings_percentage, 2),
            'analysis': "Ideal: 50% Needs, 30% Wants, 20% Savings"
        }
    })

@api_view(['POST'])
def salary_breakup_generator(request):
    """Generate detailed salary breakup"""
    ctc = request.data.get('ctc', 0)  # Cost to Company
    components = request.data.get('components', {})
    
    try:
        ctc = float(ctc)
        if ctc <= 0:
            return Response({'error': 'CTC must be greater than 0'}, status=400)
    except (ValueError, TypeError):
        return Response({'error': 'Invalid CTC amount'}, status=400)
    
    # Default salary structure if not provided
    if not components:
        basic_percent = 40  # Basic is typically 40% of CTC
        hra_percent = 40    # HRA is typically 40% of Basic
        other_percent = 20   # Other allowances
        
        basic = (ctc * basic_percent) / 100
        hra = (basic * hra_percent) / 100
        other_allowances = ctc - basic - hra
        
        components = {
            'basic': basic,
            'hra': hra,
            'other_allowances': other_allowances
        }
    else:
        basic = components.get('basic', 0)
        hra = components.get('hra', 0)
        other_allowances = components.get('other_allowances', 0)
    
    # Calculate statutory deductions
    pf_employee = min(basic * 0.12, 1800)  # 12% of basic, max 1800
    pf_employer = min(basic * 0.12, 1800)
    esi_employee = min((basic + other_allowances) * 0.0075, 112.5) if (basic + other_allowances) <= 21000 else 0
    esi_employer = min((basic + other_allowances) * 0.0325, 487.5) if (basic + other_allowances) <= 21000 else 0
    
    # Professional tax (varies by state, using Delhi rates)
    professional_tax = 200 if ctc > 10000 else 0
    
    # Calculate taxable income
    taxable_income = basic + hra + other_allowances
    
    # Calculate income tax (simplified Old Regime)
    income_tax = 0
    if taxable_income > 250000:
        if taxable_income <= 500000:
            income_tax = (taxable_income - 250000) * 0.05
        elif taxable_income <= 1000000:
            income_tax = 12500 + (taxable_income - 500000) * 0.20
        else:
            income_tax = 112500 + (taxable_income - 1000000) * 0.30
    
    # Add cess
    cess = income_tax * 0.04
    total_tax = income_tax + cess
    
    # Calculate take-home salary
    total_deductions = pf_employee + esi_employee + professional_tax + total_tax
    take_home = taxable_income - total_deductions
    
    return Response({
        'ctc': ctc,
        'earnings': {
            'basic_salary': basic,
            'hra': hra,
            'other_allowances': other_allowances,
            'total_earnings': basic + hra + other_allowances
        },
        'deductions': {
            'provident_fund': pf_employee,
            'esi': esi_employee,
            'professional_tax': professional_tax,
            'income_tax': total_tax,
            'total_deductions': total_deductions
        },
        'employer_contributions': {
            'provident_fund': pf_employer,
            'esi': esi_employer,
            'total': pf_employer + esi_employer
        },
        'take_home_salary': take_home,
        'effective_tax_rate': (total_tax / taxable_income) * 100 if taxable_income > 0 else 0,
        'monthly_take_home': take_home / 12
    })
