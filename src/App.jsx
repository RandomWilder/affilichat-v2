import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { useAuth } from './hooks/useAuth'

// Layout
import DashboardLayout from './layouts/DashboardLayout'

// Pages
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Dashboard from './pages/dashboard/Dashboard'
import KnowledgeBase from './pages/dashboard/KnowledgeBase'
import PersonaConfig from './pages/dashboard/PersonaConfig'
import WidgetManagement from './pages/dashboard/WidgetManagement'
import Analytics from './pages/dashboard/Analytics'
import Account from './pages/dashboard/Account'
import NotFound from './pages/NotFound'
import LandingPage from './pages/LandingPage'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  // If authentication is still loading, show nothing (you could add a loading spinner here)
  if (loading) return null
  
  // If user is not authenticated, redirect to login
  if (!user) return <Navigate to="/login" replace />
  
  // User is authenticated, render the protected route
  return children
}

const App = () => {
  const toast = useToast()
  const { user, loading } = useAuth()

  // Show a welcome toast when user logs in (you might want to add more conditions)
  useEffect(() => {
    if (user && !loading) {
      toast({
        title: 'Welcome to AffiliChat',
        description: 'You are successfully logged in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [user, loading, toast])

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes - Dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="knowledge-base" element={<KnowledgeBase />} />
        <Route path="persona-config" element={<PersonaConfig />} />
        <Route path="widget-management" element={<WidgetManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="account" element={<Account />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App