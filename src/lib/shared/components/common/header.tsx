"use client"

/* React and external library imports */
import React from 'react';
import { Flex, Heading, Button, Text, HStack, VStack, Breadcrumb, Menu, Portal } from '@chakra-ui/react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { lighten } from 'polished';
import { FiPlus, FiRefreshCw, FiGlobe, FiChevronDown } from 'react-icons/fi';

/* Shared module imports */
import { GRAY_COLOR, PRIMARY_COLOR } from '@shared/config';
import { generateBreadcrumbs } from '@shared/components/common/bread-crumbs';

/* Props for admin header section */
export interface AdminHeaderProps {
  loading: boolean; /* Whether content is loading */
  handleAdd: () => void; /* Add new item handler */
  handleRefresh: () => void; /* Refresh content handler */
}

/* Header section component with breadcrumbs and actions */
const HeaderSection: React.FC<AdminHeaderProps> = ({loading, handleAdd, handleRefresh}) => {
  /* Get current pathname for breadcrumb generation */
  const pathName = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathName);
  const t = useTranslations('PlanManagement');
  const locale = useLocale();
  const router = useRouter();

  /* Language options */
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文'},
    { code: 'es', name: 'Español'}
  ];

  /* Handle language change */
  const handleLanguageChange = (newLocale: string) => {
    router.push(pathName, { locale: newLocale });
  };

  /* Get current language */
  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <VStack w={'100%'} p={3} gap={1} maxW="full" align="stretch">
      {/* Header Section */}
      <Flex align="center" justify={"space-between"}>
        <Flex flexDir={'column'} flex={1} minW={0}>
          <Heading 
            as="h1" 
            size="lg" 
            color={lighten(0.2, GRAY_COLOR)} 
            mb={0}
          >
            {t('title')}
          </Heading>

          {/* Breadcrumbs */}
          <Breadcrumb.Root>
            <Breadcrumb.List>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <Breadcrumb.Item  >
                    <Breadcrumb.Link
                      href={crumb.path}
                      color={
                        index === breadcrumbs.length - 1
                          ? lighten(0.2, PRIMARY_COLOR)
                          : lighten(0.2, GRAY_COLOR)
                      }
                      _hover={{
                        color: index === breadcrumbs.length - 1
                        ? lighten(0.2, PRIMARY_COLOR)
                          : lighten(0.2, GRAY_COLOR),
                        textDecoration: 'none',
                      }}
                    >
                      {crumb.name}
                    </Breadcrumb.Link>
                  </Breadcrumb.Item>
                  {index !== breadcrumbs.length - 1 &&
                    <Breadcrumb.Separator />
                  }
                </React.Fragment>
              ))}
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </Flex>
        
        <HStack gap={2} ml={4} flexShrink={0}>
          {/* Language Switcher */}
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button
                variant="outline"
                borderColor={GRAY_COLOR}
                color={lighten(0.2, GRAY_COLOR)}
                borderRadius="32px"
                _hover={{ bg: lighten(0.8, GRAY_COLOR) }}
                size={{ base: 'md', sm: 'md' }}
                fontSize="sm"
                fontWeight="medium"
                px={{ base: 2.5, sm: 3 }}
                title="Switch Language"
              >
                <HStack gap={1}>
                  <FiGlobe size={16} />
                  <Text display={{ base: 'none', sm: 'inline' }}>
                    {currentLanguage.name}
                  </Text>
                  <FiChevronDown size={12} />
                </HStack>
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  boxShadow="lg"
                  py={1}
                >
                  {languages.map((lang) => (
                    <Menu.Item
                      key={lang.code}
                      value={lang.name}
                      onClick={() => handleLanguageChange(lang.code)}
                      bg={locale === lang.code ? lighten(0.9, PRIMARY_COLOR) : 'transparent'}
                      _hover={{ bg: lighten(0.8, GRAY_COLOR) }}
                      px={3}
                      py={2}
                      cursor="pointer"
                    >
                      <Flex gap={2} align="center" justify="space-between" w="full">
                        <Text>{lang.name}</Text>
                        {locale === lang.code && (
                          <Text fontSize="xs" color={PRIMARY_COLOR}>✓</Text>
                        )}
                      </Flex>
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
             borderColor={GRAY_COLOR}
            color={lighten(0.2, GRAY_COLOR)} 
            borderRadius="32px"
            _hover={{ bg: lighten(0.8, GRAY_COLOR) }}
            size={{ base: 'md', sm: 'md' }}
            fontSize="sm"
            fontWeight="medium"
            
            spaceX={{ base: 0, sm: 2 }}
            px={{ base: 2.5, sm: 3 }}
            title={t('buttons.refresh')}
          >
            <FiRefreshCw 
              style={{
                transform: loading ? 'rotate(360deg)' : 'rotate(0deg)',
                transition: 'transform 1s linear',
                animation: loading ? 'spin 1s linear infinite' : 'none'
              }}
            />
            <Text display={{ base: 'none', sm: 'inline' }}>{t('buttons.refresh')}</Text>
          </Button>

          {/* Add Plan Button */}
          <Button
            onClick={handleAdd}
            bg={PRIMARY_COLOR}
            color="white"
            borderRadius="32px"
            _hover={{ 
              transform: 'translateY(-1px)',
              boxShadow: 'lg',
            }}
            _active={{
              bg: PRIMARY_COLOR,
              transform: 'translateY(0)',
            }}
            size={{ base: 'md', sm: 'md' }}
            fontSize="sm"
            fontWeight="medium"
            px={{ base: 2.5, sm: 3 }}
            title={t('buttons.addPlan')}
            transition="all 0.2s"
            boxShadow="0 0 20px rgba(66, 153, 225, 0.3)"
          >
            <FiPlus />
            <Text display={{ base: 'none', sm: 'inline' }}>{t('buttons.addPlan')}</Text>
          </Button>
        </HStack>
      </Flex>
    </VStack>
  );
};

export default HeaderSection;