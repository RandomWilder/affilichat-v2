# Production Deployment Guide for AffiliChat Combined App

This guide outlines the steps to deploy the combined Vite frontend + Flask backend application to GCP.

## Pre-Deployment Checklist

1. ✅ Tested the application locally
2. ✅ Added Firebase configuration
3. ✅ Updated environment variables
4. ✅ Implemented security improvements
5. ✅ Prepared Kubernetes deployment files

## Deployment Process

### 1. Ensure Firebase Secret Configuration is Updated

Make sure your Firebase configuration secret in Kubernetes is updated:

```bash
# Check if the secret exists
kubectl get secret affilichat-firebase-config -n affilichat

# If not, create it (replace with your actual values)
kubectl create secret generic affilichat-firebase-config \
  --namespace=affilichat \
  --from-literal=FIREBASE_API_KEY=AIzaSyCS_dVPBJ3T03gxxmYCoo2P_LoeUZtZw0E \
  --from-literal=FIREBASE_AUTH_DOMAIN=affilichat-v2.firebaseapp.com \
  --from-literal=FIREBASE_PROJECT_ID=affilichat-v2 \
  --from-literal=FIREBASE_STORAGE_BUCKET=affilichat-v2.firebasestorage.app \
  --from-literal=FIREBASE_MSG_SENDER_ID=234665566004 \
  --from-literal=FIREBASE_APP_ID=1:234665566004:web:187d26897aea292ab04f61

# If it exists, update it
kubectl delete secret affilichat-firebase-config -n affilichat
kubectl create secret generic affilichat-firebase-config \
  --namespace=affilichat \
  --from-literal=FIREBASE_API_KEY=AIzaSyCS_dVPBJ3T03gxxmYCoo2P_LoeUZtZw0E \
  --from-literal=FIREBASE_AUTH_DOMAIN=affilichat-v2.firebaseapp.com \
  --from-literal=FIREBASE_PROJECT_ID=affilichat-v2 \
  --from-literal=FIREBASE_STORAGE_BUCKET=affilichat-v2.firebasestorage.app \
  --from-literal=FIREBASE_MSG_SENDER_ID=234665566004 \
  --from-literal=FIREBASE_APP_ID=1:234665566004:web:187d26897aea292ab04f61
```

### 2. Build and Push Docker Image

Run the deploy_to_gcr.bat script to build and push the Docker image to Google Container Registry:

```bash
deploy_to_gcr.bat
```

This script will:
- Build the Docker image with the combined frontend and backend
- Tag it with the appropriate GCR URL
- Push it to Google Container Registry

### 3. Deploy to Kubernetes

Apply the combined deployment to your Kubernetes cluster:

```bash
kubectl apply -f affilichat-combined-deployment.yaml
```

### 4. Verify the Deployment

Check if the deployment was successful:

```bash
# Check deployments
kubectl get deployments -n affilichat

# Check pods
kubectl get pods -n affilichat

# Check services
kubectl get services -n affilichat

# Check logs of a pod (replace POD_NAME with actual pod name)
kubectl logs -n affilichat POD_NAME
```

### 5. Verify the Application

Access your domain at https://affilichat.com and verify:
- The Vite frontend loads correctly
- API calls work properly
- Authentication flow functions correctly

## Rollback Plan

If you encounter issues, you can roll back to the previous deployment:

```bash
# Execute the rollback script
rollback.bat
```

## Troubleshooting

### Common Issues

1. **Docker Build Failures**: Check Docker logs for errors during the build process
2. **Kubernetes Deployment Issues**: Use `kubectl describe pod <pod-name> -n affilichat` to see detailed errors
3. **Firebase Authentication Issues**: Verify Firebase configuration in both Kubernetes secrets and the application

### Logs and Debugging

```bash
# Get logs from a specific pod
kubectl logs -n affilichat POD_NAME

# Execute commands inside a pod
kubectl exec -it -n affilichat POD_NAME -- /bin/bash

# Port forward to test a service directly
kubectl port-forward -n affilichat service/affilichat-service 8080:80
``` 