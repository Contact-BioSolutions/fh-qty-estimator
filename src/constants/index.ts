// Constants for FireHawk Quantity Estimator

import { AreaUnit, VolumeUnit, WeedSize, WeedSizeConfig, UnitSystem, LayoutConfig } from '../types';

// Unit Conversion Factors
export const CONVERSION_FACTORS = {
  AREA: {
    [AreaUnit.SQUARE_FEET]: {
      [AreaUnit.SQUARE_METERS]: 0.092903,
      [AreaUnit.ACRES]: 2.2957e-5,
      [AreaUnit.HECTARES]: 9.2903e-6
    },
    [AreaUnit.SQUARE_METERS]: {
      [AreaUnit.SQUARE_FEET]: 10.7639,
      [AreaUnit.ACRES]: 0.000247105,
      [AreaUnit.HECTARES]: 0.0001
    },
    [AreaUnit.ACRES]: {
      [AreaUnit.SQUARE_FEET]: 43560,
      [AreaUnit.SQUARE_METERS]: 4046.86,
      [AreaUnit.HECTARES]: 0.404686
    },
    [AreaUnit.HECTARES]: {
      [AreaUnit.SQUARE_FEET]: 107639,
      [AreaUnit.SQUARE_METERS]: 10000,
      [AreaUnit.ACRES]: 2.47105
    }
  },
  VOLUME: {
    [VolumeUnit.FLUID_OUNCES]: {
      [VolumeUnit.MILLILITERS]: 29.5735,
      [VolumeUnit.GALLONS]: 0.0078125,
      [VolumeUnit.LITERS]: 0.0295735
    },
    [VolumeUnit.MILLILITERS]: {
      [VolumeUnit.FLUID_OUNCES]: 0.033814,
      [VolumeUnit.GALLONS]: 0.000264172,
      [VolumeUnit.LITERS]: 0.001
    },
    [VolumeUnit.GALLONS]: {
      [VolumeUnit.FLUID_OUNCES]: 128,
      [VolumeUnit.MILLILITERS]: 3785.41,
      [VolumeUnit.LITERS]: 3.78541
    },
    [VolumeUnit.LITERS]: {
      [VolumeUnit.FLUID_OUNCES]: 33.814,
      [VolumeUnit.MILLILITERS]: 1000,
      [VolumeUnit.GALLONS]: 0.264172
    }
  }
} as const;

// Weed Size Configuration with water volume rates (L/ha)
export const WEED_SIZE_CONFIG: WeedSizeConfig[] = [
  {
    id: WeedSize.SMALL,
    label: 'Small Weeds',
    description: 'Less than 6 inches tall',
    multiplier: 1.0,
    minRate: 3.0,
    maxRate: 7.0,
    waterVolumePerHa: 750  // L/ha for small weeds
  },
  {
    id: WeedSize.MEDIUM,
    label: 'Medium Weeds',
    description: '6-12 inches tall',
    multiplier: 1.0,
    minRate: 4.0,
    maxRate: 8.0,
    waterVolumePerHa: 900  // L/ha for medium weeds
  },
  {
    id: WeedSize.LARGE,
    label: 'Large Weeds',
    description: '12-24 inches tall',
    multiplier: 1.0,
    minRate: 5.0,
    maxRate: 9.0,
    waterVolumePerHa: 1000  // L/ha for large weeds
  },
  {
    id: WeedSize.EXTRA_LARGE,
    label: 'Extra Large Weeds',
    description: 'Over 24 inches tall',
    multiplier: 1.0,
    minRate: 5.0,
    maxRate: 10.0,
    waterVolumePerHa: 1000  // L/ha for extra large weeds
  }
];

