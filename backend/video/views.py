import os
import io
import base64
import tempfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings
import subprocess
import json

# Video processing imports
try:
    from moviepy.editor import VideoFileClip, AudioFileClip, CompositeVideoClip
    MOVIEPY_AVAILABLE = True
except ImportError:
    MOVIEPY_AVAILABLE = False

try:
    import yt_dlp
    YTDLP_AVAILABLE = True
except ImportError:
    YTDLP_AVAILABLE = False


@csrf_exempt
def test_download(request):
    """Simple test view to debug routing"""
    return JsonResponse({
        'success': True,
        'message': 'Test endpoint working',
        'method': request.method,
        'content_type': request.content_type,
        'post_data': dict(request.POST),
        'body': request.body.decode('utf-8', errors='ignore')[:200]
    })


@csrf_exempt
@require_http_methods(["POST"])
def video_to_audio(request):
    """Extract audio from video file"""
    try:
        if not MOVIEPY_AVAILABLE:
            return JsonResponse({'error': 'MoviePy is not installed. Please install it to use this feature.'}, status=500)
        
        if 'video' not in request.FILES:
            return JsonResponse({'error': 'No video file provided'}, status=400)
        
        video_file = request.FILES['video']
        audio_format = request.POST.get('format', 'mp3').lower()
        
        if audio_format not in ['mp3', 'wav', 'aac', 'ogg']:
            return JsonResponse({'error': 'Unsupported audio format. Use mp3, wav, aac, or ogg'}, status=400)
        
        # Save video file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
            for chunk in video_file.chunks():
                temp_video.write(chunk)
            temp_video_path = temp_video.name
        
        try:
            # Extract audio using MoviePy
            video_clip = VideoFileClip(temp_video_path)
            audio_clip = video_clip.audio
            
            # Create temporary audio file
            with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{audio_format}') as temp_audio:
                temp_audio_path = temp_audio.name
            
            # Write audio file
            if audio_format == 'mp3':
                audio_clip.write_audiofile(temp_audio_path, codec='mp3')
            elif audio_format == 'wav':
                audio_clip.write_audiofile(temp_audio_path, codec='pcm_s16le')
            elif audio_format == 'aac':
                audio_clip.write_audiofile(temp_audio_path, codec='aac')
            elif audio_format == 'ogg':
                audio_clip.write_audiofile(temp_audio_path, codec='libvorbis')
            
            # Close clips
            audio_clip.close()
            video_clip.close()
            
            # Read audio file and encode to base64
            with open(temp_audio_path, 'rb') as f:
                audio_data = f.read()
            
            audio_base64 = base64.b64encode(audio_data).decode()
            
            # Determine MIME type
            mime_types = {
                'mp3': 'audio/mpeg',
                'wav': 'audio/wav',
                'aac': 'audio/aac',
                'ogg': 'audio/ogg'
            }
            mime_type = mime_types.get(audio_format, 'audio/mpeg')
            
            return JsonResponse({
                'success': True,
                'audio': f'data:{mime_type};base64,{audio_base64}',
                'filename': f'extracted_audio.{audio_format}',
                'duration': video_clip.duration
            })
            
        finally:
            # Clean up temporary files
            if os.path.exists(temp_video_path):
                os.unlink(temp_video_path)
            if 'temp_audio_path' in locals() and os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def trim_video(request):
    """Trim video to specified duration"""
    try:
        if not MOVIEPY_AVAILABLE:
            return JsonResponse({'error': 'MoviePy is not installed. Please install it to use this feature.'}, status=500)
        
        if 'video' not in request.FILES:
            return JsonResponse({'error': 'No video file provided'}, status=400)
        
        video_file = request.FILES['video']
        start_time = float(request.POST.get('start_time', 0))
        end_time = float(request.POST.get('end_time', 10))
        
        # Save video file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
            for chunk in video_file.chunks():
                temp_video.write(chunk)
            temp_video_path = temp_video.name
        
        try:
            # Load video clip
            video_clip = VideoFileClip(temp_video_path)
            
            # Validate time range
            if start_time < 0:
                start_time = 0
            if end_time > video_clip.duration:
                end_time = video_clip.duration
            if start_time >= end_time:
                return JsonResponse({'error': 'Invalid time range. Start time must be less than end time.'}, status=400)
            
            # Trim video
            trimmed_clip = video_clip.subclip(start_time, end_time)
            
            # Create temporary output file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_output:
                temp_output_path = temp_output.name
            
            # Write trimmed video
            trimmed_clip.write_videofile(temp_output_path, codec='libx264', audio_codec='aac')
            
            # Close clips
            trimmed_clip.close()
            video_clip.close()
            
            # Read output file and encode to base64
            with open(temp_output_path, 'rb') as f:
                video_data = f.read()
            
            video_base64 = base64.b64encode(video_data).decode()
            
            return JsonResponse({
                'success': True,
                'video': f'data:video/mp4;base64,{video_base64}',
                'filename': 'trimmed_video.mp4',
                'duration': end_time - start_time,
                'original_duration': video_clip.duration
            })
            
        finally:
            # Clean up temporary files
            if os.path.exists(temp_video_path):
                os.unlink(temp_video_path)
            if 'temp_output_path' in locals() and os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def change_video_speed(request):
    """Change video playback speed"""
    try:
        if not MOVIEPY_AVAILABLE:
            return JsonResponse({'error': 'MoviePy is not installed. Please install it to use this feature.'}, status=500)
        
        if 'video' not in request.FILES:
            return JsonResponse({'error': 'No video file provided'}, status=400)
        
        video_file = request.FILES['video']
        speed_factor = float(request.POST.get('speed_factor', 1.0))
        
        if speed_factor <= 0 or speed_factor > 4:
            return JsonResponse({'error': 'Speed factor must be between 0.1 and 4.0'}, status=400)
        
        # Save video file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
            for chunk in video_file.chunks():
                temp_video.write(chunk)
            temp_video_path = temp_video.name
        
        try:
            # Load video clip
            video_clip = VideoFileClip(temp_video_path)
            
            # Change speed
            if speed_factor != 1.0:
                sped_clip = video_clip.fx(lambda v: v.speedx(speed_factor))
            else:
                sped_clip = video_clip
            
            # Create temporary output file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_output:
                temp_output_path = temp_output.name
            
            # Write sped video
            sped_clip.write_videofile(temp_output_path, codec='libx264', audio_codec='aac')
            
            # Close clips
            sped_clip.close()
            video_clip.close()
            
            # Read output file and encode to base64
            with open(temp_output_path, 'rb') as f:
                video_data = f.read()
            
            video_base64 = base64.b64encode(video_data).decode()
            
            return JsonResponse({
                'success': True,
                'video': f'data:video/mp4;base64,{video_base64}',
                'filename': f'speed_{speed_factor}x_video.mp4',
                'speed_factor': speed_factor,
                'original_duration': video_clip.duration,
                'new_duration': video_clip.duration / speed_factor
            })
            
        finally:
            # Clean up temporary files
            if os.path.exists(temp_video_path):
                os.unlink(temp_video_path)
            if 'temp_output_path' in locals() and os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def extract_thumbnail(request):
    """Extract thumbnail from video"""
    try:
        if not MOVIEPY_AVAILABLE:
            return JsonResponse({'error': 'MoviePy is not installed. Please install it to use this feature.'}, status=500)
        
        if 'video' not in request.FILES:
            return JsonResponse({'error': 'No video file provided'}, status=400)
        
        video_file = request.FILES['video']
        timestamp = float(request.POST.get('timestamp', 1.0))
        
        # Save video file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
            for chunk in video_file.chunks():
                temp_video.write(chunk)
            temp_video_path = temp_video.name
        
        try:
            # Load video clip
            video_clip = VideoFileClip(temp_video_path)
            
            # Validate timestamp
            if timestamp < 0:
                timestamp = 0
            if timestamp > video_clip.duration:
                timestamp = video_clip.duration / 2
            
            # Extract frame at timestamp
            frame = video_clip.get_frame(timestamp)
            
            # Convert PIL Image to base64
            from PIL import Image
            img = Image.fromarray(frame)
            
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='PNG')
            img_buffer.seek(0)
            
            thumbnail_base64 = base64.b64encode(img_buffer.getvalue()).decode()
            
            return JsonResponse({
                'success': True,
                'thumbnail': f'data:image/png;base64,{thumbnail_base64}',
                'filename': 'thumbnail.png',
                'timestamp': timestamp,
                'video_duration': video_clip.duration
            })
            
        finally:
            # Clean up temporary files
            video_clip.close()
            if os.path.exists(temp_video_path):
                os.unlink(temp_video_path)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def change_resolution(request):
    """Change video resolution"""
    try:
        if not MOVIEPY_AVAILABLE:
            return JsonResponse({'error': 'MoviePy is not installed. Please install it to use this feature.'}, status=500)
        
        if 'video' not in request.FILES:
            return JsonResponse({'error': 'No video file provided'}, status=400)
        
        video_file = request.FILES['video']
        width = int(request.POST.get('width', 1280))
        height = int(request.POST.get('height', 720))
        
        # Save video file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
            for chunk in video_file.chunks():
                temp_video.write(chunk)
            temp_video_path = temp_video.name
        
        try:
            # Load video clip
            video_clip = VideoFileClip(temp_video_path)
            
            # Resize video
            resized_clip = video_clip.resize((width, height))
            
            # Create temporary output file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_output:
                temp_output_path = temp_output.name
            
            # Write resized video
            resized_clip.write_videofile(temp_output_path, codec='libx264', audio_codec='aac')
            
            # Close clips
            resized_clip.close()
            video_clip.close()
            
            # Read output file and encode to base64
            with open(temp_output_path, 'rb') as f:
                video_data = f.read()
            
            video_base64 = base64.b64encode(video_data).decode()
            
            return JsonResponse({
                'success': True,
                'video': f'data:video/mp4;base64,{video_base64}',
                'filename': f'{width}x{height}_video.mp4',
                'width': width,
                'height': height,
                'original_size': f"{video_clip.w}x{video_clip.h}"
            })
            
        finally:
            # Clean up temporary files
            if os.path.exists(temp_video_path):
                os.unlink(temp_video_path)
            if 'temp_output_path' in locals() and os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def download_video(request):
    """Download video from URL (YouTube, etc.)"""
    try:
        if not YTDLP_AVAILABLE:
            return JsonResponse({'error': 'yt-dlp is not installed. Please install it to use this feature.'}, status=500)
        
        url = request.POST.get('url', '')
        quality = request.POST.get('quality', 'best')
        
        if not url:
            return JsonResponse({'error': 'URL is required'}, status=400)
        
        # Configure yt-dlp options for actual download - avoid HLS completely
        ydl_opts = {
            'format': 'best[filesize<50M][height<=480]/best[height<=360]/worst',  # Small files, avoid HLS
            'outtmpl': tempfile.gettempdir() + '/%(title)s.%(ext)s',
            'noplaylist': True,
            'extractaudio': False,
            'writethumbnail': True,
            'writeinfojson': False,
            'fragment_retries': 3,  # Reduce retries to fail faster
            'retry_sleep': 2,
            'skip_unavailable_fragments': True,
            'ignoreerrors': True,
            'no_warnings': True,
            'extract_flat': False,  # Don't use flat extraction
            'hls_prefer_native': False,  # Don't use native HLS
            # Add user agent to avoid some restrictions
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }
        
        # Platform-specific optimizations
        if 'instagram.com' in url.lower():
            ydl_opts.update({
                'extract_flat': False,  # Don't use flat extraction for Instagram
                'no_check_certificate': True,  # Skip SSL certificate verification
                'socket_timeout': 30,  # Increase timeout for Instagram
            })
        elif 'facebook.com' in url.lower() or 'fb.watch' in url.lower():
            ydl_opts.update({
                'no_check_certificate': True,  # Skip SSL certificate verification
                'socket_timeout': 30,  # Increase timeout for Facebook
            })
        
        # Fallback formats that avoid HLS
        fallback_formats = [
            'worst[ext=mp4]',  # Worst quality MP4
            'best[protocol!=http_dash_segments][protocol!=hls]',  # Avoid DASH and HLS
            'worst',  # Absolute worst
        ]
        
        # Alternative configurations for Instagram
        instagram_alternatives = []
        if 'instagram.com' in url.lower():
            instagram_alternatives = [
                # Try without user agent (sometimes works better)
                {
                    'format': 'worst[ext=mp4]',
                    'http_headers': {},
                    'no_check_certificate': True,
                    'socket_timeout': 20,
                },
                # Try with mobile user agent
                {
                    'format': 'worst',
                    'http_headers': {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
                    },
                    'no_check_certificate': True,
                    'socket_timeout': 20,
                }
            ]
        
        download_success = False
        filename = None
        info = None
        
        # Try main configuration first
        configurations_to_try = [(ydl_opts, [ydl_opts['format']] + fallback_formats)]
        
        # Add Instagram-specific alternatives if needed
        if instagram_alternatives:
            for alt_config in instagram_alternatives:
                configurations_to_try.append((alt_config, [alt_config['format']]))
        
        for config_index, (current_config, formats) in enumerate(configurations_to_try):
            for i, format_selector in enumerate(formats):
                try:
                    print(f"Trying config {config_index + 1}, format: {format_selector}")
                    
                    # Update format selector for this attempt
                    current_config['format'] = format_selector
                    
                    with yt_dlp.YoutubeDL(current_config) as ydl:
                        # Extract video info first (only on first attempt of each config)
                        if i == 0:
                            info = ydl.extract_info(url, download=False)
                            
                            # Check if extraction failed
                            if not info:
                                raise Exception("Failed to extract video information. The video may be private, deleted, or region-restricted.")
                            
                            print(f"Available formats: {[f.get('format_id') + ':' + f.get('ext', 'unknown') for f in info.get('formats', [])[:10]]}")
                        else:
                            # For retries, use the same info
                            if not info:
                                raise Exception("No video information available for retry")
                            ydl._ies = {name: ie for name, ie in ydl._ies.items()}
                        
                        # Download the video
                        ydl.download([url])
                        
                        # Get the downloaded file path
                        filename = ydl.prepare_filename(info)
                        
                        if os.path.exists(filename):
                            file_size = os.path.getsize(filename)
                            print(f"Downloaded file size: {file_size} bytes")
                            if file_size > 1024:  # Valid file size
                                download_success = True
                                break
                            else:
                                # Clean up invalid file
                                os.unlink(filename)
                                filename = None
                                
                except Exception as e:
                    print(f"Config {config_index + 1}, Attempt {i+1} failed with format '{format_selector}': {str(e)}")
                    # If it's the first attempt and info extraction failed, don't retry other formats in this config
                    if i == 0 and 'Failed to extract video information' in str(e):
                        break
                    continue
            
            # If download succeeded, break out of config loop
            if download_success:
                break
        
        if not download_success or not filename:
            # For Instagram, try to at least get video info even if download fails
            if 'instagram.com' in url.lower() and not info:
                try:
                    # One last attempt to get info without downloading
                    info_opts = {
                        'quiet': True,
                        'no_warnings': True,
                        'extract_flat': False,
                        'no_check_certificate': True,
                        'socket_timeout': 15,
                        'http_headers': {
                            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
                        }
                    }
                    
                    with yt_dlp.YoutubeDL(info_opts) as ydl:
                        info = ydl.extract_info(url, download=False)
                        print(f"Info extraction succeeded: {info.get('title', 'Unknown') if info else 'Failed'}")
                        
                        if info:
                            return JsonResponse({
                                'success': True,
                                'video': None,  # No video file due to restrictions
                                'filename': None,
                                'info': {
                                    'title': info.get('title', 'Unknown'),
                                    'duration': info.get('duration', 0),
                                    'uploader': info.get('uploader', 'Unknown'),
                                    'view_count': info.get('view_count', 0),
                                    'thumbnail': info.get('thumbnail', ''),
                                    'file_size': 0,
                                    'download_blocked': True,
                                    'block_reason': 'Instagram age restriction or privacy setting'
                                },
                                'message': 'Video information retrieved but download blocked due to Instagram restrictions.'
                            })
                except Exception as e:
                    print(f"Final info extraction failed: {str(e)}")
            
            # Provide more specific error messages based on platform
            error_msg = 'Unable to download this video'
            if 'instagram.com' in url.lower():
                error_msg = 'Unable to download this Instagram content. Instagram has strict restrictions on downloading content. This reel may be age-restricted, private, or from a private account. Suggestions:\n1. Try a public Instagram reel from a public account\n2. Try copying the reel URL from a different browser\n3. Try a different Instagram reel\n4. For some content, Instagram simply blocks all downloads due to their policies.'
            elif 'facebook.com' in url.lower() or 'fb.watch' in url.lower():
                error_msg = 'Unable to download this Facebook video. This may be due to privacy settings or the video being unavailable. Try a public Facebook video.'
            elif 'youtube.com' in url.lower() or 'youtu.be' in url.lower():
                error_msg = 'Unable to download this YouTube video due to restrictions. Please try an older video or a video from a different platform.'
            
            return JsonResponse({'error': error_msg}, status=500)
        
        try:
            # Read the downloaded video file
            with open(filename, 'rb') as f:
                video_data = f.read()
            
            # Get file extension
            file_ext = info.get('ext', 'mp4')
            
            # Handle thumbnail
            thumbnail_base64 = None
            thumbnail_url = info.get('thumbnail', '')
            
            # Try to get downloaded thumbnail file
            thumbnail_filename = None
            if thumbnail_url:
                # Try to find the downloaded thumbnail file
                import glob
                thumbnail_pattern = tempfile.gettempdir() + f'/{info.get("title", "video")}*.{info.get("thumbnail_ext", "jpg")}'
                thumbnail_files = glob.glob(thumbnail_pattern)
                
                if not thumbnail_files:
                    # Try other common thumbnail extensions
                    for ext in ['jpg', 'jpeg', 'png', 'webp']:
                        thumbnail_pattern = tempfile.gettempdir() + f'/{info.get("title", "video")}*.{ext}'
                        thumbnail_files = glob.glob(thumbnail_pattern)
                        if thumbnail_files:
                            break
                
                if thumbnail_files:
                    thumbnail_filename = thumbnail_files[0]
            
            # If thumbnail file exists, read and encode it
            if thumbnail_filename and os.path.exists(thumbnail_filename):
                try:
                    with open(thumbnail_filename, 'rb') as f:
                        thumbnail_data = f.read()
                    thumbnail_base64 = base64.b64encode(thumbnail_data).decode()
                    
                    # Determine MIME type
                    if thumbnail_filename.lower().endswith('.png'):
                        thumbnail_mime = 'image/png'
                    elif thumbnail_filename.lower().endswith('.webp'):
                        thumbnail_mime = 'image/webp'
                    else:
                        thumbnail_mime = 'image/jpeg'
                    
                    thumbnail_url = f'data:{thumbnail_mime};base64,{thumbnail_base64}'
                    
                    # Clean up thumbnail file
                    os.unlink(thumbnail_filename)
                except Exception as e:
                    print(f"Error processing thumbnail: {e}")
                    thumbnail_url = info.get('thumbnail', '')
            
            # Encode video to base64
            video_base64 = base64.b64encode(video_data).decode()
            
            return JsonResponse({
                'success': True,
                'video': f'data:video/{file_ext};base64,{video_base64}',
                'filename': f"{info.get('title', 'video')}.{file_ext}",
                'info': {
                    'title': info.get('title', 'Unknown'),
                    'duration': info.get('duration', 0),
                    'uploader': info.get('uploader', 'Unknown'),
                    'view_count': info.get('view_count', 0),
                    'thumbnail': thumbnail_url,
                    'file_size': len(video_data)
                }
            })
            
        finally:
            # Clean up the downloaded video file
            if filename and os.path.exists(filename):
                os.unlink(filename)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
