// Component tests for CalculationDisplay
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculationDisplay } from '../../src/components/CalculationDisplay';
import { 
  CalculationResult, 
  UnitSystem, 
  AreaUnit, 
  VolumeUnit, 
  WeedSize 
} from '../../src/types';

describe('CalculationDisplay Component', () => {
  const mockCalculation: CalculationResult = {
    requiredProduct: 2.5,
    productUnit: VolumeUnit.FLUID_OUNCES,
    totalMixture: 2.0,
    mixtureUnit: VolumeUnit.GALLONS,
    coverageArea: 1000,
    coverageUnit: AreaUnit.SQUARE_FEET,
    estimatedCost: 45.99,
    currency: 'USD',
    recommendations: [
      {
        packageId: 'small-8oz',
        quantity: 1,
        totalCost: 24.99,
        efficiency: 3.12,
        isOptimal: false
      },
      {
        packageId: 'medium-16oz',
        quantity: 1,
        totalCost: 45.99,
        efficiency: 2.87,
        isOptimal: true
      },
      {
        packageId: 'large-32oz',
        quantity: 1,
        totalCost: 84.99,
        efficiency: 2.66,
        isOptimal: false
      }
    ],
    breakdown: {
      steps: [
        {
          id: 'area_conversion',
          description: 'Convert area to square feet',
          formula: '1000 sq ft × conversion factor',
          input: '1000 sq ft',
          output: '1000',
          unit: 'sq ft'
        },
        {
          id: 'weed_size_adjustment',
          description: 'Apply weed size multiplier',
          formula: '2.0 × 1.25',
          input: '2.0 fl oz',
          output: '2.50',
          unit: 'fl oz per 1000 sq ft'
        },
        {
          id: 'product_calculation',
          description: 'Calculate required FireHawk concentrate',
          formula: '(1000 ÷ 1000) × 2.50',
          input: '1000 sq ft',
          output: '2.50',
          unit: 'fl oz'
        },
        {
          id: 'mixture_calculation',
          description: 'Calculate total spray mixture',
          formula: '(1000 ÷ 1000) × 2.0',
          input: '1000 sq ft',
          output: '2.00',
          unit: 'gallons'
        }
      ],
      assumptions: [
        'Standard spray volume: 2.0 gallons per 1000 sq ft',
        'FireHawk concentration: 2.5%',
        'Weed size: Medium Weeds (6-12 inches tall)'
      ],
      factors: {
        weedSizeMultiplier: 1.25,
        applicationRate: 2.5,
        concentrationRatio: 2.5
      }
    }
  };

  describe('Basic Rendering', () => {
    it('should render calculation results', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
      expect(screen.getByText('2.5')).toBeInTheDocument();
      expect(screen.getByText(/fl oz/i)).toBeInTheDocument();
      expect(screen.getByText('2.0')).toBeInTheDocument();
      expect(screen.getByText(/gal/i)).toBeInTheDocument();
    });

    it('should render when calculation is null', () => {
      render(
        <CalculationDisplay 
          calculation={null}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
      expect(screen.getByText(/enter area and weed size/i)).toBeInTheDocument();
    });

    it('should show loading state during calculations', () => {
      render(
        <CalculationDisplay 
          calculation={null}
          unitSystem={UnitSystem.IMPERIAL}
          isCalculating={true}
        />
      );

      expect(screen.getByText(/calculating/i)).toBeInTheDocument();
    });
  });

  describe('Imperial System Display', () => {
    it('should display imperial units correctly', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      expect(screen.getByText(/fl oz/i)).toBeInTheDocument();
      expect(screen.getByText(/gal/i)).toBeInTheDocument();
      expect(screen.getByText(/sq ft/i)).toBeInTheDocument();
    });

    it('should format imperial values appropriately', () => {
      const largeCalculation = {
        ...mockCalculation,
        requiredProduct: 128.5,
        totalMixture: 10.25
      };

      render(
        <CalculationDisplay 
          calculation={largeCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      expect(screen.getByText('128.5')).toBeInTheDocument();
      expect(screen.getByText('10.3')).toBeInTheDocument(); // Rounded appropriately
    });
  });

  describe('Metric System Display', () => {
    it('should display metric units correctly', () => {
      const metricCalculation = {
        ...mockCalculation,
        productUnit: VolumeUnit.MILLILITERS,
        mixtureUnit: VolumeUnit.LITERS,
        coverageUnit: AreaUnit.SQUARE_METERS,
        requiredProduct: 73.9,
        totalMixture: 7.57
      };

      render(
        <CalculationDisplay 
          calculation={metricCalculation}
          unitSystem={UnitSystem.METRIC}
        />
      );

      expect(screen.getByText(/ml/i)).toBeInTheDocument();
      expect(screen.getByText(/L/i)).toBeInTheDocument();
      expect(screen.getByText(/sq m/i)).toBeInTheDocument();
    });

    it('should handle large metric values', () => {
      const largeMetricCalculation = {
        ...mockCalculation,
        productUnit: VolumeUnit.LITERS,
        mixtureUnit: VolumeUnit.LITERS,
        coverageUnit: AreaUnit.HECTARES,
        requiredProduct: 2.5,
        totalMixture: 200.0,
        coverageArea: 1.5
      };

      render(
        <CalculationDisplay 
          calculation={largeMetricCalculation}
          unitSystem={UnitSystem.METRIC}
        />
      );

      expect(screen.getByText('2.5')).toBeInTheDocument();
      expect(screen.getByText('200.0')).toBeInTheDocument();
      expect(screen.getByText('1.5')).toBeInTheDocument();
    });
  });

  describe('Package Recommendations', () => {
    it('should show package recommendations', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      expect(screen.getByText(/package recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/most cost-effective/i)).toBeInTheDocument();
    });

    it('should highlight optimal package', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      const optimalRecommendation = screen.getByText(/medium-16oz/i).closest('.package-recommendation');
      expect(optimalRecommendation).toHaveClass('package-recommendation--optimal');
    });

    it('should display package quantities and costs', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      expect(screen.getByText('$24.99')).toBeInTheDocument();
      expect(screen.getByText('$45.99')).toBeInTheDocument();
      expect(screen.getByText('$84.99')).toBeInTheDocument();
    });

    it('should show efficiency ratings', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      expect(screen.getByText(/\$2\.87.*per fl oz/i)).toBeInTheDocument();
      expect(screen.getByText(/\$3\.12.*per fl oz/i)).toBeInTheDocument();
      expect(screen.getByText(/\$2\.66.*per fl oz/i)).toBeInTheDocument();
    });

    it('should handle empty recommendations', () => {
      const calculationWithoutRecommendations = {
        ...mockCalculation,
        recommendations: []
      };

      render(
        <CalculationDisplay 
          calculation={calculationWithoutRecommendations}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      expect(screen.getByText(/no package recommendations available/i)).toBeInTheDocument();
    });
  });

  describe('Calculation Breakdown', () => {
    it('should show breakdown when enabled', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );

      expect(screen.getByText(/calculation breakdown/i)).toBeInTheDocument();
      expect(screen.getByText(/convert area to square feet/i)).toBeInTheDocument();
      expect(screen.getByText(/apply weed size multiplier/i)).toBeInTheDocument();
    });

    it('should hide breakdown when disabled', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={false}
        />
      );

      expect(screen.queryByText(/calculation breakdown/i)).not.toBeInTheDocument();
    });

    it('should display all calculation steps', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );

      expect(screen.getByText(/area conversion/i)).toBeInTheDocument();
      expect(screen.getByText(/weed size adjustment/i)).toBeInTheDocument();
      expect(screen.getByText(/product calculation/i)).toBeInTheDocument();
      expect(screen.getByText(/mixture calculation/i)).toBeInTheDocument();
    });

    it('should show calculation formulas', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );

      expect(screen.getByText(/1000 sq ft × conversion factor/i)).toBeInTheDocument();
      expect(screen.getByText(/2\.0 × 1\.25/i)).toBeInTheDocument();
      expect(screen.getByText(/\(1000 ÷ 1000\) × 2\.50/i)).toBeInTheDocument();
    });

    it('should display assumptions', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );

      expect(screen.getByText(/standard spray volume: 2\.0 gallons/i)).toBeInTheDocument();
      expect(screen.getByText(/firehawk concentration: 2\.5%/i)).toBeInTheDocument();
      expect(screen.getByText(/weed size: medium weeds/i)).toBeInTheDocument();
    });

    it('should show calculation factors', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );

      expect(screen.getByText(/weed size multiplier.*1\.25/i)).toBeInTheDocument();
      expect(screen.getByText(/application rate.*2\.5/i)).toBeInTheDocument();
      expect(screen.getByText(/concentration ratio.*2\.5/i)).toBeInTheDocument();
    });
  });

  describe('Cost Analysis', () => {
    it('should show cost analysis when enabled', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showCostAnalysis={true}
        />
      );

      expect(screen.getByText(/cost analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/estimated total cost/i)).toBeInTheDocument();
      expect(screen.getByText('$45.99')).toBeInTheDocument();
    });

    it('should hide cost analysis when disabled', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showCostAnalysis={false}
        />
      );

      expect(screen.queryByText(/cost analysis/i)).not.toBeInTheDocument();
    });

    it('should display cost per unit coverage', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showCostAnalysis={true}
        />
      );

      // Cost per sq ft: $45.99 / 1000 = $0.046
      expect(screen.getByText(/\$0\.05.*per sq ft/i)).toBeInTheDocument();
    });

    it('should handle different currencies', () => {
      const eurCalculation = {
        ...mockCalculation,
        currency: 'EUR',
        estimatedCost: 38.50
      };

      render(
        <CalculationDisplay 
          calculation={eurCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showCostAnalysis={true}
        />
      );

      expect(screen.getByText('€38.50')).toBeInTheDocument();
    });
  });

  describe('Interactive Features', () => {
    it('should allow toggling breakdown visibility', async () => {
      const user = userEvent.setup();
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle breakdown/i });
      expect(toggleButton).toBeInTheDocument();

      // Should show breakdown initially
      expect(screen.getByText(/calculation steps/i)).toBeInTheDocument();

      // Toggle off
      await user.click(toggleButton);
      expect(screen.queryByText(/calculation steps/i)).not.toBeInTheDocument();

      // Toggle back on
      await user.click(toggleButton);
      expect(screen.getByText(/calculation steps/i)).toBeInTheDocument();
    });

    it('should allow copying calculation details', async () => {
      const user = userEvent.setup();
      
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );

      const copyButton = screen.getByRole('button', { name: /copy calculation/i });
      await user.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Required Product: 2.5 fl oz')
      );
    });

    it('should allow exporting calculation data', async () => {
      const user = userEvent.setup();
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );

      const exportButton = screen.getByRole('button', { name: /export calculation/i });
      await user.click(exportButton);

      // Should trigger download
      expect(screen.getByText(/calculation exported/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Display', () => {
    it('should adapt to mobile layout', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      const displayContainer = screen.getByLabelText(/calculation results/i);
      expect(displayContainer).toHaveClass('calculation-display--mobile');
    });

    it('should show compact view on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );

      // Breakdown should be collapsible on mobile
      expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();
    });

    it('should handle tablet layout', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      const displayContainer = screen.getByLabelText(/calculation results/i);
      expect(displayContainer).toHaveClass('calculation-display--tablet');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing calculation data gracefully', () => {
      const incompleteCalculation = {
        ...mockCalculation,
        breakdown: undefined
      };

      render(
        <CalculationDisplay 
          calculation={incompleteCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );

      expect(screen.getByText(/breakdown not available/i)).toBeInTheDocument();
    });

    it('should handle zero values appropriately', () => {
      const zeroCalculation = {
        ...mockCalculation,
        requiredProduct: 0,
        totalMixture: 0,
        estimatedCost: 0
      };

      render(
        <CalculationDisplay 
          calculation={zeroCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      expect(screen.getByText('0.0')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      const largeCalculation = {
        ...mockCalculation,
        requiredProduct: 9999.99,
        totalMixture: 8888.88,
        coverageArea: 999999,
        estimatedCost: 77777.77
      };

      render(
        <CalculationDisplay 
          calculation={largeCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      expect(screen.getByText('9,999.99')).toBeInTheDocument();
      expect(screen.getByText('8,888.88')).toBeInTheDocument();
      expect(screen.getByText('999,999')).toBeInTheDocument();
      expect(screen.getByText('$77,777.77')).toBeInTheDocument();
    });

    it('should handle very small numbers', () => {
      const smallCalculation = {
        ...mockCalculation,
        requiredProduct: 0.001,
        totalMixture: 0.0001
      };

      render(
        <CalculationDisplay 
          calculation={smallCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      expect(screen.getByText('0.001')).toBeInTheDocument();
      expect(screen.getByText('0.0001')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/product quantity display/i)).toBeInTheDocument();
    });

    it('should announce updates to screen readers', () => {
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveTextContent(/calculation complete/i);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );

      // Should be able to navigate to interactive elements
      await user.tab();
      expect(document.activeElement).toBeTruthy();

      await user.tab();
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should render quickly with complex calculations', () => {
      const complexCalculation = {
        ...mockCalculation,
        recommendations: Array(50).fill(null).map((_, i) => ({
          packageId: `package-${i}`,
          quantity: i + 1,
          totalCost: (i + 1) * 25.99,
          efficiency: 2.5 + i * 0.1,
          isOptimal: i === 0
        })),
        breakdown: {
          ...mockCalculation.breakdown,
          steps: Array(20).fill(null).map((_, i) => ({
            id: `step-${i}`,
            description: `Calculation step ${i}`,
            formula: `formula ${i}`,
            input: `input ${i}`,
            output: `output ${i}`,
            unit: 'unit'
          }))
        }
      };

      const start = performance.now();
      render(
        <CalculationDisplay 
          calculation={complexCalculation}
          unitSystem={UnitSystem.IMPERIAL}
          showBreakdown={true}
        />
      );
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should render in under 100ms
    });

    it('should handle frequent updates efficiently', () => {
      const { rerender } = render(
        <CalculationDisplay 
          calculation={mockCalculation}
          unitSystem={UnitSystem.IMPERIAL}
        />
      );

      // Multiple rapid rerenders shouldn't cause performance issues
      for (let i = 0; i < 10; i++) {
        const updatedCalculation = {
          ...mockCalculation,
          requiredProduct: 2.5 + i * 0.1
        };

        rerender(
          <CalculationDisplay 
            calculation={updatedCalculation}
            unitSystem={UnitSystem.IMPERIAL}
          />
        );
      }

      expect(screen.getByText('3.4')).toBeInTheDocument();
    });
  });
});