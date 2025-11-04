# 🧠 Micro Marketplace

A microservices-based REST system built with Node.js, NestJS, React, and AWS (with AI module).

## 🚀 Quick Start

Clone the repository and run locally:

```bash
git clone https://github.com/mikolajmigacz/micro-marketplace.git
cd micro-marketplace
pnpm install
cp .env.example .env
pnpm docker:up
pnpm dev
```

Other useful scripts:

```bash
pnpm dev:backend
pnpm dev:frontend
pnpm build
pnpm start:user
pnpm start:offer
pnpm start:notification
pnpm docker:down
pnpm docker:logs
```

A microservices-based REST system built with Node.js, NestJS, React, and AWS (with AI module).

## 🎯 Project Overview

Micro Marketplace is a web app where users can:

- Register and manage accounts
- Log in and edit profiles
- Create and browse offers (tasks, products)
- Receive notifications about new events
- Get smart AI advice when searching or posting offers

The project demonstrates full-stack skills: backend (Node.js, NestJS, microservices, REST, AWS, AI API) and frontend (React). Runs locally (Docker Compose) or deploys to AWS Free Tier.

## 🧩 System Architecture

**Microservices:**

- **User Service:** User management, authentication (JWT), profile
- **Offer Service:** Offers CRUD, integrates with AI Recommendation
- **Notification Service:** Event processing, notifications (SQS)
- **AI Recommendation Service:** Generates short AI tips for users
- **Frontend (React):** User interface

**AWS Components:**

- Lambda, API Gateway, DynamoDB, SQS, S3, CloudFront, CloudWatch, Bedrock/OpenAI API

## ⚙️ Key Features

- Microservices architecture (4 backend services + React frontend)
- AI integration (smart tips for listings)
- Event-driven communication (SQS)
- Serverless & AWS Free Tier friendly
- Docker Compose for local development

## 🗂️ Project Structure

```text
micro-marketplace/
├── services/
│   ├── user-service/            # NestJS + REST + JWT + DynamoDB
│   ├── offer-service/           # NestJS + REST + SQS publisher + AI call
│   ├── notification-service/    # Node.js + SQS consumer
│   └── ai-recommendation-service/ # NestJS + REST + AI API integration
├── frontend/                    # React + Tailwind + Vite + Axios
├── docker-compose.yml           # Local dev & testing
└── README.md
```

## ☁️ AWS Deployment Plan

- **Lambda:** All microservices
- **API Gateway:** REST API
- **DynamoDB:** Users, Offers
- **SQS:** Event queue
- **S3 + CloudFront:** Frontend hosting
- **CloudWatch:** Logs & monitoring
- **Bedrock/OpenAI API:** AI tips (low usage, pay-per-token)

## 🔗 Service Communication

| From         | To                   | Type        | Purpose                |
| ------------ | -------------------- | ----------- | ---------------------- |
| Frontend     | Offer/User Service   | REST        | Offers, auth           |
| Offer        | User Service         | REST        | JWT validation         |
| Offer        | Notification Service | SQS (async) | New offer events       |
| Offer        | AI Recommendation    | REST        | Get AI advice          |
| Notification | CloudWatch/SNS       | Event       | Logging, notifications |

## 📝 Roadmap / Plans

- User authentication (JWT)
- Offers CRUD
- SQS event integration
- Notification Service
- AI Recommendation integration
- Unit & integration tests
- CI/CD (GitHub Actions)
- AWS deployment (Serverless)
- API documentation (Swagger)

---

**Author:** Mikołaj Migacz

MIT License
