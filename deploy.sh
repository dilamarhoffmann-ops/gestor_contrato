#!/bin/bash

# Script de Deploy para Vercel
# Este script automatiza o processo de deploy

echo "🚀 Iniciando processo de deploy para Vercel..."

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Fazer login na Vercel (se necessário)
echo "🔐 Verificando autenticação..."
vercel whoami || vercel login

# Build local para testar
echo "🔨 Testando build local..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build local bem-sucedido!"
    
    # Perguntar se deseja fazer deploy
    read -p "Deseja fazer deploy para produção? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]
    then
        echo "🚀 Fazendo deploy para produção..."
        vercel --prod
    else
        echo "📦 Fazendo deploy para preview..."
        vercel
    fi
else
    echo "❌ Build falhou. Corrija os erros antes de fazer deploy."
    exit 1
fi

echo "✨ Deploy concluído!"
