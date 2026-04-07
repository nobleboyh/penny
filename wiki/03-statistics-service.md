# Service Details - Statistics Service

## Purpose
Calculates financial statistics and maintains time series data for account analysis. Normalizes all amounts to base currency (USD) and base time period (DAY) for comparison.

## Technical Details
- **Port**: 7000
- **Database**: statistics-mongodb
- **Package**: com.piggymetrics.statistics
- **Main Class**: StatisticsApplication.java

## Domain Model

### DataPoint Entity (Time Series)
```
DataPoint (MongoDB collection: "datapoints")
├── id: DataPointId
│   ├── account: String - Account name
│   └── date: Date - Data point date (daily)
├── incomes: Set<ItemMetric> - Normalized income metrics
├── expenses: Set<ItemMetric> - Normalized expense metrics
├── statistics: Map<StatisticMetric, BigDecimal> - Calculated metrics
└── rates: Map<Currency, BigDecimal> - Exchange rates snapshot
```

### Supporting Entities
- **ItemMetric**: Normalized item (title, amount in base currency/period)
- **StatisticMetric**: Enum (INCOMES_AMOUNT, EXPENSES_AMOUNT, SAVING_AMOUNT)
- **Account**: Mirror of account-service model for calculations
- **ExchangeRatesContainer**: Current exchange rates from external API

## API Endpoints

| Method | Path | Description | Auth Required | Scope |
|--------|------|-------------|---------------|-------|
| GET | /statistics/current | Get current user's statistics | Yes | Any authenticated |
| GET | /statistics/{accountName} | Get account statistics | Yes | server or demo |
| PUT | /statistics/{accountName} | Create/update data point | Yes | server |

## Service Dependencies

### Outbound Calls (Feign Clients)
1. **ExchangeRatesClient** → External API (fixer.io)
   - Fetches current exchange rates
   - Fallback: Returns cached/default rates
   - Hystrix protected

## Business Logic Flow

### Statistics Calculation (on PUT)
1. Receive account data from account-service
2. Create DataPointId with account name + current date
3. **Normalize all incomes**:
   - Convert to base currency (USD)
   - Normalize to base period (DAY)
   - Create ItemMetric set
4. **Normalize all expenses**:
   - Same normalization process
   - Create ItemMetric set
5. **Calculate aggregate statistics**:
   - Sum all income amounts
   - Sum all expense amounts
   - Convert saving amount to base currency
6. Fetch current exchange rates
7. Create DataPoint with all data
8. Save to MongoDB (upsert by account+date)

### Normalization Algorithm
```
For each Item:
  1. Convert amount from item.currency to USD using exchange rates
  2. Divide by item.period.baseRatio to normalize to daily amount
  3. Round to 4 decimal places (HALF_UP)
  4. Store as ItemMetric
```

### Statistics Retrieval (on GET)
1. Query all DataPoints for given account
2. Return time series (sorted by date)
3. Client can visualize trends over time

## Data Flow
```
Account Service (PUT update)
    ↓
StatisticsController
    ↓
StatisticsService
    ↓
ExchangeRatesService (fetch rates)
    ↓
Normalization Logic (currency + time period)
    ↓
DataPointRepository
    ↓
MongoDB (time series storage)
```

## Key Algorithms

### Currency Conversion
- Fetches rates from external API (fixer.io)
- Base currency: USD
- Conversion: `amount * rate[targetCurrency] / rate[sourceCurrency]`

### Time Period Normalization
- Base period: DAY
- Conversion ratios defined in TimePeriod enum
- Example: MONTH amount / 30 = daily amount

### Aggregation
- Uses Java 8 Streams for functional aggregation
- Reduces item collections to single BigDecimal sums
- Immutable maps for statistics results

## Security
- OAuth2 resource server
- Scope-based access:
  - `server` scope: Required for PUT operations (service-to-service)
  - `ui` scope: For user GET operations
- Demo account accessible without server scope

## Configuration
- **Bootstrap**: Connects to config service
- **Shared Config**: statistics-service.yml
- **Exchange Rates**: Configurable API endpoint

## Resilience Features
- Hystrix circuit breaker on external API calls
- Fallback for exchange rates (prevents total failure)
- Timeout: 10s default
- Ribbon load balancing for service discovery

## Performance Considerations
- Daily data points (not real-time)
- Batch processing via streams
- BigDecimal for financial precision
- Indexed queries by account name
