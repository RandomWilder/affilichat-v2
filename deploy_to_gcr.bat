@echo off
echo Starting deployment to Google Container Registry...

:: Configuration
set GCP_PROJECT=affilichat-v2
set IMAGE_NAME=affilichat-combined
set IMAGE_VERSION=v1.0
set GCR_IMAGE=gcr.io/%GCP_PROJECT%/%IMAGE_NAME%:%IMAGE_VERSION%

:: Build the Docker image
echo Building Docker image...
docker build -t %IMAGE_NAME%:latest -f Dockerfile.combined .

:: Tag the image for GCR
echo Tagging image for GCR...
docker tag %IMAGE_NAME%:latest %GCR_IMAGE%

:: Push to GCR
echo Pushing image to GCR...
docker push %GCR_IMAGE%

echo Image pushed to GCR: %GCR_IMAGE%
echo.
echo To update the Kubernetes deployment, run:
echo kubectl apply -f affilichat-combined-deployment.yaml 