// Default Application Rates (L/100L of water)
export const DEFAULT_APPLICATION_RATES = {
  [WeedSize.SMALL]: { min: 3.0, max: 7.0, default: 5.0 },
  [WeedSize.MEDIUM]: { min: 4.0, max: 8.0, default: 5.0 },
  [WeedSize.LARGE]: { min: 5.0, max: 9.0, default: 6.0 },
  [WeedSize.EXTRA_LARGE]: { min: 5.0, max: 10.0, default: 7.0 }
} as const;

// Responsive Breakpoints
export const BREAKPOINTS = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px'
} as const;

// Responsive Layout Configurations
export const RESPONSIVE_LAYOUTS: Record<string, LayoutConfig> = {
  mobile: {
    formLayout: 'vertical',
    slidersPerRow: 1,
    showLabelsInline: false,
    compactMode: true
  },
  tablet: {
    formLayout: 'grid',
    slidersPerRow: 2,
    showLabelsInline: true,
    compactMode: false
  },
  desktop: {
    formLayout: 'horizontal',
    slidersPerRow: 3,
    showLabelsInline: true,
    compactMode: false
  }
};

// Unit System Defaults
export const UNIT_SYSTEM_DEFAULTS = {
  [UnitSystem.IMPERIAL]: {
    areaUnit: AreaUnit.SQUARE_FEET,
    volumeUnit: VolumeUnit.FLUID_OUNCES,
    areaUnits: [AreaUnit.SQUARE_FEET, AreaUnit.ACRES],
    volumeUnits: [VolumeUnit.FLUID_OUNCES, VolumeUnit.GALLONS]
  },
  [UnitSystem.METRIC]: {
    areaUnit: AreaUnit.SQUARE_METERS,
    volumeUnit: VolumeUnit.MILLILITERS,
    areaUnits: [AreaUnit.SQUARE_METERS, AreaUnit.HECTARES],
    volumeUnits: [VolumeUnit.MILLILITERS, VolumeUnit.LITERS]
  }
} as const;

// Default Estimator Values
export const DEFAULT_ESTIMATOR_VALUES = {
  area: 1000,
  areaUnit: AreaUnit.SQUARE_FEET,
  weedSize: WeedSize.MEDIUM,
  applicationRate: 5.0, // L/100L
  applicationUnit: 'L/100L' as any,
  unitSystem: UnitSystem.IMPERIAL
} as const;

// Calculation Constants
export const CALCULATION_CONSTANTS = {
  // Water volumes by weed size (L/ha)
  WATER_VOLUMES: {
    [WeedSize.SMALL]: 750,
    [WeedSize.MEDIUM]: 900,
    [WeedSize.LARGE]: 1000,
    [WeedSize.EXTRA_LARGE]: 1000
  },
  // Concentration ratio for FireHawk (%)
  FIREHAWK_CONCENTRATION: 2.5,
  // Minimum/Maximum area limits
  MIN_AREA: 100,
  MAX_AREA: 100000,
  // Debounce time for real-time calculations (ms)
  CALCULATION_DEBOUNCE: 300
} as const;

// Default Theme
export const DEFAULT_THEME = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#10b981',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem'
    },
    weights: {
      normal: 400,
      medium: 500,
      bold: 700
    }
  }
} as const;

// ARIA Labels and Accessibility
export const ARIA_LABELS = {
  areaInput: 'Coverage area input',
  areaSlider: 'Coverage area slider',
  weedSizeSelector: 'Weed size selector',
  applicationRateSlider: 'Application rate slider',
  unitSystemToggle: 'Unit system toggle',
  calculationDisplay: 'Calculation results',
  addToCartButton: 'Add to cart',
  productQuantity: 'Product quantity display',
  estimatorForm: 'Quantity estimator form'
} as const;

// Input Validation Rules
export const VALIDATION_RULES = {
  area: {
    min: CALCULATION_CONSTANTS.MIN_AREA,
    max: CALCULATION_CONSTANTS.MAX_AREA,
    step: 1
  },
  applicationRate: {
    min: 3.0,
    max: 10.0,
    step: 0.5
  }
} as const;