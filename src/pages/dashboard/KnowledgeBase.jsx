import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  Button, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Input, 
  InputGroup,
  InputLeftElement,
  Flex,
  Select,
  Text,
  Icon,
  Card,
  CardBody,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { FaFileAlt, FaExternalLinkAlt } from 'react-icons/fa';

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for knowledge base documents
  const mockDocuments = [
    { id: 1, name: 'Product Description', type: 'Web Page', status: 'Indexed', url: 'https://example.com/products', lastUpdated: '2024-05-08' },
    { id: 2, name: 'Pricing Information', type: 'Web Page', status: 'Indexed', url: 'https://example.com/pricing', lastUpdated: '2024-05-07' },
    { id: 3, name: 'FAQ', type: 'Web Page', status: 'Indexed', url: 'https://example.com/faq', lastUpdated: '2024-05-06' },
    { id: 4, name: 'Terms of Service', type: 'Web Page', status: 'Pending', url: 'https://example.com/terms', lastUpdated: '2024-05-05' },
  ];
  
  const filteredDocuments = mockDocuments.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box padding={6}>
      <Heading mb={6}>Knowledge Base</Heading>
      
      <Alert status="info" mb={6}>
        <AlertIcon />
        Your knowledge base helps train your affiliate chat AI with relevant content.
      </Alert>

      <Card mb={6}>
        <CardBody>
          <Heading size="md" mb={4}>Add Content</Heading>
          <Text mb={4}>Import web pages, documents, or FAQs to enhance your chat assistant's knowledge.</Text>
          <Flex gap={4} flexWrap="wrap">
            <Button leftIcon={<AddIcon />} colorScheme="blue">Add Website URL</Button>
            <Button leftIcon={<Icon as={FaFileAlt} />} colorScheme="blue" variant="outline">Upload Documents</Button>
          </Flex>
        </CardBody>
      </Card>
      
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Documents ({filteredDocuments.length})</Heading>
        <Flex gap={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search documents" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Select placeholder="All Status" maxW="150px">
            <option value="indexed">Indexed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Select>
        </Flex>
      </Flex>
      
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>URL</Th>
              <Th>Last Updated</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map(doc => (
                <Tr key={doc.id}>
                  <Td>{doc.name}</Td>
                  <Td>{doc.type}</Td>
                  <Td>{doc.status}</Td>
                  <Td>
                    <Flex alignItems="center" gap={2}>
                      <Text noOfLines={1} maxW="200px">{doc.url}</Text>
                      <Icon as={FaExternalLinkAlt} color="blue.500" boxSize="12px" cursor="pointer" />
                    </Flex>
                  </Td>
                  <Td>{doc.lastUpdated}</Td>
                  <Td>
                    <Button size="sm" colorScheme="blue" variant="ghost">Update</Button>
                    <Button size="sm" colorScheme="red" variant="ghost" ml={2}>Remove</Button>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} textAlign="center">No documents found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default KnowledgeBase; 