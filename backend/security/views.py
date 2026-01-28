from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import hashlib
import re
import json
import base64
from PIL import Image
from PIL.ExifTags import TAGS
import io
import requests
from cryptography.fernet import Fernet
import secrets
import uuid
import string

@api_view(['POST'])
def generate_password(request):
    """Generate a secure random password"""
    length = int(request.data.get('length', 12))
    include_uppercase = request.data.get('include_uppercase', True)
    include_lowercase = request.data.get('include_lowercase', True)
    include_numbers = request.data.get('include_numbers', True)
    include_symbols = request.data.get('include_symbols', True)
    
    characters = ''
    if include_lowercase:
        characters += string.ascii_lowercase
    if include_uppercase:
        characters += string.ascii_uppercase
    if include_numbers:
        characters += string.digits
    if include_symbols:
        characters += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    if not characters:
        return Response({'error': 'At least one character type must be selected'}, status=400)
    
    password = ''.join(secrets.choice(characters) for _ in range(length))
    
    return Response({
        'password': password,
        'length': length,
        'strength': 'Strong' if length >= 12 else 'Medium' if length >= 8 else 'Weak'
    })

@api_view(['POST'])
def check_password_strength(request):
    """Check password strength"""
    password = request.data.get('password', '')
    
    if not password:
        return Response({'error': 'Password is required'}, status=400)
    
    score = 0
    feedback = []
    
    # Length check
    if len(password) >= 12:
        score += 2
        feedback.append("✅ Excellent length (12+ characters)")
    elif len(password) >= 8:
        score += 1
        feedback.append("⚠️ Good length (8-11 characters), consider 12+")
    else:
        feedback.append("❌ Too short (less than 8 characters)")
    
    # Character variety checks
    if re.search(r'[a-z]', password):
        score += 1
        feedback.append("✅ Contains lowercase letters")
    else:
        feedback.append("❌ Missing lowercase letters")
    
    if re.search(r'[A-Z]', password):
        score += 1
        feedback.append("✅ Contains uppercase letters")
    else:
        feedback.append("❌ Missing uppercase letters")
    
    if re.search(r'\d', password):
        score += 1
        feedback.append("✅ Contains numbers")
    else:
        feedback.append("❌ Missing numbers")
    
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 1
        feedback.append("✅ Contains special characters")
    else:
        feedback.append("❌ Missing special characters")
    
    # Determine strength
    if score >= 6:
        strength = "Very Strong"
        color = "green"
    elif score >= 4:
        strength = "Strong"
        color = "blue"
    elif score >= 2:
        strength = "Weak"
        color = "orange"
    else:
        strength = "Very Weak"
        color = "red"
    
    return Response({
        'strength': strength,
        'score': score,
        'color': color,
        'feedback': feedback
    })

@api_view(['POST'])
def generate_hash(request):
    """Generate hash of input text"""
    text = request.data.get('text', '')
    algorithm = request.data.get('algorithm', 'sha256')
    
    if not text:
        return Response({'error': 'Text is required'}, status=400)
    
    if algorithm not in ['md5', 'sha1', 'sha256', 'sha512']:
        return Response({'error': 'Invalid algorithm. Use md5, sha1, sha256, or sha512'}, status=400)
    
    hash_func = getattr(hashlib, algorithm)()
    hash_func.update(text.encode())
    
    return Response({
        'original_text': text,
        'algorithm': algorithm,
        'hash': hash_func.hexdigest()
    })

@api_view(['POST'])
def base64_encode(request):
    """Encode text to base64"""
    text = request.data.get('text', '')
    
    if not text:
        return Response({'error': 'Text is required'}, status=400)
    
    encoded = base64.b64encode(text.encode()).decode()
    
    return Response({
        'original_text': text,
        'encoded_text': encoded
    })

@api_view(['POST'])
def base64_decode(request):
    """Decode base64 text"""
    encoded_text = request.data.get('encoded_text', '')
    
    if not encoded_text:
        return Response({'error': 'Encoded text is required'}, status=400)
    
    try:
        decoded = base64.b64decode(encoded_text).decode()
        return Response({
            'encoded_text': encoded_text,
            'decoded_text': decoded
        })
    except Exception as e:
        return Response({'error': f'Decoding failed: {str(e)}'}, status=400)

