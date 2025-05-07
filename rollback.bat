@echo off
echo Rolling back to the original deployment...

:: Apply the original deployment configuration
kubectl apply -f backup\deployment\affilichat-deployment.yaml
kubectl apply -f backup\deployment\affilichat-service.yaml

echo Rollback complete. The original deployment has been restored.
echo Checking deployment status...
kubectl get deployments -n affilichat 