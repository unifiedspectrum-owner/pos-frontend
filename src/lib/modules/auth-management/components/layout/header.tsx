"use client"

/* Libraries imports */
import React from 'react'
import { Flex, Heading, Text, HStack, Circle } from '@chakra-ui/react'
import { useRouter, usePathname } from '@/i18n/navigation'

/* Shared module imports */
import { DARK_COLOR, PRIMARY_COLOR } from '@shared/config'
import { AUTH_PAGE_ROUTES } from '@auth-management/constants'
import { PrimaryButton } from '@shared/components/form-elements/buttons'
import Link from 'next/link'

/* Header component for authentication interface */
const AuthHeader: React.FC = () => {
  const router = useRouter()
  const currentPath = usePathname()

  /* Navigation items */
  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' }
  ]
  
  /* Handle login */
  const handleLogin = () => {
    router.push(AUTH_PAGE_ROUTES.LOGIN)
  }

  /* Handle signup */
  const handleSignup = () => {
    router.push('/tenant/account/create')
  }

  return (
    <Flex 
      as="header" w="100%" px={8} py={4} bg="white"
      borderBottom="1px solid" borderColor="gray.200"
      alignItems="center" justifyContent="space-between" boxShadow="sm"
    >
      {/* Brand section with logo and name */}
      <Link href="/">
        <HStack
          gap={3}
          cursor="pointer"
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
      </Link>

      {/* Navigation menu */}
      <HStack gap={8} display={['none', 'flex']}>
        {navigationItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <Text
              fontSize="md"
              fontWeight="medium"
              color={currentPath === item.path ? PRIMARY_COLOR : DARK_COLOR}
              cursor="pointer"
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
          </Link>
        ))}
      </HStack>

      {/* Action buttons */}
      <HStack gap={4}>
        {/* Login action - only show if not on login page */}
        {currentPath !== AUTH_PAGE_ROUTES.LOGIN && (
          <PrimaryButton onClick={handleLogin}>
            Login
          </PrimaryButton>
        )}

        {/* Sign up action */}
        <PrimaryButton onClick={handleSignup}>
          Sign Up
        </PrimaryButton>
      </HStack>
    </Flex>
  )
}

export default AuthHeader