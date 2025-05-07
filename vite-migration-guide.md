# Vite Frontend Migration Guide

This guide outlines the steps to migrate from the Flask frontend to the Vite React frontend while keeping the Flask backend for API functionality.

## Deployment Process

### 1. Preparation

- [x] Create backups of critical configuration files
- [x] Set up Nginx configuration for the combined deployment
- [x] Update Dockerfile.frontend to use Nginx configuration
- [x] Create a combined Dockerfile with both frontend and backend

### 2. Local Testing

Before deploying to production, test the changes locally:

```
# Run the script to build and test locally
build_combined_local.bat
```

Access the test application at http://localhost:8000 and verify:
- The Vite frontend loads correctly
- API calls work properly
- Authentication flow is functioning

### 3. Deployment to GCP

Once testing is successful, deploy to GCP:

```
# Run the script to build and push to GCR
deploy_to_gcr.bat

# Apply the new Kubernetes configuration
kubectl apply -f affilichat-combined-deployment.yaml
```

### 4. Verification

After deployment, verify that:
- The application is accessible at https://affilichat.com
- All functionality works correctly
- Monitor logs for any errors

### 5. Rollback Plan

If issues occur, you can roll back to the previous deployment:

```
# Execute the rollback script
rollback.bat
```

## Future Improvements

After successful migration, consider:

1. Optimizing the container setup (resource allocation, caching)
2. Setting up CI/CD for automated deployments
3. Implementing proper health checks and monitoring

## Troubleshooting

### Common Issues

1. **API Connection Issues**: Check Nginx configuration and ensure proper proxying
2. **Authentication Problems**: Verify Firebase configuration in both frontend and backend
3. **Image Build Failures**: Check Docker build logs for errors

For assistance, refer to the logs:
```
# Check container logs
kubectl logs -n affilichat deployment/affilichat

# Check events
kubectl get events -n affilichat
``` 