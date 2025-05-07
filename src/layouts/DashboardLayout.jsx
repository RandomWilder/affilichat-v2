import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { 
  Box, 
  Flex, 
  Icon, 
  IconButton, 
  CloseButton,
  useDisclosure,
  Drawer,
  DrawerContent,
  useColorModeValue
} from '@chakra-ui/react'
import { FiMenu } from 'react-icons/fi'

import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'

const DashboardLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Sidebar for desktop */}
      <Sidebar
        display={{ base: 'none', md: 'block' }}
        onClose={() => onClose}
      />
      
      {/* Drawer for mobile */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        size="full"
      >
        <DrawerContent>
          <Sidebar onClose={onClose} />
        </DrawerContent>
      </Drawer>
      
      {/* Content area */}
      <Box ml={{ base: 0, md: 60 }} p="4">
        {/* Navbar */}
        <Navbar onOpen={onOpen} />
        
        {/* Main content */}
        <Box pt={8} pb={20}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardLayout