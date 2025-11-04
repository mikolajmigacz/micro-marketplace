# User Service - DDD Architecture

## 📁 Struktura projektu

Projekt user-service został zrefaktoryzowany zgodnie z zasadami **Domain-Driven Design (DDD)** z zastosowaniem architektury warstwowej (layer-first approach).

```
src/
├── domain/                    # 🧩 WARSTWA DOMENOWA (czysta logika biznesowa)
│   └── user/
│       ├── entities/
│       │   └── user.entity.ts           # Encja User - reguły biznesowe
│       ├── value-objects/
│       │   ├── email.vo.ts              # Email Value Object z walidacją
│       │   ├── password.vo.ts           # Password VO z regułami bezpieczeństwa
│       │   └── user-id.vo.ts            # UserId VO - identyfikator użytkownika
│       ├── repositories/
│       │   └── user.repository.interface.ts  # Interfejs repozytorium
│       └── exceptions/
│           └── domain.exception.ts      # Wyjątki domenowe
│
├── application/               # 🧠 WARSTWA APLIKACJI (use-case'y)
│   └── user/
│       ├── dto/
│       │   ├── register-user.dto.ts     # DTO rejestracji
│       │   ├── login-user.dto.ts        # DTO logowania
│       │   └── user-response.dto.ts     # DTO odpowiedzi
│       ├── use-cases/
│       │   ├── register-user.use-case.ts      # UC: Rejestracja użytkownika
│       │   ├── login-user.use-case.ts         # UC: Logowanie użytkownika
│       │   └── get-user-profile.use-case.ts   # UC: Pobranie profilu
│       └── services/
│           ├── jwt.service.interface.ts       # Interface dla JWT
│           └── password-hasher.interface.ts   # Interface dla hashowania
│
├── infrastructure/            # 💾 WARSTWA INFRASTRUKTURY (technologia)
│   ├── database/
│   │   └── database.module.ts           # Konfiguracja DynamoDB
│   └── user/
│       ├── persistence/
│       │   └── dynamodb-user.repository.ts    # Implementacja repozytorium
│       └── security/
│           ├── bcrypt-password-hasher.service.ts  # Implementacja hashowania
│           └── jwt.service.ts                     # Implementacja JWT
│
└── ui/                        # 🌐 WARSTWA UI (interfejs API)
    └── user/
        ├── controllers/
        │   ├── auth.controller.ts       # REST: Autentykacja
        │   └── users.controller.ts      # REST: Użytkownicy
        ├── guards/
        │   ├── jwt-auth.guard.ts        # Guard JWT
        │   └── jwt.strategy.ts          # Strategia JWT (Passport)
        ├── decorators/
        │   └── current-user.decorator.ts  # Dekorator @CurrentUser
        ├── auth.module.ts               # Moduł autentykacji
        └── users.module.ts              # Moduł użytkowników
```

## 🎯 Zasady DDD zastosowane w projekcie

### 1. **Domain Layer (Domena)** - Czyste reguły biznesowe

- ✅ **Brak zależności** od NestJS, ORM czy frameworków
- ✅ **Encje** zawierają logikę biznesową (np. weryfikacja hasła)
- ✅ **Value Objects** z walidacją (Email, Password, UserId)
- ✅ **Interfejsy repozytoriów** definiowane w domenie
- ✅ **Wyjątki domenowe** (DomainException)

### 2. **Application Layer (Aplikacja)** - Use-case'y

- ✅ **Use-cases** orkiestrują przepływ aplikacji
- ✅ **DTOs** dla walidacji danych wejściowych
- ✅ **Interfejsy serwisów** (JWT, PasswordHasher)
- ✅ Minimalny kod - tylko orchestration
- ✅ Zależności tylko od domeny (nie od infrastruktury bezpośrednio)

### 3. **Infrastructure Layer (Infrastruktura)** - Technologia

- ✅ **Implementacje repozytoriów** (DynamoDBUserRepository)
- ✅ **Implementacje serwisów** (BcryptPasswordHasher, JwtServiceImpl)
- ✅ **Konfiguracja bazy danych** (DynamoDB)
- ✅ **Mapowanie** persistence ↔ domain
- ✅ Zależna od technologii (można wymienić bez zmian domeny)

### 4. **UI Layer (Interfejs API)** - REST Controllers

