# Backend Implementation Specification

## Overview

Build the backend for a multi-tenant transaction extraction platform.

The backend must use:

* TypeScript
* Hono
* Better Auth
* Prisma ORM
* PostgreSQL

The backend is responsible for:

* Authentication
* Session management
* JWT support
* Multi-tenancy
* Transaction extraction
* Transaction storage
* Data isolation
* Cursor pagination

---

# Tech Stack

## Required

* Runtime: Node.js
* Framework: Hono
* Language: TypeScript
* Database: PostgreSQL
* ORM: Prisma
* Authentication: Better Auth
* Validation: Zod
* Testing: Vitest

---

# Folder Structure

```text
backend/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   │
│   ├── auth/
│   │   ├── auth.ts
│   │   ├── auth-config.ts
│   │   └── middleware.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── transaction.routes.ts
│   │
│   ├── services/
│   │   ├── extraction.service.ts
│   │   └── transaction.service.ts
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   └── transaction.validator.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── env.ts
│   │
│   ├── types/
│   │
│   ├── app.ts
│   └── index.ts
│
├── tests/
│
├── .env.example
├── package.json
└── README.md
```

---

# Authentication

Use Better Auth as the primary authentication system.

Requirements:

* Email + Password Authentication
* JWT Support
* Session Management
* Password Hashing
* Protected Routes
* Organization Support

## Better Auth Plugins

Enable:

* Organization Plugin
* JWT Plugin

Every user should automatically receive an organization during registration.

---

# Registration Flow

## Endpoint

```http
POST /api/auth/register
```

### Request

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Process

1. Create user
2. Create organization
3. Create membership
4. Return user information

---

# Login Flow

## Endpoint

```http
POST /api/auth/login
```

### Request

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Process

1. Validate credentials
2. Create Better Auth session
3. Generate JWT
4. Return session and token

JWT Expiry:

```text
7 days
```

---

# Database Schema

## User

Fields:

* id
* email
* createdAt
* updatedAt

## Organization

Fields:

* id
* name
* createdAt
* updatedAt

## Membership

Fields:

* id
* userId
* organizationId
* role

## Transaction

Fields:

* id
* userId
* organizationId
* date
* description
* amount
* balance
* confidence
* createdAt
* updatedAt

---

# Required Indexes

Create indexes on:

* userId
* organizationId
* createdAt
* date

---

# Authentication Middleware

Create middleware that:

1. Validates session
2. Validates JWT
3. Extracts authenticated user
4. Extracts organization
5. Attaches both to request context

Request context should contain:

```ts
userId
organizationId
```

---

# Transaction Extraction

## Endpoint

```http
POST /api/transactions/extract
```

Protected route.

### Request

```json
{
  "text": "raw transaction text"
}
```

---

# Extraction Engine

Implement regex-based extraction.

Do NOT use AI models.

Must support all provided samples.

## Sample 1

Input:

```text
Date: 11 Dec 2025
Description: STARBUCKS COFFEE MUMBAI
Amount: -420.00
Balance after transaction: 18,420.50
```

Expected Output:

```json
{
  "date": "2025-12-11",
  "description": "STARBUCKS COFFEE MUMBAI",
  "amount": -420,
  "balance": 18420.50,
  "confidence": 1
}
```

## Sample 2

Input:

```text
Uber Ride * Airport Drop
12/11/2025 → ₹1,250.00 debited
Available Balance → ₹17,170.50
```

Confidence:

```text
0.9
```

## Sample 3

Input:

```text
txn123 2025-12-10 Amazon.in Order #403-1234567-8901234 ₹2,999.00 Dr Bal 14171.50 Shopping
```

Confidence:

```text
0.75
```

---

# Transaction Storage

After extraction:

Save transaction in PostgreSQL.

Populate:

* userId
* organizationId

using authenticated context.

Never trust request body values for ownership.

---

# Data Isolation

Critical requirement.

Every query must include organization filtering.

Example:

```ts
where: {
  organizationId: auth.organizationId
}
```

Never expose another organization's records.

---

# Get Transactions

## Endpoint

```http
GET /api/transactions
```

Protected route.

### Pagination

Use cursor-based pagination.

Query Parameters:

```http
?cursor=xxx&limit=10
```

Response:

```json
{
  "data": [],
  "nextCursor": "..."
}
```

Order by:

```text
createdAt DESC
```

---

# Validation

Use Zod.

Validate:

* Register Request
* Login Request
* Transaction Extraction Request

Return consistent validation errors.

---

# Error Handling

Implement centralized error handling.

Response format:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

# Tests

Use Vitest.

Minimum 6 tests required.

## Authentication Tests

* Register User
* Login User

## Extraction Tests

* Sample 1 Parsing
* Sample 2 Parsing
* Sample 3 Parsing

## Security Test

* Organization Isolation

Verify User A cannot access User B transactions.

---

# Environment Variables

Create `.env.example`

```env
DATABASE_URL=

BETTER_AUTH_SECRET=

BETTER_AUTH_URL=

JWT_SECRET=

PORT=3001
```

---

# API Base URL

```text
http://localhost:3001
```

---

# Definition of Done

The backend is complete only when:

* TypeScript strict mode enabled
* Prisma migrations working
* Better Auth fully integrated
* JWT plugin enabled
* Organization plugin enabled
* Protected routes working
* Transaction extraction working
* Multi-tenancy enforced
* Cursor pagination implemented
* Vitest tests passing
* Clean architecture maintained

---

# Security Requirements

Never trust client-provided:

* userId
* organizationId

Always derive identity from Better Auth session context.

Security and data isolation are the highest priority requirements of this assignment.
