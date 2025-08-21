// Core TypeScript interfaces and types for FireHawk Quantity Estimator

// Measurement Units
export enum UnitSystem {
  IMPERIAL = 'imperial',
  METRIC = 'metric'
}

export enum AreaUnit {
  SQUARE_FEET = 'sq_ft',
  SQUARE_METERS = 'sq_m',
  ACRES = 'acres',
  HECTARES = 'hectares'
}

export enum VolumeUnit {
  FLUID_OUNCES = 'fl_oz',
  GALLONS = 'gallons',
  MILLILITERS = 'ml',
  LITERS = 'liters'
}

// Weed Management
export enum WeedSize {
  SMALL = 'small',        // < 6 inches
  MEDIUM = 'medium',      // 6-12 inches
  LARGE = 'large',        // 12-24 inches
  EXTRA_LARGE = 'xl'      // > 24 inches
}

export interface WeedSizeConfig {
  id: WeedSize;
  label: string;
  description: string;
  multiplier: number;     // Application rate multiplier
  minRate: number;        // Minimum application rate
  maxRate: number;        // Maximum application rate
}

// Product Configuration
export interface ProductInfo {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  currency: string;
  concentrationRatio: number;  // e.g., 2.5 for 2.5% concentration
  packageSizes: PackageSize[];
  applicationRates: ApplicationRateConfig;
}

export interface PackageSize {
  id: string;
  volume: number;
  unit: VolumeUnit;
  price: number;
  isPopular?: boolean;
}

export interface ApplicationRateConfig {
  [WeedSize.SMALL]: { min: number; max: number; default: number };
  [WeedSize.MEDIUM]: { min: number; max: number; default: number };
  [WeedSize.LARGE]: { min: number; max: number; default: number };
  [WeedSize.EXTRA_LARGE]: { min: number; max: number; default: number };
}

// Component Props Interfaces
export interface FireHawkEstimatorProps {
  productInfo: ProductInfo;
  initialUnitSystem?: UnitSystem;
  onAddToCart?: (cartItem: CartItem) => void;
  onCalculationChange?: (calculation: CalculationResult) => void;
  className?: string;
}

export interface EstimatorFormProps {
  onValuesChange: (values: EstimatorValues) => void;
  unitSystem: UnitSystem;
  weedSizeConfig: WeedSizeConfig[];
  applicationRates: ApplicationRateConfig;
  initialValues?: Partial<EstimatorValues>;
}

export interface AreaInputProps {
  value: number;
  onChange: (value: number) => void;
  unitSystem: UnitSystem;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showSlider?: boolean;
  showManualInput?: boolean;
}

export interface WeedSizeSelectorProps {
  value: WeedSize;
  onChange: (size: WeedSize) => void;
  options: WeedSizeConfig[];
  layout?: 'dropdown' | 'radio' | 'cards';
}

export interface ApplicationRateSliderProps {
  value: number;
  onChange: (rate: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: VolumeUnit;
  weedSize: WeedSize;
  showMarkers?: boolean;
}

export interface CalculationDisplayProps {
  calculation: CalculationResult;
  unitSystem: UnitSystem;
  showBreakdown?: boolean;
  showCostAnalysis?: boolean;
}

export interface AddToCartSectionProps {
  calculation: CalculationResult;
  productInfo: ProductInfo;
  onAddToCart: (item: CartItem) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

// State & Calculation Models
export interface EstimatorValues {
  area: number;
  areaUnit: AreaUnit;
  weedSize: WeedSize;
  applicationRate: number;
  applicationUnit: VolumeUnit;
  unitSystem: UnitSystem;
}

export interface CalculationResult {
  requiredProduct: number;        // Amount of concentrate needed
  productUnit: VolumeUnit;
  totalMixture: number;          // Total spray mixture volume
  mixtureUnit: VolumeUnit;
  coverageArea: number;          // Actual coverage area
  coverageUnit: AreaUnit;
  estimatedCost: number;
  currency: string;
  recommendations: ProductRecommendation[];
  breakdown: CalculationBreakdown;
}

export interface CalculationBreakdown {
  steps: CalculationStep[];
  assumptions: string[];
  factors: {
    weedSizeMultiplier: number;
    applicationRate: number;
    concentrationRatio: number;
  };
}

export interface CalculationStep {
  id: string;
  description: string;
  formula: string;
  input: number | string;
  output: number | string;
  unit?: string;
}

export interface ProductRecommendation {
  packageId: string;
  quantity: number;
  totalCost: number;
  efficiency: number;           // Cost per unit coverage
  isOptimal: boolean;
}

// E-commerce Integration
export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  metadata: {
    estimatorValues: EstimatorValues;
    calculationId: string;
    timestamp: string;
  };
}

// Context Types
export interface EstimatorContextType {
  values: EstimatorValues;
  calculation: CalculationResult | null;
  updateValues: (updates: Partial<EstimatorValues>) => void;
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
  isCalculating: boolean;
  error: string | null;
}

// Layout and Theme Types
export interface LayoutConfig {
  formLayout: 'vertical' | 'horizontal' | 'grid';
  slidersPerRow: number;
  showLabelsInline: boolean;
  compactMode: boolean;
}

export interface EstimatorTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    sizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    weights: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
}