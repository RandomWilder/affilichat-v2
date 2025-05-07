// Firebase Authentication for AffiliChat
document.addEventListener('DOMContentLoaded', function() {
    console.log("Firebase auth module loaded, attempting to fetch config...");
    
    // Firebase configuration will be loaded from the server
    fetch('/get-firebase-config')
        .then(response => {
            console.log("Firebase config fetch response status:", response.status);
            
            if (!response.ok) {
                // Try to get more detailed error information
                return response.text().then(text => {
                    try {
                        const errorData = JSON.parse(text);
                        throw new Error(`Firebase config fetch failed: ${response.status} - ${errorData.error || errorData.message || 'Unknown error'}`);
                    } catch (e) {
                        throw new Error(`Firebase config fetch failed: ${response.status} - ${text || response.statusText}`);
                    }
                });
            }
            return response.json();
        })
        .then(firebaseConfig => {
            console.log("Firebase config loaded - API Key exists:", !!firebaseConfig.apiKey, 
                "Auth Domain:", firebaseConfig.authDomain,
                "Project ID:", firebaseConfig.projectId);
            
            // Validate configuration
            if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
                throw new Error('Firebase configuration is incomplete. Missing required fields.');
            }
            
            // Initialize Firebase with valid config
            if (!firebase.apps.length) {
                try {
                    firebase.initializeApp(firebaseConfig);
                    console.log("Firebase successfully initialized");
                } catch (initError) {
                    console.error('Firebase initialization error:', initError);
                    throw initError;
                }
            }
            
            // Set auth persistence to local for better user experience
            try {
                const auth = firebase.auth();
                auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                    .then(() => {
                        console.log("Firebase auth persistence set to LOCAL");
                    })
                    .catch(err => {
                        console.warn("Could not set persistence:", err.message);
                    });
                
                auth.useDeviceLanguage();
                
                // Check current auth state and log it
                const user = auth.currentUser;
                console.log("Current auth state - User logged in:", !!user);
                
                // Configure error handling
                auth.onAuthStateChanged(function(user) {
                    if (user) {
                        console.log("Auth state changed: User signed in");
                    } else {
                        console.log("Auth state changed: User signed out");
                    }
                });
                
                // Set up Google auth provider
                const googleProvider = new firebase.auth.GoogleAuthProvider();
                // Add scopes for additional permissions
                googleProvider.addScope('email');
                googleProvider.addScope('profile');
                
                // Set up Google Sign-in buttons
                const googleButtons = document.querySelectorAll('.google-signin-btn');
                
                googleButtons.forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        console.log("Google sign-in button clicked");
                        
                        // Show loading state
                        const originalText = button.innerHTML;
                        button.disabled = true;
                        button.innerHTML = 'Signing in...';
                        
                        // Try both popup and redirect methods
                        try {
                            auth.signInWithPopup(googleProvider)
                                .then(handleAuthResult)
                                .catch(error => {
                                    console.error('Popup method failed:', error);
                                    console.log('Error code:', error.code);
                                    console.log('Error message:', error.message);
                                    
                                    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                                        console.log('Trying redirect method instead...');
                                        // If popup fails (which can happen on mobile or due to popup blockers)
                                        // Store that we're expecting a redirect return
                                        sessionStorage.setItem('auth_redirect', 'true');
                                        // Use redirect method as fallback
                                        auth.signInWithRedirect(googleProvider);
                                    } else {
                                        // Reset button state
                                        button.disabled = false;
                                        button.innerHTML = originalText;
                                        alert(`Authentication error: ${error.message || 'Unknown error'}`);
                                    }
                                });
                        } catch (initError) {
                            console.error('Error initializing Google auth:', initError);
                            // Reset button state
                            button.disabled = false;
                            button.innerHTML = originalText;
                            alert('Failed to initialize authentication. Please try again.');
                        }
                    });
                });
                
                // Check for redirect result when page loads
                auth.getRedirectResult()
                    .then(result => {
                        // Only handle this if we were expecting a redirect return
                        if (sessionStorage.getItem('auth_redirect') === 'true') {
                            sessionStorage.removeItem('auth_redirect');
                            if (result.user) {
                                handleAuthResult(result);
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Auth redirect error:', error);
                        console.log('Error code:', error.code);
                        console.log('Error message:', error.message);
                        
                        if (sessionStorage.getItem('auth_redirect') === 'true') {
                            sessionStorage.removeItem('auth_redirect');
                            alert(`Authentication failed: ${error.message || 'Unknown error'}`);
                        }
                    });
                    
                // Handler function for authentication result
                function handleAuthResult(result) {
                    console.log("Google sign-in successful");
                    // Get the user info from the Google account
                    const user = result.user;
                    console.log("User authenticated:", {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName
                    });
                    
                    return user.getIdToken()
                        .then(idToken => {
                            console.log("ID token retrieved successfully");
                            const userData = {
                                idToken: idToken,
                                uid: user.uid,
                                email: user.email,
                                displayName: user.displayName
                            };
                            
                            console.log("Sending user data to server");
                            // Send the ID token to the server
                            return fetch('/auth/google-signin', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(userData)
                            })
                            .then(response => {
                                console.log("Server response status:", response.status);
                                
                                // If not OK, get the response text
                                if (!response.ok) {
                                    return response.text().then(text => {
                                        try {
                                            // Try to parse as JSON
                                            const data = JSON.parse(text);
                                            throw new Error(data.message || `Server error: ${response.status}`);
                                        } catch (e) {
                                            // If not valid JSON, use text
                                            throw new Error(`Server error: ${response.status} - ${text || 'Unknown error'}`);
                                        }
                                    });
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log("Server response data:", data);
                                if (data.success) {
                                    // Redirect to home page or dashboard
                                    window.location.href = data.redirect_url;
                                } else {
                                    // Show error message
                                    alert(data.message || 'Authentication failed');
                                    // Reset all Google buttons
                                    document.querySelectorAll('.google-signin-btn').forEach(btn => {
                                        btn.disabled = false;
                                        btn.innerHTML = originalText;
                                    });
                                }
                            })
                            .catch(error => {
                                console.error('Server request error:', error);
                                alert(`Server error: ${error.message}`);
                                // Reset all Google buttons
                                document.querySelectorAll('.google-signin-btn').forEach(btn => {
                                    btn.disabled = false;
                                    btn.innerHTML = 'Sign in with Google <img src="/static/images/google-icon.svg" alt="Google">';
                                });
                            });
                        })
                        .catch(error => {
                            console.error('ID token error:', error);
                            alert(`Authentication token error: ${error.message}`);
                            // Reset all Google buttons
                            document.querySelectorAll('.google-signin-btn').forEach(btn => {
                                btn.disabled = false;
                                btn.innerHTML = 'Sign in with Google <img src="/static/images/google-icon.svg" alt="Google">';
                            });
                        });
                }
            } catch (authInitError) {
                console.error('Error initializing Firebase Auth:', authInitError);
                document.querySelectorAll('.auth-container').forEach(container => {
                    container.innerHTML = `<div class="error-message">Authentication system error: ${authInitError.message}</div>`;
                });
            }
        })
        .catch(error => {
            console.error('Error loading Firebase config:', error);
            document.querySelectorAll('.google-signin-btn').forEach(button => {
                button.disabled = true;
                button.innerHTML = 'Google Sign-in Unavailable';
            });
            
            // Add more detailed error info to help debugging
            const errorDetails = document.createElement('code');
            errorDetails.className = 'firebase-error';
            errorDetails.textContent = `${error.message}`;
            errorDetails.style.display = 'none';
            
            // Show error notification
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-notification';
            errorDiv.textContent = `Firebase configuration error. Check console for details.`;
            errorDiv.appendChild(errorDetails);
            
            // Add a button to show technical details
            const detailsButton = document.createElement('button');
            detailsButton.textContent = 'Show Technical Details';
            detailsButton.className = 'error-details-btn';
            detailsButton.onclick = function() {
                if (errorDetails.style.display === 'none') {
                    errorDetails.style.display = 'block';
                    detailsButton.textContent = 'Hide Technical Details';
                } else {
                    errorDetails.style.display = 'none';
                    detailsButton.textContent = 'Show Technical Details';
                }
            };
            
            errorDiv.appendChild(detailsButton);
            document.body.appendChild(errorDiv);
        });
}); 