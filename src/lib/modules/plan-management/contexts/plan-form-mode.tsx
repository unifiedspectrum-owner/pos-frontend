/* React imports */
import { createContext, useContext } from 'react'

/* Plan management module imports */
import { PlanFormMode } from '@plan-management/types'

/* Context interface */
interface PlanFormModeContextType {
  mode: PlanFormMode /* Current form mode */
  planId?: number /* Plan ID for edit/view modes */
}

/* Create context with undefined default */
const PlanFormModeContext = createContext<PlanFormModeContextType | undefined>(undefined)

/* Custom hook to use plan form mode context */
export const usePlanFormMode = (): PlanFormModeContextType => {
  const context = useContext(PlanFormModeContext)
  if (!context) {
    throw new Error('usePlanFormMode must be used within a PlanFormModeProvider')
  }
  return context
}

/* Provider component props */
interface PlanFormModeProviderProps {
  mode: PlanFormMode
  planId?: number
  children: React.ReactNode
}

/* Provider component */
export const PlanFormModeProvider: React.FC<PlanFormModeProviderProps> = ({ mode, planId, children }) => {
  return (
    <PlanFormModeContext.Provider value={{ mode, planId }}>
      {children}
    </PlanFormModeContext.Provider>
  )
}
