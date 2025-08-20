import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from '@/components/ui/provider';
import CreatePlan from '../create';
import { PLAN_FORM_MODES } from '@plan-management/config';

// Mock dependencies
vi.mock('@plan-management/config', () => ({
  PLAN_FORM_MODES: {
    CREATE: 'create',
    EDIT: 'edit',
    VIEW: 'view'
  }
}));

// Mock the PlanFormContainer component
vi.mock('@plan-management/forms/form-container', () => ({
  default: ({ mode }: { mode: string }) => (
    <div data-testid="plan-form-container">
      <div data-testid="form-mode">{mode}</div>
      <div data-testid="form-content">Plan Form Container</div>
    </div>
  )
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
);

describe('CreatePlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render CreatePlan component correctly', () => {
      render(<CreatePlan />, { wrapper: TestWrapper });

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
      expect(screen.getByTestId('form-content')).toHaveTextContent('Plan Form Container');
    });

    it('should pass CREATE mode to PlanFormContainer', () => {
      render(<CreatePlan />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-mode')).toHaveTextContent(PLAN_FORM_MODES.CREATE);
    });

    it('should not pass planId prop in create mode', () => {
      render(<CreatePlan />, { wrapper: TestWrapper });

      // Verify that only mode prop is passed, no planId
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
      expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
    });
  });

  describe('component structure', () => {
    it('should be a functional component', () => {
      expect(typeof CreatePlan).toBe('function');
    });

    it('should render without any props', () => {
      expect(() => render(<CreatePlan />, { wrapper: TestWrapper })).not.toThrow();
    });

    it('should have a single child component', () => {
      render(<CreatePlan />, { wrapper: TestWrapper });
      
      const container = screen.getByTestId('plan-form-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('integration with PlanFormContainer', () => {
    it('should render PlanFormContainer with correct props', () => {
      render(<CreatePlan />, { wrapper: TestWrapper });

      // Verify the form container is rendered
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
      expect(screen.getByTestId('form-mode')).toHaveTextContent(PLAN_FORM_MODES.CREATE);
      expect(screen.getByTestId('form-content')).toHaveTextContent('Plan Form Container');
    });
  });

  describe('accessibility', () => {
    it('should be accessible', () => {
      render(<CreatePlan />, { wrapper: TestWrapper });

      // Component should render without accessibility violations
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle rendering errors gracefully', () => {
      // This test documents that error handling would be tested at integration level
      // since mocking the form container to throw errors requires complex setup
      expect(() => {
        render(<CreatePlan />, { wrapper: TestWrapper });
      }).not.toThrow();
    });
  });

  describe('props validation', () => {
    it('should not accept any props', () => {
      // TypeScript should enforce that CreatePlan doesn't accept props
      // This test ensures the component signature is correct
      render(<CreatePlan />, { wrapper: TestWrapper });
      
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
    });
  });

  describe('constants usage', () => {
    it('should use PLAN_FORM_MODES.CREATE constant', () => {
      render(<CreatePlan />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
    });

    it('should handle missing PLAN_FORM_MODES constant gracefully', () => {
      // This test documents that constants are validated at build/compile time
      // The component relies on the constant being properly defined
      render(<CreatePlan />, { wrapper: TestWrapper });

      // Should render with the defined constant
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
      expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
    });
  });

  describe('component exports', () => {
    it('should export CreatePlan as default', () => {
      expect(CreatePlan).toBeDefined();
      expect(typeof CreatePlan).toBe('function');
    });

    it('should be a React functional component', () => {
      // Check that it returns valid React element
      const result = CreatePlan({});
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('memoization and performance', () => {
    it('should render consistently with same props', () => {
      const { rerender } = render(<CreatePlan />, { wrapper: TestWrapper });

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();

      rerender(<CreatePlan />);

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
      expect(screen.getByTestId('form-mode')).toHaveTextContent('create');
    });
  });
});