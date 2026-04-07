# Service Details - Account Service

## Purpose
Manages user accounts including income/expense tracking, savings goals, and account settings.

## Technical Details
- **Port**: 6000
- **Database**: account-mongodb
- **Package**: com.piggymetrics.account
- **Main Class**: AccountApplication.java

## Domain Model

### Account Entity
```
Account (MongoDB collection: "accounts")
├── name: String (@Id) - Account identifier
├── lastSeen: Date - Last activity timestamp
├── incomes: List<Item> - Income items
├── expenses: List<Item> - Expense items
├── saving: Saving - Savings configuration
└── note: String (max 20,000 chars) - User notes
```

### Supporting Entities
- **Item**: Individual income/expense entry (title, amount, currency, period, icon)
- **Saving**: Savings goal (amount, currency, interest, deposit, capitalization)
- **Currency**: Enum (USD, EUR, RUB) with base currency USD
- **TimePeriod**: Enum (YEAR, QUARTER, MONTH, DAY, HOUR) for normalization
- **User**: Registration data (username, password)

## API Endpoints

| Method | Path | Description | Auth Required | Scope |
|--------|------|-------------|---------------|-------|
| GET | /accounts/{name} | Get account by name | Yes | server or demo |
| GET | /accounts/current | Get current user's account | Yes | Any authenticated |
| PUT | /accounts/current | Update current account | Yes | Any authenticated |
| POST | /accounts/ | Register new account | No | Public |

## Service Dependencies

### Outbound Calls (Feign Clients)
1. **StatisticsServiceClient** → statistics-service
   - `PUT /statistics/{accountName}` - Push account updates for statistics calculation
   - Fallback: Logs error, returns gracefully

2. **AuthServiceClient** → auth-service
   - `POST /uaa/users` - Create user credentials during registration

## Business Logic Flow

### Account Creation
1. Validate username doesn't exist
2. Create user in auth-service
3. Initialize default saving (0 amount, USD, no interest)
4. Save account with timestamp
5. Return created account

### Account Update
1. Fetch existing account by name
2. Update incomes, expenses, saving, note
3. Update lastSeen timestamp
4. Save to MongoDB
5. **Asynchronously notify statistics-service** for recalculation

## Data Flow
```
AccountController
    ↓
AccountService (business logic)
    ↓
AccountRepository (MongoDB access)
    ↓
MongoDB (persistence)
    ↓ (on update)
StatisticsServiceClient (async notification)
```

## Security
- OAuth2 resource server
- Validates tokens via auth-service
- Scope-based access control:
  - `server` scope: Service-to-service calls
  - `ui` scope: User interface calls
- Principal-based authorization for current user operations

## Configuration
- **Bootstrap**: Connects to config service on port 8888
- **Shared Config**: From config/src/main/resources/shared/account-service.yml
- **Security**: OAuth2 resource with user-info-uri pointing to auth-service

## Resilience Features
- Hystrix circuit breaker (10s timeout)
- Feign client with fallback for statistics-service
- Ribbon load balancing
- Eureka service registration with heartbeat

## Key Implementation Notes
- Uses Spring Data MongoDB for persistence
- Validation via JSR-303 annotations (@Valid, @NotNull)
- RESTful controller with @PreAuthorize for fine-grained security
- Fallback mechanism prevents cascading failures when statistics-service is down
