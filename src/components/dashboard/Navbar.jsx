import React from 'react'
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { FiMenu, FiBell, FiChevronDown } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ onOpen, ...rest }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }
  
  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        align={'center'}
        {...rest}
      >
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          variant="outline"
          aria-label="open menu"
          icon={<FiMenu />}
        />
        
        <Text
          display={{ base: 'flex', md: 'none' }}
          fontSize={'2xl'}
          fontWeight={'bold'}
        >
          AffiliChat
        </Text>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          {/* Notifications */}
          <IconButton
            size="lg"
            variant="ghost"
            aria-label="open notifications"
            icon={<FiBell />}
          />
          
          {/* User Menu */}
          <Menu>
            <MenuButton
              as={Button}
              rounded={'full'}
              variant={'link'}
              cursor={'pointer'}
              minW={0}
            >
              <Flex align="center">
                <Avatar
                  size={'sm'}
                  src={user?.photoURL}
                  name={user?.displayName || user?.email}
                />
                <Box ml={2} display={{ base: 'none', md: 'block' }}>
                  <FiChevronDown />
                </Box>
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuItem as="a" href="/dashboard/account">Profile</MenuItem>
              <MenuItem as="a" href="/dashboard/account">Settings</MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
            </MenuList>
          </Menu>
        </Stack>
      </Flex>
    </Box>
  )
}

export default Navbar