import os
import io
import base64
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings
import tempfile

# PDF processing imports
import PyPDF2
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter


@csrf_exempt
@require_http_methods(["POST"])
def merge_pdfs(request):
    """Merge multiple PDF files into one"""
    try:
        files = request.FILES.getlist('pdfs')
        if len(files) < 2:
            return JsonResponse({'error': 'At least 2 PDF files are required'}, status=400)
        
        merger = PyPDF2.PdfMerger()
        
        for pdf_file in files:
            merger.append(pdf_file)
        
        # Save merged PDF to buffer
        pdf_buffer = io.BytesIO()
        merger.write(pdf_buffer)
        merger.close()
        pdf_buffer.seek(0)
        
        # Encode to base64
        pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode()
        
        return JsonResponse({
            'success': True,
            'pdf': f'data:application/pdf;base64,{pdf_base64}',
            'filename': 'merged.pdf'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def split_pdf(request):
    """Split PDF into multiple files"""
    try:
        if 'pdf' not in request.FILES:
            return JsonResponse({'error': 'No PDF file provided'}, status=400)
        
        pdf_file = request.FILES['pdf']
        split_type = request.POST.get('split_type', 'single')  # 'single' or 'range'
        page_ranges = request.POST.get('page_ranges', '')  # For range split
        
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        total_pages = len(pdf_reader.pages)
        
        result_files = []
        
        if split_type == 'single':
            # Split each page into separate PDF
            for page_num in range(total_pages):
                pdf_writer = PyPDF2.PdfWriter()
                pdf_writer.add_page(pdf_reader.pages[page_num])
                
                pdf_buffer = io.BytesIO()
                pdf_writer.write(pdf_buffer)
                pdf_buffer.seek(0)
                
                pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode()
                result_files.append({
                    'filename': f'page_{page_num + 1}.pdf',
                    'pdf': f'data:application/pdf;base64,{pdf_base64}'
                })
        
        elif split_type == 'range' and page_ranges:
            # Split by page ranges (e.g., "1-3,5,7-9")
            ranges = [r.strip() for r in page_ranges.split(',')]
            
            for range_item in ranges:
                if '-' in range_item:
                    start, end = map(int, range_item.split('-'))
                    page_indices = list(range(start - 1, min(end, total_pages)))
                else:
                    page_num = int(range_item)
                    page_indices = [page_num - 1] if page_num <= total_pages else []
                
                if page_indices:
                    pdf_writer = PyPDF2.PdfWriter()
                    for page_idx in page_indices:
                        pdf_writer.add_page(pdf_reader.pages[page_idx])
                    
                    pdf_buffer = io.BytesIO()
                    pdf_writer.write(pdf_buffer)
                    pdf_buffer.seek(0)
                    
                    pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode()
                    result_files.append({
                        'filename': f'pages_{range_item.replace("-", "_")}.pdf',
                        'pdf': f'data:application/pdf;base64,{pdf_base64}'
                    })
        
        return JsonResponse({
            'success': True,
            'files': result_files,
            'total_pages': total_pages
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def protect_pdf(request):
    """Add password protection to PDF"""
    try:
        if 'pdf' not in request.FILES:
            return JsonResponse({'error': 'No PDF file provided'}, status=400)
        
        pdf_file = request.FILES['pdf']
        password = request.POST.get('password', '')
        
        if not password:
            return JsonResponse({'error': 'Password is required'}, status=400)
        
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        pdf_writer = PyPDF2.PdfWriter()
        
        # Add all pages to writer
        for page in pdf_reader.pages:
            pdf_writer.add_page(page)
        
        # Add password protection
        pdf_writer.encrypt(password)
        
        # Save protected PDF to buffer
        pdf_buffer = io.BytesIO()
        pdf_writer.write(pdf_buffer)
        pdf_buffer.seek(0)
        
        # Encode to base64
        pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode()
        
        return JsonResponse({
            'success': True,
            'pdf': f'data:application/pdf;base64,{pdf_base64}',
            'filename': 'protected.pdf'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def unlock_pdf(request):
    """Remove password protection from PDF"""
    try:
        if 'pdf' not in request.FILES:
            return JsonResponse({'error': 'No PDF file provided'}, status=400)
        
        pdf_file = request.FILES['pdf']
        password = request.POST.get('password', '')
        
        if not password:
            return JsonResponse({'error': 'Password is required to unlock PDF'}, status=400)
        
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            if pdf_reader.is_encrypted:
                pdf_reader.decrypt(password)
        except:
            return JsonResponse({'error': 'Incorrect password or corrupted PDF'}, status=400)
        
        pdf_writer = PyPDF2.PdfWriter()
        
        # Add all pages to writer
        for page in pdf_reader.pages:
            pdf_writer.add_page(page)
        
        # Save unlocked PDF to buffer
        pdf_buffer = io.BytesIO()
        pdf_writer.write(pdf_buffer)
        pdf_buffer.seek(0)
        
        # Encode to base64
        pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode()
        
        return JsonResponse({
            'success': True,
            'pdf': f'data:application/pdf;base64,{pdf_base64}',
            'filename': 'unlocked.pdf'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def rotate_pdf(request):
    """Rotate PDF pages"""
    try:
        if 'pdf' not in request.FILES:
            return JsonResponse({'error': 'No PDF file provided'}, status=400)
        
        pdf_file = request.FILES['pdf']
        rotation = int(request.POST.get('rotation', 90))  # 90, 180, or 270 degrees
        
        if rotation not in [90, 180, 270]:
            return JsonResponse({'error': 'Rotation must be 90, 180, or 270 degrees'}, status=400)
        
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        pdf_writer = PyPDF2.PdfWriter()
        
        # Rotate all pages
        for page in pdf_reader.pages:
            page.rotate(rotation)
            pdf_writer.add_page(page)
        
        # Save rotated PDF to buffer
        pdf_buffer = io.BytesIO()
        pdf_writer.write(pdf_buffer)
        pdf_buffer.seek(0)
        
        # Encode to base64
        pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode()
        
        return JsonResponse({
            'success': True,
            'pdf': f'data:application/pdf;base64,{pdf_base64}',
            'filename': f'rotated_{rotation}.pdf'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def remove_pages(request):
    """Remove specific pages from PDF"""
    try:
        if 'pdf' not in request.FILES:
            return JsonResponse({'error': 'No PDF file provided'}, status=400)
        
        pdf_file = request.FILES['pdf']
        pages_to_remove = request.POST.get('pages_to_remove', '')
        
        if not pages_to_remove:
            return JsonResponse({'error': 'Pages to remove is required'}, status=400)
        
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        total_pages = len(pdf_reader.pages)
        
        # Parse pages to remove (e.g., "1,3,5-7")
        pages_set = set()
        for item in pages_to_remove.split(','):
            item = item.strip()
            if '-' in item:
                start, end = map(int, item.split('-'))
                pages_set.update(range(start, min(end + 1, total_pages + 1)))
            else:
                page_num = int(item)
                if 1 <= page_num <= total_pages:
                    pages_set.add(page_num)
        
        pdf_writer = PyPDF2.PdfWriter()
        
        # Add all pages except those to remove
        for page_num in range(1, total_pages + 1):
            if page_num not in pages_set:
                pdf_writer.add_page(pdf_reader.pages[page_num - 1])
        
        # Save PDF to buffer
        pdf_buffer = io.BytesIO()
        pdf_writer.write(pdf_buffer)
        pdf_buffer.seek(0)
        
        # Encode to base64
        pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode()
        
        return JsonResponse({
            'success': True,
            'pdf': f'data:application/pdf;base64,{pdf_base64}',
            'filename': 'pages_removed.pdf',
            'original_pages': total_pages,
            'new_pages': total_pages - len(pages_set)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# Placeholder functions for advanced features
@csrf_exempt
@require_http_methods(["POST"])
def pdf_to_images(request):
    """Convert PDF pages to images - requires additional setup"""
    return JsonResponse({
        'error': 'PDF to images conversion requires PyMuPDF. Install with: pip install PyMuPDF'
    }, status=501)


@csrf_exempt
@require_http_methods(["POST"])
def pdf_to_word(request):
    """Convert PDF to Word document - requires additional setup"""
    return JsonResponse({
        'error': 'PDF to Word conversion requires python-docx. Install with: pip install python-docx'
    }, status=501)


@csrf_exempt
@require_http_methods(["POST"])
def pdf_to_powerpoint(request):
    """Convert PDF to PowerPoint - requires additional setup"""
    return JsonResponse({
        'error': 'PDF to PowerPoint conversion requires python-pptx. Install with: pip install python-pptx'
    }, status=501)


@csrf_exempt
@require_http_methods(["POST"])
def pdf_to_excel(request):
    """Extract tables from PDF to Excel - requires additional setup"""
    return JsonResponse({
        'error': 'PDF to Excel conversion requires openpyxl. Install with: pip install openpyxl'
    }, status=501)
