// Custom React hooks for FireHawk Calculator

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  EstimatorValues,
  CalculationResult,
  ProductInfo,
  UnitSystem,
  WeedSize
} from '../types';
import { FireHawkCalculator } from '../utils/FireHawkCalculator';
import { unitConverter } from '../utils/UnitConverter';
import { 
  DEFAULT_ESTIMATOR_VALUES,
  CALCULATION_CONSTANTS,
  UNIT_SYSTEM_DEFAULTS
} from '../constants';

/**
 * Hook for managing the FireHawk calculator instance and calculations
 */
export function useFireHawkCalculator(productInfo: ProductInfo) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize calculator instance
  const calculator = useMemo(() => new FireHawkCalculator(productInfo), [productInfo]);

  const calculate = useCallback(async (values: EstimatorValues): Promise<CalculationResult> => {
    setIsCalculating(true);
    setError(null);

    try {
      // Validate inputs
      const validationErrors = calculator.validateInputs(values);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Perform calculation
      const result = calculator.calculate(values);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Calculation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCalculating(false);
    }
  }, [calculator]);

  return {
    calculate,
    calculator,
    isCalculating,
    error,
    clearError: () => setError(null)
  };
}

/**
 * Hook for managing estimator form values with validation
 */
export function useEstimatorValues(
  initialValues?: Partial<EstimatorValues>,
  productInfo?: ProductInfo
): [
  EstimatorValues,
  (updates: Partial<EstimatorValues>) => void,
  () => void,
  string[]
] {
  const [values, setValues] = useState<EstimatorValues>(() => ({
    ...DEFAULT_ESTIMATOR_VALUES,
    ...initialValues
  }));

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Update values with validation
  const updateValues = useCallback((updates: Partial<EstimatorValues>) => {
    setValues(prevValues => {
      const newValues = { ...prevValues, ...updates };
      
      // Auto-adjust application rate when weed size changes
      if (updates.weedSize && updates.weedSize !== prevValues.weedSize && productInfo) {
        const calculator = new FireHawkCalculator(productInfo);
        const recommendedRate = calculator.getRecommendedRate(updates.weedSize);
        newValues.applicationRate = recommendedRate;
      }

      // Validate new values
      if (productInfo) {
        const calculator = new FireHawkCalculator(productInfo);
        const errors = calculator.validateInputs(newValues);
        setValidationErrors(errors);
      }

      return newValues;
    });
  }, [productInfo]);

  // Reset to default values
  const resetValues = useCallback(() => {
    setValues({ ...DEFAULT_ESTIMATOR_VALUES, ...initialValues });
    setValidationErrors([]);
  }, [initialValues]);

  return [values, updateValues, resetValues, validationErrors];
}

/**
 * Hook for real-time calculations with debouncing
 */
export function useRealtimeCalculation(
  values: EstimatorValues,
  calculator: FireHawkCalculator,
  debounceMs: number = CALCULATION_CONSTANTS.CALCULATION_DEBOUNCE
): {
  calculation: CalculationResult | null;
  isCalculating: boolean;
  error: string | null;
} {
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const calculateWithDebounce = useCallback(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      setIsCalculating(true);
      setError(null);

      try {
        const result = calculator.calculate(values);
        setCalculation(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Calculation failed';
        setError(errorMessage);
        setCalculation(null);
      } finally {
        setIsCalculating(false);
      }
    }, debounceMs);
  }, [values, calculator, debounceMs]);

  // Trigger calculation when values change
  useEffect(() => {
    calculateWithDebounce();
    
    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [calculateWithDebounce]);

  return { calculation, isCalculating, error };
}

/**
 * Hook for managing unit system conversion
 */
export function useUnitSystem(
  initialSystem: UnitSystem = UnitSystem.IMPERIAL
): [
  UnitSystem,
  (system: UnitSystem) => void,
  (values: EstimatorValues, targetSystem: UnitSystem) => EstimatorValues
] {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialSystem);

  const convertValues = useCallback((values: EstimatorValues, targetSystem: UnitSystem) => {
    return unitConverter.convertToSystem(values, targetSystem);
  }, []);

  const changeUnitSystem = useCallback((newSystem: UnitSystem) => {
    setUnitSystem(newSystem);
  }, []);

  return [unitSystem, changeUnitSystem, convertValues];
}

/**
 * Hook for managing application rate bounds based on weed size
 */
export function useApplicationRateBounds(
  weedSize: WeedSize,
  calculator: FireHawkCalculator
): {
  min: number;
  max: number;
  recommended: number;
} {
  return useMemo(() => {
    const bounds = calculator.getRateBounds(weedSize);
    const recommended = calculator.getRecommendedRate(weedSize);
    
    return {
      min: bounds.min,
      max: bounds.max,
      recommended
    };
  }, [weedSize, calculator]);
}

/**
 * Hook for formatting display values with appropriate units
 */
export function useFormattedValues(
  values: EstimatorValues
): {
  formattedArea: string;
  formattedApplicationRate: string;
  areaUnits: string[];
  volumeUnits: string[];
} {
  return useMemo(() => {
    const systemDefaults = UNIT_SYSTEM_DEFAULTS[values.unitSystem];
    
    return {
      formattedArea: unitConverter.formatArea(values.area, values.areaUnit),
      formattedApplicationRate: unitConverter.formatVolume(values.applicationRate, values.applicationUnit),
      areaUnits: systemDefaults.areaUnits.map(unit => unit.toString()),
      volumeUnits: systemDefaults.volumeUnits.map(unit => unit.toString())
    };
  }, [values]);
}

/**
 * Hook for managing local storage persistence
 */
export function usePersistedEstimatorValues(
  storageKey: string = 'firehawk-estimator-values',
  initialValues?: Partial<EstimatorValues>
): [
  EstimatorValues,
  (updates: Partial<EstimatorValues>) => void,
  () => void
] {
  // Load from localStorage on mount
  const [values, setValues] = useState<EstimatorValues>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedValues = JSON.parse(stored);
        return { ...DEFAULT_ESTIMATOR_VALUES, ...parsedValues, ...initialValues };
      }
    } catch (error) {
      console.warn('Failed to load estimator values from localStorage:', error);
    }
    
    return { ...DEFAULT_ESTIMATOR_VALUES, ...initialValues };
  });

  // Update values and persist to localStorage
  const updateValues = useCallback((updates: Partial<EstimatorValues>) => {
    setValues(prevValues => {
      const newValues = { ...prevValues, ...updates };
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(newValues));
      } catch (error) {
        console.warn('Failed to save estimator values to localStorage:', error);
      }
      
      return newValues;
    });
  }, [storageKey]);

  // Clear values and localStorage
  const clearValues = useCallback(() => {
    const defaultValues = { ...DEFAULT_ESTIMATOR_VALUES, ...initialValues };
    setValues(defaultValues);
    
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear estimator values from localStorage:', error);
    }
  }, [storageKey, initialValues]);

  return [values, updateValues, clearValues];
}