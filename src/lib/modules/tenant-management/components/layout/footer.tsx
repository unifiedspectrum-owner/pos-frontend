"use client"

/* Libraries imports */
import React from 'react'
import { Flex, Text, VStack, Link, Separator, Circle } from '@chakra-ui/react'

/* Shared module imports */
import { PRIMARY_COLOR, DARK_COLOR } from '@shared/config'

/* Footer component for tenant interface */
const Footer: React.FC = () => {

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
              Tenant Management System
            </Text>
          </VStack>
        </Flex>

        {/* Navigation section */}
        <Flex>
          <VStack align={{ base: 'center', md: 'flex-start' }} gap={3}>
            <Text fontWeight="semibold" color="white" fontSize="sm">
              Navigation
            </Text>
            <VStack align={{ base: 'center', md: 'flex-start' }} gap={2}>
              <Link
                href="/tenant/help"
                fontSize="sm"
                color="gray.300"
                _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}
              >
                Registration Help
              </Link>
              <Link
                href="/tenant/plans"
                fontSize="sm"
                color="gray.300"
                _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}
              >
                View Plans
              </Link>
              <Link
                href="/tenant/pricing"
                fontSize="sm"
                color="gray.300"
                _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}
              >
                Pricing
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
              <Link
                href="/support"
                fontSize="sm"
                color="gray.300"
                _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}
              >
                Contact Support
              </Link>
              <Link
                href="/faq"
                fontSize="sm"
                color="gray.300"
                _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}
              >
                FAQ
              </Link>
              <Link
                href="/documentation"
                fontSize="sm"
                color="gray.300"
                _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}
              >
                Documentation
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
              <Link
                href="mailto:support@posadmin.com"
                fontSize="sm"
                color="gray.300"
                _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}
              >
                support@posadmin.com
              </Link>
              <Text fontSize="sm" color="gray.300">
                +1 (555) 123-4567
              </Text>
              <Link
                href="/live-chat"
                fontSize="sm"
                color="gray.300"
                _hover={{ color: PRIMARY_COLOR, textDecoration: 'none' }}
              >
                Live Chat
              </Link>
            </VStack>
          </VStack>
        </Flex>
      </Flex>

      {/* Copyright notice */}
      <Text fontSize="sm" color="gray.400" textAlign="center">
        © {new Date().getFullYear()} Unified Spectrum - Tenant Management System. All rights reserved.
      </Text>
    </VStack>
  )
}

export default Footer