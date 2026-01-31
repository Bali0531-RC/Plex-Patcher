#!/bin/bash

# Plexdev Patcher - Quick Start Script

echo "🔧 Plexdev - Patcher Setup"
echo "========================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🚀 Starting Plexdev Patcher..."
echo ""

# Build and start the containers
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Plexdev Patcher is now running!"
    echo ""
    echo "🌐 Service is running on: http://127.0.0.1:3313"
    echo "   Configure your nginx to proxy to this address"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs:        docker-compose logs -f"
    echo "   Stop service:     docker-compose down"
    echo "   Restart service:  docker-compose restart"
    echo ""
else
    echo ""
    echo "❌ Failed to start Plexdev Patcher"
    echo "Check the error messages above for details"
    exit 1
fi
