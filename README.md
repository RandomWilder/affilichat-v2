# AffiliChat

AffiliChat is an AI-powered affiliate marketing assistant that enhances websites with intelligent crawling and conversation capabilities, connecting businesses with their audience through personalized AI chat.

## Overview

AffiliChat consists of two main components:
1. **React/Vite Frontend**: Modern, responsive UI for user interactions
2. **Flask Backend**: API-only service that handles data processing, crawling, and AI interactions

The system is containerized and deployed on Google Cloud Platform (GCP) using Kubernetes.

## Key Features

- **Intelligent Crawling**: Automatically crawl and index website content for relevant information retrieval
- **Personalized Chat**: AI assistant that understands website content and can answer visitor questions
- **Firebase Authentication**: Secure user authentication and management
- **Vector Search**: Efficient similarity search using Pinecone
- **Multi-language Support**: Including RTL languages such as Hebrew

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│             │     │              │     │             │
│ React/Vite  │────►│ Nginx Proxy  │────►│ Flask API   │
│ Frontend    │     │              │     │ Backend     │
│             │     │              │     │             │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                               │
                                               │
                                        ┌──────▼──────┐
                                        │             │
                                        │ External    │
                                        │ Services    │
                                        │ (Firebase,  │
                                        │ Pinecone,   │
                                        │ OpenAI)     │
                                        │             │
                                        └─────────────┘
```

## Technology Stack

- **Frontend**:
  - React 18
  - Vite
  - Chakra UI
  - React Router
  - Firebase Auth

- **Backend**:
  - Flask
  - LangChain
  - Pinecone (Vector DB)
  - OpenAI/OpenRouter API

- **Infrastructure**:
  - Docker
  - Kubernetes
  - Google Cloud Platform (GCP)
  - Google Container Registry (GCR)
  - Nginx

## Deployment

The application is deployed as a combined Docker container that includes:
1. Nginx web server (serving frontend assets and proxying API requests)
2. Flask API backend
3. Supervisor process manager

Kubernetes manages deployment, scaling, and service exposure.

## Local Development

### Prerequisites
- Docker Desktop
- Node.js 18+
- Python 3.11+
- Firebase account
- OpenAI API key
- Pinecone API key

### Running Locally
```bash
# Build and run the combined container locally
build_combined_local.bat
```

## Deployment to Production

```bash
# Build and push to Google Container Registry
deploy_to_gcr.bat

# Deploy to Kubernetes
kubectl apply -f affilichat-combined-deployment.yaml
kubectl apply -f affilichat-combined-service.yaml

# Ensure transition from Flask to Vite frontend
complete_transition.bat
```

For detailed deployment instructions, see [production-deployment-guide.md](production-deployment-guide.md).

## Future Development Roadmap

- Payment integration for subscription services
- Enhanced analytics dashboard
- More personalization options for the AI assistant
- Mobile app integration

## License

Proprietary - All rights reserved 