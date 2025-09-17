/* Phone number parsing and formatting utilities */

import { FieldError, Merge } from "react-hook-form"

/* Parse phone number from various API response formats to form tuple */
export const parsePhoneFromAPI = (phoneNumber: string): [string, string] => {
  console.log('parsePhoneFromAPI input:', phoneNumber)
  
  if (!phoneNumber) {
    console.log('parsePhoneFromAPI: empty data, returning empty tuple')
    return ['', '']
  }
  
  /* Handle API string format with dash separator */
  if (phoneNumber.includes('-')) {
    const match = phoneNumber.match(/^(\+\d{1,4})-(.+)$/)
    if (match) {
      const result: [string, string] = [match[1], match[2]]
      console.log('parsePhoneFromAPI: parsed string format to tuple:', result)
      return result
    }
  } else {
    const result: [string, string] = ['', phoneNumber]
    console.log('parsePhoneFromAPI: fallback string format to tuple:', result)
    return result
  }
  
  console.log('parsePhoneFromAPI: no matching format, returning empty tuple')
  return ['', '']
}

/* Format phone number tuple for API submission */
export const formatPhoneForAPI = (phoneValue: [string, string]): string => {
  console.log('formatPhoneForAPI input:', phoneValue, 'type:', typeof phoneValue, 'isArray:', Array.isArray(phoneValue))
  
  if (!phoneValue) {
    console.log('formatPhoneForAPI: empty value, returning empty string')
    return '';
  }
  
  /* Handle tuple format from form */
  if (Array.isArray(phoneValue) && phoneValue.length === 2) {
    const [dialCode, phoneNumber] = phoneValue
    console.log('formatPhoneForAPI: tuple format detected', { dialCode, phoneNumber })
    if (dialCode && phoneNumber) {
      const result = `${dialCode}-${phoneNumber}`
      console.log('formatPhoneForAPI: returning formatted string:', result)
      return result
    }
    console.log('formatPhoneForAPI: tuple format but missing dialCode or phoneNumber')
  }
  return '';
}

/* Extract phone validation error from tuple structure */
export const getPhoneFieldErrorMessage = (fieldError: FieldError | Merge<FieldError, [(FieldError | undefined)?, (FieldError | undefined)?]> | undefined) => {
  if (fieldError) {
    console.log('Phone field error:', fieldError)
    if (fieldError.message) {
      return fieldError.message /* Direct error message */
    }
    if (Array.isArray(fieldError) && fieldError.length > 0) {
      return fieldError[0]?.message || fieldError[1]?.message || "Invalid phone number" /* Tuple error extraction */
    }
  }
  return fieldError?.message
}