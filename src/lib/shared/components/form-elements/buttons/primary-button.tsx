import React from 'react';
import { Button, ButtonProps, Icon, HStack } from '@chakra-ui/react';
import { lighten } from 'polished';
import { IconType } from 'react-icons';
import { PRIMARY_COLOR } from '@shared/config';

/* Props interface for primary button component */
interface PrimaryButtonProps {
  children: React.ReactNode; /* Button content */
  onClick?: () => void; /* Click event handler */
  disabled?: boolean; /* Whether button is disabled */
  loading?: boolean; /* Whether button shows loading state */
  type?: 'button' | 'submit' | 'reset'; /* HTML button type */
  size?: 'sm' | 'md' | 'lg'; /* Button size variant */
  leftIcon?: IconType; /* Icon to display on left */
  rightIcon?: IconType; /* Icon to display on right */
  buttonProps?: ButtonProps; /* Additional Chakra button props */
  bg?: string; /* Custom background color */
}

/* Primary action button component with hover and loading states */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  disabled = false, /* Default to enabled */
  loading = false, /* Default to not loading */
  type = 'button', /* Default button type */
  size = 'md', /* Default medium size */
  leftIcon,
  rightIcon,
  bg, /* Optional custom background */
  buttonProps
}) => {
  return (
    <Button
      px={5}
      borderRadius={20}
      type={type}
      size={size}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      bg={bg ? bg : PRIMARY_COLOR} /* Use custom background color or fallback to theme primary */
      color="white"
      _hover={{ 
        bg: lighten(-0.1, PRIMARY_COLOR),
        transform: 'translateY(-1px)',
        boxShadow: 'lg'
      }}
      _active={{
        bg: lighten(-0.2, PRIMARY_COLOR),
        transform: 'translateY(0)',
      }}
      _disabled={{
        bg: 'gray.300',
        color: 'gray.500',
        cursor: 'not-allowed',
        _hover: {
          bg: 'gray.300',
          transform: 'none',
          boxShadow: 'none'
        }
      }}
      transition="all 0.2s"
      {...buttonProps} /* Spread additional props to allow customization */
    >
      <HStack gap={2}>
        {leftIcon && <Icon as={leftIcon} fontSize={'md'}/>} {/* Conditionally render left icon */}
        {children}
        {rightIcon && <Icon as={rightIcon} />} {/* Conditionally render right icon */}
      </HStack>
    </Button>
  );
};

export default PrimaryButton