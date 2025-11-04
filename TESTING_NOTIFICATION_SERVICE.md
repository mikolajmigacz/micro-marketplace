# 🔹 Etap 3 — Notification Service Integration Test

## Struktura

Notification Service jest teraz **prosty Node.js/TypeScript worker** bez NestJS, który:

- ✅ Nasłuchuje zdarzeń `OfferCreated` z SQS (LocalStack)
- ✅ Loguje zdarzenia (CloudWatch mock - `console.log`)
- ✅ Wysyła mock email (symulacja)
- ✅ Obsługuje błędy i graceful shutdown
- ✅ Ma unit testy

## Pliki

### Core
- `src/logger.ts` - CloudWatch logger (mock)
- `src/events.ts` - Event interfaces
- `src/notification-handler.ts` - Business logic (obsługa events)
- `src/sqs-consumer.ts` - SQS polling worker
- `src/main.ts` - Entry point (worker process)

### Tests
- `src/__tests__/notification-handler.spec.ts` - Unit tests
- `src/__tests__/sqs-consumer.spec.ts` - Consumer tests

### Configuration
- `.env` - Environment variables
- `.env.example` - Template
- `jest.config.js` - Jest configuration
- `package.json` - Dependencies (bez NestJS!)

## Kroki Testowania

### 1. Przygotowanie

```bash
cd micro-marketplace

# Zainstaluj dependencies
pnpm install

# Uruchom LocalStack
docker-compose up -d localstack aws-init
```

Czekaj aż `aws-init` będzie gotowy:
```bash
docker-compose logs aws-init | grep "initialized successfully"
```

### 2. Terminal 1 - User Service (dla JWT validation)

```bash
cd services/user-service
pnpm dev
# Output: User Service running on http://localhost:3001
```

### 3. Terminal 2 - Notification Service

```bash
cd services/notification-service
pnpm dev
# Output:
# [2024-11-04T...] [INFO] [NotificationService] 🚀 Starting Notification Service Worker
# [2024-11-04T...] [INFO] [SQSConsumer] 🚀 Starting SQS Consumer
# [2024-11-04T...] [INFO] [SQSConsumer] 📬 Received 0 message(s)
```

### 4. Terminal 3 - Offer Service

```bash
cd services/offer-service
pnpm dev
# Output: Offer Service running on http://localhost:3002
```

### 5. Terminal 4 - Test API

#### 5.1 Register user

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "userId": "user-uuid"
}
```

#### 5.2 Create offer

```bash
# Replace TOKEN with token from above
TOKEN="eyJhbGc..."

curl -X POST http://localhost:3002/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "iPhone 15 Pro",
    "description": "Excellent condition, like new",
    "category": "electronics",
    "price": 1200,
    "tags": ["iphone", "smartphone", "apple"],
    "photos": ["photo1.jpg"]
  }'
```

### 6. Obserwuj Notification Service

W Terminal 2 powinniśmy zobaczyć:

```
[2024-11-04T10:30:45.123Z] [INFO] [SQSConsumer] 📬 Received 1 message(s)
[2024-11-04T10:30:45.124Z] [INFO] [SQSConsumer] 🔄 Processing message
[2024-11-04T10:30:45.125Z] [INFO] [NotificationHandler] 📧 Handling OfferCreated event
{
  "offerId": "offer-uuid",
  "ownerId": "user-uuid",
  "category": "electronics",
  "title": "iPhone 15 Pro",
  "createdAt": "2024-11-04T10:30:44.000Z"
}
[2024-11-04T10:30:45.126Z] [INFO] [NotificationHandler] 📮 Mock Email Sent
{
  "recipient": "user_user-uuid@example.com",
  "subject": "Your offer \"iPhone 15 Pro\" was created successfully!",
  "data": {
    "offerId": "offer-uuid",
    "category": "electronics",
    "createdAt": "2024-11-04T10:30:44.000Z"
  }
}
[2024-11-04T10:30:45.127Z] [INFO] [NotificationHandler] ✅ Notification sent successfully
[2024-11-04T10:30:45.128Z] [INFO] [SQSConsumer] ✅ Message processed successfully
```

## Warunki Przejścia ✅

- [x] Worker nasłuchuje wiadomości z SQS
- [x] Event jest wysyłany przez offer-service (EventPublisherService)
- [x] Notification Service odbiera event
- [x] Event jest prawidłowo parsowany
- [x] Powiadomienie jest przetwarzane (logowanie + mock email)
- [x] Message jest usuwany z SQS po przetworzeniu
- [x] Unit testy przechodzą
- [x] Error handling działa (message wraca do queue przy błędzie)

## Workflow

```
┌──────────────────┐
│   Offer Service  │
│  (Terminal 4)    │
└────────┬─────────┘
         │ POST /offers
         │ + Bearer token
         ↓
┌──────────────────────────┐
│   Offer Controller       │
│  - Create offer          │
│  - Call EventPublisher   │
└────────┬────────────────┘
         │ publishOfferCreated()
         ↓
┌──────────────────────────────┐
│ EventPublisherService        │
│ - Create SQS SendMessageCmd  │
│ - Send to SQS queue          │
└────────┬────────────────────┘
         │
         │ SQS SendMessage
         │
         ↓
    ┌─────────────────────────────────────────────────────┐
    │  SQS Queue: offer-events                            │
    │  Endpoint: http://localhost:4566                    │
    │  Queue: http://localhost:4566/000000000000/offer... │
    │                                                     │
    │  [Message] OfferCreated event JSON                 │
    └────────┬────────────────────────────────────────────┘
             │
             │ SQS ReceiveMessage
             │ (polling every 5s)
             │
         ┌───┴──────────────────┐
         │  Terminal 2          │
         │ Notification Service │
         │ (SQS Consumer)       │
         ├──────────────────────┤
         │ - Parse JSON         │
         │ - Check event type   │
         │ - Route to handler   │
         │ - Call mock email    │
         │ - Log details        │
         │ - Delete message     │
         └──────────────────────┘
```

## Testowanie Błędów

### Test 1: Wyłącz Notification Service, utwórz ofertę, wznów service

- Message zostanie w queue przez 30s (visibility timeout)
- Notification Service odeśle message gdy wznowisz
- ✅ Powinno zalogować i przetworzenie

### Test 2: Złe JSON w message

- Consumer powinno zalogować error
- Message powinno być usunięte (aby nie zapętlić)
- ✅ Consumer powinno kontynuować

### Test 3: Brak SQS_QUEUE_URL

- Service powinno się nie uruchomić
- Logger powinno wyrzucić error
- ✅ Process powinno się zakończyć z exit code 1

## Unit Tests

```bash
cd services/notification-service
pnpm test                 # Run once
pnpm test:watch          # Watch mode
pnpm test:cov            # With coverage
```

Expected output:
```
 PASS  src/__tests__/notification-handler.spec.ts
  NotificationHandler
    handleOfferCreated
      ✓ should handle OfferCreated event successfully (45ms)
      ✓ should send mock email with correct data (5ms)
    handle
      ✓ should route OfferCreated event correctly (3ms)
      ✓ should log warning for unknown event type (2ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

## Cleaning Up

```bash
# Stop all services
docker-compose down

# Remove LocalStack data
docker volume rm micro-marketplace_localstack-data
```

## Kolejne Kroki

1. **Dodaj SNS notifications** - Użyj SNS zamiast mock email
2. **Dodaj Dead Letter Queue** - Dla failed messages
3. **Dodaj retry logic** - Exponential backoff
4. **Add health checks** - /health endpoint dla serwisu
5. **Production build** - Dockerfile dla notification-service
