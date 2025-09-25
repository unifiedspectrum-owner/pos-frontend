# Claude Code Assistant Guidelines

## Code Quality Standards

### TypeScript Configuration
- Enable strict mode in `tsconfig.json`
- Avoid `any` types; use proper interfaces/types
- Implement comprehensive error handling with custom error classes

### Import Path Standards
- **Use absolute imports**: Always use TypeScript path aliases defined in `tsconfig.json` (e.g., `@shared/types`, `@modules/tenant-management`)
- **Avoid relative imports**: Do not use relative paths like `../config` or `../../utils`
- **Exception for barrel exports**: Only use relative imports within barrel export files (index.ts) to export from same directory
- **Consistent aliasing**: Follow established path mapping for clean, maintainable imports

### Import Grouping Rules

1. **External Libraries**: React, Chakra UI, and other third-party packages
2. **Shared Module**: Components and utilities using `@shared` alias
3. **Plan Module**: Plan management related imports using `@plan-management` alias
4. **Tenant Module**: Tenant management related imports using `@tenant-management` alias

### Import Formatting Standards
- **Use inline imports**: Write all imports on single lines without line breaks for destructured imports
- **Compact format**: `import { Component1, Component2, Component3 } from 'library'` instead of multi-line destructuring
- **Exception for readability**: Only use multi-line imports when the line becomes excessively long (>120 characters)
- **Consistent spacing**: Maintain consistent spacing between import groups with section comments

### Code Comments Standards
- **Import Organization**: Group imports by category with section comments
  - `/* Libraries imports */` - Third-party libraries and packages
  - `/* Shared module imports */` - Internal shared modules and utilities from @shared
  - `/* [Module Name] module imports */` - Module-specific internal imports (e.g., `/* Tenant module imports */`, `/* Payment module imports */`)
- **Inline Comments**: Use `/* ... */` for concise single-line explanations
  - Explain purpose of exported constants and configurations
  - Document router initialization and endpoint functionality
  - Describe complex business logic and data transformations
- **Barrel Export Files**: Use consistent commenting format for index.ts files
  - Start with main category comment: `/* [Category] module exports */`
  - Add specific comments above each export explaining its purpose
  - Separate logical groups with blank lines for readability
  - Example format:
    ```typescript
    /* Shared configuration module exports */
    
    /* Environment variables and Cloudflare bindings */
    export * from './env-config';
    
    /* Application constants and default values */
    export * from './constants';
    ```
- **TypeScript Interface Files**: Use consistent structure for type definition files
  - Start with file header: `/* TypeScript interfaces for [domain] data structures */`
  - Add interface-level comments describing purpose: `/* [Description] */`
  - Keep property definitions clean without inline comments
  - Group related interfaces logically within the file
  - Example format:
    ```typescript
    /* TypeScript interfaces for communication service data structures */
    
    /* Email message composition parameters */
    export interface EmailParams {
      from: string;
      to: string;
      subject: string;
    }
    
    /* Email operation response structure */
    export interface EmailResponse {
      success: boolean;
      messageId?: string;
    }
    ```
- **Comment Style**: Keep comments concise and focused on "why" rather than "what"


### Key Principles

- Use absolute imports with module aliases (no relative paths like `../../../`)
- Group related imports together with descriptive comments
- Use concise single-line comments with `/* ... */` format
- Maintain consistent spacing between groups
- Order imports logically from most general (external) to most specific (local module)
- Write imports in inline format for cleaner, more compact code

## Comment Style

- Use `/* ... */` for single-line comments
- Keep comments concise and descriptive
- Don't add comments for every individual line unless necessary
- Group related functionality under section comments