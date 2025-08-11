#!/bin/sh

# Health check script for Docker container
# Checks if nginx is running and responding to requests

# Check if nginx process is running
if ! pgrep nginx > /dev/null; then
    echo "nginx process not found"
    exit 1
fi

# Check if nginx is responding on port 80
if ! nc -z localhost 80; then
    echo "nginx not responding on port 80"
    exit 1
fi

# Check if the health endpoint returns 200
if [ "$(wget -q -O - --timeout=5 http://localhost/health)" != "healthy" ]; then
    echo "health endpoint not responding correctly"
    exit 1
fi

echo "health check passed"
exit 0