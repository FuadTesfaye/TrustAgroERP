# Trust Agro Management System - Complete Technical Documentation

## Executive Summary

Trust Agro is a comprehensive, enterprise-grade ERP (Enterprise Resource Planning) platform designed specifically for the agricultural and veterinary sectors. The system implements a modern microservices architecture with a decoupled frontend and backend, utilizing industry-standard technologies for scalability, security, and maintainability.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Backend Technology Stack](#backend-technology-stack)
3. [Frontend Technology Stack](#frontend-technology-stack)
4. [Database & Data Layer](#database--data-layer)
5. [Infrastructure & DevOps](#infrastructure--devops)
6. [Security Architecture](#security-architecture)
7. [API Design & Integration](#api-design--integration)
8. [Development & Build Tools](#development--build-tools)
9. [System Modules](#system-modules)
10. [Deployment Architecture](#deployment-architecture)

---

## System Architecture

### Architecture Pattern

**Microservices Architecture with Monolithic Deployment**

The system follows a microservices architectural pattern with clear separation of concerns between frontend and backend, currently deployed as a monolithic application for simplicity but designed for future microservice extraction.

### Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                        │
│                  (React SPA + Nginx)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                        │
│                    (Nginx Reverse Proxy)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                           │
│              (Spring Boot REST API)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Auth    │ │  Farm    │ │  Vet     │ │ Finance  │       │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                        │
│              (Service Classes + Business Rules)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                           │
│              (Spring Data JPA + Hibernate)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Storage Layer                          │
│            (PostgreSQL + Keycloak Database)                  │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns Implemented

- **Repository Pattern**: Data access abstraction through Spring Data JPA repositories
- **Service Layer Pattern**: Business logic encapsulation in service classes
- **DTO Pattern**: Data Transfer Objects for API communication
- **Builder Pattern**: Used with Lombok for complex object construction
- **Singleton Pattern**: Spring-managed beans for services
- **Strategy Pattern**: Different authentication strategies (OTP, JWT)
- **Observer Pattern**: Event-driven notifications and audit logging
- **Factory Pattern**: Entity creation and DTO mapping

---

## Backend Technology Stack

### Core Framework

**Java 17 + Spring Boot 3.2.0**

- **Java Version**: 17 (LTS)
- **Spring Boot**: 3.2.0
- **Build Tool**: Maven 3.9.6
- **Package Structure**: `com.trustagro`

### Spring Boot Starters

| Starter | Purpose | Version |
|---------|---------|---------|
| `spring-boot-starter-web` | RESTful API development, embedded Tomcat | 3.2.0 |
| `spring-boot-starter-data-jpa` | Database ORM with Hibernate | 3.2.0 |
| `spring-boot-starter-security` | Authentication and authorization | 3.2.0 |
| `spring-boot-starter-validation` | Request validation | 3.2.0 |
| `spring-boot-starter-oauth2-resource-server` | OAuth2 JWT validation | 3.2.0 |
| `spring-boot-starter-mail` | Email sending (SMTP) | 3.2.0 |
| `spring-boot-starter-test` | Testing framework | 3.2.0 |

### Security & Authentication

**Keycloak Integration (v24.0.4)**

- **Identity Provider**: Keycloak for centralized authentication
- **Protocol**: OpenID Connect (OIDC)
- **Token Type**: JWT (JSON Web Tokens)
- **Flow**: Resource Owner Password Credentials (Headless)
- **Admin Client**: Keycloak Admin Client for programmatic user management

**JWT Implementation**

- **Library**: JJWT (io.jsonwebtoken) v0.11.5
- **Components**:
  - `jjwt-api`: JWT creation and validation API
  - `jjwt-impl`: Implementation (runtime)
  - `jjwt-jackson`: JSON processing with Jackson (runtime)
- **Algorithm**: HS256 (HMAC-SHA256)
- **Token Expiry**: 24 hours (86400000 ms)

**Spring Security Configuration**

- **Security Filter Chain**: Custom JWT authentication filter
- **Password Encoder**: BCrypt (via Keycloak)
- **CORS**: Configured for frontend origins
- **Role-Based Access**: Method-level security with `@PreAuthorize`

### Database & ORM

**Hibernate ORM**

- **JPA Version**: Jakarta Persistence 3.1
- **Dialect**: PostgreSQLDialect
- **DDL Strategy**: Update (auto-schema evolution)
- **Caching**: Second-level cache (Hibernate default)
- **Lazy Loading**: Enabled for associations

**Database Drivers**

- **PostgreSQL**: org.postgresql:postgresql (runtime)
- **H2**: com.h2database:h2 (testing, runtime)

### Email & Notifications

**JavaMail API**

- **SMTP Protocol**: TLS v1.3
- **STARTTLS**: Enabled
- **Authentication**: Required
- **Port**: 587 (standard SMTP submission)

**OTP System**

- **OTP Length**: 6 digits
- **Signup Expiry**: 10 minutes
- **Login Expiry**: 5 minutes
- **Storage**: Database (email_otp_codes table)

### Code Quality & Boilerplate Reduction

**Lombok v1.18.44**

- **Annotations Used**:
  - `@Data`: Getters, setters, toString, equals, hashCode
  - `@Builder`: Builder pattern implementation
  - `@NoArgsConstructor`: No-args constructor
  - `@AllArgsConstructor**: All-args constructor
  - `@Entity`: JPA entity mapping
  - `@Id`: Primary key identifier
  - `@GeneratedValue`: Auto-generated values
  - `@Slf4j**: Logging support

### Backend Module Structure

```
com.trustagro/
├── TrustAgroApplication.java          # Main Spring Boot application
├── audit/                             # Audit logging module
│   ├── controller/
│   ├── entity/
│   ├── repository/
│   └── service/
├── auth/                              # Authentication module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
├── common/                            # Common utilities
│   ├── exception/
│   └── response/
├── config/                            # Configuration classes
│   ├── SecurityConfig.java
│   ├── JwtAuthFilter.java
│   ├── KeycloakJwtAuthenticationConverter.java
│   ├── ScheduledTasks.java
│   └── DataSeeder.java
├── crm/                               # CRM module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
├── farm/                              # Farm management module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
├── finance/                           # Finance module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
├── inventory/                         # Inventory management module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
├── notification/                      # Notification module
│   ├── controller/
│   ├── entity/
│   ├── repository/
│   └── service/
├── pharmacy/                          # Pharmacy module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
├── user/                              # User management module
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   └── service/
└── veterinary/                        # Veterinary module
    ├── controller/
    ├── dto/
    ├── entity/
    ├── repository/
    └── service/
```

---

## Frontend Technology Stack

### Core Framework

**React 19.2.5**

- **Type**: Functional Components with Hooks
- **Rendering**: Client-side rendering (CSR)
- **State Management**: React Context API + Hooks
- **Build Tool**: Create React App (react-scripts 5.0.1)

### TypeScript Integration

**TypeScript 6.0.3**

- **Compilation Target**: ESNext
- **Module System**: ESNext
- **JSX Transform**: react-jsx
- **Type Checking**: Strict mode disabled (gradual adoption)
- **Type Definitions**: @types packages for React, DOM, Node

### Routing & Navigation

**React Router DOM 7.14.2**

- **Router**: BrowserRouter
- **Route Protection**: Custom ProtectedRoute component
- **Role-Based Routing**: Redirect based on user roles
- **Route Structure**: 
  - `/login` - Login page
  - `/register` - Registration page
  - `/dashboard` - Main dashboard
  - `/farm/*` - Farm management routes
  - `/veterinary/*` - Veterinary routes
  - `/inventory/*` - Inventory routes
  - `/pharmacy/*` - Pharmacy routes
  - `/finance/*` - Finance routes
  - `/crm/*` - CRM routes

### HTTP Client & API Communication

**Axios 1.15.2**

- **Base URL**: Configurable via environment
- **Interceptors**:
  - Request: JWT token injection
  - Response: 401 error handling
- **Timeout**: Configurable
- **Retry Logic**: Built-in retry mechanism

### Styling & UI Framework

**Tailwind CSS 3.4.19**

- **Approach**: Utility-first CSS
- **Configuration**: Custom theme with brand colors
- **Responsive**: Mobile-first design
- **Plugins**: None (base installation)
- **Purge**: Enabled for production builds

**Bootstrap 5.3.8 + React Bootstrap 2.10.10**

- **Purpose**: Component library supplement
- **Components Used**: Grid system, forms, modals, alerts
- **Customization**: Tailwind overrides for consistency

### Icon Library

**Lucide React 1.14.0**

- **Type**: SVG icon library
- **Style**: Clean, modern, consistent
- **Usage**: Extensive use across dashboard and navigation
- **Customization**: Size and color props

### Data Visualization

**Recharts 3.8.1**

- **Chart Types**: Line, Bar, Pie, Area
- **Responsiveness**: Built-in responsive containers
- **Customization**: Custom tooltips and legends
- **Animation**: Smooth transitions

### Notifications & Alerts

**React Toastify 11.1.0**

- **Position**: Top-right
- **Auto-close**: Configurable (default 3s)
- **Types**: Success, error, info, warning
- **Theme**: Colored (light/dark mode support)

### Internationalization (i18n)

**i18next 23.7.6 + react-i18next 14.0.0**

- **Languages**: English (primary), Amharic (secondary)
- **Namespace**: Per-module translation files
- **Detection**: Browser language + manual selection
- **Fallback**: English

### Keycloak Client Integration

**keycloak-js 24.0.4**

- **Purpose**: Frontend Keycloak adapter
- **Usage**: Token validation and refresh
- **Flow**: Headless integration with backend tokens

### Testing Framework

**React Testing Library**

- **@testing-library/dom**: v10.4.1
- **@testing-library/jest-dom**: v6.9.1
- **@testing-library/react**: v16.3.2
- **@testing-library/user-event**: v13.5.0

### Build & Development Tools

**PostCSS & Autoprefixer**

- **PostCSS**: v8.5.14
- **Autoprefixer**: v10.5.0
- **Purpose**: CSS vendor prefixing

**Web Vitals**

- **Library**: web-vitals v2.1.4
- **Purpose**: Performance monitoring

### Frontend Module Structure

```
src/
├── App.js                           # Main application component
├── index.js                         # Application entry point
├── index.css                        # Global styles
├── global.d.ts                      # TypeScript declarations
├── i18n.js                          # i18next configuration
├── api/                             # API layer
│   ├── axios.js                     # Axios configuration
│   └── index.js                     # API endpoint definitions
├── components/                      # Reusable components
│   ├── common/                      # Common UI components
│   │   ├── DataTable.js
│   │   ├── ErrorAlert.js
│   │   ├── LoadingSpinner.js
│   │   ├── ProtectedRoute.js
│   │   ├── StatCard.js
│   │   └── StatusBadge.js
│   ├── layout/                      # Layout components
│   │   ├── AppShell.js
│   │   ├── Sidebar.js
│   │   └── Topbar.js
│   └── ui/                          # UI component library
│       ├── Badge.js
│       ├── Button.js
│       ├── Card.js
│       ├── DataTable.js
│       ├── Input.js
│       ├── KpiCard.js
│       ├── PageHeader.js
│       └── Switch.js
├── context/                         # React Context providers
│   ├── AuthContext.js
│   └── LanguageContext.js
├── hooks/                           # Custom React hooks
│   ├── index.js
│   ├── useApi.js
│   └── usePermissions.js
├── layouts/                         # Page layouts
│   ├── MainLayout.js
│   ├── Sidebar.js
│   └── TopBar.js
├── locales/                         # Translation files
│   ├── en/
│   └── am/
├── pages/                           # Page components
│   ├── auth/                        # Authentication pages
│   │   ├── Login.js
│   │   └── Register.js
│   ├── crm/                         # CRM pages
│   │   ├── CrmPage.js
│   │   ├── CrmClientForm.js
│   │   └── FarmVisitForm.js
│   ├── dashboard/                   # Dashboard pages
│   │   └── Dashboard.js
│   ├── farm/                        # Farm management pages
│   │   ├── FarmList.js
│   │   ├── FarmForm.js
│   │   ├── FlockList.js
│   │   ├── FlockForm.js
│   │   ├── DailyFarmRecordList.js
│   │   └── DailyFarmRecordForm.js
│   ├── finance/                     # Finance pages
│   │   ├── FinancePage.js
│   │   └── TransactionForm.js
│   ├── inventory/                   # Inventory pages
│   │   ├── InventoryItemList.js
│   │   ├── InventoryItemForm.js
│   │   ├── StockInForm.js
│   │   └── StockOutForm.js
│   ├── pharmacy/                    # Pharmacy pages
│   │   ├── PharmacyPage.js
│   │   ├── CustomerForm.js
│   │   └── SaleForm.js
│   └── veterinary/                  # Veterinary pages
│       ├── VeterinaryPage.js
│       ├── DiseaseCaseForm.js
│       ├── TreatmentForm.js
│       └── PrescriptionForm.js
└── utils/                           # Utility functions
    ├── index.js
    └── formatters.js
```

---

## Database & Data Layer

### Database Technology

**PostgreSQL 15**

- **Edition**: Open Source
- **Architecture**: Relational Database Management System (RDBMS)
- **ACID Compliance**: Full compliance
- **Character Set**: UTF-8
- **Collation**: en_US.UTF-8

### Database Instances

The system uses **two separate PostgreSQL instances** for security and separation of concerns:

1. **Application Database (`app-db`)**
   - **Port**: 5432
   - **Database**: trust_agro_db
   - **User**: postgres
   - **Purpose**: ERP domain data
   - **Tables**: 20+ business tables

2. **Keycloak Database (`keycloak-db`)**
   - **Port**: 5433
   - **Database**: keycloak
   - **User**: keycloak
   - **Purpose**: Identity and authentication data
   - **Tables**: Keycloak internal tables

### Database Schema Design

**Schema Characteristics**

- **Normalization**: 3NF (Third Normal Form)
- **Indexing**: Comprehensive indexing strategy
- **Constraints**: Foreign keys, check constraints, unique constraints
- **Triggers**: Automatic timestamp updates
- **Views**: Materialized views for reporting
- **Functions**: PL/pgSQL stored procedures

**Custom Data Types (ENUMs)**

```sql
-- User & Auth
user_role: ENUM('ADMIN', 'GENERAL_MANAGER', 'OPERATIONS_MANAGER', 
                'FARM_MANAGER', 'VETERINARY_OFFICER', 'STORE_KEEPER', 
                'PHARMACY_SALES', 'FINANCE_OFFICER', 'EXTENSION_WORKER')
user_status: ENUM('ACTIVE', 'INACTIVE')

-- Farm
farm_type: ENUM('BROILER', 'LAYER', 'MIXED')
farm_status: ENUM('ACTIVE', 'INACTIVE')
flock_status: ENUM('ACTIVE', 'CLOSED')

-- Inventory
item_category: ENUM('FEED', 'DRUG', 'EQUIPMENT', 'VACCINE', 'SUPPLY')
item_unit: ENUM('KG', 'L', 'UNITS', 'BAGS', 'BOXES', 'BOTTLES', 'TUBES')
item_status: ENUM('ACTIVE', 'INACTIVE')
movement_type: ENUM('STOCK_IN', 'STOCK_OUT')
issued_to_type: ENUM('FARM', 'CUSTOMER', 'VET', 'PHARMACY', 'INTERNAL')

-- Veterinary
vaccination_status: ENUM('SCHEDULED', 'COMPLETED', 'MISSED')
disease_status: ENUM('ACTIVE', 'CONTROLLED', 'RESOLVED')
disease_severity: ENUM('LOW', 'MODERATE', 'HIGH', 'CRITICAL')
prescription_status: ENUM('PENDING', 'DISPENSED', 'CANCELLED')

-- Pharmacy
customer_type: ENUM('INDIVIDUAL', 'FARM', 'RETAIL', 'VET')

-- Finance
transaction_type: ENUM('INCOME', 'EXPENSE')
payment_method: ENUM('CASH', 'MOMO', 'BANK_TRANSFER', 'CREDIT')

-- CRM
client_status: ENUM('LEAD', 'PROSPECT', 'ACTIVE_CLIENT', 'INACTIVE')

-- Notification
notification_type: ENUM('INFO', 'WARNING', 'ALERT', 'SYSTEM')
```

### Core Tables

**User Management**
- `users`: System users with role-based access
- `email_otp_codes`: OTP verification codes

**Farm Management**
- `farms`: Farm locations and metadata
- `flocks`: Bird batches/groups
- `daily_farm_records`: Daily operational metrics

**Veterinary**
- `vaccination_schedules`: Vaccination calendar
- `disease_cases`: Disease outbreak tracking
- `treatment_records`: Treatment administration
- `prescriptions`: Vet prescriptions

**Inventory**
- `inventory_items`: Master catalog
- `stock_batches`: Batch-level stock tracking (FEFO/FIFO)
- `stock_movements`: Immutable audit trail

**Pharmacy**
- `pharmacy_customers`: Customer management
- `pharmacy_sales`: Sales transactions
- `sale_items`: Line items

**Finance**
- `finance_transactions`: Income and expense records

**CRM**
- `crm_clients`: Client and prospect tracking
- `farm_visits`: Extension worker visits

**System**
- `notifications`: System alerts
- `audit_logs`: Change audit trail

### Database Views

**Reporting Views**

1. **`v_current_stock`**: Real-time stock levels with low stock alerts
2. **`v_farm_kpis`**: Pre-aggregated farm performance metrics
3. **`v_profit_loss`**: Overall financial position

### Database Triggers

**Automatic Timestamp Updates**

- `update_updated_at_column()`: PL/pgSQL function
- Applied to all tables with `updated_at` column
- Fires on UPDATE operations

**Stock Monitoring**

- `check_low_stock()`: Low stock notification trigger
- Fires when stock falls below threshold

### Indexing Strategy

**Performance Indexes**

- **Foreign Key Indexes**: All FK columns indexed
- **Composite Indexes**: Multi-column indexes for common queries
- **Partial Indexes**: Conditional indexes for specific statuses
- **Covering Indexes**: Include frequently accessed columns

**Example Indexes**

```sql
-- User lookup optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status) WHERE status = 'ACTIVE';

-- Farm performance queries
CREATE INDEX idx_daily_records_farm_date ON daily_farm_records(farm_id, record_date DESC);

-- Stock FEFO optimization
CREATE INDEX idx_stock_batches_fefo ON stock_batches(item_id, expiry_date ASC NULLS LAST, created_at ASC)
    WHERE quantity_remaining > 0;
```

### Connection Pooling

**HikariCP Configuration**

- **Connection Timeout**: 20000ms
- **Maximum Pool Size**: 5 (development)
- **Minimum Idle**: 0
- **Idle Timeout**: 600000ms (10 minutes)
- **Max Lifetime**: 1800000ms (30 minutes)

---

## Infrastructure & DevOps

### Containerization

**Docker & Docker Compose**

- **Docker Engine**: Latest stable version
- **Docker Compose**: v2.x
- **Architecture**: Multi-container application
- **Network**: Bridge network for inter-container communication

### Container Specifications

**Backend Container**

- **Base Image**: `eclipse-temurin:17-jre-alpine`
- **Build Image**: `maven:3.9.6-eclipse-temurin-17`
- **Port**: 8081 (internal), 8082 (external)
- **Environment Variables**: 10+ configuration parameters
- **Health Check**: Spring Boot actuator (optional)

**Frontend Container**

- **Base Image**: `nginx:alpine`
- **Build Image**: `node:22-alpine`
- **Port**: 80 (internal), 3000 (external)
- **Static Files**: Served from `/usr/share/nginx/html`
- **Reverse Proxy**: API requests proxied to backend

**Database Containers**

- **Image**: `postgres:15`
- **Volumes**: Persistent data volumes
- **Ports**: 5432 (app-db), 5433 (keycloak-db)
- **Environment**: Database credentials and configuration

**Keycloak Container**

- **Image**: `quay.io/keycloak/keycloak:24.0.4`
- **Port**: 8080 (internal), 8081 (external)
- **Command**: `start-dev`
- **Database**: PostgreSQL (keycloak-db)
- **Admin Credentials**: admin/admin

**MailHog Container**

- **Image**: `mailhog/mailhog:latest`
- **Ports**: 1025 (SMTP), 8025 (Web UI)
- **Purpose**: Email testing and debugging

### Volume Management

**Persistent Volumes**

- `app_db_data`: Application database persistence
- `keycloak_data`: Keycloak database persistence

### Network Configuration

**Docker Network**

- **Type**: Bridge
- **Name**: Default (docker-compose generated)
- **DNS**: Embedded DNS server
- **Service Discovery**: Container name resolution

### Environment Configuration

**Backend Environment Variables**

```bash
DB_URL=jdbc:postgresql://app-db:5432/trust_agro_db
DB_USERNAME=postgres
DB_PASSWORD=postgres
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_JWK_URI=http://keycloak:8080/realms/trust-agro/protocol/openid-connect/certs
APP_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<email>
SMTP_PASSWORD=<password>
```

**Frontend Environment Variables**

```bash
REACT_APP_API_URL=http://localhost:8082/api
REACT_APP_KEYCLOAK_URL=http://localhost:8081
```

### Reverse Proxy Configuration

**Nginx Configuration**

```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Build & Deployment Process

**Backend Build**

```dockerfile
# Multi-stage build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Frontend Build**

```dockerfile
# Multi-stage build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Development Tools

**Version Control**

- **Git**: Distributed version control
- **Repository**: Git (implied from .git directory)

**Code Quality**

- **Linting**: ESLint (React)
- **Formatting**: Prettier (implied)
- **Type Checking**: TypeScript compiler

---

## Security Architecture

### Authentication Flow

**Headless OTP Authentication**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │  React App  │    │Spring Boot  │    │  Keycloak   │
│  Browser    │    │  (Frontend) │    │  (Backend)  │    │   Server    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ 1. Register      │                  │                  │
       │─────────────────►│                  │                  │
       │                  │                  │                  │
       │                  │ 2. POST /signup  │                  │
       │                  │─────────────────►│                  │
       │                  │                  │                  │
       │                  │                  │ 3. Create User   │
       │                  │                  │─────────────────►│
       │                  │                  │                  │
       │                  │                  │ 4. Generate OTP  │
       │                  │                  │                  │
       │                  │                  │ 5. Send Email    │
       │                  │                  │─────────────────►│
       │                  │                  │                  │
       │ 6. Enter OTP     │                  │                  │
       │─────────────────►│                  │                  │
       │                  │                  │                  │
       │                  │ 7. POST /verify  │                  │
       │                  │─────────────────►│                  │
       │                  │                  │                  │
       │                  │                  │ 8. Enable User   │
       │                  │                  │─────────────────►│
       │                  │                  │                  │
       │                  │ 9. Login Request │                  │
       │                  │─────────────────►│                  │
       │                  │                  │                  │
       │                  │                  │ 10. Direct Token │
       │                  │                  │─────────────────►│
       │                  │                  │                  │
       │                  │ 11. Return JWT   │                  │
       │                  │◄─────────────────│                  │
       │                  │                  │                  │
       │ 12. Store JWT     │                  │                  │
       │◄─────────────────│                  │                  │
       │                  │                  │                  │
       │ 13. Redirect      │                  │                  │
       │─────────────────►│                  │                  │
```

### Authorization Model

**Role-Based Access Control (RBAC)**

**User Roles**

1. **ADMIN**: Full system access
2. **GENERAL_MANAGER**: Cross-module oversight
3. **OPERATIONS_MANAGER**: Operational control
4. **FARM_MANAGER**: Farm-specific operations
5. **VETERINARY_OFFICER**: Veterinary module access
6. **STORE_KEEPER**: Inventory management
7. **PHARMACY_SALES**: Pharmacy operations
8. **FINANCE_OFFICER**: Financial management
9. **EXTENSION_WORKER**: CRM and farm visits

**Permission Matrix**

| Module | Admin | GM | OM | FM | VO | SK | PS | FO | EW |
|--------|-------|----|----|----|----|----|----|----|-----|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Farm Mgmt | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Veterinary | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Inventory | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Pharmacy | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Finance | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| CRM | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Users | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

### Security Features

**JWT Security**

- **Algorithm**: HS256
- **Secret**: Environment-configured
- **Payload**: User ID, email, roles, expiry
- **Validation**: Signature verification via Keycloak JWK

**CORS Configuration**

- **Allowed Origins**: Configured whitelist
- **Allowed Methods**: GET, POST, PUT, PATCH, DELETE
- **Allowed Headers**: Authorization, Content-Type
- **Credentials**: Supported

**Input Validation**

- **Bean Validation**: JSR-380 annotations
- **Custom Validators**: Business-specific validation
- **SQL Injection Prevention**: Parameterized queries (JPA)
- **XSS Prevention**: React auto-escaping

**Password Security**

- **Storage**: Keycloak (BCrypt)
- **Policy**: Minimum 8 characters (enforced by Keycloak)
- **OTP**: 6-digit, time-limited

**Audit Logging**

- **Entity**: audit_logs table
- **Tracked Actions**: Create, Update, Delete
- **Metadata**: User, timestamp, old/new values
- **Purpose**: Compliance and debugging

---

## API Design & Integration

### API Architecture

**RESTful API Design**

- **Base Path**: `/api`
- **Protocol**: HTTP/1.1
- **Data Format**: JSON
- **Encoding**: UTF-8
- **Compression**: Gzip (optional)

### API Endpoints

**Authentication Endpoints**

```
POST   /api/auth/signup/otp          - Request signup OTP
POST   /api/auth/signup/verify      - Verify signup OTP
POST   /api/auth/login/otp          - Request login OTP
POST   /api/auth/login/verify       - Verify login OTP
POST   /api/auth/login              - Direct login (password)
POST   /api/auth/logout             - Logout
GET    /api/auth/me                 - Get current user
```

**Farm Management Endpoints**

```
GET    /api/farm/farms              - List all farms
POST   /api/farm/farms              - Create farm
GET    /api/farm/farms/{id}         - Get farm details
PUT    /api/farm/farms/{id}         - Update farm
DELETE /api/farm/farms/{id}         - Delete farm

GET    /api/farm/flocks             - List all flocks
POST   /api/farm/flocks             - Create flock
GET    /api/farm/flocks/{id}        - Get flock details
PUT    /api/farm/flocks/{id}        - Update flock
DELETE /api/farm/flocks/{id}        - Delete flock

GET    /api/farm/daily-records      - List daily records
POST   /api/farm/daily-records      - Create daily record
GET    /api/farm/daily-records/{id} - Get record details
PUT    /api/farm/daily-records/{id} - Update record
DELETE /api/farm/daily-records/{id} - Delete record
```

**Veterinary Endpoints**

```
GET    /api/vet/disease-cases       - List disease cases
POST   /api/vet/disease-cases       - Create disease case
GET    /api/vet/disease-cases/{id}  - Get disease case
PUT    /api/vet/disease-cases/{id}  - Update disease case
DELETE /api/vet/disease-cases/{id}  - Delete disease case

GET    /api/vet/treatments          - List treatments
POST   /api/vet/treatments          - Create treatment
GET    /api/vet/treatments/{id}     - Get treatment
PUT    /api/vet/treatments/{id}     - Update treatment

GET    /api/vet/prescriptions       - List prescriptions
POST   /api/vet/prescriptions       - Create prescription
PATCH  /api/vet/prescriptions/{id}/dispense - Dispense prescription
```

**Inventory Endpoints**

```
GET    /api/inventory/items         - List inventory items
POST   /api/inventory/items         - Create item
GET    /api/inventory/items/{id}    - Get item details
PUT    /api/inventory/items/{id}    - Update item

POST   /api/inventory/stock-in      - Stock in items
POST   /api/inventory/stock-out     - Stock out items
GET    /api/inventory/movements     - List stock movements
GET    /api/inventory/current-stock - Get current stock levels
```

**Pharmacy Endpoints**

```
GET    /api/pharmacy/customers      - List customers
POST   /api/pharmacy/customers      - Create customer
GET    /api/pharmacy/sales          - List sales
POST   /api/pharmacy/sales          - Create sale
GET    /api/pharmacy/sales/{id}     - Get sale details
```

**Finance Endpoints**

```
GET    /api/finance/transactions    - List transactions
POST   /api/finance/transactions    - Create transaction
GET    /api/finance/income          - List income
GET    /api/finance/expenses       - List expenses
GET    /api/finance/profit-loss     - Get profit/loss summary
```

**CRM Endpoints**

```
GET    /api/crm/clients             - List clients
POST   /api/crm/clients             - Create client
GET    /api/crm/clients/{id}        - Get client details
PUT    /api/crm/clients/{id}        - Update client
GET    /api/crm/farm-visits         - List farm visits
POST   /api/crm/farm-visits         - Create farm visit
```

### API Response Format

**Standard Response Structure**

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Error Response Structure**

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error"
    }
  ]
}
```

### Cross-Module Integration

**Integration Flow**

```
Farm → Disease Case → Treatment → Prescription → Pharmacy Sale → 
Inventory Update → Finance Record
```

**Key Integration Points**

1. **Disease to Treatment**: Optional foreign key
2. **Treatment to Prescription**: Drug name linkage
3. **Prescription to Pharmacy Sale**: Soft reference (Long)
4. **Pharmacy Sale to Inventory**: FEFO stock deduction
5. **Pharmacy Sale to Finance**: Auto income generation

**Transaction Management**

- **Scope**: Single transaction for complex operations
- **Rollback**: All-or-nothing semantics
- **Consistency**: ACID guarantees

---

## Development & Build Tools

### Backend Build Tools

**Apache Maven 3.9.6**

- **Build Lifecycle**: clean, compile, test, package
- **Dependency Management**: pom.xml
- **Plugins**:
  - `spring-boot-maven-plugin`: Spring Boot executable JAR
  - `maven-compiler-plugin`: Java compilation
  - `maven-surefire-plugin`: Test execution

**Maven Dependencies**

```xml
<properties>
    <java.version>17</java.version>
    <jjwt.version>0.11.5</jjwt.version>
    <lombok.version>1.18.44</lombok.version>
</properties>
```

### Frontend Build Tools

**npm (Node Package Manager)**

- **Version**: Compatible with Node.js 22
- **Package Manager**: npm (package-lock.json)
- **Scripts**:
  - `start`: Development server
  - `build`: Production build
  - `test`: Run tests
  - `eject`: Eject from Create React App

**React Scripts 5.0.1**

- **Babel**: JavaScript transpilation
- **Webpack**: Module bundling
- **ESLint**: Code linting
- **Jest**: Testing framework

### Development Workflow

**Backend Development**

```bash
# Build
mvn clean package

# Run locally
mvn spring-boot:run

# Run tests
mvn test

# Docker build
docker build -t trust-agro-backend ./backend
```

**Frontend Development**

```bash
# Install dependencies
npm install --legacy-peer-deps

# Development server
npm start

# Production build
npm run build

# Run tests
npm test

# Docker build
docker build -t trust-agro-frontend ./frontend
```

### Code Quality Tools

**Backend**

- **Compiler**: Java Compiler (javac)
- **Code Style**: Google Java Style (implied)
- **Static Analysis**: Maven compiler plugin

**Frontend**

- **Linter**: ESLint
- **Formatter**: Prettier (implied)
- **Type Checker**: TypeScript compiler

---

## System Modules

### Module Overview

The system consists of **8 core modules** plus authentication and audit:

1. **Authentication Module** - User authentication and authorization
2. **Farm Management Module** - Farm, flock, and daily record management
3. **Veterinary Module** - Disease tracking, treatments, and prescriptions
4. **Inventory Module** - Stock management with FEFO/FIFO
5. **Pharmacy Module** - Sales and customer management
6. **Finance Module** - Income, expense, and profit/loss tracking
7. **CRM Module** - Client relationship management and farm visits
8. **Notification Module** - System alerts and notifications
9. **Audit Module** - Change logging and compliance

### Module Dependencies

```
Authentication (Core)
    ├── Farm Management
    ├── Veterinary
    ├── Inventory
    ├── Pharmacy
    ├── Finance
    ├── CRM
    ├── Notification
    └── Audit
```

### Cross-Module Data Flow

**Example: Disease Treatment Flow**

1. **Farm Module**: Daily record identifies symptoms
2. **Veterinary Module**: Disease case registered
3. **Veterinary Module**: Treatment prescribed
4. **Veterinary Module**: Prescription issued
5. **Pharmacy Module**: Sale with prescription link
6. **Inventory Module**: Stock deducted (FEFO)
7. **Finance Module**: Income recorded automatically
8. **Audit Module**: All changes logged

---

## Deployment Architecture

### Production Deployment

**Recommended Architecture**

```
                    ┌─────────────┐
                    │   Load      │
                    │  Balancer   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
      ┌───────▼──────┐         ┌───────▼──────┐
      │   Frontend   │         │   Backend    │
      │   (Nginx)    │         │  (Spring)    │
      └───────┬──────┘         └───────┬──────┘
              │                         │
              └────────────┬────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
      ┌───────▼──────┐         ┌───────▼──────┐
      │   App DB     │         │  Keycloak    │
      │ (PostgreSQL) │         │   + DB       │
      └──────────────┘         └──────────────┘
```

### Scaling Strategy

**Horizontal Scaling**

- **Frontend**: Stateless, can scale horizontally
- **Backend**: Stateless, can scale horizontally
- **Database**: Read replicas for read scaling
- **Session**: JWT-based (stateless)

**Vertical Scaling**

- **Database**: Increase CPU, RAM, storage
- **Application**: Increase container resources

### High Availability

**Database HA**

- **PostgreSQL Streaming Replication**
- **Automatic failover**
- **Connection pooling**

**Application HA**

- **Multiple instances**
- **Load balancing**
- **Health checks**

### Monitoring & Logging

**Application Monitoring**

- **Spring Boot Actuator**: Health, metrics, info
- **Log Aggregation**: Centralized logging (ELK stack recommended)
- **Performance Monitoring**: APM tools (New Relic, Datadog)

**Database Monitoring**

- **Query Performance**: Slow query log
- **Connection Pool**: HikariCP metrics
- **Replication Lag**: Monitoring delay

### Backup Strategy

**Database Backups**

- **Frequency**: Daily full backups
- **Retention**: 30 days
- **Method**: pg_dump
- **Storage**: Offsite/cloud storage

**Application Backups**

- **Configuration**: Version control
- **Static Assets**: CDN backup
- **Logs**: Archive old logs

### Disaster Recovery

**RTO (Recovery Time Objective)**: 4 hours
**RPO (Recovery Point Objective)**: 24 hours

**Recovery Steps**

1. Restore database from backup
2. Deploy application containers
3. Configure load balancer
4. Verify health checks
5. Monitor for issues

---

## Performance Considerations

### Database Performance

**Indexing Strategy**

- **Covering Indexes**: Reduce table scans
- **Partial Indexes**: Index active records only
- **Composite Indexes**: Multi-column queries

**Query Optimization**

- **N+1 Problem**: Eager loading with JPA
- **Pagination**: Limit result sets
- **Caching**: Second-level cache

### Application Performance

**Backend Optimization**

- **Connection Pooling**: HikariCP
- **Async Processing**: @Async for long tasks
- **Caching**: Spring Cache abstraction

**Frontend Optimization**

- **Code Splitting**: React.lazy()
- **Memoization**: React.memo, useMemo
- **Bundle Size**: Tree shaking

### Network Performance

**HTTP Optimization**

- **Compression**: Gzip
- **HTTP/2**: Multiplexing
- **CDN**: Static asset delivery

---

## Security Best Practices

### Application Security

**Input Validation**

- **Server-side**: Bean Validation
- **Client-side**: Form validation
- **SQL Injection**: Parameterized queries

**Output Encoding**

- **XSS Prevention**: React auto-escaping
- **CSRF Protection**: SameSite cookies

### Infrastructure Security

**Container Security**

- **Base Images**: Minimal, official images
- **Secrets Management**: Environment variables
- **Network Segmentation**: Docker networks

**Database Security**

- **Encryption**: TLS for connections
- **Access Control**: Least privilege
- **Backup Encryption**: Encrypted backups

---

## Compliance & Governance

### Data Privacy

- **GDPR Compliance**: Data subject rights
- **Data Retention**: Configurable retention policies
- **Right to Deletion**: Account deletion process

### Audit Trail

- **Change Logging**: All modifications logged
- **User Attribution**: Actions linked to users
- **Immutable Logs**: Append-only audit trail

### Regulatory Compliance

- **Financial Records**: Transaction logging
- **Veterinary Records**: Treatment tracking
- **Inventory Records**: Stock movement audit

---

## Future Enhancements

### Planned Features

1. **Microservices Migration**: Extract modules to separate services
2. **Event-Driven Architecture**: Implement message queues (RabbitMQ/Kafka)
3. **Real-time Updates**: WebSocket integration
4. **Mobile Application**: React Native mobile app
5. **Advanced Analytics**: Business intelligence dashboard
6. **AI Integration**: Predictive analytics for farm operations
7. **Multi-tenancy**: Support for multiple organizations
8. **Advanced Reporting**: PDF report generation

### Technology Upgrades

1. **Spring Boot**: Upgrade to latest stable version
2. **React**: Migrate to Next.js for SSR
3. **Database**: Consider PostgreSQL partitioning
4. **Caching**: Implement Redis for distributed caching
5. **Search**: Elasticsearch integration for advanced search

---

## Conclusion

Trust Agro Management System represents a modern, enterprise-grade ERP solution built with industry-standard technologies. The architecture emphasizes:

- **Scalability**: Modular design for future growth
- **Security**: Multi-layer security with Keycloak integration
- **Maintainability**: Clean architecture with separation of concerns
- **Performance**: Optimized database queries and caching strategies
- **Flexibility**: Configurable and extensible design

The technology stack leverages the strengths of both Java/Spring Boot for robust backend operations and React for a responsive, modern user interface. The use of Docker for containerization ensures consistent deployment across environments, while PostgreSQL provides reliable data persistence.

This system is well-positioned for future enhancements and can evolve to meet growing business requirements in the agricultural and veterinary sectors.

---

## Appendix

### A. Environment Variables Reference

**Backend Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| DB_URL | Database JDBC URL | jdbc:postgresql://127.0.0.1:5432/trust_agro_db |
| DB_USERNAME | Database username | postgres |
| DB_PASSWORD | Database password | postgres |
| KEYCLOAK_URL | Keycloak server URL | http://localhost:8081 |
| KEYCLOAK_JWK_URI | Keycloak JWK URI | http://localhost:8081/realms/trust-agro/protocol/openid-connect/certs |
| SMTP_HOST | SMTP server host | smtp.example.com |
| SMTP_PORT | SMTP server port | 587 |
| SMTP_USERNAME | SMTP username | user |
| SMTP_PASSWORD | SMTP password | password |

**Frontend Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:8082/api |
| REACT_APP_KEYCLOAK_URL | Keycloak URL | http://localhost:8081 |

### B. Port Mapping

| Service | Internal Port | External Port |
|---------|---------------|---------------|
| Frontend (Nginx) | 80 | 3000 |
| Backend (Spring) | 8081 | 8082 |
| App Database | 5432 | 5432 |
| Keycloak Database | 5432 | 5433 |
| Keycloak | 8080 | 8081 |
| MailHog SMTP | 1025 | 1025 |
| MailHog Web | 8025 | 8025 |

### C. Quick Start Commands

**Start All Services**

```bash
docker compose up -d
```

**Stop All Services**

```bash
docker compose stop
```

**Remove All Services and Data**

```bash
docker compose down -v
```

**View Logs**

```bash
docker compose logs -f
```

**Access Services**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8082/api
- Keycloak Admin: http://localhost:8081/admin
- MailHog: http://localhost:8025

---

**Document Version**: 1.0  
**Last Updated**: June 2026  
**Maintained By**: Trust Agro Development Team
