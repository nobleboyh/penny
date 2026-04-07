# Data Flow and Service Interactions

## Complete Request Flows

### 1. User Registration Flow
```
Browser → Gateway → Account Service → Auth Service → MongoDB
                         ↓
                    Account MongoDB
```

**Steps**:
1. User submits registration (username, password)
2. Gateway routes to account-service: `POST /accounts/`
3. Account service validates username uniqueness
4. Account service calls auth-service: `POST /uaa/users` (create credentials)
5. Auth service saves user to auth-mongodb
6. Account service creates default account with:
   - Empty incomes/expenses
   - Zero savings (USD, 0%, no deposit)
   - Current timestamp
7. Account service saves to account-mongodb
8. Returns created account to user

### 2. User Login Flow
```
Browser → Gateway → Auth Service → MongoDB → Token
```

**Steps**:
1. User submits credentials
2. Gateway routes to auth-service: `POST /uaa/oauth/token`
3. Auth service validates via MongoUserDetailsService
4. Generates access_token and refresh_token
5. Stores in InMemoryTokenStore
6. Returns tokens to browser
7. Browser includes token in subsequent requests

### 3. Account Update Flow
```
Browser → Gateway → Account Service → Statistics Service
            ↓            ↓                    ↓
         Auth Check   Account DB         Statistics DB
```

**Steps**:
1. User updates account data (incomes/expenses/savings)
2. Gateway routes to account-service: `PUT /accounts/current`
3. Gateway validates OAuth2 token with auth-service
4. Account service extracts principal from token
5. Account service updates account in MongoDB
6. Account service calls statistics-service: `PUT /statistics/{accountName}`
7. Statistics service normalizes data:
   - Converts all amounts to USD
   - Normalizes time periods to daily
   - Fetches current exchange rates
8. Statistics service creates/updates DataPoint
9. Statistics service saves time series to MongoDB
10. Returns success to user

### 4. Statistics Retrieval Flow
```
Browser → Gateway → Statistics Service → MongoDB
            ↓
         Auth Check
```

**Steps**:
1. User requests statistics
2. Gateway routes to statistics-service: `GET /statistics/current`
3. Gateway validates OAuth2 token
4. Statistics service extracts principal
5. Statistics service queries DataPoints by account name
6. Returns time series data (all historical data points)
7. UI renders charts/graphs

### 5. Scheduled Backup Notification Flow
```
Cron Trigger → Notification Service → Account Service → Email
                      ↓                      ↓
                Notification DB          Account DB
```

**Steps**:
1. Cron triggers backup job (e.g., weekly)
2. Notification service queries recipients ready for backup
3. For each recipient (parallel):
   - Obtains service token from auth-service (client credentials)
   - Calls account-service: `GET /accounts/{name}` with server scope
   - Account service returns account data
   - Email service formats and sends email with account JSON
   - Marks recipient as notified with current timestamp
4. Process continues for all recipients

### 6. Service-to-Service Authentication Flow
```
Service A → Auth Service → Token → Service B
```

**Steps**:
1. Service A needs to call Service B
2. Service A requests token: `POST /uaa/oauth/token`
   - grant_type=client_credentials
   - client_id=service-a
   - client_secret=<password>
3. Auth service validates client credentials
4. Returns access_token with "server" scope
5. Service A calls Service B with Bearer token
6. Service B validates token with auth-service
7. Service B checks scope (@PreAuthorize)
8. Service B processes request

## Inter-Service Communication Matrix

| From Service | To Service | Purpose | Method | Fallback |
|--------------|------------|---------|--------|----------|
| account-service | auth-service | Create user | POST /uaa/users | None (critical) |
| account-service | statistics-service | Update stats | PUT /statistics/{name} | Log error, continue |
| notification-service | account-service | Fetch account data | GET /accounts/{name} | Skip notification |
| statistics-service | External API | Exchange rates | GET rates | Use cached rates |
| All services | config | Fetch config | GET /config | Fail-fast on startup |
| All services | registry | Register/discover | Eureka protocol | Retry |

## Data Consistency Model

### Eventual Consistency
- Account updates propagate to statistics asynchronously
- Statistics may lag behind account changes
- Circuit breaker can delay updates further
- Acceptable for analytics use case

### Strong Consistency
- User registration is synchronous (account + auth)
- Failure in auth-service rolls back account creation
- Ensures credentials exist before account is usable

## Error Handling Strategies

### Circuit Breaker Behavior
1. **Closed State**: Normal operation
   - Requests pass through
   - Failures tracked

2. **Open State**: Service unavailable
   - Requests immediately fail
   - Fallback executed
   - Periodic retry after sleep window

3. **Half-Open State**: Testing recovery
   - Single request allowed through
   - Success → Close circuit
   - Failure → Reopen circuit

### Fallback Implementations
- **StatisticsServiceClientFallback**: Logs error, returns without exception
- **ExchangeRatesClientFallback**: Returns last known rates
- Prevents cascading failures

## Message Flow (RabbitMQ)

### Hystrix Metrics Stream
```
Microservice (Hystrix)
    ↓
Spring Cloud Bus
    ↓
RabbitMQ Exchange
    ↓
Turbine Stream Service (consumer)
    ↓
Aggregated Stream
    ↓
Hystrix Dashboard (visualization)
```

### Purpose
- Real-time monitoring
- Centralized metrics
- No direct service-to-service calls for metrics
- Decoupled architecture

## Distributed Tracing

### Trace Propagation
```
Gateway (traceId created)
    ↓ (traceId, spanId-1)
Account Service
    ↓ (traceId, spanId-2)
Statistics Service
```

### Log Format
```
[service-name, traceId, spanId, exportable]
```

### Benefits
- Track requests across services
- Identify bottlenecks
- Debug distributed transactions
- Correlate logs from multiple services
