@echo off
chcp 65001 >nul
rem Liga o back-end e o front-end do PinkGo, cada um na sua janela.
rem O banco é o Supabase: os dados de conexão ficam no backend\.env.
rem Para desligar, feche as duas janelas.

setlocal
cd /d "%~dp0"

if not exist "backend\.env" (
  echo Falta o backend\.env com os dados do Supabase. Copie backend\.env.example e preencha.
  exit /b 1
)

start "PinkGo API" /d "%~dp0backend" cmd /k mvnw.cmd spring-boot:run

rem O Spring leva uns segundos para compilar e conectar no Supabase. O front só abre depois que a API responde,
rem senão a primeira página carrega sem lojas nem carros.
echo Esperando a API subir em http://localhost:8080 ...
set /a tentativas=0
:esperar
curl -s -o nul -m 2 http://localhost:8080/api/locais && goto pronta
set /a tentativas+=1
if %tentativas% geq 90 (
  echo A API não respondeu em 3 minutos. Veja o erro na janela "PinkGo API".
  exit /b 1
)
timeout /t 2 /nobreak >nul
goto esperar

:pronta
rem Na primeira vez, instala as dependências do front antes de ligar o Vite.
if exist "frontend\node_modules" (
  start "PinkGo front" /d "%~dp0frontend" cmd /k npm run dev
) else (
  start "PinkGo front" /d "%~dp0frontend" cmd /k "npm install && npm run dev"
)

echo PinkGo no ar (banco: Supabase):
echo   API   http://localhost:8080
echo   Site  http://localhost:5173