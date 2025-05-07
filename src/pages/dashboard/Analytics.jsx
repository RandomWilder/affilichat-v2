import React, { useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  HStack,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { FaRegCalendarAlt, FaDownload, FaChartLine, FaComments, FaUserFriends, FaExchangeAlt } from 'react-icons/fa';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('last7days');

  // Mock data for analytics
  const overviewStats = {
    totalChats: 125,
    activeUsers: 42,
    avgResponseTime: '1.8s',
    conversionRate: '4.7%'
  };

  const recentConversations = [
    { id: 1, user: 'Visitor 3842', messages: 8, duration: '12 min', date: 'May 8, 2024', status: 'Completed' },
    { id: 2, user: 'Visitor 3841', messages: 5, duration: '4 min', date: 'May 8, 2024', status: 'Completed' },
    { id: 3, user: 'Visitor 3840', messages: 12, duration: '15 min', date: 'May 7, 2024', status: 'Completed' },
    { id: 4, user: 'Visitor 3839', messages: 3, duration: '2 min', date: 'May 7, 2024', status: 'Abandoned' },
    { id: 5, user: 'Visitor 3838', messages: 7, duration: '9 min', date: 'May 6, 2024', status: 'Completed' }
  ];

  const topQuestions = [
    { id: 1, question: 'What are your prices?', count: 42 },
    { id: 2, question: 'Do you offer free shipping?', count: 37 },
    { id: 3, question: 'How can I track my order?', count: 31 },
    { id: 4, question: 'What is your return policy?', count: 28 },
    { id: 5, question: 'Do you ship internationally?', count: 24 }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <Box padding={6}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading>Analytics & Insights</Heading>
        
        <HStack spacing={4}>
          <Select 
            size="md" 
            maxW="200px"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          
          <Button leftIcon={<Icon as={FaRegCalendarAlt} />} variant="outline">
            Calendar
          </Button>
          
          <Button leftIcon={<Icon as={FaDownload} />} colorScheme="blue">
            Export
          </Button>
        </HStack>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Chats</StatLabel>
              <Flex alignItems="center">
                <Icon as={FaComments} boxSize={5} color="blue.500" mr={2} />
                <StatNumber>{overviewStats.totalChats}</StatNumber>
              </Flex>
              <StatHelpText>
                <StatArrow type="increase" />
                23%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active Users</StatLabel>
              <Flex alignItems="center">
                <Icon as={FaUserFriends} boxSize={5} color="green.500" mr={2} />
                <StatNumber>{overviewStats.activeUsers}</StatNumber>
              </Flex>
              <StatHelpText>
                <StatArrow type="increase" />
                12%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Avg. Response Time</StatLabel>
              <Flex alignItems="center">
                <Icon as={FaExchangeAlt} boxSize={5} color="purple.500" mr={2} />
                <StatNumber>{overviewStats.avgResponseTime}</StatNumber>
              </Flex>
              <StatHelpText>
                <StatArrow type="decrease" />
                14%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Conversion Rate</StatLabel>
              <Flex alignItems="center">
                <Icon as={FaChartLine} boxSize={5} color="orange.500" mr={2} />
                <StatNumber>{overviewStats.conversionRate}</StatNumber>
              </Flex>
              <StatHelpText>
                <StatArrow type="increase" />
                7%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      <Tabs colorScheme="blue" mb={8}>
        <TabList>
          <Tab>Conversations</Tab>
          <Tab>Popular Questions</Tab>
          <Tab>Performance</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Recent Conversations</Heading>
                
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Visitor ID</Th>
                        <Th isNumeric>Messages</Th>
                        <Th>Duration</Th>
                        <Th>Date</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentConversations.map(convo => (
                        <Tr key={convo.id}>
                          <Td>{convo.user}</Td>
                          <Td isNumeric>{convo.messages}</Td>
                          <Td>{convo.duration}</Td>
                          <Td>{convo.date}</Td>
                          <Td>
                            <Text
                              color={convo.status === 'Completed' ? 'green.500' : 'red.500'}
                              fontWeight="medium"
                            >
                              {convo.status}
                            </Text>
                          </Td>
                          <Td>
                            <Button size="sm" variant="ghost">View</Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel px={0}>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Top Questions</Heading>
                
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Question</Th>
                        <Th isNumeric>Count</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {topQuestions.map(item => (
                        <Tr key={item.id}>
                          <Td>{item.question}</Td>
                          <Td isNumeric>{item.count}</Td>
                          <Td>
                            <Button size="sm" variant="ghost">Add to FAQ</Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Response Time</Heading>
                  <Text color="gray.500">Chart placeholder - Will show average response time by day</Text>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Usage by Time</Heading>
                  <Text color="gray.500">Chart placeholder - Will show chat volume by hour of day</Text>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Chat Duration</Heading>
                  <Text color="gray.500">Chart placeholder - Will show distribution of chat durations</Text>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>User Satisfaction</Heading>
                  <Text color="gray.500">Chart placeholder - Will show user ratings over time</Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Analytics; 