# FireHawk Quantity Estimator - Examples

This directory contains various usage examples for the FireHawk Quantity Estimator React component.

## Available Examples

### 1. Basic Usage (`basic-usage.tsx`)
Demonstrates the simplest implementation of the FireHawk Quantity Estimator:
- Basic product configuration
- Simple event handling
- Default styling and theme

```tsx
import { FireHawkEstimator } from 'firehawk-quantity-estimator';

<FireHawkEstimator
  productInfo={productInfo}
  onAddToCart={handleAddToCart}
  onCalculationChange={handleCalculationChange}
/>
```

### 2. Advanced Usage (`advanced-usage.tsx`)
Shows more sophisticated implementation with:
- Multiple product variants
- Advanced state management
- Shopping cart integration
- Custom validation
- Analytics tracking
- Error handling

```tsx
<FireHawkEstimator
  productInfo={advancedProductInfo}
  initialUnitSystem={unitSystem}
  onAddToCart={handleAddToCart}
  onCalculationChange={handleCalculationChange}
  theme={customTheme}
  features={{
    showCalculationBreakdown: true,
    enableRealtimeValidation: true,
    showCostComparison: true
  }}
/>
```

## Running the Examples

### Prerequisites
```bash
npm install
# or
yarn install
```

### Development Server
```bash
npm run dev
# or
yarn dev
```

### Build for Production
```bash
npm run build
# or
yarn build
```

## Integration Patterns

### Next.js Integration
```tsx
// pages/estimator.tsx
import dynamic from 'next/dynamic';

const FireHawkEstimator = dynamic(
  () => import('firehawk-quantity-estimator'),
  { ssr: false }
);

export default function EstimatorPage() {
  return (
    <div>
      <h1>Herbicide Calculator</h1>
      <FireHawkEstimator {...props} />
    </div>
  );
}
```

### Shopify Integration
```tsx
import { FireHawkEstimator } from 'firehawk-quantity-estimator';

function ShopifyEstimator() {
  const handleAddToCart = async (cartItem) => {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: cartItem.variantId,
            quantity: cartItem.quantity,
            properties: {
              'Area': cartItem.metadata.area,
              'Weed Size': cartItem.metadata.weedSize,
              'Application Rate': cartItem.metadata.applicationRate
            }
          }]
        })
      });
      
      if (response.ok) {
        window.location.href = '/cart';
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <FireHawkEstimator
      productInfo={shopifyProductInfo}
      onAddToCart={handleAddToCart}
    />
  );
}
```

### WordPress/WooCommerce Integration
```tsx
import { FireHawkEstimator } from 'firehawk-quantity-estimator';

function WooCommerceEstimator() {
  const handleAddToCart = (cartItem) => {
    // WooCommerce AJAX add to cart
    jQuery.post(wc_add_to_cart_params.ajax_url, {
      action: 'woocommerce_add_to_cart',
      product_id: cartItem.productId,
      quantity: cartItem.quantity,
      'calculator-data': JSON.stringify(cartItem.metadata)
    });
  };

  return (
    <FireHawkEstimator
      productInfo={wooProductInfo}
      onAddToCart={handleAddToCart}
    />
  );
}
```

## Customization Examples

### Custom Theming
```tsx
const customTheme = {
  primaryColor: '#059669',      // Green theme
  secondaryColor: '#6b7280',    // Gray accents
  borderRadius: '12px',         // Rounded corners
  spacing: 'comfortable',       // Generous spacing
  fonts: {
    primary: 'Inter, sans-serif',
    monospace: 'Fira Code, monospace'
  }
};
```

### Feature Configuration
```tsx
const features = {
  showCalculationBreakdown: true,     // Show detailed calculations
  enableRealtimeValidation: true,     // Live input validation
  showCostComparison: true,           // Compare package costs
  enablePackageRecommendations: true, // Smart recommendations
  allowCustomPackageSizes: false,     // Custom package input
  showMetricImperialToggle: true,     // Unit system switcher
  enableSaveConfiguration: true,      // Save user preferences
  showShareButton: true,              // Share calculations
  enablePrintView: true,              // Print-friendly view
  showHelpTooltips: true              // Contextual help
};
```

### Validation Rules
```tsx
const validationRules = {
  area: {
    min: 0.1,
    max: 10000,
    warningThreshold: 1000
  },
  applicationRate: {
    min: 0.5,
    max: 10.0,
    recommendedMax: 5.0
  },
  weedSize: {
    allowCustom: false,
    showRecommendations: true
  }
};
```

## Analytics Integration

### Google Analytics 4
```tsx
const handleCalculationChange = (calculation) => {
  gtag('event', 'calculator_use', {
    area: calculation.area,
    area_unit: calculation.areaUnit,
    weed_size: calculation.weedSize,
    application_rate: calculation.applicationRate
  });
};

const handleAddToCart = (cartItem) => {
  gtag('event', 'add_to_cart', {
    currency: 'USD',
    value: cartItem.totalPrice,
    items: [{
      item_id: cartItem.sku,
      item_name: cartItem.productName,
      quantity: cartItem.quantity,
      price: cartItem.unitPrice
    }]
  });
};
```

### Adobe Analytics
```tsx
const handleCalculationChange = (calculation) => {
  if (typeof digitalData !== 'undefined') {
    digitalData.events.push({
      eventName: 'calculator_interaction',
      calculator: {
        type: 'firehawk_quantity_estimator',
        area: calculation.area,
        weedSize: calculation.weedSize
      }
    });
  }
};
```

## Accessibility Features

The FireHawk Quantity Estimator includes comprehensive accessibility features:

- **WCAG 2.1 AA Compliance**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast Mode**: Automatic adaptation to system preferences
- **Focus Management**: Clear focus indicators and logical tab order
- **Alternative Text**: All visual elements have text alternatives

### Testing Accessibility
```bash
# Run accessibility tests
npm run test:a11y

# Manual testing with screen readers
# - NVDA (Windows)
# - JAWS (Windows)
# - VoiceOver (macOS)
# - Orca (Linux)
```

## Performance Optimization

### Code Splitting
```tsx
import { lazy, Suspense } from 'react';

const FireHawkEstimator = lazy(() => import('firehawk-quantity-estimator'));

function App() {
  return (
    <Suspense fallback={<div>Loading calculator...</div>}>
      <FireHawkEstimator {...props} />
    </Suspense>
  );
}
```

### Memoization
```tsx
import { useMemo, useCallback } from 'react';

function OptimizedEstimator() {
  const productInfo = useMemo(() => ({
    // Product configuration
  }), []);

  const handleAddToCart = useCallback((cartItem) => {
    // Cart handling
  }, []);

  return (
    <FireHawkEstimator
      productInfo={productInfo}
      onAddToCart={handleAddToCart}
    />
  );
}
```

## Troubleshooting

### Common Issues

1. **Bundle Size**: Use dynamic imports for large applications
2. **SSR Issues**: Ensure proper client-side rendering for Next.js
3. **Style Conflicts**: Use CSS-in-JS or CSS modules for isolation
4. **Performance**: Implement proper memoization for expensive calculations

### Support

For additional support and examples:
- [Documentation](../docs/)
- [API Reference](../docs/api.md)
- [GitHub Issues](https://github.com/your-org/firehawk-quantity-estimator/issues)
- [Component Storybook](https://storybook.your-domain.com)

## Contributing

To add new examples:
1. Create a new `.tsx` file in this directory
2. Follow the existing patterns and naming conventions
3. Add documentation to this README
4. Include proper TypeScript types and error handling
5. Test across different browsers and devices