/* Role module imports */
import { CreateRoleFormData } from '@role-management/schemas'
import { RoleCreationApiRequest } from '@role-management/types'

/* Build role creation API payload from form data */
export const buildCreateRolePayload = (formData: CreateRoleFormData): RoleCreationApiRequest => {
  return {
    name: formData.name.trim(),
    code: formData.code.trim().toUpperCase(),
    display_name: formData.display_name.trim(),
    description: formData.description.trim(),
    is_active: formData.is_active
  }
}