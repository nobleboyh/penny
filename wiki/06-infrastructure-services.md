# Infrastructure Services

## Config Service

### Purpose
Centralized configuration management for all microservices using Spring Cloud Config.

### Technical Details
- **Port**: 8888
- **Package**: com.piggymetrics.config
- **Profile**: Native (local filesystem)

### Configuration Structure
```
config/src/main/resources/
├── application.yml (config service settings)
└── shared/
    ├── application.yml (shared by all services)
    ├── account-service.yml
    ├── statistics-service.yml
    ├── notification-service.yml
    ├── auth-service.yml
    ├── gateway.yml
    ├── registry.yml
    ├── monitoring.yml
    └── turbine-stream-service.yml
```

### Shared Configuration (application.yml)
- Hystrix timeout: 10s
- Eureka service URL: http://registry:8761/eureka/
- OAuth2 user-info-uri: http://auth-service:5001/uaa/users/current
- RabbitMQ host: rabbitmq
- Logging levels

### Client Usage
Services connect via bootstrap.yml:
```yaml
spring:
  cloud:
    config:
      uri: http://config:8888
      fail-fast: true
      password: ${CONFIG_SERVICE_PASSWORD}
```

### Dynamic Refresh
- Services can refresh config without restart
- POST /refresh endpoint (requires @RefreshScope)
- Webhook integration possible for automated updates

---

## Registry Service (Eureka)

### Purpose
Service discovery and registration using Netflix Eureka.

### Technical Details
- **Port**: 8761
- **Dashboard**: http://localhost:8761
- **Package**: com.piggymetrics.registry

### Functionality
- **Service Registration**: Services register on startup
- **Health Monitoring**: Heartbeat mechanism
- **Service Lookup**: Provides service instance locations
- **Load Balancing**: Works with Ribbon for client-side LB

### Registered Services
All business and infrastructure services register with metadata:
- Host and port
- Health indicator URL
- Home page
- Instance ID

### Client Integration
Services use `@EnableDiscoveryClient` and specify application name in bootstrap.yml.

---

## Gateway Service (Zuul)

### Purpose
API Gateway providing single entry point, routing, and static content hosting.

### Technical Details
- **Port**: 4000 (exposed as 80)
- **Package**: com.piggymetrics.gateway
- **Technology**: Netflix Zuul

### Routing Configuration

| Path | Target | Type |
|------|--------|------|
| /uaa/** | auth-service:5001 | URL-based |
| /accounts/** | account-service | Service discovery |
| /statistics/** | statistics-service | Service discovery |
| /notifications/** | notification-service | Service discovery |

### Features
- **Static Content**: Hosts UI application
- **Service Discovery**: Integrates with Eureka
- **Load Balancing**: Ribbon integration
- **Circuit Breaker**: Hystrix protection
- **Timeout Configuration**:
  - Hystrix: 20s
  - Ribbon read: 20s
  - Ribbon connect: 20s
  - Zuul host: 20s

### Request Flow
```
Client (Browser/API)
    ↓
Gateway (Zuul) :80
    ↓
Route Matching
    ↓
Service Discovery (Eureka)
    ↓
Load Balancing (Ribbon)
    ↓
Circuit Breaker (Hystrix)
    ↓
Target Microservice
```

### Security
- Passes OAuth2 tokens to downstream services
- Sensitive headers configuration
- No token stripping (stripPrefix: false)

---

## Monitoring Service

### Purpose
Hystrix Dashboard for visualizing circuit breaker metrics and system health.

### Technical Details
- **Port**: 9000 (mapped to 8080)
- **Package**: com.piggymetrics.monitoring
- **Dashboard**: http://localhost:9000/hystrix

### Features
- Real-time circuit breaker status
- Request throughput visualization
- Error rate monitoring
- Thread pool metrics
- Latency percentiles

### Metrics Displayed
- Request volume
- Error percentage
- Circuit state (CLOSED, OPEN, HALF_OPEN)
- Median/95th/99th percentile latency
- Active thread count
- Thread pool rejections

---

## Turbine Stream Service

### Purpose
Aggregates Hystrix metrics from all services via RabbitMQ for centralized monitoring.

### Technical Details
- **Port**: 8989
- **Package**: com.piggymetrics.turbine
- **Stream**: http://turbine-stream-service:8080/turbine/turbine.stream

### Architecture
```
Microservices (with Hystrix)
    ↓
Spring Cloud Bus (RabbitMQ)
    ↓
Turbine Stream Service (aggregation)
    ↓
Hystrix Dashboard (visualization)
```

### Integration
- Services push metrics to RabbitMQ
- Turbine consumes and aggregates
- Dashboard connects to Turbine stream
- Real-time updates

---

## Infrastructure Dependencies

### Service Startup Order
1. **RabbitMQ** (no dependencies)
2. **Config Service** (no dependencies)
3. **Registry** (depends on Config)
4. **Auth Service** (depends on Config)
5. **Gateway** (depends on Config, Registry)
6. **Business Services** (depend on Config, Registry, Auth)
7. **Monitoring** (depends on Config, Turbine)
8. **Turbine** (depends on Config, RabbitMQ)

### Health Checks
- Config service has health check endpoint
- Other services wait for config to be healthy
- Defined in docker-compose.yml with `condition: service_healthy`
