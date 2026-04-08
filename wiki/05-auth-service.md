# Service Details - Auth Service

## Purpose
OAuth2 authorization server providing token-based authentication for users and service-to-service communication.

## Technical Details
- **Port**: 5001
- **Database**: auth-mongodb
- **Package**: com.piggymetrics.auth
- **Main Class**: AuthApplication.java

## Domain Model

### User Entity
```
User (MongoDB collection: "users")
├── username: String (@Id) - Unique identifier
└── password: String - Hashed password
```

## OAuth2 Configuration

### Grant Types
1. **Password Grant** (for UI/browser)
   - Client: "browser"
   - Scopes: "ui"
   - Grant types: password, refresh_token
   - No client secret required

2. **Client Credentials Grant** (for services)
   - Clients: account-service, statistics-service, notification-service
   - Scopes: "server"
   - Grant types: client_credentials, refresh_token
   - Secrets: From environment variables

### Client Registry
```
browser:
  - Grant: password, refresh_token
  - Scope: ui
  - Secret: none

account-service:
  - Grant: client_credentials, refresh_token
  - Scope: server
  - Secret: ${ACCOUNT_SERVICE_PASSWORD}

statistics-service:
  - Grant: client_credentials, refresh_token
  - Scope: server
  - Secret: ${STATISTICS_SERVICE_PASSWORD}

notification-service:
  - Grant: client_credentials, refresh_token
  - Scope: server
  - Secret: ${NOTIFICATION_SERVICE_PASSWORD}
```

## API Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | /uaa/users | Create new user | No (internal) |
| GET | /uaa/users/current | Get current user info | Yes |
| POST | /uaa/oauth/token | Obtain access token | Client auth |

## Authentication Flow

### User Login (Password Grant)
```
1. Browser → POST /uaa/oauth/token
   - grant_type=password
   - username=<user>
   - password=<pass>
   - client_id=browser

2. Auth Service validates credentials
   - Queries MongoDB via MongoUserDetailsService
   - Verifies password (NoOpPasswordEncoder - not for production!)

3. Returns access_token + refresh_token
   - Stored in InMemoryTokenStore
   - Token contains username and scope (ui)
```

### Service-to-Service (Client Credentials)
```
1. Service → POST /uaa/oauth/token
   - grant_type=client_credentials
   - client_id=<service-name>
   - client_secret=<password>

2. Auth Service validates client credentials
   - Checks against in-memory client registry

3. Returns access_token
   - Token contains client_id and scope (server)
```

## Security Components

### OAuth2AuthorizationConfig
- **Token Store**: InMemoryTokenStore (not persistent)
- **Password Encoder**: NoOpPasswordEncoder (WARNING: insecure, demo only)
- **User Details**: MongoUserDetailsService (loads from MongoDB)
- **Authentication Manager**: Validates credentials

### WebSecurityConfig
- Configures HTTP security
- Protects endpoints
- Defines authentication manager bean

### MongoUserDetailsService
- Implements UserDetailsService
- Loads user from MongoDB
- Converts to Spring Security UserDetails

## Service Dependencies
- **None**: Auth service is independent (no outbound service calls)
- Only depends on its own MongoDB instance

## Data Flow
```
Client Request
    ↓
OAuth2 Endpoints (Spring Security)
    ↓
MongoUserDetailsService
    ↓
UserRepository
    ↓
MongoDB (user credentials)
    ↓
Token Generation (InMemoryTokenStore)
    ↓
Return access_token
```

## Token Validation
Other services validate tokens by calling:
- `GET /uaa/users/current` with Bearer token
- Returns user principal information
- Configured in shared application.yml as `user-info-uri`

## Configuration
- **Bootstrap**: Connects to config service
- **Shared Config**: auth-service.yml
- **Environment Variables**:
  - CONFIG_SERVICE_PASSWORD
  - ACCOUNT_SERVICE_PASSWORD
  - STATISTICS_SERVICE_PASSWORD
  - NOTIFICATION_SERVICE_PASSWORD
  - MONGODB_PASSWORD

## Security Considerations (Production Warnings)

### Current Implementation (Demo Only)
- **NoOpPasswordEncoder**: Passwords stored in plain text
- **InMemoryTokenStore**: Tokens lost on restart
- **In-Memory Clients**: Client registry not persistent

### Production Recommendations
1. Use BCryptPasswordEncoder for password hashing
2. Use JdbcTokenStore or JwtTokenStore for persistence
3. Store client details in database
4. Enable HTTPS/TLS
5. Implement token expiration policies
6. Add rate limiting
7. Enable audit logging

## Key Implementation Notes
- Centralized authorization (single source of truth)
- Stateless token-based auth (no sessions)
- Scope-based authorization for different client types
- Refresh token support for long-lived sessions
- UserController for user registration and info retrieval
