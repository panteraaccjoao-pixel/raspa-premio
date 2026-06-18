@echo off
:loop
echo Iniciando RaspaPremio na porta 3001...
set PORT=3001
npm run dev
echo Servidor caiu! Reiniciando em 3 segundos...
timeout /t 3 /nobreak
goto loop
