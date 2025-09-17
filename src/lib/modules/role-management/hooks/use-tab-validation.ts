import { useCallback } from 'react';
import { UseFormGetValues } from 'react-hook-form';
import {
  CreateRoleFormData,
  roleInfoSchema,
  moduleAssignmentsSchema,
  ROLE_INFO_FIELD_KEYS,
  MODULE_ASSIGNMENTS_FIELD_KEYS,
  RoleInfoFormData,
  ModuleAssignmentsFormData
} from '@role-management/schemas/validation/roles';

/* Hook for on-demand tab validation using getValues() - no reactive watching */
export const useTabValidation = (
  getValues: UseFormGetValues<CreateRoleFormData>
) => {

  /* On-demand validation functions - only called when needed */
  const validateRoleInfo = useCallback((): boolean => {
    try {
      const currentValues = getValues()

      /* Create a new object containing only the role info fields */
      const roleInfoData = ROLE_INFO_FIELD_KEYS.reduce((acc, key) => {
        acc[key] = currentValues[key];
        return acc;
      }, {} as Record<keyof RoleInfoFormData, string | boolean>);

      roleInfoSchema.parse(roleInfoData);
      return true
    } catch {
      return false
    }
  }, [getValues])

  const validateModuleAssignments = useCallback((): boolean => {
    try {
      const currentValues = getValues()

      /* Create a new object containing only the module assignments fields */
      const moduleAssignmentsData = MODULE_ASSIGNMENTS_FIELD_KEYS.reduce((acc, key) => {
        acc[key] = currentValues[key];
        return acc;
      }, {} as Record<keyof ModuleAssignmentsFormData, unknown>);

      moduleAssignmentsSchema.parse(moduleAssignmentsData)
      return true
    } catch {
      return false
    }
  }, [getValues])

  /* Lazy validation state - only computed when accessed */
  const getValidationState = useCallback(() => {
    const isRoleInfoValid = validateRoleInfo()
    const isModuleAssignmentsValid = validateModuleAssignments()

    return {
      isRoleInfoValid,
      isModuleAssignmentsValid,
      isEntireFormValid: isRoleInfoValid && isModuleAssignmentsValid
    }
  }, [validateRoleInfo, validateModuleAssignments])

  /* For backwards compatibility - compute validation state immediately when accessed */
  const isRoleInfoValid = validateRoleInfo()
  const isModuleAssignmentsValid = validateModuleAssignments()
  const isEntireFormValid = isRoleInfoValid && isModuleAssignmentsValid

  return {
    isRoleInfoValid,
    isModuleAssignmentsValid,
    isEntireFormValid,
    /* Individual validators for granular validation */
    validateRoleInfo,
    validateModuleAssignments,
    getValidationState,
  }
};