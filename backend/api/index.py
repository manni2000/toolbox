#!/usr/bin/env python
import os
import sys
import json

def handler(request):
    """Vercel serverless function handler for Django."""
    # Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'toolbox.settings')
    
    # Add backend to Python path
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    
    # Setup Django
    import django
    django.setup()
    
    # Create Django WSGI application
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
    
    # Get request data
    method = request.method
    path = request.path
    query_string = request.url.split('?', 1)[1] if '?' in request.url else ''
    headers = dict(request.headers)
    body = request.body if hasattr(request, 'body') else b''
    
    # Convert Vercel request to WSGI format
    environ = {
        'REQUEST_METHOD': method,
        'PATH_INFO': path,
        'QUERY_STRING': query_string,
        'CONTENT_TYPE': headers.get('content-type', ''),
        'CONTENT_LENGTH': str(len(body) if body else 0),
        'SERVER_NAME': 'vercel.app',
        'SERVER_PORT': '443',
        'wsgi.url_scheme': 'https',
        'wsgi.input': type('MockInput', (), {'read': lambda: body})(),
        'wsgi.errors': sys.stderr,
        'wsgi.version': (1, 0),
        'wsgi.multithread': False,
        'wsgi.multiprocess': False,
        'wsgi.run_once': False,
    }
    
    # Add headers
    for key, value in headers.items():
        environ[f'HTTP_{key.upper().replace("-", "_")}'] = value
    
    # Collect response
    response_data = {}
    
    def start_response(status, response_headers):
        response_data['status'] = status
        response_data['headers'] = response_headers
    
    # Get response from Django
    response_body = application(environ, start_response)
    
    # Convert response body to string
    body_content = b''.join(response_body)
    
    # Return Vercel response
    return {
        'statusCode': int(response_data['status'].split()[0]),
        'headers': dict(response_data['headers']),
        'body': body_content.decode('utf-8')
    }
