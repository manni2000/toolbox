#!/usr/bin/env python
import os
import sys

def handler(request):
    """Vercel serverless function handler for Django."""
    # Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'toolbox.settings')
    
    # Add backend to Python path
    sys.path.insert(0, os.path.dirname(__file__))
    
    # Setup Django
    import django
    django.setup()
    
    # Create Django WSGI application
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
    
    # Convert Vercel request to WSGI format
    environ = {
        'REQUEST_METHOD': request.method,
        'PATH_INFO': request.path,
        'QUERY_STRING': request.url.split('?', 1)[1] if '?' in request.url else '',
        'CONTENT_TYPE': request.headers.get('content-type', ''),
        'CONTENT_LENGTH': request.headers.get('content-length', '0'),
        'SERVER_NAME': 'vercel.app',
        'SERVER_PORT': '443',
        'wsgi.url_scheme': 'https',
        'wsgi.input': request.body,
        'wsgi.errors': sys.stderr,
        'wsgi.version': (1, 0),
        'wsgi.multithread': False,
        'wsgi.multiprocess': False,
        'wsgi.run_once': False,
    }
    
    # Add headers
    for key, value in request.headers.items():
        environ[f'HTTP_{key.upper().replace("-", "_")}'] = value
    
    # Collect response
    response_data = {}
    
    def start_response(status, headers):
        response_data['status'] = status
        response_data['headers'] = headers
    
    # Get response from Django
    response_body = application(environ, start_response)
    
    # Return Vercel response
    return {
        'statusCode': int(response_data['status'].split()[0]),
        'headers': dict(response_data['headers']),
        'body': b''.join(response_body).decode('utf-8')
    }
