# Deployment and Operations

## Docker Architecture

### Container Inventory
**Total Containers**: 17

**Infrastructure** (6):
- rabbitmq (RabbitMQ 3 with management)
- config (Config service)
- registry (Eureka)
- gateway (Zuul)
- monitoring (Hystrix Dashboard)
- turbine-stream-service (Metrics aggregation)

**Business Services** (3):
- account-service
- statistics-service
- notification-service

**Authentication** (1):
- auth-service

**Databases** (4):
- auth-mongodb
- account-mongodb (with demo data dump)
- statistics-mongodb
- notification-mongodb

**Message Broker** (1):
- rabbitmq

### Docker Compose Configuration

#### Service Dependencies
```
rabbitmq (no dependencies)
config (no dependencies)
    ↓
registry, auth-service, gateway, monitoring, turbine
    ↓
account-service, statistics-service, notification-service
```

#### Health Checks
- Config service has health check endpoint
- Dependent services wait with `condition: service_healthy`
- Ensures proper startup order

#### Port Mappings
| Service | Internal Port | External Port |
|---------|---------------|---------------|
| gateway | 4000 | 80 |
| registry | 8761 | 8761 |
| monitoring | 8080 | 9000 |
| turbine | 8989 | 8989 |
| rabbitmq | 15672 | 15672 |

#### Environment Variables
All services receive:
- `CONFIG_SERVICE_PASSWORD`: Config server authentication
- `MONGODB_PASSWORD`: Database authentication
- Service-specific passwords for OAuth2 clients

#### Logging Configuration
All services:
- Max log file size: 10MB
- Max log files: 10
- Automatic rotation

#### Restart Policy
All services: `restart: always`
- Automatic recovery from crashes
- Survives host reboots

---

## Deployment Modes

### Production Mode
**Command**: `docker-compose up`

**Behavior**:
- Pulls pre-built images from Docker Hub (sqshq/piggymetrics-*)
- Uses latest tagged images
- No local build required
- Fast deployment

**Use Case**:
- Production deployments
- Quick testing
- CI/CD pipelines

### Development Mode
**Command**: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`

**Behavior**:
- Builds images locally from source
- Exposes all container ports
- Mounts volumes for live development
- Uses docker-compose.dev.yml overrides

**Use Case**:
- Local development
- Testing changes
- Debugging

**Additional Features**:
- Port exposure for direct service access
- Volume mounts for hot reload
- Debug port exposure

---

## Build Process

### Maven Multi-Module Build
**Command**: `mvn package [-DskipTests]`

**Build Order** (defined in root pom.xml):
1. config
2. monitoring
3. registry
4. gateway
5. auth-service
6. account-service
7. statistics-service
8. notification-service
9. turbine-stream-service

**Artifacts**:
- Each module produces a Spring Boot executable JAR
- Stored in `target/` directory
- Self-contained with embedded Tomcat

### Docker Image Build
Each service has a Dockerfile:

**Example** (account-service):
```dockerfile
FROM java:8-jre
ADD target/account-service.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**Build Process**:
1. Maven builds JAR
2. Docker copies JAR into image
3. Sets entrypoint to run JAR
4. Exposes service port

---

## CI/CD Pipeline (Travis CI)

### Workflow
```
Git Push → Travis CI → Build → Test → Docker Build → Docker Push → Deploy
```

### Travis Configuration (.travis.yml)
1. **Build**: Maven package
2. **Test**: Run unit tests
3. **Docker Build**: Build images for each service
4. **Docker Tag**: 
   - Tag with git commit hash
   - Tag as "latest"
