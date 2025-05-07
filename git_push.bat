@echo off
echo Pushing to GitHub repository...

:: Check if origin remote already exists
git remote -v | findstr "origin" > nul
if %errorlevel% equ 0 (
    echo Remote "origin" already exists. Skipping remote add.
) else (
    echo Adding remote "origin"...
    git remote add origin https://github.com/RandomWilder/affilichat-v2.git
)

:: Make sure we're on the fresh-main branch
git branch | findstr "fresh-main" > nul
if %errorlevel% equ 0 (
    echo Ensuring we're on the fresh-main branch...
    git checkout fresh-main
) else (
    echo Creating and switching to fresh-main branch...
    git checkout -b fresh-main
)

:: Push to the repository
echo Pushing to GitHub...
git push -u origin fresh-main

echo Repository successfully pushed to GitHub at https://github.com/RandomWilder/affilichat-v2
