import os
import io
import base64
import tempfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings

# Audio processing imports
try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except ImportError:
    PYDUB_AVAILABLE = False

try:
    import speech_recognition as sr
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    SPEECH_RECOGNITION_AVAILABLE = False


@csrf_exempt
@require_http_methods(["POST"])
def convert_audio(request):
    """Convert audio to different format"""
    try:
        if not PYDUB_AVAILABLE:
            return JsonResponse({'error': 'pydub is not installed. Please install it to use this feature.'}, status=500)
        
        if 'audio' not in request.FILES:
            return JsonResponse({'error': 'No audio file provided'}, status=400)
        
        audio_file = request.FILES['audio']
        target_format = request.POST.get('format', 'mp3').lower()
        
        if target_format not in ['mp3', 'wav', 'aac', 'ogg', 'flac']:
            return JsonResponse({'error': 'Unsupported format. Use mp3, wav, aac, ogg, or flac'}, status=400)
        
        # Save audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            for chunk in audio_file.chunks():
                temp_audio.write(chunk)
            temp_audio_path = temp_audio.name
        
        try:
            # Load audio file
            audio = AudioSegment.from_file(temp_audio_path)
            
            # Create temporary output file
            with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{target_format}') as temp_output:
                temp_output_path = temp_output.name
            
            # Export in target format
            if target_format == 'mp3':
                audio.export(temp_output_path, format='mp3', bitrate='192k')
            elif target_format == 'wav':
                audio.export(temp_output_path, format='wav')
            elif target_format == 'aac':
                audio.export(temp_output_path, format='aac')
            elif target_format == 'ogg':
                audio.export(temp_output_path, format='ogg')
            elif target_format == 'flac':
                audio.export(temp_output_path, format='flac')
            
            # Read output file and encode to base64
            with open(temp_output_path, 'rb') as f:
                audio_data = f.read()
            
            audio_base64 = base64.b64encode(audio_data).decode()
            
            # Determine MIME type
            mime_types = {
                'mp3': 'audio/mpeg',
                'wav': 'audio/wav',
                'aac': 'audio/aac',
                'ogg': 'audio/ogg',
                'flac': 'audio/flac'
            }
            mime_type = mime_types.get(target_format, 'audio/mpeg')
            
            return JsonResponse({
                'success': True,
                'audio': f'data:{mime_type};base64,{audio_base64}',
                'filename': f'converted.{target_format}',
                'duration': len(audio) / 1000.0,  # Duration in seconds
                'original_format': audio_file.name.split('.')[-1] if '.' in audio_file.name else 'unknown'
            })
            
        finally:
            # Clean up temporary files
            if os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
            if 'temp_output_path' in locals() and os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def trim_audio(request):
    """Trim audio to specified duration"""
    try:
        if not PYDUB_AVAILABLE:
            return JsonResponse({'error': 'pydub is not installed. Please install it to use this feature.'}, status=500)
        
        if 'audio' not in request.FILES:
            return JsonResponse({'error': 'No audio file provided'}, status=400)
        
        audio_file = request.FILES['audio']
        start_time = float(request.POST.get('start_time', 0)) * 1000  # Convert to milliseconds
        end_time = float(request.POST.get('end_time', 10)) * 1000  # Convert to milliseconds
        
        # Save audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            for chunk in audio_file.chunks():
                temp_audio.write(chunk)
            temp_audio_path = temp_audio.name
        
        try:
            # Load audio file
            audio = AudioSegment.from_file(temp_audio_path)
            
            # Validate time range
            if start_time < 0:
                start_time = 0
            if end_time > len(audio):
                end_time = len(audio)
            if start_time >= end_time:
                return JsonResponse({'error': 'Invalid time range. Start time must be less than end time.'}, status=400)
            
            # Trim audio
            trimmed_audio = audio[start_time:end_time]
            
            # Create temporary output file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_output:
                temp_output_path = temp_output.name
            
            # Export trimmed audio
            trimmed_audio.export(temp_output_path, format='mp3')
            
            # Read output file and encode to base64
            with open(temp_output_path, 'rb') as f:
                audio_data = f.read()
            
            audio_base64 = base64.b64encode(audio_data).decode()
            
            return JsonResponse({
                'success': True,
                'audio': f'data:audio/mpeg;base64,{audio_base64}',
                'filename': 'trimmed_audio.mp3',
                'duration': (end_time - start_time) / 1000.0,  # Duration in seconds
                'original_duration': len(audio) / 1000.0
            })
            
        finally:
            # Clean up temporary files
            if os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
            if 'temp_output_path' in locals() and os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def merge_audio(request):
    """Merge multiple audio files"""
    try:
        if not PYDUB_AVAILABLE:
            return JsonResponse({'error': 'pydub is not installed. Please install it to use this feature.'}, status=500)
        
        files = request.FILES.getlist('audios')
        if len(files) < 2:
            return JsonResponse({'error': 'At least 2 audio files are required'}, status=400)
        
        # Save audio files temporarily and load them
        audio_segments = []
        temp_files = []
        
        try:
            for audio_file in files:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
                    for chunk in audio_file.chunks():
                        temp_audio.write(chunk)
                    temp_audio_path = temp_audio.name
                    temp_files.append(temp_audio_path)
                
                # Load audio file
                audio = AudioSegment.from_file(temp_audio_path)
                audio_segments.append(audio)
            
            # Merge all audio segments
            merged_audio = audio_segments[0]
            for segment in audio_segments[1:]:
                merged_audio += segment
            
            # Create temporary output file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_output:
                temp_output_path = temp_output.name
            
            # Export merged audio
            merged_audio.export(temp_output_path, format='mp3')
            
            # Read output file and encode to base64
            with open(temp_output_path, 'rb') as f:
                audio_data = f.read()
            
            audio_base64 = base64.b64encode(audio_data).decode()
            
            return JsonResponse({
                'success': True,
                'audio': f'data:audio/mpeg;base64,{audio_base64}',
                'filename': 'merged_audio.mp3',
                'duration': len(merged_audio) / 1000.0,  # Duration in seconds
                'files_merged': len(files)
            })
            
        finally:
            # Clean up temporary files
            for temp_file in temp_files:
                if os.path.exists(temp_file):
                    os.unlink(temp_file)
            if 'temp_output_path' in locals() and os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def change_audio_speed(request):
    """Change audio playback speed"""
    try:
        if not PYDUB_AVAILABLE:
            return JsonResponse({'error': 'pydub is not installed. Please install it to use this feature.'}, status=500)
        
        if 'audio' not in request.FILES:
            return JsonResponse({'error': 'No audio file provided'}, status=400)
        
        audio_file = request.FILES['audio']
        speed_factor = float(request.POST.get('speed_factor', 1.0))
        
        if speed_factor <= 0 or speed_factor > 4:
            return JsonResponse({'error': 'Speed factor must be between 0.1 and 4.0'}, status=400)
        
        # Save audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            for chunk in audio_file.chunks():
                temp_audio.write(chunk)
            temp_audio_path = temp_audio.name
        
        try:
            # Load audio file
            audio = AudioSegment.from_file(temp_audio_path)
            
            # Change speed (affects pitch)
            if speed_factor != 1.0:
                # Manually change the frame rate to change speed
                sped_audio = audio._spawn(audio.raw_data, overrides={
                    "frame_rate": int(audio.frame_rate * speed_factor)
                }).set_frame_rate(audio.frame_rate)
            else:
                sped_audio = audio
            
            # Create temporary output file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_output:
                temp_output_path = temp_output.name
            
            # Export sped audio
            sped_audio.export(temp_output_path, format='mp3')
            
            # Read output file and encode to base64
            with open(temp_output_path, 'rb') as f:
                audio_data = f.read()
            
            audio_base64 = base64.b64encode(audio_data).decode()
            
            return JsonResponse({
                'success': True,
                'audio': f'data:audio/mpeg;base64,{audio_base64}',
                'filename': f'speed_{speed_factor}x_audio.mp3',
                'speed_factor': speed_factor,
                'original_duration': len(audio) / 1000.0,
                'new_duration': len(sped_audio) / 1000.0
            })
            
        finally:
            # Clean up temporary files
            if os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
            if 'temp_output_path' in locals() and os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def speech_to_text(request):
    """Convert speech to text"""
    try:
        if not SPEECH_RECOGNITION_AVAILABLE:
            return JsonResponse({'error': 'speech_recognition is not installed. Please install it to use this feature.'}, status=500)
        
        if 'audio' not in request.FILES:
            return JsonResponse({'error': 'No audio file provided'}, status=400)
        
        audio_file = request.FILES['audio']
        language = request.POST.get('language', 'en-US')
        
        # Save audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            for chunk in audio_file.chunks():
                temp_audio.write(chunk)
            temp_audio_path = temp_audio.name
        
        try:
            # Initialize recognizer
            r = sr.Recognizer()
            
            # Load audio file
            with sr.AudioFile(temp_audio_path) as source:
                audio_data = r.record(source)
            
            # Recognize speech
            try:
                text = r.recognize_google(audio_data, language=language)
                return JsonResponse({
                    'success': True,
                    'text': text,
                    'language': language,
                    'confidence': 1.0  # Google API doesn't provide confidence in basic mode
                })
            except sr.UnknownValueError:
                return JsonResponse({'error': 'Could not understand the audio'}, status=400)
            except sr.RequestError as e:
                return JsonResponse({'error': f'Speech recognition service error: {str(e)}'}, status=500)
            
        finally:
            # Clean up temporary files
            if os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
