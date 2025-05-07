import React from 'react'
import { 
  Box, 
  CloseButton, 
  Flex, 
  Icon, 
  Text, 
  useColorModeValue, 
  Link,
  Image
} from '@chakra-ui/react'
import { NavLink as RouterLink } from 'react-router-dom'
import { 
  FiHome, 
  FiDatabase, 
  FiUser, 
  FiSettings, 
  FiBarChart2, 
  FiMessageSquare 
} from 'react-icons/fi'

// Navigation items for the sidebar
const navItems = [
  { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
  { name: 'Knowledge Base', icon: FiDatabase, path: '/dashboard/knowledge-base' },
  { name: 'Persona Config', icon: FiUser, path: '/dashboard/persona-config' },
  { name: 'Widget Management', icon: FiMessageSquare, path: '/dashboard/widget-management' },
  { name: 'Analytics', icon: FiBarChart2, path: '/dashboard/analytics' },
  { name: 'Account', icon: FiSettings, path: '/dashboard/account' },
]

const Sidebar = ({ onClose, ...rest }) => {
  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          AffiliChat
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      
      {/* Navigation Links */}
      {navItems.map((navItem) => (
        <NavItem 
          key={navItem.name} 
          icon={navItem.icon} 
          path={navItem.path}
        >
          {navItem.name}
        </NavItem>
      ))}
    </Box>
  )
}

// Individual navigation item component
const NavItem = ({ icon, children, path, ...rest }) => {
  return (
    <Link
      as={RouterLink}
      to={path}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      {({ isActive }) => (
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? 'brand.50' : 'transparent'}
          color={isActive ? 'brand.700' : 'inherit'}
          fontWeight={isActive ? 'medium' : 'normal'}
          _hover={{
            bg: 'brand.50',
          }}
          {...rest}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              as={icon}
            />
          )}
          {children}
        </Flex>
      )}
    </Link>
  )
}

export default Sidebar