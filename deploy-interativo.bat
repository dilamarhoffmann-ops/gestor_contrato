@echo off
echo ========================================
echo   DEPLOY GESTOR DE CONTRATOS - VERCEL
echo ========================================
echo.
echo Conta: dilamarhoffmann-ops
echo Status: Conectado
echo.
echo ========================================
echo.

echo Escolha o tipo de deploy:
echo.
echo 1. Deploy de Preview (teste)
echo 2. Deploy de Producao
echo 3. Configurar Variaveis de Ambiente
echo 4. Ver Status do Projeto
echo 5. Cancelar
echo.

set /p opcao="Digite o numero da opcao: "

if "%opcao%"=="1" goto preview
if "%opcao%"=="2" goto producao
if "%opcao%"=="3" goto variaveis
if "%opcao%"=="4" goto status
if "%opcao%"=="5" goto cancelar

:preview
echo.
echo ========================================
echo   DEPLOY DE PREVIEW
echo ========================================
echo.
echo Iniciando deploy de preview...
echo Este deploy criara uma URL temporaria para testes.
echo.
vercel
goto fim

:producao
echo.
echo ========================================
echo   DEPLOY DE PRODUCAO
echo ========================================
echo.
echo ATENCAO: Este deploy ira para producao!
echo.
set /p confirma="Tem certeza? (S/N): "
if /i "%confirma%"=="S" (
    echo.
    echo Iniciando deploy de producao...
    vercel --prod
) else (
    echo Deploy cancelado.
)
goto fim

:variaveis
echo.
echo ========================================
echo   CONFIGURAR VARIAVEIS DE AMBIENTE
echo ========================================
echo.
echo As seguintes variaveis precisam ser configuradas:
echo.
echo 1. VITE_SUPABASE_URL
echo 2. VITE_SUPABASE_ANON_KEY
echo 3. VITE_AWS_ACCESS_KEY_ID
echo 4. VITE_AWS_SECRET_ACCESS_KEY
echo 5. VITE_AWS_REGION
echo 6. VITE_S3_BUCKET
echo.
echo Voce pode configurar via:
echo - Dashboard: https://vercel.com/dashboard
echo - CLI: vercel env add [NOME_DA_VARIAVEL]
echo.
set /p config="Deseja configurar via CLI agora? (S/N): "
if /i "%config%"=="S" (
    echo.
    echo Configurando VITE_SUPABASE_URL...
    vercel env add VITE_SUPABASE_URL
    echo.
    echo Configurando VITE_SUPABASE_ANON_KEY...
    vercel env add VITE_SUPABASE_ANON_KEY
    echo.
    echo Configurando VITE_AWS_ACCESS_KEY_ID...
    vercel env add VITE_AWS_ACCESS_KEY_ID
    echo.
    echo Configurando VITE_AWS_SECRET_ACCESS_KEY...
    vercel env add VITE_AWS_SECRET_ACCESS_KEY
    echo.
    echo Configurando VITE_AWS_REGION...
    vercel env add VITE_AWS_REGION
    echo.
    echo Configurando VITE_S3_BUCKET...
    vercel env add VITE_S3_BUCKET
    echo.
    echo Variaveis configuradas com sucesso!
) else (
    echo.
    echo Acesse: https://vercel.com/dashboard
    echo Va em: Settings ^> Environment Variables
)
goto fim

:status
echo.
echo ========================================
echo   STATUS DO PROJETO
echo ========================================
echo.
echo Conta: dilamarhoffmann-ops
echo.
echo Verificando status...
vercel whoami
echo.
echo Listando projetos...
vercel ls
goto fim

:cancelar
echo.
echo Deploy cancelado.
goto fim

:fim
echo.
echo ========================================
echo   CONCLUIDO
echo ========================================
echo.
pause
