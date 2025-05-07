@echo off
echo Setting up GitHub repository for AffiliChat v2...

:: Check if Git repository is already initialized
if not exist .git (
    echo Initializing Git repository...
    git init
) else (
    echo Git repository already initialized.
)

:: Check if files have been staged
git diff --cached --quiet
if %errorlevel% equ 0 (
    :: Add all files except those in .gitignore
    echo Adding files to repository...
    git add .
)

:: Check current branch
git branch | findstr "fresh-main" > nul
if %errorlevel% neq 0 (
    echo Creating fresh-main branch...
    git checkout -b fresh-main
) else (
    echo Already on fresh-main branch.
)

:: Check for uncommitted changes
git diff-index --quiet HEAD --
if %errorlevel% neq 0 (
    echo Creating commit...
    git commit -m "Update AffiliChat - Vite Frontend with Flask API Backend"
) else (
    echo No changes to commit.
)

:: Check if origin remote already exists
git remote -v | findstr "origin" > nul
if %errorlevel% equ 0 (
    echo Remote "origin" already exists.
) else (
    echo Adding remote "origin"...
    git remote add origin https://github.com/RandomWilder/affilichat-v2.git
)

echo.
echo Repository is ready for pushing to GitHub.
echo.
echo To push your changes to GitHub, run:
echo.
echo git_push.bat
echo.
echo This will push your code to: https://github.com/RandomWilder/affilichat-v2
echo on the fresh-main branch. 