// FireHawk Quantity Calculator Engine

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
   * Main calculation method - calculates all required values
   */
  calculate(values: EstimatorValues): CalculationResult {
    try {
      // Convert all inputs to standard units for calculation
      const standardArea = unitConverter.toStandardArea(values.area, values.areaUnit);
      const standardApplicationRate = unitConverter.toStandardVolume(
        values.applicationRate,
        values.applicationUnit
      );

      // Apply weed size multiplier
      const adjustedApplicationRate = this.applyWeedSizeMultiplier(
        standardApplicationRate,
        values.weedSize
      );

      // Calculate required product amount
      const requiredProductOz = this.calculateRequiredProduct(
        standardArea,
        adjustedApplicationRate,
        this.productInfo.concentrationRatio
      );

      // Calculate total mixture volume
      const totalMixtureGallons = this.calculateTotalMixture(
        standardArea,
        CALCULATION_CONSTANTS.STANDARD_SPRAY_VOLUME
      );

      // Calculate cost
      const estimatedCost = this.calculateCost(requiredProductOz);

      // Generate package recommendations
      const recommendations = this.generateRecommendations(requiredProductOz);

      // Create calculation breakdown
      const breakdown = this.createCalculationBreakdown(
        values,
        standardArea,
        adjustedApplicationRate,
        requiredProductOz,
        totalMixtureGallons
      );

      // Convert results to appropriate display units
      const displayUnits = unitConverter.getUnitsForSystem(values.unitSystem);
      const optimalProductUnit = unitConverter.getOptimalVolumeUnit(
        requiredProductOz,
        values.unitSystem
      );
      const optimalMixtureUnit = unitConverter.getOptimalVolumeUnit(
        totalMixtureGallons * 128, // Convert gallons to fl oz first
        values.unitSystem
      );

      return {
        requiredProduct: unitConverter.convertVolume(
          requiredProductOz,
          VolumeUnit.FLUID_OUNCES,
          optimalProductUnit
        ),
        productUnit: optimalProductUnit,
        totalMixture: unitConverter.convertVolume(
          totalMixtureGallons,
          VolumeUnit.GALLONS,
          optimalMixtureUnit
        ),
        mixtureUnit: optimalMixtureUnit,
        coverageArea: values.area,
        coverageUnit: values.areaUnit,
        estimatedCost,
        currency: this.productInfo.currency,
        recommendations,
        breakdown
      };
    } catch (error) {
      throw new Error(`Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate the required amount of FireHawk concentrate
   */
  private calculateRequiredProduct(
    areaSquareFeet: number,
    applicationRateOzPer1000SqFt: number,
    concentrationRatio: number
  ): number {
    // Base calculation: (area / 1000) * application rate
    const baseRequirement = (areaSquareFeet / 1000) * applicationRateOzPer1000SqFt;
    
    // Adjust for concentration (2.5% concentration means we need full strength)
    // This is the actual concentrate amount needed
    return baseRequirement;
  }

  /**
   * Apply weed size multiplier to application rate
   */
  private applyWeedSizeMultiplier(
    baseApplicationRate: number,
    weedSize: WeedSize
  ): number {
    const weedConfig = WEED_SIZE_CONFIG.find(config => config.id === weedSize);
    if (!weedConfig) {
      throw new Error(`Invalid weed size: ${weedSize}`);
    }

    const adjustedRate = baseApplicationRate * weedConfig.multiplier;
    
    // Ensure the rate stays within bounds for the weed size
    const rateConfig = DEFAULT_APPLICATION_RATES[weedSize];
    return Math.max(rateConfig.min, Math.min(rateConfig.max, adjustedRate));
  }

  /**
   * Calculate total spray mixture volume
   */
  private calculateTotalMixture(
    areaSquareFeet: number,
    sprayVolumeGallonsPer1000SqFt: number
  ): number {
    return (areaSquareFeet / 1000) * sprayVolumeGallonsPer1000SqFt;
  }

  /**
   * Calculate estimated cost based on package sizes
   */
  private calculateCost(requiredProductOz: number): number {
    if (!this.productInfo.packageSizes.length) {
      return 0;
    }

    // Find the most cost-effective package combination
    let minCost = Infinity;
    
    for (const packageSize of this.productInfo.packageSizes) {
      const packageOz = unitConverter.convertVolume(
        packageSize.volume,
        packageSize.unit,
        VolumeUnit.FLUID_OUNCES
      );
      
      const packagesNeeded = Math.ceil(requiredProductOz / packageOz);
      const totalCost = packagesNeeded * packageSize.price;
      
      if (totalCost < minCost) {
        minCost = totalCost;
      }
    }

    return minCost === Infinity ? 0 : minCost;
  }

  /**
   * Generate package size recommendations
   */
  private generateRecommendations(requiredProductOz: number): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];

    for (const packageSize of this.productInfo.packageSizes) {
      const packageOz = unitConverter.convertVolume(
        packageSize.volume,
        packageSize.unit,
        VolumeUnit.FLUID_OUNCES
      );
      
      const quantity = Math.ceil(requiredProductOz / packageOz);
      const totalCost = quantity * packageSize.price;
      const totalProductOz = quantity * packageOz;
      const efficiency = totalCost / totalProductOz; // Cost per fl oz

      recommendations.push({
        packageId: packageSize.id,
        quantity,
        totalCost,
        efficiency,
        isOptimal: false // Will be determined after sorting
      });
    }

    // Sort by efficiency (cost per fl oz) and mark the most efficient
    recommendations.sort((a, b) => a.efficiency - b.efficiency);
    if (recommendations.length > 0) {
      recommendations[0].isOptimal = true;
    }

    return recommendations;
  }

  /**
   * Create detailed calculation breakdown
   */
  private createCalculationBreakdown(
    values: EstimatorValues,
    standardArea: number,
    adjustedApplicationRate: number,
    requiredProductOz: number,
    totalMixtureGallons: number
  ): CalculationBreakdown {
    const weedConfig = WEED_SIZE_CONFIG.find(config => config.id === values.weedSize);
    
    const steps: CalculationStep[] = [
      {
        id: 'area_conversion',
        description: 'Convert area to square feet',
        formula: `${values.area} ${values.areaUnit} × conversion factor`,
        input: `${values.area} ${values.areaUnit}`,
        output: standardArea.toFixed(0),
        unit: 'sq ft'
      },
      {
        id: 'weed_size_adjustment',
        description: 'Apply weed size multiplier',
        formula: `${values.applicationRate} × ${weedConfig?.multiplier || 1}`,
        input: `${values.applicationRate} ${values.applicationUnit}`,
        output: adjustedApplicationRate.toFixed(2),
        unit: 'fl oz per 1000 sq ft'
      },
      {
        id: 'product_calculation',
        description: 'Calculate required FireHawk concentrate',
        formula: `(${standardArea.toFixed(0)} ÷ 1000) × ${adjustedApplicationRate.toFixed(2)}`,
        input: `${standardArea.toFixed(0)} sq ft`,
        output: requiredProductOz.toFixed(2),
        unit: 'fl oz'
      },
      {
        id: 'mixture_calculation',
        description: 'Calculate total spray mixture',
        formula: `(${standardArea.toFixed(0)} ÷ 1000) × ${CALCULATION_CONSTANTS.STANDARD_SPRAY_VOLUME}`,
        input: `${standardArea.toFixed(0)} sq ft`,
        output: totalMixtureGallons.toFixed(2),
        unit: 'gallons'
      }
    ];

    const assumptions = [
      `Standard spray volume: ${CALCULATION_CONSTANTS.STANDARD_SPRAY_VOLUME} gallons per 1000 sq ft`,
      `FireHawk concentration: ${this.productInfo.concentrationRatio}%`,
      `Weed size: ${weedConfig?.label || 'Unknown'} (${weedConfig?.description || ''})`
    ];

    return {
      steps,
      assumptions,
      factors: {
        weedSizeMultiplier: weedConfig?.multiplier || 1,
        applicationRate: adjustedApplicationRate,
        concentrationRatio: this.productInfo.concentrationRatio
      }
    };
  }

  /**
   * Validate calculation inputs
   */
  validateInputs(values: EstimatorValues): string[] {
    const errors: string[] = [];

    // Validate area
    if (!Number.isFinite(values.area) || values.area <= 0) {
      errors.push('Area must be a positive number');
    }
    
    if (values.area < CALCULATION_CONSTANTS.MIN_AREA) {
      errors.push(`Area must be at least ${CALCULATION_CONSTANTS.MIN_AREA} square feet`);
    }
    
    if (values.area > CALCULATION_CONSTANTS.MAX_AREA) {
      errors.push(`Area cannot exceed ${CALCULATION_CONSTANTS.MAX_AREA} square feet`);
    }

    // Validate application rate
    if (!Number.isFinite(values.applicationRate) || values.applicationRate <= 0) {
      errors.push('Application rate must be a positive number');
    }

    const rateConfig = DEFAULT_APPLICATION_RATES[values.weedSize];
    if (values.applicationRate < rateConfig.min || values.applicationRate > rateConfig.max) {
      errors.push(`Application rate for ${values.weedSize} weeds must be between ${rateConfig.min} and ${rateConfig.max}`);
    }

    return errors;
  }

  /**
   * Get recommended application rate for weed size
   */
  getRecommendedRate(weedSize: WeedSize): number {
    return DEFAULT_APPLICATION_RATES[weedSize].default;
  }

  /**
   * Get application rate bounds for weed size
   */
  getRateBounds(weedSize: WeedSize): { min: number; max: number } {
    const config = DEFAULT_APPLICATION_RATES[weedSize];
    return { min: config.min, max: config.max };
  }
}