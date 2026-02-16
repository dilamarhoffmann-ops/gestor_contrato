@echo off
REM Script de Deploy para Vercel (Windows)
REM Este script automatiza o processo de deploy

echo 🚀 Iniciando processo de deploy para Vercel...

REM Verificar se o Vercel CLI está instalado
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI não encontrado. Instalando...
    npm install -g vercel
)

REM Fazer login na Vercel (se necessário)
echo 🔐 Verificando autenticação...
vercel whoami || vercel login

REM Build local para testar
echo 🔨 Testando build local...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build local bem-sucedido!
    
    REM Perguntar se deseja fazer deploy
    set /p deploy="Deseja fazer deploy para produção? (s/n): "
    if /i "%deploy%"=="s" (
        echo 🚀 Fazendo deploy para produção...
        vercel --prod
    ) else (
        echo 📦 Fazendo deploy para preview...
        vercel
    )
) else (
    echo ❌ Build falhou. Corrija os erros antes de fazer deploy.
    exit /b 1
)

echo ✨ Deploy concluído!
pause
