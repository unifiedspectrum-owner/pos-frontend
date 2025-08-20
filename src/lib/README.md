# Lib Directory

This directory contains the core library components, utilities, and configurations for the POS Frontend application.

## Structure

### admin/
Contains all admin-related components, hooks, and configurations:

#### components/
- **common/**: Shared components like breadcrumbs, dialogs, headers, and sidebars
- **form-elements/**: Reusable form components (buttons, inputs, selects, etc.)
- **plan-form/**: Specialized components for plan management forms
  - **tabs/**: Individual tab components for plan creation/editing
    - `basic-details.tsx` - Basic plan information form
    - `pricing-configuration.tsx` - Pricing and volume discount configuration
    - `feature-selection.tsx` - Feature selection and management
    - `addon-configuration.tsx` - Add-on selection and configuration
    - `sla-configuration.tsx` - SLA selection and configuration
    - **common/**: Shared tab utilities and base components

#### config/
Application configuration files:
- `app-config.ts` - Main application settings
- `form-field-config.ts` - Form field configurations
- `plan-constants.ts` - Plan-related constants

#### contexts/
React contexts for state management:
- `resource-error-context.tsx` - Error handling for resources

#### forms/
Form components organized by feature:
- **plans/**: Plan-specific form components
  - `form-container.tsx` - Main form wrapper
  - `form-ui.tsx` - Form UI implementation

#### hooks/
Custom React hooks:
- **plans/**: Plan-specific hooks
  - `use-form-submission.ts` - Form submission logic
  - `use-resource-management.ts` - Resource CRUD operations
  - `use-resource-selection.ts` - Resource selection handling
  - `use-tab-navigation.ts` - Tab navigation logic
  - `use-tab-validation.ts` - Form validation per tab

#### layouts/
Layout components:
- `admin-layout.tsx` - Main admin layout wrapper

#### schemas/
Data validation schemas:
- **validation/**: Zod schemas for form validation
  - `plan.ts` - Plan-related validation schemas

#### types/
TypeScript type definitions:
- `plan.ts` - Plan-related interfaces and types

#### utils/
Utility functions organized by category:
- **data-format/**: Data transformation utilities
- **form/**: Form-related utilities
- **ui/**: UI-specific utilities like toast notifications

### pages/
Page-level components organized by feature:
- **plans/**: Plan management pages
  - `create.tsx` - Plan creation page
  - `edit.tsx` - Plan editing page
  - `view.tsx` - Plan view page
  - `index.tsx` - Plan listing page

## Key Features

### Multi-Tab Plan Forms
The plan form system uses a multi-tab interface with:
- Progressive validation per tab
- Auto-save functionality with localStorage persistence
- Resource management (Features, Add-ons, SLA)
- Complex pricing configuration with volume discounts

### Reusable Components
- Form elements with consistent styling and validation
- Resource management components for CRUD operations
- Search and selection grids for resource picking
- Confirmation dialogs for destructive actions

### State Management
- Form state managed via React Hook Form
- Resource selection with custom hooks
- Error handling through React contexts
- Navigation state for tab management

### Validation
- Zod schemas for type-safe validation
- Per-tab validation with real-time feedback
- Cross-tab validation for complex relationships

## Development Patterns

### Component Organization
- Feature-based directory structure
- Shared components in common directories
- Consistent naming conventions

### Hook Usage
- Custom hooks for business logic extraction
- Separation of concerns between UI and logic
- Reusable hooks across different components

### Type Safety
- Comprehensive TypeScript interfaces
- Zod schemas for runtime validation
- Generic types for reusable components

### Performance
- Memoization for expensive calculations
- Debounced inputs for search functionality
- Lazy loading where appropriate