@api_view(['POST'])
def generate_uuid(request):
    """Generate UUID"""
    uuid_type = request.data.get('type', 'uuid4')
    
    if uuid_type == 'uuid1':
        generated_uuid = str(uuid.uuid1())
    elif uuid_type == 'uuid3':
        namespace = request.data.get('namespace', str(uuid.NAMESPACE_DNS))
        name = request.data.get('name', 'default')
        generated_uuid = str(uuid.uuid3(uuid.UUID(namespace), name))
    elif uuid_type == 'uuid4':
        generated_uuid = str(uuid.uuid4())
    elif uuid_type == 'uuid5':
        namespace = request.data.get('namespace', str(uuid.NAMESPACE_DNS))
        name = request.data.get('name', 'default')
        generated_uuid = str(uuid.uuid5(uuid.UUID(namespace), name))
    else:
        return Response({'error': 'Invalid UUID type. Use uuid1, uuid3, uuid4, or uuid5'}, status=400)
    
    return Response({
        'uuid': generated_uuid,
        'type': uuid_type
    })

@api_view(['POST'])
def password_strength_explainer(request):
    """Analyze password strength and provide detailed explanation"""
    password = request.data.get('password', '')
    
    if not password:
        return Response({'error': 'Password is required'}, status=400)
    
    score = 0
    feedback = []
    
    # Length check
    if len(password) >= 12:
        score += 2
        feedback.append("✅ Excellent length (12+ characters)")
    elif len(password) >= 8:
        score += 1
        feedback.append("⚠️ Good length (8-11 characters), consider 12+")
    else:
        feedback.append("❌ Too short (less than 8 characters)")
    
    # Character variety checks
    if re.search(r'[a-z]', password):
        score += 1
        feedback.append("✅ Contains lowercase letters")
    else:
        feedback.append("❌ Missing lowercase letters")
    
    if re.search(r'[A-Z]', password):
        score += 1
        feedback.append("✅ Contains uppercase letters")
    else:
        feedback.append("❌ Missing uppercase letters")
    
    if re.search(r'\d', password):
        score += 1
        feedback.append("✅ Contains numbers")
    else:
        feedback.append("❌ Missing numbers")
    
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 1
        feedback.append("✅ Contains special characters")
    else:
        feedback.append("❌ Missing special characters")
    
    # Common patterns check
    common_patterns = ['123456', 'password', 'qwerty', 'abc123', 'admin']
    if any(pattern in password.lower() for pattern in common_patterns):
        score -= 2
        feedback.append("❌ Contains common patterns")
    
    # Determine strength
    if score >= 6:
        strength = "Very Strong"
        color = "green"
    elif score >= 4:
        strength = "Strong"
        color = "blue"
    elif score >= 2:
        strength = "Weak"
        color = "orange"
    else:
        strength = "Very Weak"
        color = "red"
    
    return Response({
        'strength': strength,
        'score': score,
        'color': color,
        'feedback': feedback,
        'suggestions': [
            "Use at least 12 characters",
            "Mix uppercase, lowercase, numbers, and symbols",
            "Avoid common words and patterns",
            "Use unique passwords for each account"
        ]
    })

@api_view(['POST'])
def data_breach_check(request):
    """Check if email appears in known data breaches (simulated)"""
    email = request.data.get('email', '')
    
    if not email or '@' not in email:
        return Response({'error': 'Valid email is required'}, status=400)
    
    # Simulated breach check (in real implementation, use HaveIBeenPwned API)
    simulated_breaches = [
        {"name": "LinkedIn", "date": "2021", "data_type": "Email, Password"},
        {"name": "Adobe", "date": "2013", "data_type": "Email, Password, Credit Card"},
        {"name": "Dropbox", "date": "2012", "data_type": "Email, Password"}
    ]
    
    # Simulate random breach detection for demo
    import random
    detected_breaches = random.sample(simulated_breaches, random.randint(0, 2))
    
    return Response({
        'email': email,
        'breaches_found': len(detected_breaches),
        'breaches': detected_breaches,
        'recommendations': [
            "Change your password immediately",
            "Enable two-factor authentication",
            "Use unique passwords for each account",
            "Monitor your accounts for suspicious activity"
        ]
    })

