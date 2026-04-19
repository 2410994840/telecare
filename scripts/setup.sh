#!/bin/bash
# TeleCare local development setup script
set -e

echo "🏥 Setting up TeleCare development environment..."

# Backend
echo "📦 Installing backend dependencies..."
cd backend && cp .env.example .env && npm install && cd ..

# Frontend
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# AI Service
echo "🐍 Setting up Python AI service..."
cd ai-service && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && deactivate && cd ..

echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  Backend:    cd backend && npm run dev"
echo "  Frontend:   cd frontend && npm start"
echo "  AI Service: cd ai-service && uvicorn main:app --reload"
echo ""
echo "Or use Docker: docker-compose up --build"
