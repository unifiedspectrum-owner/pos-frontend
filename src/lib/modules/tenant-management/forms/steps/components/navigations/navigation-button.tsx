import { SecondaryButton, PrimaryButton } from '@/lib/shared'
import { Flex } from '@chakra-ui/react'
import React from 'react'
import { IconType } from 'react-icons';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

interface NavigationButtonProps {
  primaryBtnType?: 'button' | 'submit',
  isPrimaryBtnLoading?: boolean,
  primaryBtnLoadingText?: string,
  primaryBtnText?: string,
  primaryBtnLeftIcon?: IconType,
  primaryBtnRightIcon?: IconType,
  primaryBtnDisabled?: boolean,
  onPrimaryClick?: () => void,
  
  secondaryBtnType?: 'button' | 'submit',
  isSecondaryBtnLoading?: boolean,
  secondaryBtnLoadingText?: string,
  secondaryBtnText?: string,
  secondaryBtnLeftIcon?: IconType,
  secondaryBtnRightIcon?: IconType,
  secondaryBtnDisabled?: boolean,
  onSecondaryClick?: () => void,
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  primaryBtnType = 'button',
  isPrimaryBtnLoading = false,
  primaryBtnLoadingText = 'loading',
  primaryBtnText = 'Next',
  primaryBtnLeftIcon,
  primaryBtnRightIcon = FiArrowRight,
  primaryBtnDisabled = false,
  onPrimaryClick,
  
  secondaryBtnType = 'button',
  isSecondaryBtnLoading = false,
  secondaryBtnLoadingText = 'Loading',
  secondaryBtnText = 'Previous',
  secondaryBtnLeftIcon = FiArrowLeft,
  secondaryBtnRightIcon,
  secondaryBtnDisabled = false,
  onSecondaryClick,
}) => {
  return (
    <Flex justify="space-between" pt={4}>
      <SecondaryButton
        type={secondaryBtnType}
        loading={isSecondaryBtnLoading}
        leftIcon={secondaryBtnLeftIcon} 
        rightIcon={secondaryBtnRightIcon}
        disabled={secondaryBtnDisabled}
        onClick={onSecondaryClick}
      >
        {isSecondaryBtnLoading ? secondaryBtnLoadingText : secondaryBtnText}
      </SecondaryButton>

      <PrimaryButton 
        type={primaryBtnType} 
        loading={isPrimaryBtnLoading}
        leftIcon={primaryBtnLeftIcon}
        rightIcon={primaryBtnRightIcon}
        disabled={primaryBtnDisabled}
        onClick={onPrimaryClick}
      >
        {isPrimaryBtnLoading ? primaryBtnLoadingText : primaryBtnText}
      </PrimaryButton>
    </Flex>
  )
}

export default NavigationButton