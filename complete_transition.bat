@echo off
echo Starting the complete transition to the Vite frontend...

echo 1. Applying the combined deployment...
kubectl apply -f affilichat-combined-deployment.yaml

echo 2. Updating the service to point to the new deployment...
kubectl apply -f affilichat-combined-service.yaml

echo 3. Scaling down old deployments if any exist (checking for other deployments)...
for /f "tokens=1" %%i in ('kubectl get deployments -n affilichat -o name') do (
    if not "%%i"=="deployment.apps/affilichat" (
        echo Found old deployment: %%i, scaling it down...
        kubectl scale %%i --replicas=0 -n affilichat
    )
)

echo 4. Waiting for new pods to be ready...
timeout /t 30

echo 5. Verifying the deployment...
kubectl get deployments -n affilichat
kubectl get pods -n affilichat
kubectl get services -n affilichat

echo 6. Cleaning up old pods that might still be terminating...
kubectl delete pods --field-selector=status.phase=Terminating -n affilichat --grace-period=0 --force

echo Transition completed. The new Vite frontend should now be visible at https://affilichat.com
echo Please allow a few minutes for DNS propagation and cache clearing.
echo You may need to clear your browser cache or use incognito mode to see the changes immediately. 