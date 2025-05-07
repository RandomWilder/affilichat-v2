import React, { useState } from 'react'
import { 
  Box, 
  Button, 
  Container, 
  Divider, 
  FormControl, 
  FormLabel, 
  Heading, 
  Input, 
  Stack, 
  Text,
  useToast,
  Center,
  Icon,
  InputGroup,
  InputRightElement,
  FormErrorMessage
} from '@chakra-ui/react'
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  
  const { login, loginWithGoogle } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  
  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({})
    
    // Validate form
    let formErrors = {}
    if (!email) formErrors.email = 'Email is required'
    if (!password) formErrors.password = 'Password is required'
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }
    
    // Submit form
    setIsSubmitting(true)
    
    try {
      await login(email, password)
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/dashboard')
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setErrors({ form: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleGoogleLogin = async () => {
    setIsSubmitting(true)
    
    try {
      await loginWithGoogle()
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/dashboard')
    } catch (error) {
      toast({
        title: 'Google login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6" align="center">
          <Heading size="xl">Log in to AffiliChat</Heading>
          <Text color="gray.500">
            Enter your email and password to access your account
          </Text>
        </Stack>
        
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={{ base: 'transparent', sm: 'bg-surface' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <form onSubmit={handleLogin}>
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl isInvalid={errors.email}>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <InputGroup>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                    <InputRightElement>
                      <Icon as={FiMail} color="gray.500" />
                    </InputRightElement>
                  </InputGroup>
                  {errors.email && (
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  )}
                </FormControl>
                
                <FormControl isInvalid={errors.password}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      required
                    />
                    <InputRightElement>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Icon as={showPassword ? FiEyeOff : FiEye} color="gray.500" />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {errors.password && (
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  )}
                </FormControl>
              </Stack>
              
              {errors.form && (
                <Text color="red.500" fontSize="sm">
                  {errors.form}
                </Text>
              )}
              
              <Stack spacing="4">
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  isLoading={isSubmitting}
                >
                  Log in
                </Button>
                
                <Divider />
                
                <Button 
                  variant="outline" 
                  leftIcon={<FcGoogle />} 
                  onClick={handleGoogleLogin}
                  isDisabled={isSubmitting}
                >
                  Continue with Google
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
        
        <Center>
          <Text>
            Don't have an account?{' '}
            <RouterLink to="/signup">
              <Button variant="link" colorScheme="blue">
                Sign up
              </Button>
            </RouterLink>
          </Text>
        </Center>
      </Stack>
    </Container>
  )
}

export default Login