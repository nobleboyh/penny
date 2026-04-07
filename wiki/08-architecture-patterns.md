# Architecture Patterns and Design Decisions

## Microservice Patterns Implemented

### 1. API Gateway Pattern
**Implementation**: Netflix Zuul (gateway service)

**Purpose**:
- Single entry point for all client requests
- Routing to appropriate backend services
- Static content hosting (UI)
- Cross-cutting concerns (logging, monitoring)

**Benefits**:
- Simplified client interaction
- Centralized security enforcement
- Protocol translation
- Request aggregation potential

**Trade-offs**:
- Single point of failure (mitigated by restart policy)
- Potential bottleneck (mitigated by horizontal scaling)

---

### 2. Service Registry Pattern
**Implementation**: Netflix Eureka (registry service)

**Purpose**:
- Dynamic service discovery
- Health monitoring via heartbeats
- Automatic instance registration/deregistration

**Benefits**:
- No hardcoded service locations
- Automatic failover
- Supports dynamic scaling
- Client-side load balancing

**Design Choice**: Client-side discovery
- Services query Eureka directly
- No additional network hop
- Ribbon handles load balancing

---

### 3. Circuit Breaker Pattern
**Implementation**: Netflix Hystrix

**Purpose**:
- Prevent cascading failures
- Fail fast when service unavailable
- Automatic recovery testing

**Configuration**:
- Default timeout: 10s (20s for gateway)
- Fallback methods for graceful degradation
- Metrics collection for monitoring

**Applied To**:
- All Feign client calls
- External API calls (exchange rates)
- Service-to-service communication

**Example**: StatisticsServiceClientFallback
- When statistics-service is down
- Account updates still succeed
- Statistics calculation deferred
- User experience unaffected

---

### 4. Externalized Configuration Pattern
**Implementation**: Spring Cloud Config

**Purpose**:
- Centralized configuration management
- Environment-specific settings
- Dynamic configuration updates

**Benefits**:
- Single source of truth
- No config in code
- Runtime updates via @RefreshScope
- Version control for configurations

**Security**:
- Password-protected config server
- Credentials via environment variables
- Fail-fast on config unavailable

---

### 5. Database per Service Pattern

**Implementation**: Separate MongoDB instance per service

**Services and Databases**:
- account-service → account-mongodb
- statistics-service → statistics-mongodb
- notification-service → notification-mongodb
- auth-service → auth-mongodb

**Benefits**:
- Service autonomy
- Independent scaling
- Technology flexibility
- Failure isolation

**Trade-offs**:
- No ACID transactions across services
- Data duplication (Account model in multiple services)
- Eventual consistency model

**Consistency Strategy**:
- Synchronous calls for critical operations (user creation)
- Asynchronous calls for analytics (statistics updates)
- Fallbacks for non-critical failures

---

### 6. Access Token Pattern
**Implementation**: OAuth2 with JWT-style tokens

**Grant Types**:
1. **Password Grant**: User authentication
   - Client: browser
   - Scope: ui
   - Use case: User login

2. **Client Credentials Grant**: Service authentication
   - Clients: microservices
   - Scope: server
   - Use case: Service-to-service calls

**Token Validation**:
- Resource servers call auth-service
- User-info endpoint: /uaa/users/current
- Scope-based authorization via @PreAuthorize

**Security Layers**:
- Gateway validates tokens
- Each service validates independently
- Scope enforcement at method level

---

### 7. Asynchronous Messaging Pattern
**Implementation**: RabbitMQ + Spring Cloud Bus

**Purpose**:
- Decouple metrics collection
- Real-time monitoring without polling
- Event-driven architecture

**Flow**:
- Services publish Hystrix metrics to RabbitMQ
- Turbine consumes and aggregates
- Dashboard subscribes to aggregated stream

**Benefits**:
- No direct service-to-monitoring calls
- Scalable metrics collection
- Real-time updates

---

## Design Decisions Analysis

### Why Spring Cloud?
**Decision**: Use Spring Cloud ecosystem for microservices

**Rationale**:
- Mature, production-ready components
- Seamless Spring Boot integration
- Netflix OSS battle-tested tools
- Comprehensive documentation
- Active community

**Alternatives Considered** (implied):
- Kubernetes-native service mesh (Istio)
- Custom service discovery
- API gateway alternatives (Kong, Ambassador)

---

### Why MongoDB?
**Decision**: NoSQL database for all services

