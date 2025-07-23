# NetWorth Summary Component Tests

## Overview

The NetWorthSummary component calculates and displays the user's net worth by subtracting total liabilities from total assets.

## Test Coverage

### Basic Functionality Tests (`NetWorthSummary.test.tsx`)

1. **Loading State** - Displays skeleton loader while fetching data
2. **Positive Net Worth** - Correctly calculates and displays in green with up arrow
3. **Negative Net Worth** - Correctly calculates and displays in red with down arrow
4. **Zero Net Worth** - Handles zero values correctly (displays as positive/green)
5. **Empty Data** - Handles empty assets and liabilities arrays
6. **API Errors** - Gracefully handles failed API calls
7. **Large Numbers** - Correctly formats millions and billions
8. **Decimal Values** - Handles and rounds decimal values properly

### Edge Cases Tests (`NetWorthCalculation.test.tsx`)

1. **Floating Point Precision** - Handles JavaScript floating point issues (0.1 + 0.2)
2. **Negative Values** - Correctly handles negative asset values
3. **Very Small Values** - Properly rounds tiny decimal values
4. **Maximum Safe Integer** - Handles very large numbers within JavaScript limits
5. **Null/Undefined Values** - Treats missing values as 0
6. **String Numbers** - Converts string numbers to proper numeric values
7. **Missing API Properties** - Defaults to empty arrays when properties missing

## Key Implementation Details

### Calculation Logic

```typescript
const totalAssets = (assetsData.assets || []).reduce(
  (sum: number, asset: { value: number }) => sum + (Number(asset.value) || 0),
  0,
);
```

- Uses `|| []` to handle missing arrays
- Uses `Number()` to convert string values
- Uses `|| 0` to handle null/undefined values

### Display Logic

- Positive/Zero: Green text with trending up icon
- Negative: Red text with trending down icon
- Always shows absolute value with proper formatting

### Error Handling

- API failures result in $0.00 display
- Console errors are logged for debugging
- Component remains functional even with partial data

## Running Tests

```bash
# Run all dashboard tests
npm test -- src/components/Dashboard/ --watchAll=false

# Run specific test file
npm test -- src/components/Dashboard/NetWorthSummary.test.tsx --watchAll=false
```
