#!/usr/bin/env python
import os
import sys

def handler(request):
    """Simple test handler to verify Vercel deployment."""
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': '{"message": "Backend is running!", "path": "' + request.path + '"}'
    }