@api_view(['POST'])
def file_hash_comparison(request):
    """Compare hashes of two files"""
    try:
        file1 = request.FILES.get('file1')
        file2 = request.FILES.get('file2')
        
        if not file1 or not file2:
            return Response({'error': 'Both files are required'}, status=400)
        
        # Calculate hashes
        def calculate_hash(file_obj, algorithm='sha256'):
            hash_func = getattr(hashlib, algorithm)()
            for chunk in file_obj.chunks():
                hash_func.update(chunk)
            return hash_func.hexdigest()
        
        file1_hash = calculate_hash(file1)
        file2_hash = calculate_hash(file2)
        
        # Calculate MD5 for additional verification
        file1_md5 = calculate_hash(file1, 'md5')
        file2_md5 = calculate_hash(file2, 'md5')
        
        return Response({
            'files_match': file1_hash == file2_hash,
            'file1': {
                'sha256': file1_hash,
                'md5': file1_md5,
                'size': file1.size
            },
            'file2': {
                'sha256': file2_hash,
                'md5': file2_md5,
                'size': file2.size
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def exif_location_remover(request):
    """Remove GPS location data from image"""
    try:
        image_file = request.FILES.get('image')
        
        if not image_file:
            return Response({'error': 'Image file is required'}, status=400)
        
        # Open image
        image = Image.open(image_file)
        
        # Get original EXIF data
        original_exif = image._getexif() or {}
        
        # Check for GPS data
        gps_info = original_exif.get(34853)  # GPSInfo tag
        
        # Create new EXIF data without GPS
        new_exif = {}
        for tag_id, value in original_exif.items():
            if tag_id != 34853:  # Remove GPSInfo tag
                new_exif[tag_id] = value
        
        # Save image without GPS data
        output = io.BytesIO()
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        image.save(output, format='JPEG', quality=95)
        output.seek(0)
        
        # Encode to base64 for response
        image_base64 = base64.b64encode(output.getvalue()).decode()
        
        return Response({
            'success': True,
            'had_gps_data': gps_info is not None,
            'image_data': f"data:image/jpeg;base64,{image_base64}",
            'message': 'GPS location data removed successfully' if gps_info else 'No GPS data found in image'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def text_redaction(request):
    """Redact sensitive information from text"""
    text = request.data.get('text', '')
    redaction_types = request.data.get('types', ['email', 'phone', 'ssn', 'credit_card'])
    
    if not text:
        return Response({'error': 'Text is required'}, status=400)
    
    redacted_text = text
    found_items = []
    
    # Email redaction
    if 'email' in redaction_types:
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, redacted_text)
        found_items.extend([{'type': 'email', 'value': email} for email in emails])
        redacted_text = re.sub(email_pattern, '[EMAIL REDACTED]', redacted_text)
    
    # Phone redaction
    if 'phone' in redaction_types:
        phone_pattern = r'\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b'
        phones = re.findall(phone_pattern, redacted_text)
        found_items.extend([{'type': 'phone', 'value': f"({phone[0]}) {phone[1]}-{phone[2]}"} for phone in phones])
        redacted_text = re.sub(phone_pattern, '[PHONE REDACTED]', redacted_text)
    
    # SSN redaction
    if 'ssn' in redaction_types:
        ssn_pattern = r'\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b'
        ssns = re.findall(ssn_pattern, redacted_text)
        found_items.extend([{'type': 'ssn', 'value': ssn} for ssn in ssns])
        redacted_text = re.sub(ssn_pattern, '[SSN REDACTED]', redacted_text)
    
    # Credit card redaction
    if 'credit_card' in redaction_types:
        cc_pattern = r'\b(?:\d{4}[-.\s]?){3}\d{4}\b'
        ccs = re.findall(cc_pattern, redacted_text)
        found_items.extend([{'type': 'credit_card', 'value': '****-****-****-' + cc[-4:]} for cc in ccs])
        redacted_text = re.sub(cc_pattern, '[CREDIT CARD REDACTED]', redacted_text)
    
    return Response({
        'original_text': text,
        'redacted_text': redacted_text,
        'items_found': len(found_items),
        'redacted_items': found_items
    })

@api_view(['POST'])
def qr_phishing_scanner(request):
    """Analyze QR code for potential phishing"""
    qr_data = request.data.get('qr_data', '')
    
    if not qr_data:
        return Response({'error': 'QR data is required'}, status=400)
    
    risk_score = 0
    warnings = []
    
    # Check for suspicious patterns
    if qr_data.startswith('http://'):
        risk_score += 2
        warnings.append("Uses HTTP instead of HTTPS")
    
    # Check for URL shorteners
    shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly']
    if any(shortener in qr_data.lower() for shortener in shorteners):
        risk_score += 3
        warnings.append("Uses URL shortener (common in phishing)")
    
    # Check for suspicious domains
    suspicious_patterns = ['secure', 'verify', 'account', 'login', 'update', 'confirm']
    if any(pattern in qr_data.lower() for pattern in suspicious_patterns):
        risk_score += 2
        warnings.append("Contains suspicious keywords")
    
    # Check for IP addresses
    ip_pattern = r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b'
    if re.search(ip_pattern, qr_data):
        risk_score += 4
        warnings.append("Contains IP address instead of domain")
    
    # Determine risk level
    if risk_score >= 6:
        risk_level = "High Risk"
        color = "red"
    elif risk_score >= 3:
        risk_level = "Medium Risk"
        color = "orange"
    else:
        risk_level = "Low Risk"
        color = "green"
    
    return Response({
        'qr_data': qr_data,
        'risk_level': risk_level,
        'risk_score': risk_score,
        'color': color,
        'warnings': warnings,
        'recommendations': [
            "Verify the destination before scanning",
            "Use a QR scanner with preview capability",
            "Be cautious of unexpected QR codes",
            "Check the URL carefully after scanning"
        ]
    })

@api_view(['POST'])
def secure_notes_tool(request):
    """Encrypt and decrypt secure notes"""
    action = request.data.get('action', '')  # 'encrypt' or 'decrypt'
    note_text = request.data.get('note', '')
    password = request.data.get('password', '')
    
    if not action or not note_text:
        return Response({'error': 'Action and note are required'}, status=400)
    
    if action == 'encrypt':
        if not password:
            return Response({'error': 'Password is required for encryption'}, status=400)
        
        try:
            # Generate key from password
            key = base64.urlsafe_b64encode(hashlib.sha256(password.encode()).digest())
            f = Fernet(key)
            
            # Encrypt the note
            encrypted_note = f.encrypt(note_text.encode()).decode()
            
            return Response({
                'encrypted_note': encrypted_note,
                'message': 'Note encrypted successfully'
            })
            
        except Exception as e:
            return Response({'error': f'Encryption failed: {str(e)}'}, status=500)
    
    elif action == 'decrypt':
        if not password:
            return Response({'error': 'Password is required for decryption'}, status=400)
        
        try:
            # Generate key from password
            key = base64.urlsafe_b64encode(hashlib.sha256(password.encode()).digest())
            f = Fernet(key)
            
            # Decrypt the note
            decrypted_note = f.decrypt(note_text.encode()).decode()
            
            return Response({
                'decrypted_note': decrypted_note,
                'message': 'Note decrypted successfully'
            })
            
        except Exception as e:
            return Response({'error': 'Decryption failed - incorrect password or invalid data'}, status=500)
    
    else:
        return Response({'error': 'Invalid action. Use encrypt or decrypt'}, status=400)

@api_view(['POST'])
def url_reputation_checker(request):
    """Check URL reputation (simulated)"""
    url = request.data.get('url', '')
    
    if not url:
        return Response({'error': 'URL is required'}, status=400)
    
    # Simulated reputation check
    risk_score = 0
    factors = []
    
    # Check HTTP vs HTTPS
    if url.startswith('http://'):
        risk_score += 2
        factors.append("Uses HTTP instead of HTTPS")
    
    # Check for suspicious patterns
    suspicious_patterns = ['secure', 'verify', 'account', 'login', 'update']
    if any(pattern in url.lower() for pattern in suspicious_patterns):
        risk_score += 1
        factors.append("Contains suspicious keywords")
    
    # Check domain age (simulated)
    import random
    domain_age_days = random.randint(30, 3650)
    if domain_age_days < 90:
        risk_score += 2
        factors.append(f"Domain is only {domain_age_days} days old")
    
    # Check for IP address
    ip_pattern = r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b'
    if re.search(ip_pattern, url):
        risk_score += 3
        factors.append("Uses IP address instead of domain")
    
    # Determine reputation
    if risk_score >= 5:
        reputation = "Dangerous"
        color = "red"
    elif risk_score >= 3:
        reputation = "Suspicious"
        color = "orange"
    else:
        reputation = "Safe"
        color = "green"
    
    return Response({
        'url': url,
        'reputation': reputation,
        'risk_score': risk_score,
        'color': color,
        'factors': factors,
        'domain_age_days': domain_age_days,
        'recommendations': [
            "Use HTTPS websites whenever possible",
            "Be cautious of newly created domains",
            "Verify website legitimacy before entering data",
            "Use browser security tools and extensions"
        ]
    })
