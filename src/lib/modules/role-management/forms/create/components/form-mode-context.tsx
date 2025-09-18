/* Libraries imports */
import React, { createContext, useContext } from 'react'

/* Role module imports */
import { ROLE_FORM_MODES, RoleFormMode } from '@role-management/constants'

/* Form mode context interface */
interface FormModeContextType {
  mode: RoleFormMode
  isViewMode: boolean
  isEditMode: boolean
  isCreateMode: boolean
}

/* Create context with default values */
const FormModeContext = createContext<FormModeContextType | undefined>(undefined)

/* Form mode provider component */
interface FormModeProviderProps {
  mode: RoleFormMode
  children: React.ReactNode
}

export const FormModeProvider: React.FC<FormModeProviderProps> = ({ mode, children }) => {
  const value: FormModeContextType = {
    mode,
    isViewMode: mode === ROLE_FORM_MODES.VIEW,
    isEditMode: mode === ROLE_FORM_MODES.EDIT,
    isCreateMode: mode === ROLE_FORM_MODES.CREATE
  }

  return (
    <FormModeContext.Provider value={value}>
      {children}
    </FormModeContext.Provider>
  )
}

/* Hook to use form mode context */
export const useFormMode = (): FormModeContextType => {
  const context = useContext(FormModeContext)
  if (context === undefined) {
    throw new Error('useFormMode must be used within a FormModeProvider')
  }
  return context
}