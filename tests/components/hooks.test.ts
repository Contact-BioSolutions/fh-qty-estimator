// Tests for custom React hooks
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useFireHawkCalculator,
  useEstimatorValues,
  useRealtimeCalculation,
  useUnitSystem,
  useApplicationRateBounds,
  useFormattedValues,
  usePersistedEstimatorValues
} from '../../src/hooks/useFireHawkCalculator';
import { 
  ProductInfo, 
  EstimatorValues, 
  UnitSystem, 
  WeedSize, 
  AreaUnit, 
  VolumeUnit 
} from '../../src/types';
import { FireHawkCalculator } from '../../src/utils/FireHawkCalculator';

describe('Custom Hooks Tests', () => {
  const mockProductInfo: ProductInfo = {
    id: 'test-product',
    name: 'Test Herbicide',
    sku: 'TEST-001',
    basePrice: 45.99,
    currency: 'USD',
    concentrationRatio: 2.5,
    packageSizes: [
      {
        id: 'test-16oz',
        volume: 16,
        unit: VolumeUnit.FLUID_OUNCES,
        price: 45.99,
        isPopular: true
      }
    ],
    applicationRates: {
      [WeedSize.SMALL]: { min: 1.0, max: 2.0, default: 1.5 },
      [WeedSize.MEDIUM]: { min: 1.5, max: 3.0, default: 2.0 },
      [WeedSize.LARGE]: { min: 2.0, max: 4.0, default: 3.0 },
      [WeedSize.EXTRA_LARGE]: { min: 3.0, max: 6.0, default: 4.0 }
    }
  };

  const mockEstimatorValues: EstimatorValues = {
    area: 1000,
    areaUnit: AreaUnit.SQUARE_FEET,
    weedSize: WeedSize.MEDIUM,
    applicationRate: 2.0,
    applicationUnit: VolumeUnit.FLUID_OUNCES,
    unitSystem: UnitSystem.IMPERIAL
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('useFireHawkCalculator', () => {
    it('should initialize with calculator instance', () => {
      const { result } = renderHook(() => useFireHawkCalculator(mockProductInfo));

      expect(result.current.calculator).toBeInstanceOf(FireHawkCalculator);
      expect(result.current.isCalculating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should perform calculations', async () => {
      const { result } = renderHook(() => useFireHawkCalculator(mockProductInfo));

      let calculationResult;
      await act(async () => {
        calculationResult = await result.current.calculate(mockEstimatorValues);
      });

      expect(calculationResult).toBeDefined();
      expect(calculationResult.requiredProduct).toBeGreaterThan(0);
      expect(calculationResult.totalMixture).toBeGreaterThan(0);
    });

    it('should handle calculation errors', async () => {
      const { result } = renderHook(() => useFireHawkCalculator(mockProductInfo));

      const invalidValues = { ...mockEstimatorValues, area: -100 };

      await act(async () => {
        try {
          await result.current.calculate(invalidValues);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should set calculating state during calculation', async () => {
      const { result } = renderHook(() => useFireHawkCalculator(mockProductInfo));

      let calculatingState = false;
      
      act(() => {
        result.current.calculate(mockEstimatorValues).then(() => {
          // Calculation complete
        });
        calculatingState = result.current.isCalculating;
      });

      expect(calculatingState).toBe(true);

      await waitFor(() => {
        expect(result.current.isCalculating).toBe(false);
      });
    });

    it('should clear errors', () => {
      const { result } = renderHook(() => useFireHawkCalculator(mockProductInfo));

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should memoize calculator instance', () => {
      const { result, rerender } = renderHook(
        ({ productInfo }) => useFireHawkCalculator(productInfo),
        { initialProps: { productInfo: mockProductInfo } }
      );

      const initialCalculator = result.current.calculator;

      // Rerender with same product info
      rerender({ productInfo: mockProductInfo });
      expect(result.current.calculator).toBe(initialCalculator);

      // Rerender with different product info
      const newProductInfo = { ...mockProductInfo, id: 'different-id' };
      rerender({ productInfo: newProductInfo });
      expect(result.current.calculator).not.toBe(initialCalculator);
    });
  });

  describe('useEstimatorValues', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useEstimatorValues());

      const [values] = result.current;
      expect(values.area).toBe(1000);
      expect(values.weedSize).toBe(WeedSize.MEDIUM);
      expect(values.unitSystem).toBe(UnitSystem.IMPERIAL);
    });

    it('should initialize with provided initial values', () => {
      const initialValues = { area: 2000, weedSize: WeedSize.LARGE };
      const { result } = renderHook(() => useEstimatorValues(initialValues));

      const [values] = result.current;
      expect(values.area).toBe(2000);
      expect(values.weedSize).toBe(WeedSize.LARGE);
    });

    it('should update values', () => {
      const { result } = renderHook(() => useEstimatorValues());

      act(() => {
        const [, updateValues] = result.current;
        updateValues({ area: 3000 });
      });

      const [values] = result.current;
      expect(values.area).toBe(3000);
    });

    it('should auto-adjust application rate when weed size changes', () => {
      const { result } = renderHook(() => 
        useEstimatorValues(undefined, mockProductInfo)
      );

      act(() => {
        const [, updateValues] = result.current;
        updateValues({ weedSize: WeedSize.LARGE });
      });

      const [values] = result.current;
      expect(values.applicationRate).toBe(3.0); // Default for large weeds
    });

    it('should validate values and set errors', () => {
      const { result } = renderHook(() => 
        useEstimatorValues(undefined, mockProductInfo)
      );

      act(() => {
        const [, updateValues] = result.current;
        updateValues({ area: -100 });
      });

      const [, , , validationErrors] = result.current;
      expect(validationErrors.length).toBeGreaterThan(0);
      expect(validationErrors.some(error => error.includes('positive number'))).toBe(true);
    });

    it('should reset values', () => {
      const { result } = renderHook(() => useEstimatorValues());

      act(() => {
        const [, updateValues] = result.current;
        updateValues({ area: 5000, weedSize: WeedSize.EXTRA_LARGE });
      });

      act(() => {
        const [, , resetValues] = result.current;
        resetValues();
      });

      const [values] = result.current;
      expect(values.area).toBe(1000);
      expect(values.weedSize).toBe(WeedSize.MEDIUM);
    });
  });

  describe('useRealtimeCalculation', () => {
    it('should perform calculation when values change', async () => {
      const calculator = new FireHawkCalculator(mockProductInfo);
      const { result } = renderHook(() =>
        useRealtimeCalculation(mockEstimatorValues, calculator, 100)
      );

      await waitFor(() => {
        expect(result.current.calculation).toBeDefined();
        expect(result.current.isCalculating).toBe(false);
      });
    });

    it('should debounce rapid changes', async () => {
      jest.useFakeTimers();
      const calculator = new FireHawkCalculator(mockProductInfo);
      
      const { result, rerender } = renderHook(
        ({ values }) => useRealtimeCalculation(values, calculator, 300),
        { initialProps: { values: mockEstimatorValues } }
      );

      // Rapid changes
      rerender({ values: { ...mockEstimatorValues, area: 1500 } });
      rerender({ values: { ...mockEstimatorValues, area: 2000 } });
      rerender({ values: { ...mockEstimatorValues, area: 2500 } });

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current.calculation).toBeDefined();
      });

      jest.useRealTimers();
    });

    it('should handle calculation errors', async () => {
      const calculator = new FireHawkCalculator(mockProductInfo);
      const invalidValues = { ...mockEstimatorValues, area: -100 };
      
      const { result } = renderHook(() =>
        useRealtimeCalculation(invalidValues, calculator)
      );

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.calculation).toBeNull();
      });
    });

    it('should cleanup timers on unmount', () => {
      jest.useFakeTimers();
      const calculator = new FireHawkCalculator(mockProductInfo);
      
      const { unmount } = renderHook(() =>
        useRealtimeCalculation(mockEstimatorValues, calculator)
      );

      unmount();

      // Should not throw or cause memory leaks
      act(() => {
        jest.runAllTimers();
      });

      jest.useRealTimers();
    });
  });

  describe('useUnitSystem', () => {
    it('should initialize with default unit system', () => {
      const { result } = renderHook(() => useUnitSystem());

      const [unitSystem] = result.current;
      expect(unitSystem).toBe(UnitSystem.IMPERIAL);
    });

    it('should initialize with specified unit system', () => {
      const { result } = renderHook(() => useUnitSystem(UnitSystem.METRIC));

      const [unitSystem] = result.current;
      expect(unitSystem).toBe(UnitSystem.METRIC);
    });

    it('should change unit system', () => {
      const { result } = renderHook(() => useUnitSystem());

      act(() => {
        const [, changeUnitSystem] = result.current;
        changeUnitSystem(UnitSystem.METRIC);
      });

      const [unitSystem] = result.current;
      expect(unitSystem).toBe(UnitSystem.METRIC);
    });

    it('should convert values between unit systems', () => {
      const { result } = renderHook(() => useUnitSystem());

      const [, , convertValues] = result.current;
      const convertedValues = convertValues(mockEstimatorValues, UnitSystem.METRIC);

      expect(convertedValues.unitSystem).toBe(UnitSystem.METRIC);
      expect(convertedValues.areaUnit).toBe(AreaUnit.SQUARE_METERS);
      expect(convertedValues.applicationUnit).toBe(VolumeUnit.MILLILITERS);
      expect(convertedValues.area).toBeCloseTo(92.9, 0);
    });
  });

  describe('useApplicationRateBounds', () => {
    it('should return bounds for weed size', () => {
      const calculator = new FireHawkCalculator(mockProductInfo);
      const { result } = renderHook(() =>
        useApplicationRateBounds(WeedSize.MEDIUM, calculator)
      );

      expect(result.current.min).toBe(1.5);
      expect(result.current.max).toBe(3.0);
      expect(result.current.recommended).toBe(2.0);
    });

    it('should update when weed size changes', () => {
      const calculator = new FireHawkCalculator(mockProductInfo);
      const { result, rerender } = renderHook(
        ({ weedSize }) => useApplicationRateBounds(weedSize, calculator),
        { initialProps: { weedSize: WeedSize.MEDIUM } }
      );

      expect(result.current.min).toBe(1.5);
      expect(result.current.max).toBe(3.0);

      rerender({ weedSize: WeedSize.LARGE });

      expect(result.current.min).toBe(2.0);
      expect(result.current.max).toBe(4.0);
      expect(result.current.recommended).toBe(3.0);
    });

    it('should memoize results for same inputs', () => {
      const calculator = new FireHawkCalculator(mockProductInfo);
      const { result, rerender } = renderHook(() =>
        useApplicationRateBounds(WeedSize.MEDIUM, calculator)
      );

      const initialResult = result.current;

      rerender();

      expect(result.current).toBe(initialResult);
    });
  });

  describe('useFormattedValues', () => {
    it('should format values for display', () => {
      const { result } = renderHook(() =>
        useFormattedValues(mockEstimatorValues)
      );

      expect(result.current.formattedArea).toBe('1000.0 sq ft');
      expect(result.current.formattedApplicationRate).toBe('2.0 fl oz');
    });

    it('should provide unit arrays for system', () => {
      const { result } = renderHook(() =>
        useFormattedValues(mockEstimatorValues)
      );

      expect(result.current.areaUnits).toContain('sq_ft');
      expect(result.current.areaUnits).toContain('acres');
      expect(result.current.volumeUnits).toContain('fl_oz');
      expect(result.current.volumeUnits).toContain('gallons');
    });

    it('should format metric values correctly', () => {
      const metricValues = {
        ...mockEstimatorValues,
        unitSystem: UnitSystem.METRIC,
        areaUnit: AreaUnit.SQUARE_METERS,
        applicationUnit: VolumeUnit.MILLILITERS,
        area: 100,
        applicationRate: 60
      };

      const { result } = renderHook(() => useFormattedValues(metricValues));

      expect(result.current.formattedArea).toBe('100.0 sq m');
      expect(result.current.formattedApplicationRate).toBe('60.0 ml');
    });

    it('should memoize formatted values', () => {
      const { result, rerender } = renderHook(() =>
        useFormattedValues(mockEstimatorValues)
      );

      const initialResult = result.current;

      rerender();

      expect(result.current).toBe(initialResult);
    });
  });

  describe('usePersistedEstimatorValues', () => {
    const testStorageKey = 'test-estimator-values';

    it('should initialize with default values when no storage', () => {
      const { result } = renderHook(() =>
        usePersistedEstimatorValues(testStorageKey)
      );

      const [values] = result.current;
      expect(values.area).toBe(1000);
      expect(values.weedSize).toBe(WeedSize.MEDIUM);
    });

    it('should load values from localStorage', () => {
      const storedValues = { area: 2500, weedSize: WeedSize.LARGE };
      localStorage.setItem(testStorageKey, JSON.stringify(storedValues));

      const { result } = renderHook(() =>
        usePersistedEstimatorValues(testStorageKey)
      );

      const [values] = result.current;
      expect(values.area).toBe(2500);
      expect(values.weedSize).toBe(WeedSize.LARGE);
    });

    it('should save values to localStorage when updated', () => {
      const { result } = renderHook(() =>
        usePersistedEstimatorValues(testStorageKey)
      );

      act(() => {
        const [, updateValues] = result.current;
        updateValues({ area: 3000 });
      });

      const stored = localStorage.getItem(testStorageKey);
      const parsedStored = JSON.parse(stored!);
      expect(parsedStored.area).toBe(3000);
    });

    it('should clear values and localStorage', () => {
      localStorage.setItem(testStorageKey, JSON.stringify({ area: 5000 }));

      const { result } = renderHook(() =>
        usePersistedEstimatorValues(testStorageKey)
      );

      act(() => {
        const [, , clearValues] = result.current;
        clearValues();
      });

      const [values] = result.current;
      expect(values.area).toBe(1000); // Back to default

      const stored = localStorage.getItem(testStorageKey);
      expect(stored).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalConsoleWarn = console.warn;
      console.warn = jest.fn();

      const mockLocalStorage = {
        getItem: jest.fn().mockImplementation(() => {
          throw new Error('localStorage error');
        }),
        setItem: jest.fn().mockImplementation(() => {
          throw new Error('localStorage error');
        }),
        removeItem: jest.fn().mockImplementation(() => {
          throw new Error('localStorage error');
        })
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });

      const { result } = renderHook(() =>
        usePersistedEstimatorValues(testStorageKey)
      );

      // Should still work with default values
      const [values] = result.current;
      expect(values.area).toBe(1000);

      // Should not crash when updating
      act(() => {
        const [, updateValues] = result.current;
        updateValues({ area: 2000 });
      });

      expect(console.warn).toHaveBeenCalled();
      console.warn = originalConsoleWarn;
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem(testStorageKey, 'invalid-json');

      const { result } = renderHook(() =>
        usePersistedEstimatorValues(testStorageKey)
      );

      // Should fall back to default values
      const [values] = result.current;
      expect(values.area).toBe(1000);
    });

    it('should merge initial values with stored values', () => {
      localStorage.setItem(testStorageKey, JSON.stringify({ area: 2000 }));
      const initialValues = { weedSize: WeedSize.EXTRA_LARGE };

      const { result } = renderHook(() =>
        usePersistedEstimatorValues(testStorageKey, initialValues)
      );

      const [values] = result.current;
      expect(values.area).toBe(2000); // From storage
      expect(values.weedSize).toBe(WeedSize.EXTRA_LARGE); // From initial values
    });
  });

  describe('Hook Integration', () => {
    it('should work together in realistic scenarios', async () => {
      const { result: calculatorResult } = renderHook(() =>
        useFireHawkCalculator(mockProductInfo)
      );

      const { result: valuesResult } = renderHook(() =>
        useEstimatorValues({ area: 1500 }, mockProductInfo)
      );

      const { result: unitSystemResult } = renderHook(() =>
        useUnitSystem(UnitSystem.IMPERIAL)
      );

      // Get current values
      const [values, updateValues] = valuesResult.current;
      const [unitSystem, changeUnitSystem] = unitSystemResult.current;
      const { calculator } = calculatorResult.current;

      // Perform calculation
      let calculation;
      await act(async () => {
        calculation = await calculator.calculate(values);
      });

      expect(calculation).toBeDefined();

      // Change unit system and values
      act(() => {
        changeUnitSystem(UnitSystem.METRIC);
        updateValues({ area: 2000 });
      });

      // Should handle changes smoothly
      expect(valuesResult.current[0].area).toBe(2000);
      expect(unitSystemResult.current[0]).toBe(UnitSystem.METRIC);
    });

    it('should handle rapid state changes without conflicts', async () => {
      const { result: valuesResult } = renderHook(() =>
        useEstimatorValues(undefined, mockProductInfo)
      );

      const { result: boundsResult } = renderHook(() =>
        useApplicationRateBounds(
          valuesResult.current[0].weedSize, 
          new FireHawkCalculator(mockProductInfo)
        )
      );

      // Rapid weed size changes
      act(() => {
        const [, updateValues] = valuesResult.current;
        updateValues({ weedSize: WeedSize.SMALL });
      });

      act(() => {
        const [, updateValues] = valuesResult.current;
        updateValues({ weedSize: WeedSize.LARGE });
      });

      act(() => {
        const [, updateValues] = valuesResult.current;
        updateValues({ weedSize: WeedSize.EXTRA_LARGE });
      });

      // Should eventually stabilize
      await waitFor(() => {
        expect(boundsResult.current.min).toBe(3.0);
        expect(boundsResult.current.max).toBe(6.0);
      });
    });
  });
});