#!/bin/bash

# Detect OS and activate appropriate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash)
    source .venv/Scripts/activate
else
    # Mac/Linux
    source .venv/bin/activate
fi

# Function to clean up processes
cleanup() {
    echo "Shutting down servers..."
    if [ ! -z "$HTTP_PID" ] && kill -0 $HTTP_PID 2>/dev/null; then
        kill -TERM $HTTP_PID
        wait $HTTP_PID 2>/dev/null
    fi
    if [ ! -z "$FLASK_PID" ] && kill -0 $FLASK_PID 2>/dev/null; then
        kill -TERM $FLASK_PID
        wait $FLASK_PID 2>/dev/null
    fi
    echo "Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start the Python HTTP server from root directory
python -m http.server 9000 &
HTTP_PID=$!

# Change to app directory and start Flask app
cd My_Collection
python ./app.py &
FLASK_PID=$!

echo "HTTP server running on port 9000 (PID: $HTTP_PID)"
echo "Flask app running on port 8080 (PID: $FLASK_PID)"
echo "Press Ctrl+C to stop both servers"

# Wait for processes
wait