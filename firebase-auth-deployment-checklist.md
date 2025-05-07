# Firebase Authentication Deployment Checklist

## 1. Update Kubernetes Secrets

First, you need to update the placeholder values in the `affilichat-firebase-config-secret.yaml` file with your actual values from your .env file:

```yaml
FIREBASE_API_KEY: "your-actual-api-key-here"
FIREBASE_AUTH_DOMAIN: "affilichat-v2.firebaseapp.com"
FIREBASE_PROJECT_ID: "affilichat-v2"
FIREBASE_STORAGE_BUCKET: "affilichat-v2.appspot.com"
FIREBASE_MSG_SENDER_ID: "your-actual-msg-sender-id-here"
FIREBASE_APP_ID: "your-actual-app-id-here"
```

## 2. Apply Kubernetes Configurations

Apply the Kubernetes secret and configuration files:

```bash
# Apply the Firebase service account key secret
kubectl apply -f affilichat-firebase-key-secret.yaml

# Apply the Firebase configuration secret
kubectl apply -f affilichat-firebase-config-secret.yaml

# Apply the updated deployment
kubectl apply -f affilichat-deployment.yaml
```

## 3. Firebase Console Configuration

Ensure your Firebase project is properly configured:

1. Go to Firebase Console → Authentication → Sign-in method
   - Make sure Email/Password is enabled
   - Make sure Google sign-in is enabled
   
2. Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your domain: `affilichat.com` 
   - Ensure `localhost` is also there for testing

3. Check OAuth consent screen in Google Cloud Console
   - Go to Google Cloud Console → APIs & Services → OAuth consent screen
   - Ensure it's properly configured with the correct app information

## 4. Verify Deployment

After deployment, verify everything is working:

1. Check if the pods are running correctly:
   ```bash
   kubectl get pods -n affilichat
   ```

2. Check the logs for any errors:
   ```bash
   kubectl logs -n affilichat deployment/affilichat
   ```

3. Test the authentication:
   - Try email/password sign up
   - Try Google sign-in
   
## 5. Debug Common Issues

If authentication fails, check these common issues:

1. **Firebase configuration is not properly loaded**
   - Check environment variables in the pod:
     ```bash
     kubectl exec -n affilichat <pod-name> -- env | grep FIREBASE
     ```

2. **Firebase service account key is not accessible**
   - Check if the file is mounted correctly:
     ```bash
     kubectl exec -n affilichat <pod-name> -- ls -la /app/firebase-key.json
     ```

3. **Domain not authorized**
   - Ensure your domain is added to Firebase authorized domains
   
4. **CORS issues**
   - If seeing CORS errors in console, ensure your domain is properly configured

5. **Network issues**
   - Check if your app can reach Firebase servers
     ```bash
     kubectl exec -n affilichat <pod-name> -- curl https://www.googleapis.com
     ``` 