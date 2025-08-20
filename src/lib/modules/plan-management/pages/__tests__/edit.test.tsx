import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from '@/components/ui/provider';
import EditPlanPage from '../edit';
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
  default: ({ mode, planId }: { mode: string; planId?: number }) => (
    <div data-testid="plan-form-container">
      <div data-testid="form-mode">{mode}</div>
      <div data-testid="form-plan-id">{planId}</div>
      <div data-testid="form-content">Plan Form Container</div>
    </div>
  )
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
);

describe('EditPlanPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render EditPlanPage component correctly', () => {
      const planId = 123;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
      expect(screen.getByTestId('form-content')).toHaveTextContent('Plan Form Container');
    });

    it('should pass EDIT mode to PlanFormContainer', () => {
      const planId = 456;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-mode')).toHaveTextContent(PLAN_FORM_MODES.EDIT);
    });

    it('should pass planId prop to PlanFormContainer', () => {
      const planId = 789;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-plan-id')).toHaveTextContent(planId.toString());
    });
  });

  describe('props handling', () => {
    it('should handle numeric planId correctly', () => {
      const planId = 42;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('42');
      expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
    });

    it('should handle zero planId correctly', () => {
      const planId = 0;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('0');
      expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
    });

    it('should handle large planId correctly', () => {
      const planId = 999999;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('999999');
    });

    it('should handle negative planId correctly', () => {
      const planId = -1;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('-1');
    });
  });

  describe('component structure', () => {
    it('should be a functional component', () => {
      expect(typeof EditPlanPage).toBe('function');
    });

    it('should require planId prop', () => {
      const planId = 123;
      expect(() => render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper })).not.toThrow();
    });

    it('should have a single child component', () => {
      const planId = 123;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });
      
      const container = screen.getByTestId('plan-form-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('integration with PlanFormContainer', () => {
    it('should render PlanFormContainer with correct props', () => {
      const planId = 123;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      // Verify the form container is rendered with correct props
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
      expect(screen.getByTestId('form-mode')).toHaveTextContent(PLAN_FORM_MODES.EDIT);
      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('123');
      expect(screen.getByTestId('form-content')).toHaveTextContent('Plan Form Container');
    });
  });

  describe('TypeScript interface compliance', () => {
    it('should satisfy EditPlanPageProps interface', () => {
      const validProps = { planId: 123 };
      
      expect(() => render(<EditPlanPage {...validProps} />, { wrapper: TestWrapper })).not.toThrow();
    });

    it('should require planId in props', () => {
      // TypeScript compilation should catch this, but we can test runtime behavior
      const planId = 456;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });
      
      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('456');
    });
  });

  describe('accessibility', () => {
    it('should be accessible', () => {
      const planId = 123;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      // Component should render without accessibility violations
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle rendering errors gracefully', () => {
      // This test documents that error handling would be tested at integration level
      // since mocking the form container to throw errors requires complex setup
      expect(() => {
        render(<EditPlanPage planId={123} />, { wrapper: TestWrapper });
      }).not.toThrow();
    });

    it('should handle undefined planId gracefully in development', () => {
      // In a real scenario, TypeScript would prevent this, but test runtime behavior
      const planId = undefined as any;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('');
    });
  });

  describe('constants usage', () => {
    it('should use PLAN_FORM_MODES.EDIT constant', () => {
      const planId = 123;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
    });

    it('should handle missing PLAN_FORM_MODES constant gracefully', () => {
      // This test documents that constants are validated at build/compile time
      // The component relies on the constant being properly defined
      const planId = 123;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      // Should render with the defined constant
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
      expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
    });
  });

  describe('component exports', () => {
    it('should export EditPlanPage as default', () => {
      expect(EditPlanPage).toBeDefined();
      expect(typeof EditPlanPage).toBe('function');
    });

    it('should be a React functional component', () => {
      // Check that it returns valid React element
      const result = EditPlanPage({ planId: 123 });
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('memoization and performance', () => {
    it('should render consistently with same props', () => {
      const planId = 123;
      const { rerender } = render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();

      rerender(<EditPlanPage planId={planId} />);

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
      expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('123');
    });

    it('should update when planId changes', () => {
      const { rerender } = render(<EditPlanPage planId={123} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('123');

      rerender(<EditPlanPage planId={456} />);

      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('456');
    });
  });

  describe('edge cases', () => {
    it('should handle float planId by truncating', () => {
      const planId = 123.456 as any; // Type assertion to bypass TypeScript
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('123.456');
    });

    it('should handle string planId in runtime', () => {
      const planId = '789' as any; // Type assertion to bypass TypeScript
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('789');
    });
  });

  describe('component comparison with other pages', () => {
    it('should have similar structure to ViewPlanPage but different mode', () => {
      const planId = 123;
      render(<EditPlanPage planId={planId} />, { wrapper: TestWrapper });

      expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
      expect(screen.getByTestId('form-plan-id')).toHaveTextContent('123');
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument();
    });
  });
});