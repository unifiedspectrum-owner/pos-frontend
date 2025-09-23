'use client';

/* Libraries imports */
import React from 'react';
import { useRouter } from 'next/navigation';
import { Flex, Box, VStack, Text, HStack, Icon } from '@chakra-ui/react';
import { FiLock, FiHome, FiArrowLeft } from 'react-icons/fi';

/* Shared module imports */
import { ERROR_RED_COLOR, GRAY_COLOR, DARK_COLOR } from '@shared/config';
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements/buttons';
import { HeaderSection } from '@shared/components/common';
import { usePermissions } from '@shared/contexts';
import { ADMIN_PAGE_ROUTES } from '@shared/constants';

/* Forbidden page component props */
interface ForbiddenPageProps {
  module?: string;
  permission?: string;
  customMessage?: string;
}

/* 403 Forbidden page component */
export const ForbiddenPage = ({
  module,
  permission,
  customMessage
}: ForbiddenPageProps) => {
  const router = useRouter();
  const { refreshPermissions } = usePermissions();

  /* Navigate back to previous page */
  const handleGoBack = () => {
    router.back();
  };

  /* Navigate to dashboard/home */
  const handleGoHome = () => {
    router.push(ADMIN_PAGE_ROUTES.TENANT_MANAGEMENT.HOME);
  };

  /* Handle refresh - reload permissions and stay on current page */
  const handleRefresh = async () => {
    await refreshPermissions();
    console.log('[ForbiddenPage] Permissions refreshed');
  };

  return (
    <Flex w={'100%'} flexDir={'column'}>
      {/* Header section following module page pattern */}
      <HeaderSection
        translation={'AccessForbidden'}
        loading={false}
        handleRefresh={handleRefresh}
        showAddButton={false}
      />

      {/* Main content area like normal module pages */}
      <Flex p={3} w={'100%'} justify="center" align="center" >
        <Flex w={'100%'} justifyContent={'center'} alignItems={'center'} p={5} borderWidth={1} borderColor={GRAY_COLOR} borderRadius={'lg'}>
          <VStack gap={4} textAlign="center" maxW="500px">
            {/* Access Denied Icon */}
            <Box
              p={6}
              borderRadius="full"
              bg="red.50"
              border="2px solid"
              borderColor="red.200"
            >
              <Icon as={FiLock} boxSize="48px" color={ERROR_RED_COLOR} />
            </Box>

            {/* Main Message */}
            <VStack gap={2}>
              <Text
                fontSize="3xl"
                fontWeight="bold"
                color={DARK_COLOR}
              >
                Access Restricted
              </Text>

              <Text
                fontSize="lg"
                color={GRAY_COLOR}
                lineHeight="tall"
              >
                {customMessage || (
                  module && permission
                    ? `You need ${permission} permission to access the ${module.replace('-', ' ')} module.`
                    : module
                    ? `You don't have access to the ${module} module.`
                    : "You don't have permission to view this page."
                )}
              </Text>

              <Text fontSize="md" color="gray.500">
                Contact your administrator for access or return to the dashboard.
              </Text>
            </VStack>

            {/* Action Buttons */}
            <HStack gap={2} >
              <SecondaryButton
                onClick={handleGoBack}
                leftIcon={FiArrowLeft}
                size="lg"
              >
                Go Back
              </SecondaryButton>
              <PrimaryButton
                onClick={handleGoHome}
                leftIcon={FiHome}
                size="lg"
              >
                Go to Dashboard
              </PrimaryButton>
            </HStack>

            {/* Access Details - if provided */}
            {(module || permission) && (
              <Box
                mt={6}
                p={4}
                bg="gray.50"
                borderRadius="lg"
                w="100%"
                border="1px solid"
                borderColor="gray.200"
              >
                <Text fontWeight="bold" mb={2} color={DARK_COLOR} fontSize="sm">
                  Required Access:
                </Text>
                {module && (
                  <Flex justifyContent={'center'} gap={2} alignItems={'center'}>
                    <Text fontSize="sm" fontWeight={'bold'} color={GRAY_COLOR}>Module:</Text>
                    <Text as="span" fontWeight="medium" textTransform={'capitalize'} color={DARK_COLOR}>{module.replace('-', ' ')}</Text>
                  </Flex>
                )}
                {permission && (
                  <Flex justifyContent={'center'} gap={2} alignItems={'center'}>
                    <Text fontSize="sm" fontWeight={'bold'} color={GRAY_COLOR}>Permission:</Text>
                    <Text as="span" fontWeight="medium" color={DARK_COLOR}>{permission}</Text>
                  </Flex>
                )}
              </Box>
            )}
          </VStack>
        </Flex>
      </Flex>
    </Flex>
  );
};