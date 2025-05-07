import React, { createContext, useState, useEffect } from 'react'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth'
import { app } from '../firebase/config'

// Create the authentication context
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const auth = getAuth(app)
  const googleProvider = new GoogleAuthProvider()
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    
    // Cleanup subscription
    return () => unsubscribe()
  }, [auth])
  
  // Sign in with email and password
  const login = async (email, password) => {
    setError(null)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      setUser(userCredential.user)
      return userCredential.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }
  
  // Sign up with email and password
  const signup = async (email, password) => {
    setError(null)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      setUser(userCredential.user)
      return userCredential.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }
  
  // Sign in with Google
  const loginWithGoogle = async () => {
    setError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      setUser(result.user)
      return result.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }
  
  // Sign out
  const logout = async () => {
    setError(null)
    try {
      await signOut(auth)
      setUser(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }
  
  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    signup,
    loginWithGoogle,
    logout
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}