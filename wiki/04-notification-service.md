# Service Details - Notification Service

## Purpose
Manages user notification preferences and sends scheduled email notifications (reminders and backups).

## Technical Details
- **Port**: 8000
- **Database**: notification-mongodb
- **Package**: com.piggymetrics.notification
- **Main Class**: NotificationServiceApplication.java

## Domain Model

### Recipient Entity
```
Recipient (MongoDB collection: "recipients")
├── accountName: String - Account identifier
├── email: String - Email address (validated)
├── scheduledNotifications: Map<NotificationType, NotificationSettings>
    ├── BACKUP → NotificationSettings
    │   ├── active: Boolean
    │   ├── frequency: Frequency (WEEKLY, MONTHLY, QUARTERLY)
    │   └── lastNotified: Date
    └── REMIND → NotificationSettings
        ├── active: Boolean
        ├── frequency: Frequency
        └── lastNotified: Date
```

### Enums
- **NotificationType**: BACKUP, REMIND
- **Frequency**: WEEKLY, MONTHLY, QUARTERLY

## API Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | /notifications/settings/current | Get notification settings | Yes |
| PUT | /notifications/settings/current | Update notification settings | Yes |

## Service Dependencies

### Outbound Calls (Feign Clients)
1. **AccountServiceClient** → account-service
   - `GET /accounts/{accountName}` - Fetch account data for backup emails
   - Used during scheduled backup notifications

## Business Logic Flow

### Scheduled Notifications (Cron-based)

#### Backup Notifications
- **Trigger**: Cron expression from config (`${backup.cron}`)
- **Process**:
  1. Query recipients ready for backup (active + frequency elapsed)
  2. For each recipient (async):
     - Fetch account data from account-service
     - Send email with account data as attachment
     - Mark recipient as notified with current timestamp
  3. Error handling: Log and continue with next recipient

#### Remind Notifications
- **Trigger**: Cron expression from config (`${remind.cron}`)
- **Process**:
  1. Query recipients ready for reminder (active + frequency elapsed)
  2. For each recipient (async):
     - Send reminder email (no attachment)
     - Mark recipient as notified with current timestamp
  3. Error handling: Log and continue with next recipient

### Settings Management
1. **Get Settings**: Retrieve recipient by principal name
2. **Update Settings**: Upsert recipient with new notification preferences

## Data Flow
```
Scheduled Task (Cron)
    ↓
NotificationService
    ↓
RecipientService (find ready recipients)
    ↓
CompletableFuture (async processing)
    ↓
AccountServiceClient (fetch data) + EmailService (send)
    ↓
RecipientService (mark notified)
```

## Email Service
- **Implementation**: EmailServiceImpl
- **Features**:
  - @RefreshScope for dynamic config updates
  - Template-based emails (subject + text from config)
  - Attachment support for backups
  - SMTP integration via Spring Mail

## Scheduling Logic

### Recipient Selection Algorithm
```
For each NotificationType:
  1. Filter recipients where settings[type].active == true
  2. Calculate time since lastNotified
  3. Compare with frequency threshold:
     - WEEKLY: 7 days
     - MONTHLY: 30 days
     - QUARTERLY: 90 days
  4. Return recipients where elapsed >= threshold
```

## Security
- OAuth2 resource server
- Principal-based access (users can only access their own settings)
- Service-to-service calls use client credentials grant

## Configuration
- **Bootstrap**: Connects to config service
- **Shared Config**: notification-service.yml
- **Dynamic Properties**:
  - `backup.cron`: Backup schedule
  - `remind.cron`: Reminder schedule
  - Email templates (subject, text)
  - SMTP settings

## Resilience Features
- Async processing via CompletableFuture (non-blocking)
- Individual failure isolation (one recipient failure doesn't affect others)
- Hystrix circuit breaker for account-service calls
- Error logging for debugging

## Key Implementation Notes
- **@Scheduled** annotations for cron-based execution
- **@RefreshScope** on EmailService for config hot-reload
- Custom MongoDB converters for Frequency enum
- Validation via JSR-303 (@Email, @NotNull)
- Parallel processing of notifications for performance
