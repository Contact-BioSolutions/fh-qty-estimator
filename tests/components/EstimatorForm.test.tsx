// Component tests for EstimatorForm
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EstimatorForm } from '../../src/components/EstimatorForm';
import { UnitSystem, WeedSize, AreaUnit, VolumeUnit, EstimatorValues } from '../../src/types';
import { WEED_SIZE_CONFIG, DEFAULT_APPLICATION_RATES } from '../../src/constants';

describe('EstimatorForm Component', () => {
  const mockOnValuesChange = jest.fn();
  
  const defaultProps = {
    onValuesChange: mockOnValuesChange,
    unitSystem: UnitSystem.IMPERIAL,
    weedSizeConfig: WEED_SIZE_CONFIG,
    applicationRates: DEFAULT_APPLICATION_RATES
  };

  const defaultInitialValues: EstimatorValues = {
    area: 1000,
    areaUnit: AreaUnit.SQUARE_FEET,
    weedSize: WeedSize.MEDIUM,
    applicationRate: 2.0,
    applicationUnit: VolumeUnit.FLUID_OUNCES,
    unitSystem: UnitSystem.IMPERIAL
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render form elements', () => {
      render(<EstimatorForm {...defaultProps} />);
      
      expect(screen.getByRole('form', { name: /quantity estimator form/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/coverage area input/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/weed size selector/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/application rate slider/i)).toBeInTheDocument();
    });

    it('should render with initial values', () => {
      render(
        <EstimatorForm 
          {...defaultProps} 
          initialValues={defaultInitialValues}
        />
      );
      
      const areaInput = screen.getByLabelText(/coverage area input/i);
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      
      expect(areaInput).toHaveValue(1000);
      expect(weedSizeSelector).toHaveValue(WeedSize.MEDIUM);
      expect(rateSlider).toHaveValue('2');
    });

    it('should render unit system toggle', () => {
      render(<EstimatorForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/unit system toggle/i)).toBeInTheDocument();
      expect(screen.getByText(/imperial/i)).toBeInTheDocument();
    });

    it('should show metric units when unit system is metric', () => {
      render(
        <EstimatorForm 
          {...defaultProps} 
          unitSystem={UnitSystem.METRIC}
        />
      );
      
      expect(screen.getByText(/metric/i)).toBeInTheDocument();
      expect(screen.getByText(/sq m/i)).toBeInTheDocument();
    });
  });

  describe('Area Input Component', () => {
    it('should handle area input changes', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '2000');
      
      expect(mockOnValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({ area: 2000 })
      );
    });

    it('should handle area slider changes', async () => {
      render(<EstimatorForm {...defaultProps} />);
      
      const areaSlider = screen.getByLabelText(/coverage area slider/i);
      fireEvent.change(areaSlider, { target: { value: '1500' } });
      
      expect(mockOnValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({ area: 1500 })
      );
    });

    it('should show area unit selector', () => {
      render(<EstimatorForm {...defaultProps} />);
      
      const unitSelector = screen.getByRole('combobox', { name: /area unit/i });
      expect(unitSelector).toBeInTheDocument();
      expect(unitSelector).toHaveValue(AreaUnit.SQUARE_FEET);
    });

    it('should handle area unit changes', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const unitSelector = screen.getByRole('combobox', { name: /area unit/i });
      await user.selectOptions(unitSelector, AreaUnit.ACRES);
      
      expect(mockOnValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({ areaUnit: AreaUnit.ACRES })
      );
    });

    it('should validate area input bounds', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const areaInput = screen.getByLabelText(/coverage area input/i);
      
      // Test minimum
      await user.clear(areaInput);
      await user.type(areaInput, '50');
      
      await waitFor(() => {
        expect(screen.getByText(/area must be at least/i)).toBeInTheDocument();
      });
      
      // Test maximum
      await user.clear(areaInput);
      await user.type(areaInput, '150000');
      
      await waitFor(() => {
        expect(screen.getByText(/area cannot exceed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Weed Size Selector Component', () => {
    it('should render all weed size options', () => {
      render(<EstimatorForm {...defaultProps} />);
      
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      
      expect(screen.getByText(/small weeds/i)).toBeInTheDocument();
      expect(screen.getByText(/medium weeds/i)).toBeInTheDocument();
      expect(screen.getByText(/large weeds/i)).toBeInTheDocument();
      expect(screen.getByText(/extra large weeds/i)).toBeInTheDocument();
    });

    it('should show weed size descriptions', () => {
      render(<EstimatorForm {...defaultProps} />);
      
      expect(screen.getByText(/less than 6 inches/i)).toBeInTheDocument();
      expect(screen.getByText(/6-12 inches/i)).toBeInTheDocument();
      expect(screen.getByText(/12-24 inches/i)).toBeInTheDocument();
      expect(screen.getByText(/over 24 inches/i)).toBeInTheDocument();
    });

    it('should handle weed size selection', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.LARGE);
      
      expect(mockOnValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({ weedSize: WeedSize.LARGE })
      );
    });

    it('should update application rate bounds when weed size changes', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.SMALL);
      
      // Should show bounds for small weeds (1.0 - 2.0)
      await waitFor(() => {
        expect(screen.getByText(/1\.0.*2\.0/)).toBeInTheDocument();
      });
    });

    it('should display as card layout when specified', () => {
      const CardEstimatorForm = () => (
        <EstimatorForm 
          {...defaultProps}
          layout="cards"
        />
      );
      
      render(<CardEstimatorForm />);
      
      // Should render as card layout
      expect(screen.getByRole('radiogroup', { name: /weed size selector/i })).toBeInTheDocument();
    });
  });

  describe('Application Rate Slider Component', () => {
    it('should render application rate slider', () => {
      render(<EstimatorForm {...defaultProps} />);
      
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      expect(rateSlider).toBeInTheDocument();
      expect(rateSlider).toHaveAttribute('type', 'range');
    });

    it('should handle application rate changes', async () => {
      render(<EstimatorForm {...defaultProps} />);
      
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      fireEvent.change(rateSlider, { target: { value: '2.5' } });
      
      expect(mockOnValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({ applicationRate: 2.5 })
      );
    });

    it('should show rate bounds for current weed size', () => {
      render(
        <EstimatorForm 
          {...defaultProps} 
          initialValues={{ ...defaultInitialValues, weedSize: WeedSize.LARGE }}
        />
      );
      
      // Should show bounds for large weeds (2.0 - 4.0)
      expect(screen.getByText(/2\.0.*4\.0/)).toBeInTheDocument();
    });

    it('should show markers for recommended rates', () => {
      render(<EstimatorForm {...defaultProps} showMarkers={true} />);
      
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      expect(rateSlider).toBeInTheDocument();
      
      // Should show recommended rate indicator
      expect(screen.getByText(/recommended/i)).toBeInTheDocument();
    });

    it('should enforce minimum and maximum bounds', () => {
      render(
        <EstimatorForm 
          {...defaultProps} 
          initialValues={{ ...defaultInitialValues, weedSize: WeedSize.SMALL }}
        />
      );
      
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      
      expect(rateSlider).toHaveAttribute('min', '1');
      expect(rateSlider).toHaveAttribute('max', '2');
    });

    it('should handle fine-tuned rate adjustments', async () => {
      render(<EstimatorForm {...defaultProps} />);
      
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      
      // Should support decimal increments
      fireEvent.change(rateSlider, { target: { value: '2.3' } });
      
      expect(mockOnValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({ applicationRate: 2.3 })
      );
    });
  });

  describe('Unit System Toggle', () => {
    it('should handle unit system toggle', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const unitToggle = screen.getByLabelText(/unit system toggle/i);
      await user.click(unitToggle);
      
      expect(mockOnValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({ unitSystem: UnitSystem.METRIC })
      );
    });

    it('should show metric labels when toggled', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const unitToggle = screen.getByLabelText(/unit system toggle/i);
      await user.click(unitToggle);
      
      await waitFor(() => {
        expect(screen.getByText(/metric/i)).toBeInTheDocument();
        expect(screen.getByText(/sq m/i)).toBeInTheDocument();
        expect(screen.getByText(/ml/i)).toBeInTheDocument();
      });
    });

    it('should convert values when unit system changes', async () => {
      const user = userEvent.setup();
      render(
        <EstimatorForm 
          {...defaultProps} 
          initialValues={defaultInitialValues}
        />
      );
      
      const unitToggle = screen.getByLabelText(/unit system toggle/i);
      await user.click(unitToggle);
      
      // Should call with converted values
      expect(mockOnValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({
          unitSystem: UnitSystem.METRIC,
          areaUnit: AreaUnit.SQUARE_METERS,
          applicationUnit: VolumeUnit.MILLILITERS
        })
      );
    });
  });

  describe('Form Layout Options', () => {
    it('should render in vertical layout', () => {
      render(
        <EstimatorForm 
          {...defaultProps} 
          layout="vertical"
        />
      );
      
      const form = screen.getByRole('form');
      expect(form).toHaveClass('estimator-form--vertical');
    });

    it('should render in horizontal layout', () => {
      render(
        <EstimatorForm 
          {...defaultProps} 
          layout="horizontal"
        />
      );
      
      const form = screen.getByRole('form');
      expect(form).toHaveClass('estimator-form--horizontal');
    });

    it('should render in grid layout', () => {
      render(
        <EstimatorForm 
          {...defaultProps} 
          layout="grid"
        />
      );
      
      const form = screen.getByRole('form');
      expect(form).toHaveClass('estimator-form--grid');
    });

    it('should render in compact mode', () => {
      render(
        <EstimatorForm 
          {...defaultProps} 
          compactMode={true}
        />
      );
      
      const form = screen.getByRole('form');
      expect(form).toHaveClass('estimator-form--compact');
    });
  });

  describe('Input Validation', () => {
    it('should show validation errors for invalid inputs', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '-100');
      
      await waitFor(() => {
        expect(screen.getByText(/area must be a positive number/i)).toBeInTheDocument();
      });
    });

    it('should validate application rate bounds', async () => {
      render(
        <EstimatorForm 
          {...defaultProps} 
          initialValues={{ ...defaultInitialValues, weedSize: WeedSize.SMALL }}
        />
      );
      
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      fireEvent.change(rateSlider, { target: { value: '3.0' } }); // Above max for small weeds
      
      await waitFor(() => {
        expect(screen.getByText(/application rate.*must be between/i)).toBeInTheDocument();
      });
    });

    it('should clear validation errors when inputs become valid', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const areaInput = screen.getByLabelText(/coverage area input/i);
      
      // Create error
      await user.clear(areaInput);
      await user.type(areaInput, '50');
      
      await waitFor(() => {
        expect(screen.getByText(/area must be at least/i)).toBeInTheDocument();
      });
      
      // Fix error
      await user.clear(areaInput);
      await user.type(areaInput, '1000');
      
      await waitFor(() => {
        expect(screen.queryByText(/area must be at least/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labeling', () => {
      render(<EstimatorForm {...defaultProps} />);
      
      const form = screen.getByRole('form', { name: /quantity estimator form/i });
      expect(form).toBeInTheDocument();
    });

    it('should have proper input labels', () => {
      render(<EstimatorForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/coverage area input/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/weed size selector/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/application rate slider/i)).toBeInTheDocument();
    });

    it('should associate validation errors with inputs', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '50');
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/area must be at least/i);
        expect(errorMessage).toBeInTheDocument();
        expect(areaInput).toHaveAttribute('aria-describedby');
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      // Tab through form elements
      await user.tab();
      expect(document.activeElement).toBeTruthy();
      
      await user.tab();
      expect(document.activeElement).toBeTruthy();
      
      await user.tab();
      expect(document.activeElement).toBeTruthy();
    });

    it('should announce changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      await user.selectOptions(weedSizeSelector, WeedSize.LARGE);
      
      // Should have aria-live region for dynamic updates
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle rapid input changes efficiently', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const areaInput = screen.getByLabelText(/coverage area input/i);
      
      // Rapid changes should be debounced
      for (let i = 0; i < 10; i++) {
        await user.clear(areaInput);
        await user.type(areaInput, `${1000 + i * 100}`);
      }
      
      // Should not call onValuesChange for every keystroke
      expect(mockOnValuesChange.mock.calls.length).toBeLessThan(50);
    });

    it('should render efficiently with large datasets', () => {
      const largeWeedConfig = Array(100).fill(null).map((_, i) => ({
        id: `weed-${i}` as WeedSize,
        label: `Weed Type ${i}`,
        description: `Description ${i}`,
        multiplier: 1 + i * 0.1,
        minRate: 1,
        maxRate: 5
      }));
      
      const start = performance.now();
      render(
        <EstimatorForm 
          {...defaultProps} 
          weedSizeConfig={largeWeedConfig}
        />
      );
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should render in under 100ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing initial values gracefully', () => {
      render(<EstimatorForm {...defaultProps} initialValues={undefined} />);
      
      // Should use default values
      expect(screen.getByLabelText(/coverage area input/i)).toHaveValue(1000);
    });

    it('should handle empty weed size config', () => {
      render(
        <EstimatorForm 
          {...defaultProps} 
          weedSizeConfig={[]}
        />
      );
      
      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      expect(weedSizeSelector).toBeInTheDocument();
      expect(weedSizeSelector.children).toHaveLength(0);
    });

    it('should handle decimal area values', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '1250.5');
      
      expect(mockOnValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({ area: 1250.5 })
      );
    });

    it('should handle very large area values', async () => {
      const user = userEvent.setup();
      render(<EstimatorForm {...defaultProps} />);
      
      const areaInput = screen.getByLabelText(/coverage area input/i);
      await user.clear(areaInput);
      await user.type(areaInput, '99999');
      
      expect(mockOnValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({ area: 99999 })
      );
    });

    it('should handle very small application rates', async () => {
      render(
        <EstimatorForm 
          {...defaultProps} 
          initialValues={{ ...defaultInitialValues, weedSize: WeedSize.SMALL }}
        />
      );
      
      const rateSlider = screen.getByLabelText(/application rate slider/i);
      fireEvent.change(rateSlider, { target: { value: '1.1' } });
      
      expect(mockOnValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({ applicationRate: 1.1 })
      );
    });
  });
});