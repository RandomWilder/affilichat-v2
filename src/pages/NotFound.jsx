import React from 'react'
import { Box, Heading, Text, Button, Center, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

const NotFound = () => {
  return (
    <Center h="100vh" w="100%">
      <VStack spacing={6} align="center" p={8}>
        <Heading size="4xl">404</Heading>
        <Heading size="xl">Page Not Found</Heading>
        <Text fontSize="lg" textAlign="center">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Box pt={4}>
          <Button
            as={RouterLink}
            to="/"
            colorScheme="blue"
            size="lg"
          >
            Return to Homepage
          </Button>
        </Box>
      </VStack>
    </Center>
  )
}

export default NotFound