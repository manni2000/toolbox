import os
import base64
import io
from PIL import Image
from rembg import remove
import qrcode
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings
import tempfile


@csrf_exempt
@require_http_methods(["POST"])
def remove_background(request):
    """Remove background from image using rembg"""
    try:
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No image file provided'}, status=400)
        
        image_file = request.FILES['image']
        
        # Open and process image
        input_image = Image.open(image_file)
        
        # Remove background
        output_image = remove(input_image)
        
        # Convert to bytes for response
        img_buffer = io.BytesIO()
        output_image.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        # Encode to base64
        image_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        return JsonResponse({
            'success': True,
            'image': f'data:image/png;base64,{image_base64}',
            'filename': f'no_bg_{image_file.name}'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def image_to_base64(request):
    """Convert image to base64"""
    try:
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No image file provided'}, status=400)
        
        image_file = request.FILES['image']
        
        # Read image and convert to base64
        image_data = image_file.read()
        image_base64 = base64.b64encode(image_data).decode()
        
        # Determine MIME type
        mime_type = image_file.content_type or 'image/jpeg'
        
        return JsonResponse({
            'success': True,
            'base64': f'data:{mime_type};base64,{image_base64}',
            'filename': image_file.name
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def base64_to_image(request):
    """Convert base64 to image"""
    try:
        data = request.POST.get('base64')
        if not data:
            return JsonResponse({'error': 'No base64 data provided'}, status=400)
        
        # Remove data URL prefix if present
        if ',' in data:
            data = data.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(data)
        
        return JsonResponse({
            'success': True,
            'image_data': image_data.hex(),  # Return as hex for frontend processing
            'size': len(image_data)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def generate_qr_code(request):
    """Generate QR code from text or URL"""
    try:
        text = request.POST.get('text', '')
        size = int(request.POST.get('size', 300))
        fg_color = request.POST.get('fg_color', '#000000')
        bg_color = request.POST.get('bg_color', '#ffffff')
        
        if not text:
            return JsonResponse({'error': 'Text or URL is required'}, status=400)
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(text)
        qr.make(fit=True)
        
        # Create QR code image
        qr_img = qr.make_image(fill_color=fg_color, back_color=bg_color)
        
        # Resize if needed
        if qr_img.size != (size, size):
            qr_img = qr_img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Convert to base64
        img_buffer = io.BytesIO()
        qr_img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        image_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        return JsonResponse({
            'success': True,
            'qr_code': f'data:image/png;base64,{image_base64}',
            'size': size
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def resize_image(request):
    """Resize image to specified dimensions"""
    try:
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No image file provided'}, status=400)
        
        image_file = request.FILES['image']
        width = int(request.POST.get('width', 800))
        height = int(request.POST.get('height', 600))
        maintain_aspect = request.POST.get('maintain_aspect', 'true').lower() == 'true'
        
        # Open image
        img = Image.open(image_file)
        
        # Calculate new dimensions
        if maintain_aspect:
            img.thumbnail((width, height), Image.Resampling.LANCZOS)
        else:
            img = img.resize((width, height), Image.Resampling.LANCZOS)
        
        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Convert to base64
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='JPEG', quality=90)
        img_buffer.seek(0)
        
        image_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        return JsonResponse({
            'success': True,
            'image': f'data:image/jpeg;base64,{image_base64}',
            'width': img.width,
            'height': img.height,
            'filename': f'resized_{image_file.name}'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def compress_image(request):
    """Compress image while maintaining quality"""
    try:
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No image file provided'}, status=400)
        
        image_file = request.FILES['image']
        quality = int(request.POST.get('quality', 80))
        
        # Open image
        img = Image.open(image_file)
        
        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Compress image
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='JPEG', quality=quality, optimize=True)
        img_buffer.seek(0)
        
        # Calculate compression ratio
        original_size = image_file.size
        compressed_size = img_buffer.tell()
        compression_ratio = (1 - compressed_size / original_size) * 100
        
        image_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        return JsonResponse({
            'success': True,
            'image': f'data:image/jpeg;base64,{image_base64}',
            'original_size': original_size,
            'compressed_size': compressed_size,
            'compression_ratio': round(compression_ratio, 2),
            'filename': f'compressed_{image_file.name}'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def convert_image_format(request):
    """Convert image to different format"""
    try:
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'No image file provided'}, status=400)
        
        image_file = request.FILES['image']
        format_type = request.POST.get('format', 'JPEG').upper()
        
        if format_type not in ['JPEG', 'PNG', 'WEBP']:
            return JsonResponse({'error': 'Unsupported format. Use JPEG, PNG, or WEBP'}, status=400)
        
        # Open image
        img = Image.open(image_file)
        
        # Convert to RGB if necessary for JPEG
        if format_type == 'JPEG' and img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Convert format
        img_buffer = io.BytesIO()
        img.save(img_buffer, format=format_type)
        img_buffer.seek(0)
        
        image_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Get file extension
        extension = format_type.lower()
        if format_type == 'JPEG':
            extension = 'jpg'
        
        return JsonResponse({
            'success': True,
            'image': f'data:image/{extension};base64,{image_base64}',
            'format': format_type,
            'filename': f'converted.{extension}'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
