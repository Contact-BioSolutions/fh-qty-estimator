// Unit Conversion System for FireHawk Quantity Estimator

import { AreaUnit, VolumeUnit, UnitSystem, EstimatorValues } from '../types';
import { CONVERSION_FACTORS, UNIT_SYSTEM_DEFAULTS } from '../constants';

export class UnitConverter {
  /**
   * Convert area values between different units
   */
  convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
    if (from === to) return value;
    
    const conversionFactor = CONVERSION_FACTORS.AREA[from]?.[to];
    if (!conversionFactor) {
      throw new Error(`Conversion from ${from} to ${to} not supported`);
    }
    
    return value * conversionFactor;
  }

  /**
   * Convert volume values between different units
   */
  convertVolume(value: number, from: VolumeUnit, to: VolumeUnit): number {
    if (from === to) return value;
    
    const conversionFactor = CONVERSION_FACTORS.VOLUME[from]?.[to];
    if (!conversionFactor) {
      throw new Error(`Conversion from ${from} to ${to} not supported`);
    }
    
    return value * conversionFactor;
  }

  /**
   * Convert estimator values to a different unit system
   */
  convertToSystem(
    values: EstimatorValues,
    targetSystem: UnitSystem
  ): EstimatorValues {
    if (values.unitSystem === targetSystem) return values;

    const systemDefaults = UNIT_SYSTEM_DEFAULTS[targetSystem];
    
    // Convert area to target system's default area unit
    const convertedArea = this.convertArea(
      values.area,
      values.areaUnit,
      systemDefaults.areaUnit
    );

    // Convert application rate to target system's default volume unit
    const convertedApplicationRate = this.convertVolume(
      values.applicationRate,
      values.applicationUnit,
      systemDefaults.volumeUnit
    );

    return {
      ...values,
      area: Math.round(convertedArea * 100) / 100, // Round to 2 decimal places
      areaUnit: systemDefaults.areaUnit,
      applicationRate: Math.round(convertedApplicationRate * 100) / 100,
      applicationUnit: systemDefaults.volumeUnit,
      unitSystem: targetSystem
    };
  }

  /**
   * Get available units for a specific system
   */
  getUnitsForSystem(system: UnitSystem) {
    return UNIT_SYSTEM_DEFAULTS[system];
  }

  /**
   * Format area value with appropriate unit display
   */
  formatArea(value: number, unit: AreaUnit): string {
    const unitLabels = {
      [AreaUnit.SQUARE_FEET]: 'sq ft',
      [AreaUnit.SQUARE_METERS]: 'sq m',
      [AreaUnit.ACRES]: 'acres',
      [AreaUnit.HECTARES]: 'hectares'
    };

    const formattedValue = this.formatNumber(value, unit);
    return `${formattedValue} ${unitLabels[unit]}`;
  }

  /**
   * Format volume value with appropriate unit display
   */
  formatVolume(value: number, unit: VolumeUnit): string {
    const unitLabels = {
      [VolumeUnit.FLUID_OUNCES]: 'fl oz',
      [VolumeUnit.GALLONS]: 'gal',
      [VolumeUnit.MILLILITERS]: 'ml',
      [VolumeUnit.LITERS]: 'L'
    };

    const formattedValue = this.formatNumber(value, unit);
    return `${formattedValue} ${unitLabels[unit]}`;
  }

  /**
   * Format number based on unit type and magnitude
   */
  private formatNumber(value: number, unit: AreaUnit | VolumeUnit): string {
    // For very small values, show more decimal places
    if (value < 1) {
      return value.toFixed(3);
    }
    
    // For area units that are typically large (acres, hectares)
    if (unit === AreaUnit.ACRES || unit === AreaUnit.HECTARES) {
      return value.toFixed(2);
    }
    
    // For volume units that are typically small (fl oz, ml)
    if (unit === VolumeUnit.FLUID_OUNCES || unit === VolumeUnit.MILLILITERS) {
      return value.toFixed(1);
    }
    
    // Default formatting
    return value.toFixed(1);
  }

  /**
   * Convert area to square feet for standardized calculations
   */
  toStandardArea(value: number, unit: AreaUnit): number {
    return this.convertArea(value, unit, AreaUnit.SQUARE_FEET);
  }

  /**
   * Convert volume to fluid ounces for standardized calculations
   */
  toStandardVolume(value: number, unit: VolumeUnit): number {
    return this.convertVolume(value, unit, VolumeUnit.FLUID_OUNCES);
  }

  /**
   * Get the most appropriate unit for display based on value magnitude
   */
  getOptimalAreaUnit(valueInSquareFeet: number, system: UnitSystem): AreaUnit {
    const systemUnits = this.getUnitsForSystem(system);
    
    if (system === UnitSystem.IMPERIAL) {
      // Use acres for areas larger than 5000 sq ft
      return valueInSquareFeet > 5000 ? AreaUnit.ACRES : AreaUnit.SQUARE_FEET;
    } else {
      // Use hectares for areas larger than 500 sq meters
      const valueInSquareMeters = this.convertArea(
        valueInSquareFeet,
        AreaUnit.SQUARE_FEET,
        AreaUnit.SQUARE_METERS
      );
      return valueInSquareMeters > 500 ? AreaUnit.HECTARES : AreaUnit.SQUARE_METERS;
    }
  }

  /**
   * Get the most appropriate volume unit for display based on value magnitude
   */
  getOptimalVolumeUnit(valueInFluidOunces: number, system: UnitSystem): VolumeUnit {
    if (system === UnitSystem.IMPERIAL) {
      // Use gallons for volumes larger than 32 fl oz
      return valueInFluidOunces > 32 ? VolumeUnit.GALLONS : VolumeUnit.FLUID_OUNCES;
    } else {
      // Use liters for volumes larger than 1000 ml
      const valueInMilliliters = this.convertVolume(
        valueInFluidOunces,
        VolumeUnit.FLUID_OUNCES,
        VolumeUnit.MILLILITERS
      );
      return valueInMilliliters > 1000 ? VolumeUnit.LITERS : VolumeUnit.MILLILITERS;
    }
  }

  /**
   * Validate conversion input values
   */
  validateConversion(value: number, fromUnit: AreaUnit | VolumeUnit, toUnit: AreaUnit | VolumeUnit): boolean {
    // Check if value is a valid number
    if (!Number.isFinite(value) || value < 0) {
      return false;
    }

    // Check if units are compatible (both area or both volume)
    const areaUnits = Object.values(AreaUnit);
    const volumeUnits = Object.values(VolumeUnit);
    
    const fromIsArea = areaUnits.includes(fromUnit as AreaUnit);
    const toIsArea = areaUnits.includes(toUnit as AreaUnit);
    const fromIsVolume = volumeUnits.includes(fromUnit as VolumeUnit);
    const toIsVolume = volumeUnits.includes(toUnit as VolumeUnit);

    return (fromIsArea && toIsArea) || (fromIsVolume && toIsVolume);
  }
}

// Export singleton instance
export const unitConverter = new UnitConverter();