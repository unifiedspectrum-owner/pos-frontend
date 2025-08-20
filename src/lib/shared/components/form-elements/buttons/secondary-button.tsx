import React from 'react';
import { Button, ButtonProps, Icon, HStack } from '@chakra-ui/react';
import { lighten } from 'polished';
import { IconType } from 'react-icons';
import { GRAY_COLOR } from '@shared/config';

/* Props interface for secondary button component */
interface SecondaryButtonProps {
  children: React.ReactNode; /* Button content */
  onClick?: () => void; /* Click event handler */
  disabled?: boolean; /* Whether button is disabled */
  loading?: boolean; /* Whether button shows loading state */
  type?: 'button' | 'submit' | 'reset'; /* HTML button type */
  size?: 'sm' | 'md' | 'lg'; /* Button size variant */
  leftIcon?: IconType; /* Icon to display on left */
  rightIcon?: IconType; /* Icon to display on right */
  buttonProps?: ButtonProps; /* Additional Chakra button props */
}

/* Secondary action button component with outline style */
const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  onClick,
  disabled = false, /* Default to enabled */
  loading = false, /* Default to not loading */
  type = 'button', /* Default button type */
  size = 'md', /* Default medium size */
  leftIcon,
  rightIcon,
  buttonProps
}) => {
  return (
    <Button
      px={5}
      borderRadius={20}
      type={type}
      size={size}
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      borderColor={GRAY_COLOR}
      color={lighten(0.2, GRAY_COLOR)}
      _hover={{ 
        bg: lighten(0.7, GRAY_COLOR),
        borderColor: GRAY_COLOR
      }}
      _active={{
        bg: lighten(0.6, GRAY_COLOR),
      }}
      _disabled={{
        opacity: 0.4,
        cursor: 'not-allowed',
        _hover: {
          bg: 'transparent'
        }
      }}
      transition="all 0.2s"
      {...buttonProps} /* Spread additional props to allow customization */
    >
      <HStack gap={2}>
        {leftIcon && <Icon as={leftIcon} />} {/* Conditionally render left icon */}
        {children}
        {rightIcon && <Icon as={rightIcon} />} {/* Conditionally render right icon */}
      </HStack>
    </Button>
  );
};

export default SecondaryButton