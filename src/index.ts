// Main entry point for FireHawk Quantity Estimator

// Main Components
export { default as FireHawkEstimator } from './components/FireHawkEstimator';
export { default as EstimatorForm } from './components/EstimatorForm';
export { default as CalculationDisplay } from './components/CalculationDisplay';
export { default as AddToCartSection } from './components/AddToCartSection';

// Individual Input Components
export { default as AreaInput } from './components/AreaInput';
export { default as WeedSizeSelector } from './components/WeedSizeSelector';
export { default as ApplicationRateSlider } from './components/ApplicationRateSlider';

// Utilities
export { FireHawkCalculator } from './utils/FireHawkCalculator';
export { UnitConverter, unitConverter } from './utils/UnitConverter';

// Hooks
export {
  useFireHawkCalculator,
  useEstimatorValues,
  useRealtimeCalculation,
  useUnitSystem,
  useApplicationRateBounds,
  useFormattedValues,
  usePersistedEstimatorValues
} from './hooks/useFireHawkCalculator';

// Types and Interfaces
export type {
  // Core Types
  UnitSystem,
  AreaUnit,
  VolumeUnit,
  WeedSize,
  
  // Configuration Types
  WeedSizeConfig,
  ProductInfo,
  PackageSize,
  ApplicationRateConfig,
  
  // Component Props
  FireHawkEstimatorProps,
  EstimatorFormProps,
  AreaInputProps,
  WeedSizeSelectorProps,
  ApplicationRateSliderProps,
  CalculationDisplayProps,
  AddToCartSectionProps,
  
  // State and Calculation Types
  EstimatorValues,
  CalculationResult,
  CalculationBreakdown,
  CalculationStep,
  ProductRecommendation,
  
  // E-commerce Types
  CartItem,
  
  // Context Types
  EstimatorContextType,
  
  // Layout and Theme Types
  LayoutConfig,
  EstimatorTheme
} from './types';

// Constants
export {
  // Conversion factors
  CONVERSION_FACTORS,
  
  // Configuration
  WEED_SIZE_CONFIG,
  DEFAULT_APPLICATION_RATES,
  UNIT_SYSTEM_DEFAULTS,
  DEFAULT_ESTIMATOR_VALUES,
  
  // UI Constants
  BREAKPOINTS,
  RESPONSIVE_LAYOUTS,
  DEFAULT_THEME,
  ARIA_LABELS,
  
  // Calculation Constants
  CALCULATION_CONSTANTS,
  VALIDATION_RULES
} from './constants';

// Re-export enums for convenience
export {
  UnitSystem,
  AreaUnit,
  VolumeUnit,
  WeedSize
} from './types';

// Default export is the main component
export { FireHawkEstimator as default } from './components/FireHawkEstimator';