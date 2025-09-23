/* React and Chakra UI component imports */
import React from 'react';
import { Flex, HStack, Text, Button, Box } from '@chakra-ui/react';
import { FiSearch, FiPlus, FiX } from 'react-icons/fi';
import { lighten } from 'polished';

/* Shared module imports */
import { PRIMARY_COLOR, GRAY_COLOR } from '@shared/config';
import { PrimaryButton, TextInputField } from '@shared/components/form-elements';

/* Props interface for search header component */
interface SearchHeaderProps {
  title: string; /* Header title text */
  showSearch: boolean; /* Whether search field is visible */
  searchTerm: string; /* Current search term */
  onSearchToggle: () => void; /* Toggle search field visibility */
  onSearchChange: (value: string) => void; /* Handle search term changes */
  searchPlaceholder: string; /* Placeholder text for search input */
  showCreateForm: boolean; /* Whether create form is visible */
  onCreateToggle: () => void; /* Toggle create form visibility */
  createButtonText: string; /* Text for create button */
  isCreating?: boolean; /* Whether creation is in progress */
  hideCreateButton?: boolean; /* Whether to hide create button */
  hideSearchButton?: boolean; /* Whether to hide search button */
}

/* Header component with search and create functionality */
const SearchHeader: React.FC<SearchHeaderProps> = ({
  title,
  showSearch,
  searchTerm,
  onSearchToggle,
  onSearchChange,
  searchPlaceholder,
  showCreateForm,
  onCreateToggle,
  createButtonText,
  isCreating = false, /* Default not creating */
  hideCreateButton = false, /* Default show create button */
  hideSearchButton = false, /* Default show search button */
}) => {
  return (
    <Flex flexDir="column" gap={2}>
      {/* Header section with title and action buttons */}
      <Flex justify="space-between" align="center">
        <Text fontSize="md" fontWeight="semibold" color={GRAY_COLOR}>
          {title}
        </Text>
        <HStack gap={2}>
          {/* Search toggle button - only show if not hidden */}
          {!hideSearchButton && (
            <Button
              onClick={onSearchToggle}
              bg={showSearch ? PRIMARY_COLOR : 'transparent'}
              color={showSearch ? 'white' : PRIMARY_COLOR}
              borderWidth={1}
              borderRadius={'full'}
              size="sm"
              _hover={{
                bg: showSearch ? lighten(0.1, PRIMARY_COLOR) : lighten(0.45, PRIMARY_COLOR)
              }}
            >
              <FiSearch />
            </Button>
          )}

          {/* Create/cancel toggle button - only show if not hidden */}
          {!hideCreateButton && (
            <PrimaryButton
              onClick={onCreateToggle}
              disabled={isCreating}
              leftIcon={showCreateForm ? FiX : FiPlus}
            >
              {showCreateForm ? "Cancel" : createButtonText}
            </PrimaryButton>
          )}
        </HStack>
      </Flex>

      {/* Collapsible search input field */}
      <Box
        overflow="hidden"
        transition="all 0.3s ease-in-out"
        maxH={showSearch ? "60px" : "0"}
        opacity={showSearch ? 1 : 0}
      >
        <TextInputField
          label=""
          value={searchTerm}
          placeholder={searchPlaceholder}
          isInValid={false}
          required={false}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<FiSearch />}
          inputProps={{
            borderRadius: '2xl',
            bg: lighten(0.72, GRAY_COLOR),
            borderColor: lighten(0.3, GRAY_COLOR),
            _focus: {
              borderColor: PRIMARY_COLOR,
              borderRadius: '2xl',
              boxShadow: `0 0 0 1px ${PRIMARY_COLOR}`
            }
          }}
        />
      </Box>
    </Flex>
  );
};

export default SearchHeader;