- ✅ **Controllers** tylko przekazują dane do use-case'ów
- ✅ **Guards** chronią endpointy (JwtAuthGuard)
- ✅ **Decorators** (@CurrentUser)
- ✅ **Modules** wiążą wszystkie warstwy przez DI
- ✅ Brak logiki biznesowej w kontrolerach

## 🔄 Kierunek zależności (Dependency Rule)

```
UI → Application → Domain ← Infrastructure
```

Wszystkie zależności kierują się **do wnętrza** (do domeny):

- UI wywołuje use-case'y z Application
- Application używa interfejsów z Domain
- Infrastructure implementuje interfejsy z Domain
- Domain **nie zna** żadnej zewnętrznej warstwy

## ✅ Korzyści z tej architektury

1. **Testowalność**
   - Domain layer: testy jednostkowe bez frameworka
   - Application: mockowanie repozytoriów
   - Infrastructure: testy integracyjne
   - UI: testy E2E

2. **Wymienialność**
   - Można zmienić DynamoDB → PostgreSQL (tylko infrastructure)
   - Można zmienić NestJS → Express (tylko ui)
   - Domain pozostaje niezmieniony

3. **Klarowność**
   - Jasny podział odpowiedzialności
   - Łatwe znalezienie logiki biznesowej
   - Profesjonalna struktura enterprise

4. **Skalowalność**
   - Łatwe dodawanie nowych domen (np. `domain/product/`)
   - Niezależne zespoły mogą pracować na różnych warstwach
   - Możliwość ekstrakcji do mikrousług

## 🚀 Jak to działa (przykład: Rejestracja użytkownika)

```
1. POST /auth/register
   ↓
2. AuthController.register(dto)                    [UI Layer]
   ↓
3. RegisterUserUseCase.execute(dto)                [Application Layer]
   ↓
4. Email.create(dto.email)                         [Domain Layer - VO]
   Password.create(dto.password)
   ↓
5. UserRepository.findByEmail()                    [Application → Domain Interface]
   ↓
6. DynamoDBUserRepository.findByEmail()            [Infrastructure Implementation]
   ↓
7. User.create(email, password, name, hasher)      [Domain Layer - Entity]
   ↓
8. UserRepository.save(user)                       [Application → Domain Interface]
   ↓
9. DynamoDBUserRepository.save(user)               [Infrastructure Implementation]
   ↓
10. JwtService.sign(payload)                       [Application → Infrastructure]
    ↓
11. return AuthResponseDto                         [Application Layer]
```

## 📝 Konwencje nazewnicze

- **Entities**: `user.entity.ts`
- **Value Objects**: `email.vo.ts`
- **Repository Interfaces**: `user.repository.interface.ts`
- **Repository Implementations**: `dynamodb-user.repository.ts`
- **Use Cases**: `register-user.use-case.ts`
- **DTOs**: `register-user.dto.ts`
- **Services**: `jwt.service.ts` (implementacja), `jwt.service.interface.ts` (interfejs)

## 🔧 Dependency Injection

Wszystkie zależności są wstrzykiwane przez NestJS DI:

```typescript
// W module:
{
  provide: USER_REPOSITORY,
  useClass: DynamoDBUserRepository,  // Infrastructure
}

// W use-case:
constructor(
  @Inject(USER_REPOSITORY)
  private readonly userRepository: UserRepository  // Domain interface
) {}
```

## 🧪 Testowanie

### Domain Layer

```typescript
// Czyste testy jednostkowe - bez frameworka
const email = Email.create("test@example.com");
const user = User.create(email, password, "John", mockHasher);
expect(user.email.getValue()).toBe("test@example.com");
```

### Application Layer

```typescript
// Mock repozytorium
const mockRepo = { findByEmail: jest.fn(), save: jest.fn() };
const useCase = new RegisterUserUseCase(mockRepo, mockHasher, mockJwt);
```

### Infrastructure Layer

```typescript
// Testy integracyjne z prawdziwą bazą (testcontainers)
```

### UI Layer

```typescript
// Testy E2E (supertest)
```

## 📚 Inspiracje

Ta architektura jest zgodna z praktykami stosowanymi w:

- **Clean Architecture** (Robert C. Martin)
- **Hexagonal Architecture** (Ports & Adapters)
- **Domain-Driven Design** (Eric Evans)
- Firmy: Allegro, Revolut, OLX, PayU, Netflix

---

**Autor**: Zrefaktoryzowane zgodnie z DDD best practices
**Data**: 2025
