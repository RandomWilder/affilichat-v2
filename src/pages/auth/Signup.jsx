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
  FormErrorMessage,
  Checkbox
} from '@chakra-ui/react'
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  
  const { signup, loginWithGoogle } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the terms and conditions'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSignup = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      await signup(email, password)
      // TODO: Update user profile with name
      
      toast({
        title: 'Account created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/dashboard')
    } catch (error) {
      toast({
        title: 'Sign up failed',
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
  
  const handleGoogleSignup = async () => {
    if (!agreeTerms) {
      setErrors({ agreeTerms: 'You must agree to the terms and conditions' })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await loginWithGoogle()
      toast({
        title: 'Account created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/dashboard')
    } catch (error) {
      toast({
        title: 'Google sign up failed',
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
          <Heading size="xl">Create an account</Heading>
          <Text color="gray.500">
            Enter your information to create an AffiliChat account
          </Text>
        </Stack>
        
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={{ base: 'transparent', sm: 'bg-surface' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <form onSubmit={handleSignup}>
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl isInvalid={errors.name}>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <InputGroup>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                    <InputRightElement>
                      <Icon as={FiUser} color="gray.500" />
                    </InputRightElement>
                  </InputGroup>
                  {errors.name && (
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  )}
                </FormControl>
                
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
                
                <FormControl isInvalid={errors.confirmPassword}>
                  <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {errors.confirmPassword && (
                    <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                  )}
                </FormControl>
                
                <FormControl isInvalid={errors.agreeTerms}>
                  <Checkbox
                    id="terms"
                    isChecked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  >
                    I agree to the Terms of Service and Privacy Policy
                  </Checkbox>
                  {errors.agreeTerms && (
                    <FormErrorMessage>{errors.agreeTerms}</FormErrorMessage>
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
                  Create Account
                </Button>
                
                <Divider />
                
                <Button 
                  variant="outline" 
                  leftIcon={<FcGoogle />} 
                  onClick={handleGoogleSignup}
                  isDisabled={isSubmitting}
                >
                  Sign up with Google
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
        
        <Center>
          <Text>
            Already have an account?{' '}
            <RouterLink to="/login">
              <Button variant="link" colorScheme="blue">
                Log in
              </Button>
            </RouterLink>
          </Text>
        </Center>
      </Stack>
    </Container>
  )
}

export default Signup