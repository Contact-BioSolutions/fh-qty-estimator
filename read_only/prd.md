# PRD: FileHawk Quantity Estimator

## 1. Purpose
The FileHawk Quantity Estimator provides agronomists and growers with an easy-to-use tool for calculating the required volume of **FireHawk herbicide** and total water based on:
- Area treated  
- Weed size (which affects spray volume)  
- Application rate  

The tool outputs **product quantity, carrier water, pack requirements**, and provides **Add to Cart / Buy Now** actions for e-commerce integration.

---

## 2. Objectives
- Provide a **user-friendly calculator** embedded in the FileHawk website (Next.js front end).  
- Standardize dosing based on selectable units (metric/imperial).  
- Support direct **integration with e-commerce workflows** (e.g., Shopify / custom cart).  
- Modular design: the estimator should be delivered as a **React package** for reuse.  

---

## 3. Users
- **Internal agronomists** (for demonstration with growers).  
- **Growers / customers** (self-service calculations and purchases).  
- **E-commerce platform** (consumes “Add to cart” payload).  

---

## 4. Scope

### Features (MVP)
1. **Input Units**
   - Area units: `sq ft`, `sq m`, `ac`, `ha`  
   - Output units: `L`, `US gal`

2. **Sliders**
   - Area (configurable min, max, step per unit)  
   - Weed size (small, medium, large → maps to spray volume: default 200/300/500 L/ha)  
   - FireHawk rate (L/ha or gal/ac, range settable via props)

3. **Outputs**
   - FireHawk quantity (`L` or `US gal`)  
   - Water volume (`L` or `US gal`)  
   - Total spray volume  

4. **Pack Size**
   - User selects pack size (e.g., 5 L, 20 L drum,
