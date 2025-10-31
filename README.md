# 🧠 Micro Marketplace

Mikroserwisowy system marketplace oparty na **Node.js**, **NestJS**, **React** i **AWS**.

## 📋 Opis projektu

Micro Marketplace to aplikacja webowa typu Mini Marketplace / Task Board, gdzie użytkownicy mogą:

- ✅ Zakładać konta i logować się (JWT)
- ✅ Edytować swój profil
- ✅ Tworzyć i przeglądać ogłoszenia
- ✅ Otrzymywać powiadomienia o nowych zdarzeniach

## 🏗️ Architektura

System składa się z:

### Backend (Mikroserwisy)
- **User Service** (port 3001) - zarządzanie użytkownikami i autoryzacją JWT
- **Listing Service** (port 3002) - zarządzanie ogłoszeniami
- **Notification Service** (port 3003) - przetwarzanie zdarzeń z kolejki SQS

### Frontend
- **React + Vite + TailwindCSS** (port 5173) - interfejs użytkownika

### Infrastruktura lokalna
- **LocalStack** - emulacja AWS (DynamoDB, SQS, SNS)
- **DynamoDB Admin** (port 8001) - interfejs do przeglądania tabel

## 🚀 Szybki start

### Wymagania

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** + **Docker Compose**

### Instalacja

```bash
# Klonowanie repozytorium
git clone <repo-url>
cd micro-marketplace

# Instalacja zależności
pnpm install

# Kopiowanie pliku .env
cp .env.example .env

# Uruchomienie infrastruktury (LocalStack)
pnpm docker:up

# Uruchomienie wszystkich serwisów
pnpm dev
```

### Dostępne endpointy

- Frontend: http://localhost:5173
- User Service: http://localhost:3001
- Listing Service: http://localhost:3002
- Notification Service: http://localhost:3003
- DynamoDB Admin: http://localhost:8001
- LocalStack: http://localhost:4566

## 📦 Dostępne skrypty

```bash
# Instalacja wszystkich zależności
pnpm install

# Uruchomienie wszystkich serwisów (backend + frontend)
pnpm dev

# Uruchomienie tylko backendu
pnpm dev:backend

# Uruchomienie tylko frontendu
pnpm dev:frontend

# Build wszystkich serwisów
pnpm build

# Uruchomienie konkretnego serwisu
pnpm start:user
pnpm start:listing
pnpm start:notification

# Docker
pnpm docker:up      # Uruchomienie LocalStack
pnpm docker:down    # Zatrzymanie LocalStack
pnpm docker:logs    # Wyświetlenie logów
```

## 🗂️ Struktura projektu

```
micro-marketplace/
├── services/
│   ├── user-service/          # NestJS + JWT + DynamoDB
│   ├── listing-service/       # NestJS + SQS publisher + DynamoDB
│   └── notification-service/  # NestJS + SQS consumer
├── frontend/                  # React + Vite + TailwindCSS
├── docker-compose.yml         # LocalStack + DynamoDB
├── pnpm-workspace.yaml        # Konfiguracja monorepo
└── package.json               # Root package.json
```

## 🔗 Komunikacja między serwisami

- **Frontend → Listing Service** - REST API (pobieranie i tworzenie ogłoszeń)
- **Frontend → User Service** - REST API (rejestracja i logowanie)
- **Listing Service → User Service** - REST API (weryfikacja tokena JWT)
- **Listing Service → Notification Service** - Asynchroniczna (SQS event)

## 🛠️ Technologie

### Backend
- Node.js, NestJS, TypeScript
- JWT, bcrypt
- AWS SDK (DynamoDB, SQS, SNS)
- class-validator, class-transformer

### Frontend
- React, TypeScript
- Vite
- TailwindCSS
- React Router
- Axios

### Infrastruktura
- Docker, Docker Compose
- LocalStack (emulacja AWS)
- DynamoDB Local
- SQS, SNS

## ☁️ Deployment na AWS

Projekt jest przygotowany do wdrożenia na AWS Free Tier:

- **AWS Lambda** - hosting mikroserwisów
- **API Gateway** - publiczne REST API
- **DynamoDB** - baza danych NoSQL
- **SQS** - kolejka komunikatów
- **S3 + CloudFront** - hosting frontendu
- **CloudWatch** - logi i monitoring

## 📝 TODO / Roadmap

- [ ] Implementacja modułu Auth (rejestracja, logowanie, JWT)
- [ ] Implementacja CRUD dla ogłoszeń
- [ ] Integracja z SQS dla eventów
- [ ] Implementacja Notification Service
- [ ] Dodanie testów jednostkowych i integracyjnych
- [ ] Konfiguracja CI/CD (GitHub Actions)
- [ ] Deployment na AWS (Serverless Framework / AWS SAM)
- [ ] Dodanie dokumentacji API (Swagger)

## 📄 Licencja

MIT

## 👨‍💻 Autor

Mikołaj Migacz - projekt portfolio
