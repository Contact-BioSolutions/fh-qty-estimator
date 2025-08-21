# FireHawk Quantity Estimator

🌾 **Professional React Component for Agricultural Chemical Calculations**

A production-ready, accessible React component for calculating FireHawk herbicide quantities, water requirements, and package recommendations. Built with TypeScript, comprehensive testing, and e-commerce integration capabilities.

## ✨ Key Features

- 🔢 **Real-time Calculations** - Instant updates with debounced performance
- 🔄 **Unit Conversion** - Seamless metric/imperial switching  
- 📦 **Smart Recommendations** - Optimal package size suggestions
- 🛒 **E-commerce Ready** - Shopify, WooCommerce, custom cart integration
- ♿ **Accessibility First** - WCAG 2.1 AA compliant
- 📱 **Mobile Responsive** - Touch-friendly across all devices
- 🎯 **TypeScript Native** - Complete type safety
- ⚡ **Performance Optimized** - <50KB gzipped bundle

## 🚀 Quick Start

```bash
npm install firehawk-quantity-estimator
```

```tsx
import { FireHawkEstimator } from 'firehawk-quantity-estimator';

<FireHawkEstimator
  productInfo={{
    name: "FireHawk Herbicide",
    packages: [
      { id: "fh-5l", name: "5L Container", size: 5, unit: "L", price: 89.99, sku: "FH-5L-001" }
    ],
    applicationRateRange: { min: 1.0, max: 5.0, default: 2.5, unit: "L/ha" }
  }}
  onAddToCart={(cartItem) => console.log('Adding to cart:', cartItem)}
  initialUnitSystem="metric"
/>
```

## 📁 Project Structure

```
├── src/                           # Source code
│   ├── components/                # React components
│   │   ├── FireHawkEstimator.tsx  # Main component
│   │   ├── EstimatorForm.tsx      # Input form
│   │   ├── CalculationDisplay.tsx # Results display
│   │   └── AddToCartSection.tsx   # E-commerce integration
│   ├── utils/                     # Utility functions
│   │   ├── UnitConverter.ts       # Unit conversion system
│   │   └── FireHawkCalculator.ts  # Calculation engine
│   ├── hooks/                     # Custom React hooks
│   ├── types/                     # TypeScript definitions
│   └── constants/                 # Configuration constants
├── tests/                         # Comprehensive test suite
│   ├── utils/                     # Utility function tests
│   ├── components/                # Component tests
│   ├── integration/               # Integration tests
│   └── accessibility/             # A11y tests
├── examples/                      # Usage examples
│   ├── basic-usage.tsx            # Simple implementation
│   ├── advanced-usage.tsx         # Advanced features
│   └── README.md                  # Example documentation
├── docs/                          # Complete documentation
└── coordination/                  # Development coordination
    └── subtasks/                  # Requirements & architecture docs
```

## 🛠️ Development

### Prerequisites
- Node.js 16+
- React 16.8+
- TypeScript 4.5+

### Setup
```bash
# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm run test

# Type checking
npm run typecheck

# Build for production
npm run build
```

## 📋 Available Scripts

- `npm run build` - Build production package
- `npm run dev` - Start development server  
- `npm run test` - Run test suite
- `npm run test:watch` - Watch mode testing
- `npm run lint` - Lint codebase
- `npm run typecheck` - TypeScript validation

## 🧪 Testing

Comprehensive test suite with >90% coverage:

- **Unit Tests**: 85+ tests for calculations and utilities
- **Component Tests**: React Testing Library integration  
- **Accessibility Tests**: WCAG 2.1 AA compliance
- **Performance Tests**: Bundle size and runtime metrics
- **Integration Tests**: Complete user workflows

```bash
npm run test              # All tests
npm run test:coverage     # Coverage report
npm run test:a11y         # Accessibility tests
```

## 📚 Documentation

- [Complete Documentation](./docs/README.md) - Full component guide
- [API Reference](./docs/api.md) - Component API documentation
- [Examples](./examples/README.md) - Usage examples and patterns
- [TypeScript Types](./docs/types.md) - Interface definitions

## 🎯 Core Functionality

### Calculation Engine
- Area-based herbicide quantity calculations
- Weed size impact on spray volume (200/300/500 L/ha)
- Package optimization for minimal waste
- Cost analysis and recommendations

### Unit Conversion
- **Area**: sq ft ↔ sq m ↔ acres ↔ hectares
- **Volume**: fl oz ↔ US gal ↔ mL ↔ L  
- **Rate**: gal/ac ↔ L/ha

### E-commerce Integration
- Shopify cart integration
- WooCommerce compatibility
- Custom cart implementations
- Structured product metadata

## ♿ Accessibility Features

WCAG 2.1 AA compliant with:
- Full keyboard navigation
- Screen reader support
- High contrast mode
- Touch-friendly interfaces
- ARIA labeling throughout

## 📦 Package Information

- **Bundle Size**: ~48KB gzipped
- **Dependencies**: React, react-dom (peer dependencies)
- **TypeScript**: Full type definitions included
- **License**: MIT
- **Browser Support**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for changes
4. Ensure tests pass (`npm run test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🆘 Support

- [GitHub Issues](https://github.com/your-org/firehawk-quantity-estimator/issues) - Bug reports and feature requests
- [Documentation](./docs/) - Complete implementation guide
- [Examples](./examples/) - Usage patterns and integration examples

---

**Built for the agricultural community with modern web standards** 🌾