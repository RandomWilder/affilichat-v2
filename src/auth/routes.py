from flask import render_template, request, flash, redirect, url_for, session, jsonify
from flask_login import login_user, logout_user, current_user
import firebase_admin
from firebase_admin import auth, credentials
from . import auth_bp
from .models import User

# Initialize Firebase (should be done in app.py, but added here for reference)
# We'll assume it's already initialized in app.py

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        # Handle login form submission
        email = request.form.get('email')
        password = request.form.get('password')
        
        try:
            # Verify with Firebase
            user = auth.get_user_by_email(email)
            # In a real implementation, password verification would happen via Firebase Auth SDK
            # For now, we're just logging in the user directly
            user_obj = User(user.uid, user.email, user.display_name or '')
            login_user(user_obj)
            
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            return redirect(url_for('index'))
        except Exception as e:
            flash(f'Login failed: {str(e)}', 'error')
    
    return render_template('auth/login.html')

@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        # Handle signup form submission
        email = request.form.get('email')
        password = request.form.get('password')
        name = request.form.get('name', '')
        
        try:
            # Create user in Firebase
            user = auth.create_user(
                email=email,
                password=password,
                display_name=name
            )
            
            # Log in the new user
            user_obj = User(user.uid, user.email, user.display_name or '')
            login_user(user_obj)
            
            flash('Account created successfully!', 'success')
            return redirect(url_for('index'))
        except Exception as e:
            flash(f'Signup failed: {str(e)}', 'error')
    
    return render_template('auth/signup.html')

@auth_bp.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))

@auth_bp.route('/firebase-auth', methods=['POST'])
def firebase_auth():
    # Handle token verification from client-side Firebase auth
    try:
        id_token = request.json.get('idToken')
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        
        # Get the user from Firebase
        firebase_user = auth.get_user(uid)
        
        # Create a User object and log them in
        user = User(
            firebase_user.uid,
            firebase_user.email,
            firebase_user.display_name or ''
        )
        login_user(user)
        
        return jsonify({'success': True, 'redirect': url_for('index')})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 401

@auth_bp.route('/google-signin', methods=['POST'])
def google_signin():
    """Handle Google Sign-in authentication from client-side"""
    try:
        # Get the ID token from the request
        data = request.get_json()
        
        if not data or 'idToken' not in data:
            return jsonify({'success': False, 'message': 'No ID token provided'}), 400

        # Verify the ID token with Firebase Admin SDK
        id_token = data.get('idToken')
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        
        # Get the user from Firebase
        firebase_user = auth.get_user(uid)
        
        # Create a User object and log them in
        user = User(
            firebase_user.uid,
            firebase_user.email,
            firebase_user.display_name or ''
        )
        login_user(user)
        
        # Return success response with redirect URL
        return jsonify({
            'success': True,
            'message': 'Authentication successful',
            'redirect_url': url_for('index')
        })
        
    except ValueError as e:
        # Invalid token
        return jsonify({'success': False, 'message': f'Invalid authentication token: {str(e)}'}), 401
    except auth.InvalidIdTokenError as e:
        # Token expired or invalid
        return jsonify({'success': False, 'message': f'Invalid ID token: {str(e)}'}), 401
    except Exception as e:
        # Other errors
        return jsonify({'success': False, 'message': f'Authentication error: {str(e)}'}), 500 