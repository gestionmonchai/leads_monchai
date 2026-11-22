@echo off
setlocal
chcp 65001 >nul
set "PYTHONUTF8=1"
if defined MONCHAI_PYTHON (
  "%MONCHAI_PYTHON%" "%~dp0recenser.py" --ouvrir %*
) else (
  where py >nul 2>nul
  if not errorlevel 1 (
    py -3 "%~dp0recenser.py" --ouvrir %*
  ) else (
    where python >nul 2>nul
    if errorlevel 1 (
      echo Python 3.10 ou plus recent est necessaire. Configurez MONCHAI_PYTHON si besoin.
      pause
      exit /b 1
    )
    python "%~dp0recenser.py" --ouvrir %*
  )
)
set "COLLECTE_CODE=%ERRORLEVEL%"
if "%COLLECTE_CODE%"==2 echo Rapport partiel : consultez les sources en erreur dans le rapport.
if "%COLLECTE_CODE%"==1 echo Collecte echouee : consultez le message affiche ci-dessus.
if "%COLLECTE_CODE%"==3 echo Une autre collecte est active. Attendez sa fin avant de relancer.
pause
exit /b %COLLECTE_CODE%
