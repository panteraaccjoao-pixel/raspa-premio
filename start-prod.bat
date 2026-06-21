@echo off
:loop
echo Iniciando RaspaPremio PRODUCAO na porta 3001...
set PORT=3001
npm run start
echo Servidor caiu! Reiniciando em 3 segundos...
timeout /t 3 /nobreak
goto loop
