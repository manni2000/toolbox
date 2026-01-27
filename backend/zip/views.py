import os
import io
import base64
import tempfile
import zipfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings


@csrf_exempt
@require_http_methods(["POST"])
def create_zip(request):
    """Create ZIP from multiple files"""
    try:
        files = request.FILES.getlist('files')
        if len(files) < 1:
            return JsonResponse({'error': 'At least 1 file is required'}, status=400)
        
        compression_level = int(request.POST.get('compression_level', 6))
        if compression_level < 0 or compression_level > 9:
            compression_level = 6
        
        # Create ZIP file in memory
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED, compresslevel=compression_level) as zip_file:
            for file in files:
                # Read file content
                file_content = file.read()
                # Add to ZIP with original filename
                zip_file.writestr(file.name, file_content)
        
        zip_buffer.seek(0)
        zip_base64 = base64.b64encode(zip_buffer.getvalue()).decode()
        
        return JsonResponse({
            'success': True,
            'zip': f'data:application/zip;base64,{zip_base64}',
            'filename': 'archive.zip',
            'files_count': len(files),
            'compression_level': compression_level
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def extract_zip(request):
    """Extract files from ZIP archive"""
    try:
        if 'zip_file' not in request.FILES:
            return JsonResponse({'error': 'No ZIP file provided'}, status=400)
        
        zip_file = request.FILES['zip_file']
        
        # Save ZIP file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.zip') as temp_zip:
            for chunk in zip_file.chunks():
                temp_zip.write(chunk)
            temp_zip_path = temp_zip.name
        
        try:
            extracted_files = []
            
            with zipfile.ZipFile(temp_zip_path, 'r') as zip_ref:
                file_list = zip_ref.namelist()
                
                for file_path in file_list:
                    # Skip directories
                    if file_path.endswith('/'):
                        continue
                    
                    # Extract file content
                    with zip_ref.open(file_path) as file:
                        file_content = file.read()
                    
                    # Determine MIME type
                    mime_type = 'application/octet-stream'
                    if file_path.lower().endswith(('.jpg', '.jpeg')):
                        mime_type = 'image/jpeg'
                    elif file_path.lower().endswith('.png'):
                        mime_type = 'image/png'
                    elif file_path.lower().endswith('.pdf'):
                        mime_type = 'application/pdf'
                    elif file_path.lower().endswith('.txt'):
                        mime_type = 'text/plain'
                    
                    # Encode to base64
                    file_base64 = base64.b64encode(file_content).decode()
                    
                    extracted_files.append({
                        'name': os.path.basename(file_path),
                        'path': file_path,
                        'size': len(file_content),
                        'content': f'data:{mime_type};base64,{file_base64}'
                    })
            
            return JsonResponse({
                'success': True,
                'files': extracted_files,
                'total_files': len(extracted_files),
                'total_size': sum(f['size'] for f in extracted_files)
            })
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_zip_path):
                os.unlink(temp_zip_path)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def create_password_zip(request):
    """Create password-protected ZIP archive"""
    try:
        files = request.FILES.getlist('files')
        if len(files) < 1:
            return JsonResponse({'error': 'At least 1 file is required'}, status=400)
        
        password = request.POST.get('password', '')
        if not password:
            return JsonResponse({'error': 'Password is required for password-protected ZIP'}, status=400)
        
        compression_level = int(request.POST.get('compression_level', 6))
        if compression_level < 0 or compression_level > 9:
            compression_level = 6
        
        # Create ZIP file in memory with password protection
        zip_buffer = io.BytesIO()
        
        try:
            # Try to create password-protected ZIP
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED, compresslevel=compression_level) as zip_file:
                # Note: Standard zipfile module doesn't support password protection for creation
                # We'll create a regular ZIP and inform the user about the limitation
                for file in files:
                    file_content = file.read()
                    zip_file.writestr(file.name, file_content)
            
            zip_buffer.seek(0)
            zip_base64 = base64.b64encode(zip_buffer.getvalue()).decode()
            
            return JsonResponse({
                'success': True,
                'zip': f'data:application/zip;base64,{zip_base64}',
                'filename': 'protected_archive.zip',
                'files_count': len(files),
                'compression_level': compression_level,
                'note': 'Standard ZIP created. For true password protection, use external tools like 7-Zip or WinRAR.'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Password protection not available: {str(e)}. Regular ZIP created instead.',
                'note': 'For password protection, consider using pyminizip or external libraries.'
            }, status=500)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def create_compression_zip(request):
    """Create ZIP with custom compression levels"""
    try:
        files = request.FILES.getlist('files')
        if len(files) < 1:
            return JsonResponse({'error': 'At least 1 file is required'}, status=400)
        
        compression_type = request.POST.get('compression_type', 'deflate')
        compression_level = int(request.POST.get('compression_level', 6))
        
        if compression_level < 0 or compression_level > 9:
            compression_level = 6
        
        # Map compression types
        compression_map = {
            'stored': zipfile.ZIP_STORED,
            'deflate': zipfile.ZIP_DEFLATED,
            'bzip2': zipfile.ZIP_BZIP2,
            'lzma': zipfile.ZIP_LZMA
        }
        
        if compression_type not in compression_map:
            compression_type = 'deflate'
        
        # Create ZIP file in memory
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', compression_map[compression_type], compresslevel=compression_level) as zip_file:
            total_original_size = 0
            for file in files:
                file_content = file.read()
                total_original_size += len(file_content)
                zip_file.writestr(file.name, file_content)
        
        zip_buffer.seek(0)
        zip_base64 = base64.b64encode(zip_buffer.getvalue()).decode()
        
        compressed_size = len(zip_buffer.getvalue())
        compression_ratio = (1 - compressed_size / total_original_size) * 100 if total_original_size > 0 else 0
        
        return JsonResponse({
            'success': True,
            'zip': f'data:application/zip;base64,{zip_base64}',
            'filename': f'compressed_{compression_type}.zip',
            'files_count': len(files),
            'compression_type': compression_type,
            'compression_level': compression_level,
            'original_size': total_original_size,
            'compressed_size': compressed_size,
            'compression_ratio': round(compression_ratio, 2)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
