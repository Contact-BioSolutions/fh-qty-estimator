// Performance tests for the FireHawk Estimator
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FireHawkEstimator } from '../../src/components/FireHawkEstimator';
import { ProductInfo, UnitSystem, WeedSize, AreaUnit, VolumeUnit } from '../../src/types';

describe('Performance Tests', () => {
  const mockProductInfo: ProductInfo = {
    id: 'performance-test',
    name: 'Performance Test Herbicide',
    sku: 'PERF-001',
    basePrice: 45.99,
    currency: 'USD',
    concentrationRatio: 2.5,
    packageSizes: Array(20).fill(null).map((_, i) => ({
      id: `package-${i}`,
      volume: 4 + i * 2,
      unit: VolumeUnit.FLUID_OUNCES,
      price: 15.99 + i * 10,
      isPopular: i === 5
    })),
    applicationRates: {
      [WeedSize.SMALL]: { min: 1.0, max: 2.0, default: 1.5 },
      [WeedSize.MEDIUM]: { min: 1.5, max: 3.0, default: 2.0 },
      [WeedSize.LARGE]: { min: 2.0, max: 4.0, default: 3.0 },
      [WeedSize.EXTRA_LARGE]: { min: 3.0, max: 6.0, default: 4.0 }
    }
  };

  const measureRenderTime = (component: React.ReactElement) => {
    const start = performance.now();
    render(component);
    const end = performance.now();
    return end - start;
  };

  describe('Initial Render Performance', () => {
    it('should render initial component quickly', () => {
      const renderTime = measureRenderTime(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );

      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
    });

    it('should render with large package list efficiently', () => {
      const largeProductInfo = {
        ...mockProductInfo,
        packageSizes: Array(100).fill(null).map((_, i) => ({
          id: `package-${i}`,
          volume: 4 + i,
          unit: VolumeUnit.FLUID_OUNCES,
          price: 15.99 + i * 2,
          isPopular: i === 50
        }))
      };

      const renderTime = measureRenderTime(
        <FireHawkEstimator productInfo={largeProductInfo} />
      );

      expect(renderTime).toBeLessThan(200); // Should handle large datasets efficiently
    });

    it('should render with complex calculation breakdown efficiently', () => {
      const renderTime = measureRenderTime(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          showBreakdown={true}
          showCostAnalysis={true}
        />
      );

      expect(renderTime).toBeLessThan(150);
    });
  });

  describe('Calculation Performance', () => {
    it('should perform calculations quickly', async () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      const start = performance.now();
      
      // Wait for initial calculation
      await waitFor(() => {
        expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(500); // Initial calculation under 500ms
    });

    it('should handle rapid input changes efficiently', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      const areaInput = screen.getByLabelText(/coverage area input/i);
      const start = performance.now();

      // Simulate rapid typing
      for (let i = 0; i < 20; i++) {
        await user.clear(areaInput);
        await user.type(areaInput, `${1000 + i * 100}`);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(2000); // 20 rapid changes in under 2s
    });

    it('should debounce calculations effectively', async () => {
      const user = userEvent.setup();
      const mockOnCalculationChange = jest.fn();
      
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onCalculationChange={mockOnCalculationChange}
        />
      );

      const areaInput = screen.getByLabelText(/coverage area input/i);

      // Rapid changes should be debounced
      await user.clear(areaInput);
      await user.type(areaInput, '1500');
      await user.clear(areaInput);
      await user.type(areaInput, '2000');
      await user.clear(areaInput);
      await user.type(areaInput, '2500');

      // Wait for debounce to settle
      await waitFor(() => {
        expect(mockOnCalculationChange).toHaveBeenCalled();
      });

      // Should not call calculation for every keystroke
      expect(mockOnCalculationChange.mock.calls.length).toBeLessThan(10);
    });

    it('should handle complex area calculations efficiently', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      const testAreas = [
        100, 500, 1000, 5000, 10000, 25000, 50000, 75000, 100000
      ];

      const start = performance.now();

      for (const area of testAreas) {
        const areaInput = screen.getByLabelText(/coverage area input/i);
        await user.clear(areaInput);
        await user.type(areaInput, area.toString());
        
        await waitFor(() => {
          expect(screen.getByDisplayValue(area.toString())).toBeInTheDocument();
        });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5000); // All calculations in under 5s
    });
  });

  describe('UI Interaction Performance', () => {
    it('should handle slider interactions smoothly', async () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      const rateSlider = screen.getByLabelText(/application rate slider/i);
      const start = performance.now();

      // Simulate dragging slider
      for (let i = 15; i <= 30; i++) {
        fireEvent.change(rateSlider, { target: { value: (i / 10).toString() } });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // Smooth slider interaction
    });

    it('should handle dropdown changes efficiently', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
      const start = performance.now();

      // Cycle through all weed sizes
      const weedSizes = [WeedSize.SMALL, WeedSize.MEDIUM, WeedSize.LARGE, WeedSize.EXTRA_LARGE];
      
      for (const weedSize of weedSizes) {
        await user.selectOptions(weedSizeSelector, weedSize);
        await waitFor(() => {
          expect(weedSizeSelector).toHaveValue(weedSize);
        });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(2000); // All dropdown changes in under 2s
    });

    it('should handle unit system toggling efficiently', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      const unitToggle = screen.getByLabelText(/unit system toggle/i);
      const start = performance.now();

      // Toggle between systems multiple times
      for (let i = 0; i < 10; i++) {
        await user.click(unitToggle);
        await waitFor(() => {
          const expectedText = i % 2 === 0 ? /metric/i : /imperial/i;
          expect(screen.getByText(expectedText)).toBeInTheDocument();
        });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(3000); // 10 toggles in under 3s
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not leak memory with repeated renders', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Render and unmount multiple times
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(
          <FireHawkEstimator productInfo={mockProductInfo} />
        );
        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
      }
    });

    it('should clean up event listeners properly', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );

      const addCount = addEventListenerSpy.mock.calls.length;
      
      unmount();

      const removeCount = removeEventListenerSpy.mock.calls.length;

      // Should clean up most event listeners (some may be shared)
      expect(removeCount).toBeGreaterThanOrEqual(addCount * 0.8);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should handle large datasets without memory issues', () => {
      const largeProductInfo = {
        ...mockProductInfo,
        packageSizes: Array(1000).fill(null).map((_, i) => ({
          id: `package-${i}`,
          volume: 4 + i,
          unit: VolumeUnit.FLUID_OUNCES,
          price: 15.99 + i,
          isPopular: i === 500
        }))
      };

      const start = performance.now();
      const { unmount } = render(
        <FireHawkEstimator productInfo={largeProductInfo} />
      );
      const renderTime = performance.now() - start;

      expect(renderTime).toBeLessThan(500); // Should handle large datasets

      unmount();
    });
  });

  describe('Calculation Engine Performance', () => {
    it('should handle batch calculations efficiently', async () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      const testCases = [
        { area: 1000, weedSize: WeedSize.SMALL, rate: 1.5 },
        { area: 2500, weedSize: WeedSize.MEDIUM, rate: 2.0 },
        { area: 5000, weedSize: WeedSize.LARGE, rate: 3.0 },
        { area: 10000, weedSize: WeedSize.EXTRA_LARGE, rate: 4.0 },
        { area: 25000, weedSize: WeedSize.LARGE, rate: 3.5 },
        { area: 50000, weedSize: WeedSize.MEDIUM, rate: 2.5 },
        { area: 75000, weedSize: WeedSize.SMALL, rate: 1.8 },
        { area: 100000, weedSize: WeedSize.EXTRA_LARGE, rate: 5.0 }
      ];

      const start = performance.now();

      for (const testCase of testCases) {
        const areaInput = screen.getByLabelText(/coverage area input/i);
        const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
        const rateSlider = screen.getByLabelText(/application rate slider/i);

        await userEvent.clear(areaInput);
        await userEvent.type(areaInput, testCase.area.toString());
        await userEvent.selectOptions(weedSizeSelector, testCase.weedSize);
        fireEvent.change(rateSlider, { target: { value: testCase.rate.toString() } });

        await waitFor(() => {
          expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
        });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(8000); // 8 complex calculations in under 8s
    });

    it('should handle unit conversion calculations efficiently', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      const unitToggle = screen.getByLabelText(/unit system toggle/i);
      const areaInput = screen.getByLabelText(/coverage area input/i);

      const start = performance.now();

      // Test multiple conversions
      for (let i = 0; i < 20; i++) {
        await user.clear(areaInput);
        await user.type(areaInput, (1000 + i * 500).toString());
        await user.click(unitToggle);
        
        await waitFor(() => {
          expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
        });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10000); // 20 conversions in under 10s
    });

    it('should handle edge case calculations efficiently', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      const edgeCases = [
        { area: 100, rate: 1.0 }, // Minimum values
        { area: 100000, rate: 6.0 }, // Maximum values
        { area: 1234.56, rate: 2.345 }, // Decimal values
        { area: 999.99, rate: 1.999 }, // Near boundaries
      ];

      const start = performance.now();

      for (const edgeCase of edgeCases) {
        const areaInput = screen.getByLabelText(/coverage area input/i);
        const rateSlider = screen.getByLabelText(/application rate slider/i);

        await user.clear(areaInput);
        await user.type(areaInput, edgeCase.area.toString());
        fireEvent.change(rateSlider, { target: { value: edgeCase.rate.toString() } });

        await waitFor(() => {
          expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
        });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(4000); // Edge cases in under 4s
    });
  });

  describe('Rendering Performance with Complex Data', () => {
    it('should render calculation breakdown efficiently', async () => {
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          showBreakdown={true}
        />
      );

      const start = performance.now();

      await waitFor(() => {
        expect(screen.getByText(/calculation breakdown/i)).toBeInTheDocument();
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(1000);
    });

    it('should render package recommendations efficiently', async () => {
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      const start = performance.now();

      await waitFor(() => {
        expect(screen.getByText(/package recommendations/i)).toBeInTheDocument();
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(1000);
    });

    it('should handle responsive layout changes efficiently', () => {
      const { rerender } = render(
        <FireHawkEstimator productInfo={mockProductInfo} />
      );

      const viewportSizes = [320, 768, 1024, 1440, 1920];

      const start = performance.now();

      viewportSizes.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        fireEvent(window, new Event('resize'));

        rerender(<FireHawkEstimator productInfo={mockProductInfo} />);
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // Responsive changes in under 1s
    });
  });

  describe('Stress Testing', () => {
    it('should handle extreme rapid input changes', async () => {
      const user = userEvent.setup();
      render(<FireHawkEstimator productInfo={mockProductInfo} />);

      const areaInput = screen.getByLabelText(/coverage area input/i);
      const start = performance.now();

      // Extremely rapid changes
      for (let i = 0; i < 100; i++) {
        await user.clear(areaInput);
        await user.type(areaInput, (Math.random() * 100000).toFixed(0));
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10000); // 100 rapid changes in under 10s
    });

    it('should maintain performance with maximum package sizes', async () => {
      const maxProductInfo = {
        ...mockProductInfo,
        packageSizes: Array(500).fill(null).map((_, i) => ({
          id: `max-package-${i}`,
          volume: Math.random() * 100,
          unit: i % 2 === 0 ? VolumeUnit.FLUID_OUNCES : VolumeUnit.GALLONS,
          price: Math.random() * 200,
          isPopular: i === 250
        }))
      };

      const start = performance.now();
      const { unmount } = render(
        <FireHawkEstimator productInfo={maxProductInfo} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/calculation results/i)).toBeInTheDocument();
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(2000); // Max packages in under 2s

      unmount();
    });

    it('should handle concurrent operations efficiently', async () => {
      const user = userEvent.setup();
      render(
        <FireHawkEstimator 
          productInfo={mockProductInfo}
          onAddToCart={jest.fn()}
        />
      );

      const start = performance.now();

      // Simulate user doing multiple things at once
      const promises = [
        // Change area
        (async () => {
          const areaInput = screen.getByLabelText(/coverage area input/i);
          for (let i = 0; i < 10; i++) {
            await user.clear(areaInput);
            await user.type(areaInput, (1000 + i * 100).toString());
          }
        })(),
        
        // Change weed size
        (async () => {
          const weedSizeSelector = screen.getByLabelText(/weed size selector/i);
          const weedSizes = [WeedSize.SMALL, WeedSize.MEDIUM, WeedSize.LARGE, WeedSize.EXTRA_LARGE];
          for (let i = 0; i < 10; i++) {
            await user.selectOptions(weedSizeSelector, weedSizes[i % 4]);
          }
        })(),
        
        // Move slider
        (async () => {
          const rateSlider = screen.getByLabelText(/application rate slider/i);
          for (let i = 0; i < 10; i++) {
            fireEvent.change(rateSlider, { target: { value: (1.5 + i * 0.2).toString() } });
          }
        })()
      ];

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(15000); // Concurrent operations in under 15s
    });
  });
});