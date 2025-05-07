import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  Select,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Divider,
  Badge,
  Flex,
  Switch,
  FormHelperText,
  useToast
} from '@chakra-ui/react';

const PersonaConfig = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: 'Default Assistant',
    description: 'A helpful assistant for your website visitors',
    tone: 'professional',
    language: 'en',
    expertise: 'general',
    promptTemplate: 'You are {name}, a helpful assistant for {website}. You specialize in {expertise} and speak in a {tone} tone.'
  });
  
  const [isActive, setIsActive] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate saving
    setTimeout(() => {
      toast({
        title: 'Persona saved',
        description: 'Your assistant persona has been updated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 1000);
  };

  // Generate the prompt with variables replaced
  const generatePrompt = () => {
    let prompt = formData.promptTemplate;
    prompt = prompt.replace(/{name}/g, formData.name);
    prompt = prompt.replace(/{website}/g, 'YourWebsite.com');
    prompt = prompt.replace(/{expertise}/g, formData.expertise);
    prompt = prompt.replace(/{tone}/g, formData.tone);
    return prompt;
  };

  return (
    <Box padding={6}>
      <Heading mb={6}>Persona Configuration</Heading>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <VStack as="form" onSubmit={handleSubmit} spacing={6} align="start">
          <Card w="100%">
            <CardBody>
              <Heading size="md" mb={4}>Basic Information</Heading>
              <VStack spacing={4} align="start">
                <HStack w="100%" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Persona Name</FormLabel>
                    <Input 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="My Assistant"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Flex align="center">
                      <Switch 
                        colorScheme="green" 
                        isChecked={isActive} 
                        onChange={() => setIsActive(!isActive)}
                        mr={3}
                      />
                      <Badge colorScheme={isActive ? 'green' : 'gray'}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Flex>
                  </FormControl>
                </HStack>
                
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your assistant persona"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
          
          <Card w="100%">
            <CardBody>
              <Heading size="md" mb={4}>Personality Settings</Heading>
              <VStack spacing={4} align="start">
                <HStack w="100%" spacing={4}>
                  <FormControl>
                    <FormLabel>Tone</FormLabel>
                    <Select 
                      name="tone" 
                      value={formData.tone}
                      onChange={handleInputChange}
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="enthusiastic">Enthusiastic</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Language</FormLabel>
                    <Select 
                      name="language" 
                      value={formData.language}
                      onChange={handleInputChange}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="he">Hebrew</option>
                    </Select>
                  </FormControl>
                </HStack>
                
                <FormControl>
                  <FormLabel>Expertise</FormLabel>
                  <Select 
                    name="expertise" 
                    value={formData.expertise}
                    onChange={handleInputChange}
                  >
                    <option value="general">General Knowledge</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="support">Customer Support</option>
                    <option value="technical">Technical</option>
                    <option value="wellness">Health & Wellness</option>
                  </Select>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
          
          <Card w="100%">
            <CardBody>
              <Heading size="md" mb={4}>Advanced Settings</Heading>
              <FormControl>
                <FormLabel>Prompt Template</FormLabel>
                <Textarea
                  name="promptTemplate"
                  value={formData.promptTemplate}
                  onChange={handleInputChange}
                  placeholder="Enter custom prompt template"
                  rows={5}
                />
                <FormHelperText>
                  Use variables like {"{name}"}, {"{website}"}, {"{tone}"}, and {"{expertise}"} to customize your prompt.
                </FormHelperText>
              </FormControl>
            </CardBody>
          </Card>
          
          <Button type="submit" colorScheme="blue" size="lg">
            Save Changes
          </Button>
        </VStack>
        
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Preview</Heading>
            <Divider mb={4} />
            
            <VStack spacing={4} align="start">
              <Box>
                <Heading size="sm">Name</Heading>
                <Text>{formData.name}</Text>
              </Box>
              
              <Box>
                <Heading size="sm">Description</Heading>
                <Text>{formData.description}</Text>
              </Box>
              
              <SimpleGrid columns={2} spacing={4} width="100%">
                <Box>
                  <Heading size="sm">Tone</Heading>
                  <Badge>{formData.tone}</Badge>
                </Box>
                
                <Box>
                  <Heading size="sm">Language</Heading>
                  <Badge>{formData.language === 'en' ? 'English' : 
                         formData.language === 'es' ? 'Spanish' : 
                         formData.language === 'fr' ? 'French' : 
                         formData.language === 'de' ? 'German' : 
                         formData.language === 'he' ? 'Hebrew' : 
                         formData.language}</Badge>
                </Box>
                
                <Box>
                  <Heading size="sm">Expertise</Heading>
                  <Badge>{formData.expertise}</Badge>
                </Box>
                
                <Box>
                  <Heading size="sm">Status</Heading>
                  <Badge colorScheme={isActive ? 'green' : 'gray'}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Box>
              </SimpleGrid>
              
              <Box width="100%">
                <Heading size="sm">Generated Prompt</Heading>
                <Card mt={2} variant="outline">
                  <CardBody>
                    <Text>
                      {generatePrompt()}
                    </Text>
                  </CardBody>
                </Card>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default PersonaConfig; 