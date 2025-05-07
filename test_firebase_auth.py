"""
Firebase Authentication Test Script for AffiliChat

This script tests:
1. Firebase configuration
2. Firebase Admin SDK initialization
3. Google authentication setup
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv
from config.settings import get_settings

def test_firebase_auth():
    """Test Firebase Authentication Configuration"""
    print("\n===== Firebase Authentication Test Script =====")
    
    # Load environment variables
    load_dotenv()
    print("Loaded environment variables")
    
    # Get settings
    try:
        settings = get_settings()
        print("\n=== Firebase Client-Side Configuration ===")
        print(f"API Key exists: {bool(settings.FIREBASE_API_KEY)}")
        if settings.FIREBASE_API_KEY:
            key_prefix = settings.FIREBASE_API_KEY[:2]
            key_suffix = settings.FIREBASE_API_KEY[-2:] if len(settings.FIREBASE_API_KEY) > 2 else ""
            print(f"  API Key format: {key_prefix}...{key_suffix} ({len(settings.FIREBASE_API_KEY)} characters)")
        
        print(f"Auth Domain: {settings.FIREBASE_AUTH_DOMAIN}")
        print(f"Project ID: {settings.FIREBASE_PROJECT_ID}")
        print(f"Storage Bucket: {settings.FIREBASE_STORAGE_BUCKET}")
        print(f"Messaging Sender ID exists: {bool(settings.FIREBASE_MSG_SENDER_ID)}")
        print(f"App ID exists: {bool(settings.FIREBASE_APP_ID)}")
        
        # Test configuration for Google Sign-in
        print("\n=== Google Sign-in Configuration Check ===")
        auth_domain = settings.FIREBASE_AUTH_DOMAIN
        if auth_domain and '.firebaseapp.com' in auth_domain:
            print(f"✅ Auth domain looks valid: {auth_domain}")
        else:
            print(f"❌ Auth domain may be misconfigured: {auth_domain}")
        
        # Test get-firebase-config endpoint
        print("\n=== Testing /get-firebase-config Endpoint ===")
        try:
            response = requests.get('http://localhost:5000/get-firebase-config')
            print(f"Status code: {response.status_code}")
            if response.status_code == 200:
                config = response.json()
                print("✅ Endpoint returned valid JSON")
                print(f"Contains apiKey: {bool(config.get('apiKey'))}")
                print(f"Contains authDomain: {bool(config.get('authDomain'))}")
                print(f"Contains projectId: {bool(config.get('projectId'))}")
            else:
                print(f"❌ Endpoint error: {response.text}")
        except Exception as e:
            print(f"❌ Error accessing endpoint: {str(e)}")
        
        # Check Firebase service account file
        print("\n=== Firebase Admin SDK Configuration ===")
        cred_path = 'firebase-key.json'
        if os.path.exists(cred_path):
            print(f"✅ Firebase credentials file exists at {cred_path}")
            try:
                with open(cred_path, 'r') as f:
                    cred_data = json.load(f)
                print(f"✅ Credential file contains valid JSON")
                
                # Check service account type
                if 'type' in cred_data and cred_data['type'] == 'service_account':
                    print("✅ Credential file is a service account (required)")
                else:
                    print("❌ Credential file is NOT a service account (required)")
                
                # Check service account project ID matches
                if cred_data.get('project_id') == settings.FIREBASE_PROJECT_ID:
                    print(f"✅ Project ID in credentials matches environment: {cred_data.get('project_id')}")
                else:
                    print(f"❌ Project ID mismatch - Credentials: {cred_data.get('project_id')}, Settings: {settings.FIREBASE_PROJECT_ID}")
                    
                # Check for token creation permissions
                if 'client_email' in cred_data and 'private_key' in cred_data:
                    print("✅ Credential file has email and private key for token creation")
                    print(f"  Service account email: {cred_data.get('client_email')}")
                else:
                    print("❌ Credential file missing email or private key (required)")
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON in credentials file: {str(e)}")
            except Exception as e:
                print(f"❌ Error reading credentials file: {str(e)}")
        else:
            print(f"❌ Firebase credentials file NOT found at {cred_path}")
            
        # Firebase Authentication Checklist
        print("\n=== Google Sign-in Checklist ===")
        print("For Google Sign-in to work correctly, ensure you have:")
        print("1. Enabled Google as an auth provider in Firebase console")
        print("   (Firebase Console → Authentication → Sign-in method → Google → Enable)")
        print("2. Added http://localhost:5000 to authorized domains")
        print("   (Firebase Console → Authentication → Settings → Authorized domains)")
        print("3. Set up OAuth consent screen in Google Cloud Console")
        print("   (Google Cloud Console → APIs & Services → OAuth consent screen)")
        print("4. Added proper redirect URIs in the Firebase project settings")
        print("   (Firebase Console → Authentication → Sign-in method → Google → Web SDK configuration)")
        print("5. Ensured your GCP project has the Identity Toolkit API enabled")
        print("   (Google Cloud Console → APIs & Services → Enabled APIs & services)")
    
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        
if __name__ == "__main__":
    test_firebase_auth() 