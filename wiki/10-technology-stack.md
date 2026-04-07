# Technology Stack Deep Dive

## Core Technologies

### Spring Boot 2.0.3
**Purpose**: Application framework and runtime

**Key Features Used**:
- Auto-configuration for rapid development
- Embedded Tomcat (no external server needed)
- Actuator for health checks and metrics
- Spring Data MongoDB for persistence
- Spring Security for authentication
- Starter dependencies for simplified setup

**Configuration**:
- application.yml / bootstrap.yml
- @SpringBootApplication annotation
- Component scanning
- Property injection via @Value

---

### Spring Cloud Finchley.RELEASE
**Purpose**: Microservice infrastructure

**Components Used**:

#### 1. Spring Cloud Config
- **Artifact**: spring-cloud-config-server / spring-cloud-starter-config
- **Purpose**: Centralized configuration
- **Features**: Native profile, Git support, refresh scope

#### 2. Spring Cloud Netflix
- **Eureka**: Service discovery
- **Zuul**: API gateway
- **Ribbon**: Client-side load balancing
- **Hystrix**: Circuit breaker
- **Feign**: Declarative REST clients

#### 3. Spring Cloud Security
- **OAuth2**: Authorization server and resource server
- **JWT**: Token format (optional)
- **Scope-based authorization**: @PreAuthorize

#### 4. Spring Cloud Bus
- **Purpose**: Event propagation
- **Transport**: RabbitMQ
- **Use Case**: Config refresh, metrics streaming

#### 5. Spring Cloud Sleuth
- **Purpose**: Distributed tracing
- **Features**: Trace ID, Span ID, MDC integration
- **Export**: Zipkin compatible

---

## Data Layer

### MongoDB
**Version**: Latest (via Docker image)

**Why MongoDB**:
- Schema flexibility for evolving models
- JSON-like documents match REST APIs
- Horizontal scaling support
- Good for time series data

**Collections**:
- **accounts**: Account documents with embedded items
- **datapoints**: Time series statistics
- **recipients**: Notification settings
- **users**: Authentication credentials

**Indexes**:
- Primary key on account name
- Date-based queries for time series
- Username lookup for auth

**Spring Data MongoDB**:
- Repository pattern
- Query derivation from method names
- Custom converters (Frequency enum)
- Document annotations (@Document, @Id)

---

## Communication Layer

### Netflix Feign
**Purpose**: Declarative HTTP clients

**Features**:
- Interface-based client definition
- Automatic service discovery integration
- Hystrix fallback support
- Request/response logging
- Custom encoders/decoders

**Example**:
```java
@FeignClient(name = "statistics-service", fallback = Fallback.class)
public interface StatisticsServiceClient {
    @RequestMapping(method = PUT, value = "/statistics/{name}")
    void updateStatistics(@PathVariable String name, Account account);
}
```

**Integration**:
- Ribbon: Load balancing
- Eureka: Service discovery
- Hystrix: Circuit breaker
- OAuth2: Token propagation

---

### Netflix Ribbon
**Purpose**: Client-side load balancing

**Features**:
- Round-robin load balancing (default)
- Retry logic
- Server list from Eureka
- Health-based filtering
- Configurable timeouts

**Configuration**:
```yaml
ribbon:
  ReadTimeout: 20000
  ConnectTimeout: 20000
```

**Integration**:
- Feign clients use Ribbon automatically
- Zuul uses Ribbon for routing
- Eureka provides server list

---

### Netflix Hystrix
**Purpose**: Circuit breaker and fault tolerance

**Features**:
- Circuit breaker pattern
- Fallback methods
- Request timeout
- Thread pool isolation
- Metrics collection

**Configuration**:
```yaml
hystrix:
  command:
    default:
      execution:
        isolation:
          thread:
            timeoutInMilliseconds: 10000
```

**Metrics**:
- Success/failure counts
- Latency percentiles
- Circuit state
- Thread pool usage

**Dashboard**:
- Real-time visualization
- Turbine aggregation
- Multiple service monitoring

---

## Service Discovery

### Netflix Eureka
**Purpose**: Service registry and discovery

**Architecture**:
- **Server**: Registry service (port 8761)
- **Client**: All microservices

**Features**:
- Self-registration on startup
- Heartbeat mechanism (30s default)
- Automatic deregistration on failure
- REST API for service lookup
- Dashboard for monitoring

**Client Configuration**:
```yaml
eureka:
  instance:
    prefer-ip-address: true
  client:
    serviceUrl:
      defaultZone: http://registry:8761/eureka/
```

**Service Lookup**:
- By service name (application.name)
- Returns list of instances
- Includes metadata (host, port, health)

---

## API Gateway

### Netflix Zuul
**Purpose**: Edge service and API gateway

