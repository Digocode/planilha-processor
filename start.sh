#!/bin/bash

echo "🚀 Iniciando Processador de Planilhas..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "📦 Instalando dependências do backend..."
cd backend
npm install

echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install

echo "✅ Instalação concluída!"
echo ""
echo "Para iniciar a aplicação:"
echo "1. Terminal 1: cd backend && npm start"
echo "2. Terminal 2: cd frontend && npm run dev"
echo ""
echo "Acesse: http://localhost:5173"

