import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  HStack,
  Avatar,
  Text,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  Select,
  useToast,
  Badge,
  Link,
  Flex,
  Icon,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FaUserCircle, FaKey, FaShieldAlt, FaCreditCard } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const Account = () => {
  const toast = useToast();
  const { user } = useAuth();
  
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    company: '',
    jobTitle: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };
  
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been updated successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    toast({
      title: 'Password updated',
      description: 'Your password has been updated successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <Box padding={6}>
      <Heading mb={6}>Account Settings</Heading>
      
      <Tabs colorScheme="blue" mb={8}>
        <TabList>
          <Tab><Icon as={FaUserCircle} mr={2} /> Profile</Tab>
          <Tab><Icon as={FaKey} mr={2} /> Security</Tab>
          <Tab><Icon as={FaCreditCard} mr={2} /> Billing</Tab>
          <Tab><Icon as={FaShieldAlt} mr={2} /> API</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              <VStack as="form" onSubmit={handleProfileSubmit} spacing={6} align="start" gridColumn="span 2">
                <Card w="100%">
                  <CardBody>
                    <Heading size="md" mb={4}>Personal Information</Heading>
                    
                    <VStack spacing={4} align="start">
                      <HStack w="100%" spacing={6} align="start">
                        <Box>
                          <Avatar 
                            size="xl" 
                            name={profileForm.displayName || 'User'} 
                            src={user?.photoURL}
                            mb={2}
                          />
                          <Button size="sm" variant="outline">
                            Change Photo
                          </Button>
                        </Box>
                        
                        <VStack spacing={4} align="start" flex={1}>
                          <FormControl isRequired>
                            <FormLabel>Display Name</FormLabel>
                            <Input 
                              name="displayName"
                              value={profileForm.displayName}
                              onChange={handleProfileChange}
                            />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Email</FormLabel>
                            <Input 
                              name="email"
                              value={profileForm.email}
                              onChange={handleProfileChange}
                              isReadOnly
                              bg="gray.50"
                            />
                          </FormControl>
                        </VStack>
                      </HStack>
                      
                      <HStack w="100%" spacing={4}>
                        <FormControl>
                          <FormLabel>Phone Number</FormLabel>
                          <Input 
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            placeholder="(123) 456-7890"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Company</FormLabel>
                          <Input 
                            name="company"
                            value={profileForm.company}
                            onChange={handleProfileChange}
                            placeholder="Your company name"
                          />
                        </FormControl>
                      </HStack>
                      
                      <FormControl>
                        <FormLabel>Job Title</FormLabel>
                        <Input 
                          name="jobTitle"
                          value={profileForm.jobTitle}
                          onChange={handleProfileChange}
                          placeholder="Your job title"
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card w="100%">
                  <CardBody>
                    <Heading size="md" mb={4}>Preferences</Heading>
                    
                    <VStack spacing={4} align="start">
                      <FormControl display="flex" alignItems="center">
                        <Switch id="email-notifications" defaultChecked mr={3} />
                        <FormLabel htmlFor="email-notifications" mb={0}>
                          Email Notifications
                        </FormLabel>
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <Switch id="activity-digest" defaultChecked mr={3} />
                        <FormLabel htmlFor="activity-digest" mb={0}>
                          Weekly Activity Digest
                        </FormLabel>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Interface Language</FormLabel>
                        <Select defaultValue="en">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="he">Hebrew</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Timezone</FormLabel>
                        <Select defaultValue="UTC+0">
                          <option value="UTC-8">Pacific Time (UTC-8)</option>
                          <option value="UTC-5">Eastern Time (UTC-5)</option>
                          <option value="UTC+0">UTC+0</option>
                          <option value="UTC+1">Central European Time (UTC+1)</option>
                          <option value="UTC+2">Eastern European Time (UTC+2)</option>
                          <option value="UTC+3">Israel Standard Time (UTC+3)</option>
                        </Select>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
                
                <HStack spacing={4}>
                  <Button type="submit" colorScheme="blue">
                    Save Changes
                  </Button>
                  <Button variant="outline">
                    Cancel
                  </Button>
                </HStack>
              </VStack>
              
              <Card h="fit-content">
                <CardBody>
                  <Heading size="md" mb={4}>Account Info</Heading>
                  <Divider mb={4} />
                  
                  <VStack spacing={4} align="start">
                    <Box>
                      <Text fontWeight="medium" color="gray.500">Account Type</Text>
                      <Flex align="center" mt={1}>
                        <Badge colorScheme="blue" mr={2}>Professional</Badge>
                        <Link color="blue.500" fontSize="sm">Upgrade</Link>
                      </Flex>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="medium" color="gray.500">Account ID</Text>
                      <Text>{user?.uid?.substring(0, 12) || 'USR-123456789'}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="medium" color="gray.500">Member Since</Text>
                      <Text>May 1, 2024</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="medium" color="gray.500">Last Login</Text>
                      <Text>May 8, 2024</Text>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Heading size="sm" mb={2}>Usage</Heading>
                      <HStack spacing={4}>
                        <Box>
                          <Text fontWeight="medium" color="gray.500">API Calls</Text>
                          <Text>458 / 1,000</Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="medium" color="gray.500">Storage</Text>
                          <Text>25MB / 50MB</Text>
                        </Box>
                      </HStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              <Card gridColumn="span 2">
                <CardBody>
                  <Heading size="md" mb={4}>Change Password</Heading>
                  
                  <VStack as="form" onSubmit={handlePasswordSubmit} spacing={4} align="start">
                    <FormControl isRequired>
                      <FormLabel>Current Password</FormLabel>
                      <Input 
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                      />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>New Password</FormLabel>
                      <Input 
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                      />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Confirm New Password</FormLabel>
                      <Input 
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                    </FormControl>
                    
                    <HStack spacing={4} pt={4}>
                      <Button type="submit" colorScheme="blue">
                        Update Password
                      </Button>
                      <Button variant="outline">
                        Cancel
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
              
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Two-Factor Authentication</Heading>
                    
                    <FormControl display="flex" alignItems="center" mb={4}>
                      <Switch id="2fa" mr={3} />
                      <FormLabel htmlFor="2fa" mb={0}>
                        Enable 2FA
                      </FormLabel>
                    </FormControl>
                    
                    <Text fontSize="sm" color="gray.500">
                      Secure your account with two-factor authentication. 
                      When enabled, you'll be required to provide a verification 
                      code in addition to your password.
                    </Text>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Login Sessions</Heading>
                    
                    <VStack spacing={3} align="start">
                      <Flex w="100%" justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="medium">Current Session</Text>
                          <Text fontSize="sm" color="gray.500">Windows 10 · Chrome</Text>
                        </Box>
                        <Badge colorScheme="green">Active</Badge>
                      </Flex>
                      
                      <Divider />
                      
                      <Box w="100%">
                        <Button size="sm" colorScheme="red" variant="outline">
                          Sign Out All Other Sessions
                        </Button>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </SimpleGrid>
          </TabPanel>
          
          <TabPanel px={0}>
            <Card mb={6}>
              <CardBody>
                <Heading size="md" mb={4}>Billing Information</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <VStack align="start" spacing={4}>
                    <Heading size="sm">Current Plan</Heading>
                    <Box>
                      <Badge colorScheme="blue" mb={2}>Professional</Badge>
                      <Text>$49/month</Text>
                      <Text fontSize="sm" color="gray.500">Billed monthly</Text>
                    </Box>
                    
                    <HStack spacing={4}>
                      <Button colorScheme="blue" variant="outline">Upgrade Plan</Button>
                      <Button variant="ghost" color="red.500">Cancel Subscription</Button>
                    </HStack>
                  </VStack>
                  
                  <VStack align="start" spacing={4}>
                    <Heading size="sm">Next Payment</Heading>
                    <Box>
                      <Text>June 8, 2024</Text>
                      <Text fontWeight="bold">$49.00</Text>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">Payment Method</Text>
                      <Text>Visa ending in 4242</Text>
                      <Link color="blue.500" fontSize="sm">Update</Link>
                    </Box>
                  </VStack>
                </SimpleGrid>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Billing History</Heading>
                
                <Alert status="info" mb={4}>
                  <AlertIcon />
                  Your invoices are sent via email when payments are processed.
                </Alert>
                
                <Box overflowX="auto">
                  <Text color="gray.500">No billing history available yet.</Text>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel px={0}>
            <Card mb={6}>
              <CardBody>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">API Keys</Heading>
                  <Button colorScheme="blue" size="sm">Generate New Key</Button>
                </Flex>
                
                <Alert status="warning" mb={4}>
                  <AlertIcon />
                  API keys grant access to your account and should be kept secure. Never share your API keys in public repositories or client-side code.
                </Alert>
                
                <Box overflowX="auto">
                  <Text color="gray.500">No API keys generated yet.</Text>
                </Box>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Webhooks</Heading>
                
                <Text color="gray.500" mb={4}>
                  Webhooks allow you to receive real-time notifications when certain events occur in your AffiliChat account.
                </Text>
                
                <Button colorScheme="blue" variant="outline" size="sm">
                  Configure Webhooks
                </Button>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Account; 