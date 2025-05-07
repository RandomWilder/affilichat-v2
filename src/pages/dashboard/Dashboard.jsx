import React from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Card, CardBody, Text } from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box padding={6}>
      <Heading mb={6}>Dashboard</Heading>
      <Text mb={6}>Welcome back, {user?.displayName || 'User'}!</Text>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active Chats</StatLabel>
              <StatNumber>24</StatNumber>
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
              <StatLabel>Total Visitors</StatLabel>
              <StatNumber>345</StatNumber>
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
              <StatLabel>Conversion Rate</StatLabel>
              <StatNumber>5.2%</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                7%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Knowledge Base</StatLabel>
              <StatNumber>42</StatNumber>
              <StatHelpText>Documents indexed</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Recent Activity</Heading>
            <Text color="gray.500">No recent activity to display</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Quick Actions</Heading>
            <Text color="gray.500">No actions available</Text>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard; 