**Features**:
- Dynamic routing
- Service discovery integration
- Load balancing via Ribbon
- Circuit breaker via Hystrix
- Static content serving
- Request/response filters

**Routing Configuration**:
```yaml
zuul:
  routes:
    account-service:
      path: /accounts/**
      serviceId: account-service
      stripPrefix: false
```

**Filters** (not implemented in this project):
- Pre-filters: Authentication, logging
- Route filters: Request transformation
- Post-filters: Response modification
- Error filters: Error handling

---

## Security

### Spring Security OAuth2
**Purpose**: Authentication and authorization

**Components**:

#### Authorization Server (auth-service)
- Issues access tokens
- Validates credentials
- Manages client registry
- Token store (in-memory)

#### Resource Servers (all business services)
- Validate tokens
- Extract principal
- Enforce scopes
- Method-level security

**Grant Types**:
- **Password**: User login
- **Client Credentials**: Service-to-service
- **Refresh Token**: Token renewal

**Token Validation**:
- User-info endpoint: /uaa/users/current
- Called by resource servers
- Returns principal information

---

## Messaging

### RabbitMQ
**Version**: 3 with management plugin

**Purpose**:
- Hystrix metrics streaming
- Spring Cloud Bus transport
- Event-driven communication

**Exchanges/Queues**:
- Turbine stream exchange
- Config refresh events
- Hystrix metrics queue

**Management UI**:
- Port: 15672
- Credentials: guest/guest
- Queue monitoring
- Message rates

---

## Monitoring

### Spring Boot Actuator
**Purpose**: Production-ready features

**Endpoints**:
- /actuator/health: Health check
- /actuator/info: Application info
- /actuator/metrics: Metrics
- /actuator/env: Environment properties

**Integration**:
- Eureka health checks
- Prometheus metrics (optional)
- Custom health indicators

---

### Hystrix Dashboard
**Purpose**: Circuit breaker visualization

**Features**:
- Real-time metrics
- Circuit state visualization
- Latency graphs
- Thread pool monitoring

**Turbine Integration**:
- Aggregates metrics from all services
- Single dashboard for entire system
- RabbitMQ-based streaming

---

## Build Tools

### Maven
**Version**: Defined by spring-boot-starter-parent

**Structure**:
- Multi-module project
- Parent POM for dependency management
- Spring Boot Maven plugin for executable JARs

**Key Plugins**:
- spring-boot-maven-plugin: Executable JAR packaging
- maven-compiler-plugin: Java 8 compilation
- maven-surefire-plugin: Unit tests

**Dependency Management**:
- Spring Boot BOM
- Spring Cloud BOM
- Centralized version management

---

## Containerization

### Docker
**Base Images**:
- **Java Services**: java:8-jre
- **MongoDB**: mongo:latest
- **RabbitMQ**: rabbitmq:3-management

**Dockerfile Pattern**:
```dockerfile
FROM java:8-jre
ADD target/{service}.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**Networking**:
- Bridge network (default)
- Service name resolution
- Internal DNS

---

### Docker Compose
**Version**: 2.1

**Features**:
- Multi-container orchestration
- Service dependencies
- Health checks
- Environment variables
- Volume management
- Port mapping

**Compose Files**:
- docker-compose.yml: Production
- docker-compose.dev.yml: Development overrides

---

## Testing

### JUnit 4
**Purpose**: Unit testing framework

**Annotations**:
- @Test: Test methods
- @Before/@After: Setup/teardown
- @RunWith: Test runner

### Spring Test
**Purpose**: Integration testing

**Annotations**:
- @SpringBootTest: Full application context
- @WebMvcTest: Controller testing
- @DataMongoTest: Repository testing
- @MockBean: Mock dependencies

### Mockito
**Purpose**: Mocking framework

**Features**:
- Mock creation
- Behavior verification
- Argument matchers
- Spy objects

---

## External Dependencies

### Exchange Rates API
**Service**: fixer.io (or similar)

**Purpose**: Currency conversion rates

**Integration**:
- Feign client
- Hystrix fallback
- Cached rates on failure

**Data Format**:
```json
{
  "base": "USD",
  "rates": {
    "EUR": 0.85,
    "RUB": 75.0
  }
}
```

---

## Development Tools

### IntelliJ IDEA Support
**Features**:
- Spring Boot run configurations
- Environment variable management
- EnvFile plugin for .env support

**Setup**:
1. Import as Maven project
2. Install EnvFile plugin
3. Configure run configurations with .env
4. Start services individually

---

## Technology Versions Summary

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 1.8 | Runtime |
| Spring Boot | 2.0.3.RELEASE | Framework |
| Spring Cloud | Finchley.RELEASE | Microservices |
| MongoDB | Latest | Database |
| RabbitMQ | 3 | Messaging |
| Docker | 19.03+ | Containerization |
| Maven | 3.x | Build tool |
| JUnit | 4.x | Testing |
