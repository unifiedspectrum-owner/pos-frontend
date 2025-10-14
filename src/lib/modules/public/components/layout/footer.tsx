"use client"

/* Libraries imports */
import React from 'react'
import { Flex, Text, VStack, Separator, Circle } from '@chakra-ui/react'
import Link from 'next/link'

/* Shared module imports */
import { PRIMARY_COLOR, DARK_COLOR } from '@shared/config'

/* Footer component for public pages */
const PublicFooter: React.FC = () => {

  return (
    <VStack
      as="footer"
      w="100%"
      py={8}
      px={6}
      bg={DARK_COLOR}
      borderTop="1px solid"
      borderColor="gray.600"
      gap={6}
    >
      <Separator />

      <Flex
        w="100%"
        direction={{ base: 'column', lg: 'row' }}
        justify={{ base: 'center', lg: 'space-between' }}
        align={{ base: 'center', lg: 'flex-start' }}
        gap={{ base: 6, lg: 4 }}
        pb={5}
        borderBottomWidth={1}
      >
        {/* Brand section */}
        <Flex align="center" gap={3} mb={{ base: 4, lg: 0 }} flex={{ lg: '0 0 auto' }}>
          <Circle
            size="40px"
            bg={PRIMARY_COLOR}
            color="white"
          >
            <Text fontSize="sm" fontWeight="bold">
              US
            </Text>
          </Circle>
          <VStack align="flex-start" gap={0}>
            <Text fontWeight="bold" fontSize="lg" color="white">
              Unified Spectrum
            </Text>
            <Text fontSize="sm" color="gray.300">
              Point of Sale System
            </Text>
          </VStack>
        </Flex>

        {/* Navigation section */}
        <Flex>
          <VStack align={{ base: 'center', md: 'flex-start' }} gap={3}>
            <Text fontWeight="semibold" color="white" fontSize="sm">
              Authentication
            </Text>
            <VStack align={{ base: 'center', md: 'flex-start' }} gap={2}>
              <Link href="/auth/login">
                <Text fontSize="sm" color="white" _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}>
                  Login
                </Text>
              </Link>
              <Link href="/auth/forgot-password">
                <Text fontSize="sm" color="white" _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}>
                  Forgot Password
                </Text>
              </Link>
              <Link href="/tenant/account/create">
                <Text fontSize="sm" color="white" _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}>
                  Create Account
                </Text>
              </Link>
            </VStack>
          </VStack>
        </Flex>

        {/* Support section */}
        <Flex>
          <VStack align={{ base: 'center', md: 'flex-start' }} gap={3}>
            <Text fontWeight="semibold" color="white" fontSize="sm">
              Support
            </Text>
            <VStack align={{ base: 'center', md: 'flex-start' }} gap={2}>
              <Link href="/support">
                <Text fontSize="sm" color="white" _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}>
                  Contact Support
                </Text>
              </Link>
              <Link href="/faq">
                <Text fontSize="sm" color="white" _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}>
                  FAQ
                </Text>
              </Link>
              <Link href="/help">
                <Text fontSize="sm" color="white" _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}>
                  Help Center
                </Text>
              </Link>
            </VStack>
          </VStack>
        </Flex>

        {/* Contact section */}
        <Flex>
          <VStack align={{ base: 'center', md: 'flex-start' }} gap={3}>
            <Text fontWeight="semibold" color="white" fontSize="sm">
              Contact
            </Text>
            <VStack align={{ base: 'center', md: 'flex-start' }} gap={2}>
              <Link href="mailto:support@posadmin.com">
                <Text fontSize="sm" color="white" _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}>
                  support@posadmin.com
                </Text>
              </Link>
              <Text fontSize="sm" color="white">
                +1 (555) 123-4567
              </Text>
              <Link href="/live-chat">
                <Text fontSize="sm" color="white" _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}>
                  Live Chat
                </Text>
              </Link>
            </VStack>
          </VStack>
        </Flex>
      </Flex>

      {/* Copyright notice */}
      <Text fontSize="sm" color="white" textAlign="center">
        © {new Date().getFullYear()} Unified Spectrum - Point of Sale System. All rights reserved.
      </Text>
    </VStack>
  )
}

export default PublicFooter
