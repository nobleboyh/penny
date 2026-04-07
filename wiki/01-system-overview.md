# System Overview - PiggyMetrics

## Project Identity
- **Name**: PiggyMetrics
- **Purpose**: Financial advisor application demonstrating microservice architecture
- **Technology Stack**: Spring Boot 2.0.3, Spring Cloud Finchley, Docker, MongoDB
- **Architecture Pattern**: Microservices with Spring Cloud ecosystem

## High-Level Architecture

PiggyMetrics is a distributed system composed of:
- **3 Core Business Services** (Account, Statistics, Notification)
- **5 Infrastructure Services** (Config, Registry, Gateway, Auth, Monitoring)
- **4 MongoDB Databases** (one per business service + auth)
- **1 Message Broker** (RabbitMQ for event streaming)

## System Characteristics

### Design Principles
1. **Database per Service**: Each microservice has its own MongoDB instance
2. **API-Only Communication**: No direct database access between services
3. **Service Discovery**: Dynamic service location via Eureka
4. **Centralized Configuration**: Spring Cloud Config for all services
5. **OAuth2 Security**: Token-based authentication and authorization
6. **Circuit Breaker Pattern**: Hystrix for fault tolerance
7. **Client-Side Load Balancing**: Ribbon for request distribution

### Technology Decisions
- **Java 1.8**: Runtime environment
- **Spring Boot 2.0.3**: Application framework
- **Spring Cloud Finchley**: Microservice infrastructure
- **MongoDB**: NoSQL database for flexibility
- **OAuth2**: Industry-standard authorization
- **Feign**: Declarative REST clients
- **Docker**: Containerization and deployment

## Service Inventory

### Business Services
1. **account-service** (Port: 6000) - Account management and validation
2. **statistics-service** (Port: 7000) - Financial calculations and time series
3. **notification-service** (Port: 8000) - Email notifications and scheduling

### Infrastructure Services
1. **config** (Port: 8888) - Centralized configuration server
2. **registry** (Port: 8761) - Eureka service discovery
3. **gateway** (Port: 4000/80) - Zuul API gateway and UI hosting
4. **auth-service** (Port: 5000) - OAuth2 authorization server
5. **monitoring** (Port: 9000) - Hystrix dashboard
6. **turbine-stream-service** (Port: 8989) - Metrics aggregation

### Data Stores
- **auth-mongodb**: User credentials
- **account-mongodb**: Account data with demo dump
- **statistics-mongodb**: Time series data points
- **notification-mongodb**: Recipient settings
- **rabbitmq**: Message broker for Turbine stream

## Request Flow

```
User → Gateway (Zuul) → [Auth Service for token] → Business Service → MongoDB
                      ↓
                   Eureka (service discovery)
                      ↓
                   Ribbon (load balancing)
                      ↓
                   Hystrix (circuit breaker)
```

## Key Patterns Implemented

1. **API Gateway Pattern**: Single entry point via Zuul
2. **Service Registry Pattern**: Eureka for service discovery
3. **Circuit Breaker Pattern**: Hystrix for resilience
4. **Externalized Configuration**: Spring Cloud Config
5. **Access Token Pattern**: OAuth2 for security
6. **Database per Service**: Data isolation
7. **Asynchronous Messaging**: RabbitMQ for metrics
8. **Distributed Tracing**: Spring Cloud Sleuth with trace/span IDs
