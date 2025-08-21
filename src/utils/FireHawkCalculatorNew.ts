// FireHawk Quantity Calculator Engine - Updated for L/100L System
// Application rates are now L/100L with weed size determining water volume

import {
  EstimatorValues,
  CalculationResult,
  ProductInfo,
  ProductRecommendation,
  CalculationBreakdown,
  CalculationStep,
  WeedSize,
  AreaUnit,
  VolumeUnit
} from '../types';
import { unitConverter } from './UnitConverter';
import {
  CALCULATION_CONSTANTS,
  WEED_SIZE_CONFIG,
  DEFAULT_APPLICATION_RATES
} from '../constants';

export class FireHawkCalculator {
  private productInfo: ProductInfo;

  constructor(productInfo: ProductInfo) {
    this.productInfo = productInfo;
  }

  /**
   * Main calculation method using L/100L system
   */
  calculate(values: EstimatorValues): CalculationResult {
    try {
      // Convert area to hectares for calculation
      const areaInHectares = this.convertToHectares(values.area, values.areaUnit);
      
      // Get water volume per hectare based on weed size
      const weedConfig = WEED_SIZE_CONFIG.find(config => config.id === values.weedSize);
      const waterVolumePerHa = weedConfig?.waterVolumePerHa || 900; // Default to medium
      
      // Calculate total water volume needed
      const totalWaterVolume = areaInHectares * waterVolumePerHa; // Liters
      
      // Application rate is L/100L (e.g., 5.0 means 5L per 100L of water)
      const applicationRate = values.applicationRate; // L/100L
      
      // Calculate FireHawk product needed
      const requiredProductLiters = (applicationRate / 100) * totalWaterVolume;
      
      // Generate calculation breakdown
      const breakdown = this.generateBreakdown(
        areaInHectares,
        waterVolumePerHa,
        totalWaterVolume,
        applicationRate,
        requiredProductLiters,
        values.weedSize
      );

      // Generate package recommendations based on cost efficiency
      const recommendations = this.generateCostEfficientRecommendations(
        requiredProductLiters
      );

      // Find the most cost-effective option
      const optimalRecommendation = recommendations.find(r => r.isOptimal) || recommendations[0];
      const estimatedCost = optimalRecommendation?.totalCost || 0;

      return {
        requiredProduct: requiredProductLiters,
        productUnit: VolumeUnit.LITERS,
        totalMixture: totalWaterVolume,
        mixtureUnit: VolumeUnit.LITERS,
        coverageArea: values.area,
        coverageUnit: values.areaUnit,
        applicationRate: applicationRate,
        applicationRateUnit: 'L/100L',
        estimatedCost,
        currency: this.productInfo.currency,
        recommendations,
        breakdown,
        calculationDate: new Date().toISOString(),
        productInfo: this.productInfo
      };

    } catch (error) {
      throw new Error(`Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert area to hectares for consistent calculation
   */
  private convertToHectares(area: number, unit: AreaUnit): number {
    switch (unit) {
      case AreaUnit.HECTARES:
        return area;
      case AreaUnit.ACRES:
        return area * 0.404686;
      case AreaUnit.SQUARE_METERS:
        return area / 10000;
      case AreaUnit.SQUARE_FEET:
        return area * 0.0000092903;
      default:
        throw new Error(`Unsupported area unit: ${unit}`);
    }
  }

  /**
   * Generate calculation breakdown showing steps
   */
  private generateBreakdown(
    areaHa: number,
    waterVolumePerHa: number,
    totalWaterVolume: number,
    applicationRate: number,
    requiredProduct: number,
    weedSize: WeedSize
  ): CalculationBreakdown {
    const steps: CalculationStep[] = [
      {
        id: 'area-conversion',
        description: 'Convert treatment area to hectares',
        formula: 'Area (ha) = input area × conversion factor',
        input: `${areaHa.toFixed(4)} ha`,
        output: areaHa.toFixed(4),
        unit: 'ha'
      },
      {
        id: 'water-volume',
        description: `Determine water volume for ${weedSize} weeds`,
        formula: `Water volume = ${waterVolumePerHa} L/ha × area`,
        input: `${waterVolumePerHa} L/ha × ${areaHa.toFixed(4)} ha`,
        output: totalWaterVolume.toFixed(1),
        unit: 'L'
      },
      {
        id: 'product-calculation',
        description: 'Calculate FireHawk product needed',
        formula: `Product = (${applicationRate}/100) × total water volume`,
        input: `${applicationRate}% × ${totalWaterVolume.toFixed(1)} L`,
        output: requiredProduct.toFixed(2),
        unit: 'L'
      }
    ];

    return {
      steps,
      factors: {
        weedSizeMultiplier: 1.0, // Not used in L/100L system
        applicationRate,
        waterVolumePerHa,
        concentrationRatio: this.productInfo.concentrationRatio
      },
      assumptions: [
        `Water volume: ${waterVolumePerHa} L/ha for ${weedSize} weeds`,
        `Application rate: ${applicationRate} L/100L of water`,
        'Calculations assume uniform coverage',
        'Weather conditions are suitable for application'
      ]
    };
  }

  /**
   * Generate package recommendations based on cost efficiency (no waste consideration)
   */
  private generateCostEfficientRecommendations(requiredLiters: number): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];
    
    // Get all package sizes and calculate efficiency
    const packages = this.productInfo.packageSizes.map(pkg => {
      // Convert package volume to liters
      const volumeInLiters = this.convertToLiters(pkg.volume, pkg.unit);
      
      // Calculate how many packages needed
      const packagesNeeded = Math.ceil(requiredLiters / volumeInLiters);
      
      // Calculate total cost
      const totalCost = packagesNeeded * pkg.price;
      
      // Calculate cost efficiency (cost per liter of product)
      const efficiency = pkg.price / volumeInLiters;
      
      return {
        packageId: pkg.id,
        quantity: packagesNeeded,
        unitPrice: pkg.price,
        totalCost,
        efficiency,
        packageSize: volumeInLiters,
        isOptimal: false // Will be set later
      };
    });

    // Sort by total cost (most cost-effective first)
    packages.sort((a, b) => a.totalCost - b.totalCost);
    
    // Mark the most cost-effective option
    if (packages.length > 0) {
      packages[0].isOptimal = true;
    }

    return packages;
  }

  /**
   * Convert volume to liters
   */
  private convertToLiters(volume: number, unit: VolumeUnit): number {
    switch (unit) {
      case VolumeUnit.LITERS:
        return volume;
      case VolumeUnit.MILLILITERS:
        return volume / 1000;
      case VolumeUnit.GALLONS:
        return volume * 3.78541;
      case VolumeUnit.FLUID_OUNCES:
        return volume * 0.0295735;
      default:
        throw new Error(`Unsupported volume unit: ${unit}`);
    }
  }

  /**
   * Validate calculation inputs
   */
  validateInputs(values: EstimatorValues): string[] {
    const errors: string[] = [];

    if (values.area <= 0) {
      errors.push('Area must be greater than 0');
    }

    if (values.area > CALCULATION_CONSTANTS.MAX_AREA) {
      errors.push(`Area cannot exceed ${CALCULATION_CONSTANTS.MAX_AREA}`);
    }

    if (values.applicationRate < 3.0 || values.applicationRate > 10.0) {
      errors.push('Application rate must be between 3.0 and 10.0 L/100L');
    }

    return errors;
  }

  /**
   * Get water volume for specific weed size
   */
  getWaterVolumeForWeedSize(weedSize: WeedSize): number {
    return CALCULATION_CONSTANTS.WATER_VOLUMES[weedSize] || 900;
  }

  /**
   * Get recommended application rate range for weed size
   */
  getApplicationRateRange(weedSize: WeedSize) {
    return DEFAULT_APPLICATION_RATES[weedSize] || DEFAULT_APPLICATION_RATES[WeedSize.MEDIUM];
  }
}