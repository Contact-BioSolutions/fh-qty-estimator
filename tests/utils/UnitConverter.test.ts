// Unit tests for UnitConverter utility
import { UnitConverter, unitConverter } from '../../src/utils/UnitConverter';
import { AreaUnit, VolumeUnit, UnitSystem, EstimatorValues } from '../../src/types';

describe('UnitConverter', () => {
  let converter: UnitConverter;

  beforeEach(() => {
    converter = new UnitConverter();
  });

  describe('Area Conversions', () => {
    describe('convertArea', () => {
      it('should return same value when converting to same unit', () => {
        expect(converter.convertArea(100, AreaUnit.SQUARE_FEET, AreaUnit.SQUARE_FEET)).toBe(100);
      });

      it('should convert square feet to square meters accurately', () => {
        const result = converter.convertArea(1000, AreaUnit.SQUARE_FEET, AreaUnit.SQUARE_METERS);
        expect(result).toBeCloseTo(92.903, 2);
      });

      it('should convert square feet to acres accurately', () => {
        const result = converter.convertArea(43560, AreaUnit.SQUARE_FEET, AreaUnit.ACRES);
        expect(result).toBeCloseTo(1, 3);
      });

      it('should convert square meters to hectares accurately', () => {
        const result = converter.convertArea(10000, AreaUnit.SQUARE_METERS, AreaUnit.HECTARES);
        expect(result).toBeCloseTo(1, 3);
      });

      it('should handle large area conversions', () => {
        const result = converter.convertArea(1000000, AreaUnit.SQUARE_FEET, AreaUnit.ACRES);
        expect(result).toBeCloseTo(22.957, 2);
      });

      it('should handle small area conversions', () => {
        const result = converter.convertArea(1, AreaUnit.SQUARE_METERS, AreaUnit.SQUARE_FEET);
        expect(result).toBeCloseTo(10.7639, 3);
      });

      it('should throw error for unsupported conversion', () => {
        expect(() => {
          // @ts-ignore - Testing invalid conversion
          converter.convertArea(100, 'invalid_unit', AreaUnit.SQUARE_FEET);
        }).toThrow('Conversion from invalid_unit to sq_ft not supported');
      });
    });

    describe('bidirectional conversions', () => {
      it('should be reversible for square feet <-> square meters', () => {
        const original = 1000;
        const converted = converter.convertArea(original, AreaUnit.SQUARE_FEET, AreaUnit.SQUARE_METERS);
        const backConverted = converter.convertArea(converted, AreaUnit.SQUARE_METERS, AreaUnit.SQUARE_FEET);
        expect(backConverted).toBeCloseTo(original, 1);
      });

      it('should be reversible for acres <-> hectares', () => {
        const original = 5;
        const converted = converter.convertArea(original, AreaUnit.ACRES, AreaUnit.HECTARES);
        const backConverted = converter.convertArea(converted, AreaUnit.HECTARES, AreaUnit.ACRES);
        expect(backConverted).toBeCloseTo(original, 3);
      });
    });
  });

  describe('Volume Conversions', () => {
    describe('convertVolume', () => {
      it('should return same value when converting to same unit', () => {
        expect(converter.convertVolume(32, VolumeUnit.FLUID_OUNCES, VolumeUnit.FLUID_OUNCES)).toBe(32);
      });

      it('should convert fluid ounces to milliliters accurately', () => {
        const result = converter.convertVolume(1, VolumeUnit.FLUID_OUNCES, VolumeUnit.MILLILITERS);
        expect(result).toBeCloseTo(29.5735, 3);
      });

      it('should convert gallons to liters accurately', () => {
        const result = converter.convertVolume(1, VolumeUnit.GALLONS, VolumeUnit.LITERS);
        expect(result).toBeCloseTo(3.78541, 3);
      });

      it('should convert milliliters to fluid ounces accurately', () => {
        const result = converter.convertVolume(100, VolumeUnit.MILLILITERS, VolumeUnit.FLUID_OUNCES);
        expect(result).toBeCloseTo(3.3814, 3);
      });

      it('should handle large volume conversions', () => {
        const result = converter.convertVolume(1000, VolumeUnit.GALLONS, VolumeUnit.MILLILITERS);
        expect(result).toBeCloseTo(3785410, 0);
      });

      it('should handle small volume conversions', () => {
        const result = converter.convertVolume(0.5, VolumeUnit.FLUID_OUNCES, VolumeUnit.MILLILITERS);
        expect(result).toBeCloseTo(14.787, 2);
      });
    });

    describe('bidirectional conversions', () => {
      it('should be reversible for fluid ounces <-> milliliters', () => {
        const original = 16;
        const converted = converter.convertVolume(original, VolumeUnit.FLUID_OUNCES, VolumeUnit.MILLILITERS);
        const backConverted = converter.convertVolume(converted, VolumeUnit.MILLILITERS, VolumeUnit.FLUID_OUNCES);
        expect(backConverted).toBeCloseTo(original, 2);
      });

      it('should be reversible for gallons <-> liters', () => {
        const original = 2.5;
        const converted = converter.convertVolume(original, VolumeUnit.GALLONS, VolumeUnit.LITERS);
        const backConverted = converter.convertVolume(converted, VolumeUnit.LITERS, VolumeUnit.GALLONS);
        expect(backConverted).toBeCloseTo(original, 3);
      });
    });
  });

  describe('System Conversions', () => {
    describe('convertToSystem', () => {
      const mockValues: EstimatorValues = {
        area: 1000,
        areaUnit: AreaUnit.SQUARE_FEET,
        weedSize: 'medium' as any,
        applicationRate: 2.0,
        applicationUnit: VolumeUnit.FLUID_OUNCES,
        unitSystem: UnitSystem.IMPERIAL
      };

      it('should return same values when converting to same system', () => {
        const result = converter.convertToSystem(mockValues, UnitSystem.IMPERIAL);
        expect(result).toEqual(mockValues);
      });

      it('should convert imperial to metric system', () => {
        const result = converter.convertToSystem(mockValues, UnitSystem.METRIC);
        
        expect(result.unitSystem).toBe(UnitSystem.METRIC);
        expect(result.areaUnit).toBe(AreaUnit.SQUARE_METERS);
        expect(result.applicationUnit).toBe(VolumeUnit.MILLILITERS);
        expect(result.area).toBeCloseTo(92.9, 1);
        expect(result.applicationRate).toBeCloseTo(59.15, 1);
      });

      it('should convert metric to imperial system', () => {
        const metricValues: EstimatorValues = {
          area: 100,
          areaUnit: AreaUnit.SQUARE_METERS,
          weedSize: 'large' as any,
          applicationRate: 60,
          applicationUnit: VolumeUnit.MILLILITERS,
          unitSystem: UnitSystem.METRIC
        };

        const result = converter.convertToSystem(metricValues, UnitSystem.IMPERIAL);
        
        expect(result.unitSystem).toBe(UnitSystem.IMPERIAL);
        expect(result.areaUnit).toBe(AreaUnit.SQUARE_FEET);
        expect(result.applicationUnit).toBe(VolumeUnit.FLUID_OUNCES);
        expect(result.area).toBeCloseTo(1076.39, 1);
        expect(result.applicationRate).toBeCloseTo(2.03, 1);
      });

      it('should round converted values to 2 decimal places', () => {
        const result = converter.convertToSystem(mockValues, UnitSystem.METRIC);
        
        // Check that values are properly rounded
        expect(result.area).toBe(Math.round(result.area * 100) / 100);
        expect(result.applicationRate).toBe(Math.round(result.applicationRate * 100) / 100);
      });
    });
  });

  describe('Formatting', () => {
    describe('formatArea', () => {
      it('should format square feet correctly', () => {
        expect(converter.formatArea(1000, AreaUnit.SQUARE_FEET)).toBe('1000.0 sq ft');
      });

      it('should format acres with 2 decimal places', () => {
        expect(converter.formatArea(2.5555, AreaUnit.ACRES)).toBe('2.56 acres');
      });

      it('should format small values with 3 decimal places', () => {
        expect(converter.formatArea(0.25, AreaUnit.HECTARES)).toBe('0.250 hectares');
      });
    });

    describe('formatVolume', () => {
      it('should format fluid ounces correctly', () => {
        expect(converter.formatVolume(16.5, VolumeUnit.FLUID_OUNCES)).toBe('16.5 fl oz');
      });

      it('should format gallons correctly', () => {
        expect(converter.formatVolume(2.75, VolumeUnit.GALLONS)).toBe('2.8 gal');
      });

      it('should format small volumes with appropriate precision', () => {
        expect(converter.formatVolume(0.125, VolumeUnit.LITERS)).toBe('0.125 L');
      });
    });
  });

  describe('Standard Conversions', () => {
    it('should convert to standard area unit (square feet)', () => {
      expect(converter.toStandardArea(1, AreaUnit.ACRES)).toBeCloseTo(43560, 0);
      expect(converter.toStandardArea(100, AreaUnit.SQUARE_METERS)).toBeCloseTo(1076.39, 1);
    });

    it('should convert to standard volume unit (fluid ounces)', () => {
      expect(converter.toStandardVolume(1, VolumeUnit.GALLONS)).toBeCloseTo(128, 0);
      expect(converter.toStandardVolume(100, VolumeUnit.MILLILITERS)).toBeCloseTo(3.38, 1);
    });
  });

  describe('Optimal Unit Selection', () => {
    describe('getOptimalAreaUnit', () => {
      it('should use square feet for small imperial areas', () => {
        const result = converter.getOptimalAreaUnit(1000, UnitSystem.IMPERIAL);
        expect(result).toBe(AreaUnit.SQUARE_FEET);
      });

      it('should use acres for large imperial areas', () => {
        const result = converter.getOptimalAreaUnit(50000, UnitSystem.IMPERIAL);
        expect(result).toBe(AreaUnit.ACRES);
      });

      it('should use square meters for small metric areas', () => {
        const result = converter.getOptimalAreaUnit(1000, UnitSystem.METRIC);
        expect(result).toBe(AreaUnit.SQUARE_METERS);
      });

      it('should use hectares for large metric areas', () => {
        const result = converter.getOptimalAreaUnit(10000, UnitSystem.METRIC);
        expect(result).toBe(AreaUnit.HECTARES);
      });
    });

    describe('getOptimalVolumeUnit', () => {
      it('should use fluid ounces for small imperial volumes', () => {
        const result = converter.getOptimalVolumeUnit(16, UnitSystem.IMPERIAL);
        expect(result).toBe(VolumeUnit.FLUID_OUNCES);
      });

      it('should use gallons for large imperial volumes', () => {
        const result = converter.getOptimalVolumeUnit(256, UnitSystem.IMPERIAL);
        expect(result).toBe(VolumeUnit.GALLONS);
      });

      it('should use milliliters for small metric volumes', () => {
        const result = converter.getOptimalVolumeUnit(16, UnitSystem.METRIC);
        expect(result).toBe(VolumeUnit.MILLILITERS);
      });

      it('should use liters for large metric volumes', () => {
        const result = converter.getOptimalVolumeUnit(256, UnitSystem.METRIC);
        expect(result).toBe(VolumeUnit.LITERS);
      });
    });
  });

  describe('Validation', () => {
    describe('validateConversion', () => {
      it('should validate positive numbers', () => {
        expect(converter.validateConversion(100, AreaUnit.SQUARE_FEET, AreaUnit.ACRES)).toBe(true);
        expect(converter.validateConversion(0, AreaUnit.SQUARE_FEET, AreaUnit.ACRES)).toBe(true);
      });

      it('should reject negative numbers', () => {
        expect(converter.validateConversion(-10, AreaUnit.SQUARE_FEET, AreaUnit.ACRES)).toBe(false);
      });

      it('should reject invalid numbers', () => {
        expect(converter.validateConversion(NaN, AreaUnit.SQUARE_FEET, AreaUnit.ACRES)).toBe(false);
        expect(converter.validateConversion(Infinity, AreaUnit.SQUARE_FEET, AreaUnit.ACRES)).toBe(false);
      });

      it('should validate compatible unit types', () => {
        expect(converter.validateConversion(100, AreaUnit.SQUARE_FEET, AreaUnit.ACRES)).toBe(true);
        expect(converter.validateConversion(100, VolumeUnit.GALLONS, VolumeUnit.LITERS)).toBe(true);
      });

      it('should reject incompatible unit types', () => {
        expect(converter.validateConversion(100, AreaUnit.SQUARE_FEET, VolumeUnit.GALLONS as any)).toBe(false);
        expect(converter.validateConversion(100, VolumeUnit.GALLONS, AreaUnit.ACRES as any)).toBe(false);
      });
    });
  });

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(unitConverter).toBeInstanceOf(UnitConverter);
    });

    it('should maintain state across calls', () => {
      const result1 = unitConverter.convertArea(100, AreaUnit.SQUARE_FEET, AreaUnit.SQUARE_METERS);
      const result2 = unitConverter.convertArea(100, AreaUnit.SQUARE_FEET, AreaUnit.SQUARE_METERS);
      expect(result1).toBe(result2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      expect(converter.convertArea(0, AreaUnit.SQUARE_FEET, AreaUnit.ACRES)).toBe(0);
      expect(converter.convertVolume(0, VolumeUnit.GALLONS, VolumeUnit.LITERS)).toBe(0);
    });

    it('should handle very small values', () => {
      const result = converter.convertArea(0.001, AreaUnit.ACRES, AreaUnit.SQUARE_FEET);
      expect(result).toBeCloseTo(43.56, 2);
    });

    it('should handle very large values', () => {
      const result = converter.convertArea(1000000, AreaUnit.SQUARE_FEET, AreaUnit.ACRES);
      expect(result).toBeGreaterThan(20);
    });

    it('should maintain precision in chain conversions', () => {
      const original = 1000;
      let value = original;
      
      // Chain multiple conversions
      value = converter.convertArea(value, AreaUnit.SQUARE_FEET, AreaUnit.SQUARE_METERS);
      value = converter.convertArea(value, AreaUnit.SQUARE_METERS, AreaUnit.HECTARES);
      value = converter.convertArea(value, AreaUnit.HECTARES, AreaUnit.ACRES);
      value = converter.convertArea(value, AreaUnit.ACRES, AreaUnit.SQUARE_FEET);
      
      // Should be close to original (within reasonable precision)
      expect(value).toBeCloseTo(original, 0);
    });
  });
});