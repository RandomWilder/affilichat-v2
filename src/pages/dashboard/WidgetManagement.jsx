import React, { useState } from 'react';
import {
  Box, 
  Heading, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  Select,
  Switch,
  Text,
  Flex,
  SimpleGrid,
  Card,
  CardBody,
  Code,
  useClipboard,
  useToast,
  Divider,
  Alert,
  AlertIcon,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Slider,
  Badge
} from '@chakra-ui/react';

const WidgetManagement = () => {
  const toast = useToast();
  const [widgetSettings, setWidgetSettings] = useState({
    title: 'Chat with us',
    subtitle: 'We\'re here to help',
    primaryColor: '#3182ce',
    textColor: '#FFFFFF',
    position: 'bottom-right',
    initialMessage: 'Hi! How can I help you today?',
    autoOpen: false,
    showAvatar: true,
    mobileOptimized: true,
    height: 500
  });
  
  const widgetCode = `<script>
  (function(w,d,s,o,f,js,fjs){
    w['AffiliChat']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','affiliChat','https://affilichat.com/widget.js'));
  
  affiliChat('init', {
    widgetId: 'YOUR_WIDGET_ID',
    primaryColor: '${widgetSettings.primaryColor}',
    position: '${widgetSettings.position}',
    title: '${widgetSettings.title}',
    autoOpen: ${widgetSettings.autoOpen}
  });
</script>`;

  const { hasCopied, onCopy } = useClipboard(widgetCode);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWidgetSettings({
      ...widgetSettings,
      [name]: value
    });
  };

  const handleSwitchChange = (name) => {
    setWidgetSettings({
      ...widgetSettings,
      [name]: !widgetSettings[name]
    });
  };

  const handleSliderChange = (value) => {
    setWidgetSettings({
      ...widgetSettings,
      height: value
    });
  };

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your widget settings have been updated successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box padding={6}>
      <Heading mb={6}>Widget Management</Heading>
      
      <Tabs colorScheme="blue" mb={6}>
        <TabList>
          <Tab>Appearance</Tab>
          <Tab>Behavior</Tab>
          <Tab>Installation</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <VStack spacing={6} align="start">
                <Card w="100%">
                  <CardBody>
                    <Heading size="md" mb={4}>Text Settings</Heading>
                    <FormControl mb={4}>
                      <FormLabel>Widget Title</FormLabel>
                      <Input 
                        name="title"
                        value={widgetSettings.title}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                    
                    <FormControl mb={4}>
                      <FormLabel>Widget Subtitle</FormLabel>
                      <Input 
                        name="subtitle"
                        value={widgetSettings.subtitle}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Initial Message</FormLabel>
                      <Textarea 
                        name="initialMessage"
                        value={widgetSettings.initialMessage}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </CardBody>
                </Card>
                
                <Card w="100%">
                  <CardBody>
                    <Heading size="md" mb={4}>Color & Style</Heading>
                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl>
                        <FormLabel>Primary Color</FormLabel>
                        <Input 
                          type="color"
                          name="primaryColor"
                          value={widgetSettings.primaryColor}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Text Color</FormLabel>
                        <Input 
                          type="color"
                          name="textColor"
                          value={widgetSettings.textColor}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    </SimpleGrid>
                    
                    <FormControl mt={4}>
                      <FormLabel>Position</FormLabel>
                      <Select 
                        name="position"
                        value={widgetSettings.position}
                        onChange={handleInputChange}
                      >
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl mt={4}>
                      <FormLabel>Widget Height (px): {widgetSettings.height}</FormLabel>
                      <Slider 
                        defaultValue={widgetSettings.height} 
                        min={300} 
                        max={700} 
                        step={10}
                        onChange={handleSliderChange}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </FormControl>
                  </CardBody>
                </Card>
              </VStack>
              
              <Card h="fit-content">
                <CardBody>
                  <Heading size="md" mb={4}>Live Preview</Heading>
                  <Alert status="info" mb={4}>
                    <AlertIcon />
                    This is a simplified preview of how your widget will appear.
                  </Alert>
                  
                  <Box 
                    p={4} 
                    borderRadius="md" 
                    boxShadow="md" 
                    w="100%" 
                    h="400px"
                    border="1px solid"
                    borderColor="gray.200"
                    position="relative"
                    overflow="hidden"
                  >
                    <Flex 
                      bg={widgetSettings.primaryColor} 
                      color={widgetSettings.textColor}
                      p={3}
                      borderTopRadius="md"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Text fontWeight="bold">{widgetSettings.title}</Text>
                        <Text fontSize="sm">{widgetSettings.subtitle}</Text>
                      </Box>
                      <Box fontSize="lg">×</Box>
                    </Flex>
                    
                    <Box p={4} bg="gray.50" h="calc(100% - 70px)" overflowY="auto">
                      <Flex mb={4}>
                        {widgetSettings.showAvatar && (
                          <Box 
                            bg="gray.200" 
                            borderRadius="full" 
                            w="30px" 
                            h="30px" 
                            mr={2} 
                            fontSize="sm" 
                            display="flex" 
                            alignItems="center" 
                            justifyContent="center"
                          >
                            AI
                          </Box>
                        )}
                        <Box 
                          bg="white" 
                          p={2} 
                          borderRadius="md" 
                          boxShadow="sm"
                          maxW="80%"
                        >
                          {widgetSettings.initialMessage}
                        </Box>
                      </Flex>
                    </Box>
                    
                    <Flex 
                      p={3} 
                      borderTop="1px" 
                      borderColor="gray.200"
                      alignItems="center"
                    >
                      <Input placeholder="Type your message..." />
                      <Button 
                        ml={2} 
                        bg={widgetSettings.primaryColor} 
                        color={widgetSettings.textColor}
                        size="sm"
                      >
                        Send
                      </Button>
                    </Flex>
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Behavior Settings</Heading>
                  
                  <VStack spacing={4} align="start">
                    <FormControl display="flex" alignItems="center">
                      <Switch 
                        id="auto-open" 
                        isChecked={widgetSettings.autoOpen}
                        onChange={() => handleSwitchChange('autoOpen')}
                        mr={3}
                      />
                      <FormLabel htmlFor="auto-open" mb={0}>Auto-open widget on page load</FormLabel>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <Switch 
                        id="show-avatar" 
                        isChecked={widgetSettings.showAvatar}
                        onChange={() => handleSwitchChange('showAvatar')}
                        mr={3}
                      />
                      <FormLabel htmlFor="show-avatar" mb={0}>Show avatar in messages</FormLabel>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <Switch 
                        id="mobile-optimized" 
                        isChecked={widgetSettings.mobileOptimized}
                        onChange={() => handleSwitchChange('mobileOptimized')}
                        mr={3}
                      />
                      <FormLabel htmlFor="mobile-optimized" mb={0}>Optimize for mobile devices</FormLabel>
                    </FormControl>
                    
                    <Divider />
                    
                    <FormControl>
                      <FormLabel>Chat Timeout (minutes)</FormLabel>
                      <Select defaultValue={30}>
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={0}>No timeout</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Advanced Options</Heading>
                  
                  <VStack spacing={4} align="start">
                    <FormControl>
                      <FormLabel>Widget Visibility</FormLabel>
                      <Select defaultValue="all">
                        <option value="all">All Pages</option>
                        <option value="specific">Specific Pages Only</option>
                        <option value="exclude">Exclude Specific Pages</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Data Collection</FormLabel>
                      <Select defaultValue="essential">
                        <option value="essential">Essential Only</option>
                        <option value="standard">Standard (Recommended)</option>
                        <option value="extended">Extended Analytics</option>
                      </Select>
                    </FormControl>
                    
                    <Divider />
                    
                    <Box w="100%">
                      <Heading size="sm" mb={2}>Current Status</Heading>
                      <Flex justifyContent="space-between" width="100%">
                        <Text>Widget Status:</Text>
                        <Badge colorScheme="green">Active</Badge>
                      </Flex>
                      <Flex justifyContent="space-between" width="100%" mt={2}>
                        <Text>Last Updated:</Text>
                        <Text>May 8, 2024</Text>
                      </Flex>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          <TabPanel>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Widget Installation</Heading>
                
                <Alert status="info" mb={4}>
                  <AlertIcon />
                  Copy this code snippet and paste it before the closing &lt;/body&gt; tag on your website.
                </Alert>
                
                <Box bg="gray.50" p={4} borderRadius="md" mb={4} position="relative">
                  <Code display="block" whiteSpace="pre" overflowX="auto" p={4}>
                    {widgetCode}
                  </Code>
                  <Button 
                    position="absolute" 
                    top={4} 
                    right={4} 
                    size="sm" 
                    colorScheme="blue"
                    onClick={onCopy}
                  >
                    {hasCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </Box>
                
                <Alert status="warning">
                  <AlertIcon />
                  Remember to replace 'YOUR_WIDGET_ID' with your actual widget ID found in your account settings.
                </Alert>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Flex justifyContent="flex-end">
        <Button mr={3} variant="outline">Reset to Default</Button>
        <Button colorScheme="blue" onClick={handleSave}>Save Changes</Button>
      </Flex>
    </Box>
  );
};

export default WidgetManagement; 