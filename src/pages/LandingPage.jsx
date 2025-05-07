import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack,
  Flex,
  Image,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LandingPage = () => {
  const { user } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const buttonColorScheme = 'blue';
  
  return (
    <Box>
      {/* Navigation */}
      <Box as="nav" bg={useColorModeValue('white', 'gray.800')} py={4} shadow="sm">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="lg">AffiliChat</Heading>
            <HStack spacing={4}>
              {user ? (
                <Button 
                  as={RouterLink} 
                  to="/dashboard" 
                  colorScheme={buttonColorScheme}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    as={RouterLink} 
                    to="/login" 
                    variant="ghost"
                  >
                    Log In
                  </Button>
                  <Button 
                    as={RouterLink} 
                    to="/signup" 
                    colorScheme={buttonColorScheme}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>
      
      {/* Hero Section */}
      <Box bg={bgColor} py={20}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="center" textAlign="center">
            <Heading size="2xl">
              AI-Powered Conversion Assistant
            </Heading>
            <Text fontSize="xl" maxW="container.md">
              Enhance your website with intelligent crawling and conversation capabilities. 
              Connect with your audience through personalized AI chat to increase conversions.
            </Text>
            <Button 
              as={RouterLink} 
              to={user ? "/dashboard" : "/signup"} 
              size="lg" 
              colorScheme={buttonColorScheme}
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </Button>
          </VStack>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Heading textAlign="center">Key Features</Heading>
            
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              gap={8} 
              justify="center"
              align="stretch"
            >
              {/* Feature 1 */}
              <Box 
                p={8} 
                shadow="md" 
                borderRadius="lg" 
                bg={useColorModeValue('white', 'gray.700')}
                flex="1"
              >
                <VStack spacing={4} align="flex-start">
                  <Heading size="md">Intelligent Crawling</Heading>
                  <Text>
                    Automatically crawl and index your website content for relevant information retrieval.
                  </Text>
                </VStack>
              </Box>
              
              {/* Feature 2 */}
              <Box 
                p={8} 
                shadow="md" 
                borderRadius="lg" 
                bg={useColorModeValue('white', 'gray.700')}
                flex="1"
              >
                <VStack spacing={4} align="flex-start">
                  <Heading size="md">Personalized Chat</Heading>
                  <Text>
                    Talk to an AI assistant that understands your website content and can answer visitor questions.
                  </Text>
                </VStack>
              </Box>
              
              {/* Feature 3 */}
              <Box 
                p={8} 
                shadow="md" 
                borderRadius="lg" 
                bg={useColorModeValue('white', 'gray.700')}
                flex="1"
              >
                <VStack spacing={4} align="flex-start">
                  <Heading size="md">Multilingual Support</Heading>
                  <Text>
                    Full support for RTL languages including Hebrew for global audience reach.
                  </Text>
                </VStack>
              </Box>
            </Flex>
          </VStack>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box bg={useColorModeValue('gray.100', 'gray.800')} py={10}>
        <Container maxW="container.xl">
          <VStack spacing={4}>
            <Text>&copy; {new Date().getFullYear()} AffiliChat. All rights reserved.</Text>
            <HStack spacing={6}>
              <Text as="a" href="#" fontWeight="medium">Terms of Service</Text>
              <Text as="a" href="#" fontWeight="medium">Privacy Policy</Text>
              <Text as="a" href="#" fontWeight="medium">Contact</Text>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;