**Rationale**:
- Flexible schema for evolving domain models
- JSON-like documents match REST APIs
- Easy horizontal scaling
- Good fit for time series (statistics)

**Trade-offs**:
- No ACID transactions across collections
- Eventual consistency
- More complex queries vs SQL

---

### Why OAuth2?
**Decision**: OAuth2 for authentication/authorization

**Rationale**:
- Industry standard
- Supports multiple grant types
- Token-based (stateless)
- Scope-based authorization
- Refresh token support

**Implementation Notes**:
- InMemoryTokenStore (demo only)
- NoOpPasswordEncoder (insecure, demo only)
- Production needs persistent store and encryption

---

### Why Feign?
**Decision**: Declarative REST clients via Feign

**Rationale**:
- Reduces boilerplate code
- Integrates with Ribbon (load balancing)
- Integrates with Hystrix (circuit breaker)
- Type-safe service interfaces
- Automatic service discovery

**Example**:
```java
@FeignClient(name = "statistics-service", fallback = StatisticsServiceClientFallback.class)
public interface StatisticsServiceClient {
    @RequestMapping(method = RequestMethod.PUT, value = "/statistics/{accountName}")
    void updateStatistics(@PathVariable String accountName, Account account);
}
```

---

### Why Separate Statistics Service?
**Decision**: Extract statistics calculation to separate service

**Rationale**:
- **Single Responsibility**: Account service handles CRUD, statistics handles analytics
- **Independent Scaling**: Analytics can scale separately
- **Technology Flexibility**: Could use different tech for analytics
- **Failure Isolation**: Statistics failure doesn't affect account operations

**Data Duplication**:
- Account model exists in both services
- Acceptable trade-off for service autonomy
- Statistics has read-only view

---

## Anti-Patterns Avoided

### 1. Distributed Monolith
**Avoided By**:
- Database per service
- Independent deployability
- Loose coupling via REST APIs
- Fallback mechanisms

### 2. Chatty Services
**Avoided By**:
- Batch operations where possible
- Async communication for non-critical paths
- Caching (exchange rates)

### 3. Shared Database
**Avoided By**:
- Strict database isolation
- API-only communication
- Data duplication accepted

### 4. Synchronous Coupling
**Mitigated By**:
- Circuit breakers
- Fallback methods
- Async notifications
- Message broker for metrics

---

## Scalability Considerations

### Horizontal Scaling
- All services are stateless (except token store)
- Eureka supports multiple instances
- Ribbon distributes load
- Docker enables easy replication

### Bottlenecks Identified
1. **Gateway**: Single instance, but can scale horizontally
2. **Config Service**: Single instance, but rarely called after startup
3. **Auth Service**: InMemoryTokenStore limits to single instance
4. **MongoDB**: Single instances, need replica sets for production

### Performance Optimizations
- Client-side load balancing (no extra hop)
- Connection pooling (Feign/Ribbon)
- Async processing (notifications)
- Caching (exchange rates fallback)

---

## Resilience Patterns

### Fault Tolerance
1. **Circuit Breaker**: Prevents cascading failures
2. **Fallback Methods**: Graceful degradation
3. **Timeouts**: Prevents hanging requests
4. **Retry Logic**: Automatic recovery attempts
5. **Health Checks**: Automatic deregistration of unhealthy instances

### Failure Scenarios

| Scenario | Impact | Mitigation |
|----------|--------|------------|
| Statistics service down | Account updates succeed, stats delayed | Circuit breaker + fallback |
| Auth service down | No new logins, existing tokens work | Token caching, retry |
| Config service down | Services fail to start | Fail-fast, manual intervention |
| Exchange rates API down | Statistics use cached rates | Fallback with last known rates |
| Account service down | Notifications skip that account | Async processing, continue others |
| MongoDB down | Service unavailable | Restart policy, health checks |

---

## Security Architecture

### Defense in Depth
1. **Gateway Level**: First token validation
2. **Service Level**: Independent token validation
3. **Method Level**: @PreAuthorize scope checks
4. **Data Level**: Principal-based filtering

### OAuth2 Scopes
- **ui**: Browser/user operations
- **server**: Service-to-service operations
- **Special**: Demo account accessible with either scope

### Token Flow
```
User Login → Password Grant → ui scope token
Service Call → Client Credentials Grant → server scope token
```

### Security Weaknesses (Demo Only)
- Plain text passwords (NoOpPasswordEncoder)
- In-memory token store (lost on restart)
- No HTTPS enforcement
- No rate limiting
- Hardcoded client secrets in config
