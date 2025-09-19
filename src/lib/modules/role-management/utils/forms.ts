/* Form payload building utilities for role management */

/* Role management module imports */
import { CreateRoleFormData } from '@role-management/schemas'
import { RoleCreationRequest, RoleUpdateRequest } from '@role-management/types'

/* Build role creation API payload from form data */
export const buildCreateRolePayload = (formData: CreateRoleFormData): RoleCreationRequest => {
  return {
    name: formData.name.trim(),
    description: formData.description.trim(),
    is_active: formData.is_active,
    module_assignments: formData.module_assignments
  }
}

/* Build payload for role updates with only changed fields */
export const buildUpdateRolePayload = (changedFields: Partial<CreateRoleFormData>): RoleUpdateRequest => {
  const payload: RoleUpdateRequest = {}

  /* Handle each field type properly */
  if (changedFields.name !== undefined) {
    payload.name = changedFields.name.trim()
  }

  if (changedFields.description !== undefined) {
    payload.description = changedFields.description.trim()
  }

  if (changedFields.is_active !== undefined) {
    payload.is_active = changedFields.is_active
  }

  if (changedFields.module_assignments !== undefined) {
    payload.module_assignments = changedFields.module_assignments
  }

  return payload
}