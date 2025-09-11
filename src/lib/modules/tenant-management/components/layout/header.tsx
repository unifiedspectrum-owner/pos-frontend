"use client"

/* Libraries imports */
import React from 'react'
import { Flex, Heading, Button, Text, HStack, Circle } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'
import { lighten } from 'polished'

/* Shared module imports */
import { DARK_COLOR, PRIMARY_COLOR } from '@shared/config'

/* Header component props */
export interface HeaderProps {
  currentPath?: string
}

/* Header component for tenant interface */
const Header: React.FC<HeaderProps> = ({ currentPath }) => {
  const router = useRouter()

  /* Navigation items */
  const navigationItems = [
    { label: 'Features', path: '/features' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ]

  /* Handle navigation */
  const handleNavigation = (path: string) => {
    router.push(path)
  }

  /* Handle signup */
  const handleSignup = () => {
    router.push('/tenant/account/create')
  }

  /* Handle get demo */
  const handleGetDemo = () => {
    router.push('/demo')
  }

  return (
    <Flex
      as="header"
      w="100%"
      px={8}
      py={4}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      align="center"
      justify="space-between"
      boxShadow="sm"
    >
      {/* Brand section with logo and name */}
      <HStack 
        gap={3} 
        cursor="pointer"
        onClick={() => handleNavigation('/')}
        _hover={{
          '& .brand-text': { color: PRIMARY_COLOR },
          '& .brand-icon': { bg: PRIMARY_COLOR }
        }}
      >
        {/* Company logo */}
        <Circle
          size="40px"
          bg={PRIMARY_COLOR}
          color="white"
          className="brand-icon"
          transition="background-color 0.2s"
        >
          <Text fontSize="sm" fontWeight="bold">
            US
          </Text>
        </Circle>
        
        {/* Company name */}
        <Heading
          as="h1"
          size="lg"
          color={PRIMARY_COLOR}
          fontWeight="bold"
          className="brand-text"
          transition="color 0.2s"
        >
          Unified Spectrum
        </Heading>
      </HStack>

      {/* Navigation menu */}
      <HStack gap={8} display={{ base: 'none', md: 'flex' }}>
        {navigationItems.map((item) => (
          <Text
            key={item.path}
            fontSize="md"
            fontWeight="medium"
            color={currentPath === item.path ? PRIMARY_COLOR : DARK_COLOR}
            cursor="pointer"
            onClick={() => handleNavigation(item.path)}
            _hover={{
              color: PRIMARY_COLOR,
              textDecoration: 'none',
              fontSize: 'lg',
              fontWeight: 'semibold'
            }}
            transition="all 0.2s ease"
          >
            {item.label}
          </Text>
        ))}
      </HStack>

      {/* Action buttons */}
      <HStack gap={4}>
        {/* Sign up action */}
        <Button
          onClick={handleSignup}
          variant="outline"
          borderColor={PRIMARY_COLOR}
          color={PRIMARY_COLOR}
          borderRadius="24px"
          _hover={{
            bg: lighten(0.9, PRIMARY_COLOR),
            borderColor: PRIMARY_COLOR
          }}
          size="md"
          fontSize="sm"
          fontWeight="medium"
          px={6}
        >
          Sign Up
        </Button>

        {/* Demo request action */}
        <Button
          onClick={handleGetDemo}
          bg={PRIMARY_COLOR}
          color="white"
          borderRadius="24px"
          _hover={{
            bg: lighten(-0.1, PRIMARY_COLOR),
            transform: 'translateY(-1px)',
            boxShadow: 'lg'
          }}
          _active={{
            bg: PRIMARY_COLOR,
            transform: 'translateY(0)'
          }}
          size="md"
          fontSize="sm"
          fontWeight="medium"
          px={6}
          transition="all 0.2s"
          boxShadow="0 0 20px rgba(66, 153, 225, 0.3)"
        >
          Get Demo
        </Button>
      </HStack>
    </Flex>
  )
}

export default Header