5. **Docker Push**: Push to Docker Hub (sqshq/*)
6. **Deploy**: Optional deployment step

### Image Versioning
- **latest**: Most recent successful build
- **{git-hash}**: Specific commit version
- Enables easy rollback to any previous version

### Benefits
- Automated testing
- Consistent builds
- Version tracking
- Easy rollback
- Continuous delivery

---

## Configuration Management

### Environment-Specific Configuration

#### .env File
Contains sensitive credentials:
```
CONFIG_SERVICE_PASSWORD=password
NOTIFICATION_SERVICE_PASSWORD=password
STATISTICS_SERVICE_PASSWORD=password
ACCOUNT_SERVICE_PASSWORD=password
MONGODB_PASSWORD=password
```

**Production**: Replace with strong passwords

#### Config Service Files
- **Shared**: config/src/main/resources/shared/application.yml
- **Service-Specific**: config/src/main/resources/shared/{service-name}.yml

#### Configuration Hierarchy
1. Bootstrap.yml (service-specific, in service repo)
2. Shared application.yml (from config service)
3. Service-specific yml (from config service)
4. Environment variables (highest priority)

### Dynamic Configuration Updates

**Process**:
1. Update configuration in config service
2. Commit changes (if using Git backend)
3. Call refresh endpoint: `POST /refresh`
4. Services with @RefreshScope reload config

**Example**:
```bash
curl -H "Authorization: Bearer {token}" \
     -XPOST http://127.0.0.1:8000/notifications/refresh
```

**Limitations**:
- Doesn't work with @Configuration classes
- Doesn't affect @Scheduled methods
- Requires @RefreshScope annotation

---

## Monitoring and Observability

### Hystrix Dashboard
**URL**: http://localhost:9000/hystrix

**Metrics**:
- Circuit breaker status
- Request throughput
- Error rates
- Latency percentiles
- Thread pool usage

**Stream URL**: http://turbine-stream-service:8080/turbine/turbine.stream

### Eureka Dashboard
**URL**: http://localhost:8761

**Information**:
- Registered services
- Instance count per service
- Health status
- Uptime
- Renewal statistics

### RabbitMQ Management
**URL**: http://localhost:15672
**Credentials**: guest/guest

**Features**:
- Queue monitoring
- Message rates
- Connection tracking
- Exchange visualization

### Distributed Tracing
**Implementation**: Spring Cloud Sleuth

**Log Format**:
```
[service-name, traceId, spanId, exportable]
```

**Benefits**:
- Trace requests across services
- Correlate logs
- Identify bottlenecks
- Debug distributed transactions

**Integration**: Can export to Zipkin for visualization

---

## Operational Procedures

### Starting the System
```bash
# Production mode
docker-compose up

# Development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Background mode
docker-compose up -d
```

### Stopping the System
```bash
# Graceful shutdown
docker-compose down

# Force stop
docker-compose kill
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f account-service

# Last 100 lines
docker-compose logs --tail=100 account-service
```

### Scaling Services
```bash
# Scale account service to 3 instances
docker-compose up -d --scale account-service=3
```

**Note**: Requires load balancer configuration

### Health Checks
```bash
# Check Eureka for registered services
curl http://localhost:8761/eureka/apps

# Check service health
curl http://localhost:6000/actuator/health
```

### Database Access
```bash
# Connect to MongoDB
docker exec -it {container-name} mongo -u user -p password

# Backup database
docker exec {container-name} mongodump --out /backup
```

---

## Resource Requirements

### Minimum System Requirements
- **RAM**: 4GB (8GB recommended)
- **CPU**: 2 cores (4 cores recommended)
- **Disk**: 10GB free space
- **Docker**: Version 19.03+
- **Docker Compose**: Version 1.25+

### Container Resource Usage (Approximate)
- **Java Services**: 300-500MB RAM each
- **MongoDB**: 100-200MB RAM each
- **RabbitMQ**: 100MB RAM
- **Total**: ~4GB RAM minimum

### Performance Tuning
- Increase JVM heap: `-Xmx512m` in Dockerfile
- Adjust connection pools in configuration
- Scale horizontally for high load
- Use MongoDB replica sets for production

---

## Troubleshooting

### Common Issues

**Services fail to start**:
- Check config service is healthy
- Verify environment variables in .env
- Check port conflicts
- Review logs: `docker-compose logs {service}`

**Services can't connect**:
- Verify Eureka registration
- Check network connectivity
- Validate OAuth2 tokens
- Review Hystrix circuit breaker status

**Database connection errors**:
- Verify MONGODB_PASSWORD
- Check MongoDB container status
- Review connection strings in config

**High latency**:
- Check Hystrix dashboard for bottlenecks
- Review circuit breaker status
- Monitor thread pool usage
- Check external API (exchange rates)

### Debug Mode
```bash
# Run specific service with debug port
docker run -p 5005:5005 -e JAVA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005" {image}
```

### Log Levels
Adjust in config service:
```yaml
logging:
  level:
    com.piggymetrics: DEBUG
    org.springframework: INFO
```
