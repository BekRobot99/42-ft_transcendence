#!/bin/bash

# Render.com startup script for ft_transcendence
echo "🚀 Starting ft_transcendence on Render.com..."

# Install docker-compose if needed
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing docker-compose..."
    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Start the services
echo "🎯 Starting services..."
PORT=${PORT:-8080} docker-compose up --build

echo "✅ ft_transcendence is running on port $PORT!"
