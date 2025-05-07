import os
import sys
import json
from dotenv import load_dotenv
from config.settings import get_settings

def test_firebase_config():
    """Test function to check if Firebase configuration is correctly loaded"""
    print("Testing Firebase configuration access...")
    
    # Load environment variables
    load_dotenv()
    
    # Get settings
    try:
        settings = get_settings()
        print("\nFirebase Configuration:")
        print(f"API Key exists: {bool(settings.FIREBASE_API_KEY)}")
        print(f"Auth Domain exists: {bool(settings.FIREBASE_AUTH_DOMAIN)}")
        print(f"Project ID exists: {bool(settings.FIREBASE_PROJECT_ID)}")
        print(f"Storage Bucket exists: {bool(settings.FIREBASE_STORAGE_BUCKET)}")
        print(f"Message Sender ID exists: {bool(settings.FIREBASE_MSG_SENDER_ID)}")
        print(f"App ID exists: {bool(settings.FIREBASE_APP_ID)}")
        
        # Check Firebase credentials file
        cred_path = 'firebase-key.json'
        if os.path.exists(cred_path):
            print(f"\nFirebase credentials file exists at {cred_path}")
            try:
                with open(cred_path, 'r') as f:
                    cred_data = json.load(f)
                print(f"Credential file contains valid JSON")
                print(f"Project ID in credentials: {cred_data.get('project_id', 'NOT FOUND')}")
                
                # Check for required authentication permissions
                if 'type' in cred_data and cred_data['type'] == 'service_account':
                    print("Credential file is a service account")
                else:
                    print("WARNING: Credential file is not a service account")
                    
                # Check token creation permissions
                if 'client_email' in cred_data and 'private_key' in cred_data:
                    print("Credential file has email and private key for token creation")
                else:
                    print("WARNING: Credential file missing email or private key")
                
                # Check OAuth configuration
                print("\nChecking Firebase Auth configuration for Google Sign-in:")
                auth_domain = settings.FIREBASE_AUTH_DOMAIN
                if auth_domain and '.firebaseapp.com' in auth_domain:
                    print(f"Auth domain looks valid: {auth_domain}")
                else:
                    print(f"WARNING: Auth domain may be misconfigured: {auth_domain}")
                
                print("\nTo enable Google Sign-in, ensure you have:")
                print("1. Enabled Google as an auth provider in Firebase console")
                print("2. Added localhost:5000 to authorized domains")
                print("3. Set up proper OAuth consent screen in Google Cloud Console")
                print("4. Added proper redirect URIs in the Firebase project settings")
                
            except json.JSONDecodeError:
                print(f"WARNING: Credentials file contains invalid JSON")
            except Exception as e:
                print(f"ERROR: Could not read credentials file: {str(e)}")
        else:
            print(f"\nWARNING: Firebase credentials file not found at {cred_path}")
    
    except Exception as e:
        print(f"ERROR: {str(e)}")
        
if __name__ == "__main__":
    test_firebase_config() 