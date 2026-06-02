# Trust Agro Management System

Trust Agro is a comprehensive, enterprise-grade ERP (Enterprise Resource Planning) platform designed specifically for the agricultural and veterinary sectors. It provides seamless management of farm operations, veterinary tracking, inventory and pharmacy sales, and customer relationships (CRM).

---

## 🏗️ Detailed Tech Stack & Libraries

The system is built using a modern, decoupled microservices architecture. Below is an exhaustive list of the frameworks, libraries, and tools utilized across the stack.

### 1. Frontend Web Application (React)
The frontend is a Single Page Application (SPA) built for speed, responsiveness, and clean UI/UX.

- **Core Framework:** React 18 (using functional components and Hooks)
- **Routing:** `react-router-dom` (Handles all client-side routing, including protected routes and role-based redirects)
- **HTTP Client:** `axios` (Configured with global interceptors to automatically attach JWT Bearer tokens to every outgoing API request and handle 401 Unauthorized fallbacks)
- **Styling & UI:** 
  - `tailwindcss` (Utility-first CSS framework for rapid UI development)
  - Custom modular CSS for advanced components.
- **Icons:** `lucide-react` (Clean, modern SVG icon library used extensively across the dashboard menus and cards)
- **Data Visualization:** `recharts` (Used for rendering dynamic charts on the operational dashboards)
- **Notifications:** `react-toastify` (Provides elegant, non-blocking toast notifications for API success/error messages)

### 2. Backend API Server (Java & Spring Boot)
The backend is a robust RESTful API built to handle complex business logic, database transactions, and cryptographic token verification.

- **Core Framework:** Java 17 & Spring Boot 3.2
- **Security:** `spring-boot-starter-security` & `spring-boot-starter-oauth2-resource-server` (Verifies incoming JWTs against Keycloak's public keys on every protected endpoint)
- **Database ORM:** `spring-boot-starter-data-jpa` & Hibernate (Maps Java entities to PostgreSQL tables)
- **Identity Provider Integration:** `keycloak-admin-client` (Allows the Spring Boot backend to programmatically create and enable users inside the Keycloak server)
- **Email Delivery:** `spring-boot-starter-mail` (JavaMailSender) (Used to connect to external SMTP servers to send OTP verification emails)
- **Boilerplate Reduction:** `Lombok` (Auto-generates Getters, Setters, Constructors, and Builders)
- **Validation:** `spring-boot-starter-validation` (Enforces data integrity on incoming JSON payloads)

### 3. Databases (PostgreSQL 15)
To ensure high security and strict separation of concerns, the platform runs two completely isolated database instances:
1. **App Database (`app-db`):** Stores all ERP domain data (farms, veterinary records, inventory) and a lightweight `users` table that tracks application-level metadata (like Full Name and custom internal IDs).
2. **Keycloak Database (`keycloak-db`):** Exclusively used by the Keycloak server to store sensitive authentication data, realms, identity structures, and active sessions.

### 4. Infrastructure & DevOps
- **Containerization:** Docker & Docker Compose (The entire stack can be spun up with a single command, ensuring perfect parity between development and production environments).
- **Web Server:** `nginx:alpine` (Serves the compiled React frontend production build inside the Docker container).
- **Email Catching:** `MailHog` (Included in the Docker network for local SMTP debugging and trapping outbound emails without hitting real inboxes).

---

## 🔐 Deep Dive: Keycloak Implementation & Authentication

Keycloak (v24) is the cornerstone of the application's security. It acts as the centralized Identity Provider (IdP). However, instead of using Keycloak's default browser-based login screens (which redirect users away from the app), we implemented a **highly customized, headless Auth flow** to keep users on the Trust Agro UI.

### The Headless OTP Authentication Flow

**1. Registration (Silent Provisioning):**
When a user fills out the Registration form on the React frontend, the payload is sent to the Spring Boot backend. 
- The backend saves the user in the PostgreSQL App DB as `INACTIVE`.
- Simultaneously, the backend uses the `keycloak-admin-client` (authenticating itself to Keycloak via the `master` realm) to programmatically create a matching user profile inside Keycloak. This Keycloak user is also created as `disabled`.
- Finally, the backend generates a 6-digit OTP and emails it to the user.

**2. OTP Verification & Activation:**
When the user enters the OTP into the React frontend:
- The backend validates the code.
- If correct, the backend marks the user as `ACTIVE` in the PostgreSQL App DB.
- The backend then tells Keycloak (via the Admin API) to `enable` the user account.

**3. Direct Token Issuance (Resource Owner Password Flow):**
Because we don't want the user to be redirected to a Keycloak login page, the backend performs a "Direct Access Grant" (Resource Owner Password Credentials flow) behind the scenes.
- The Spring Boot server securely passes the user's email and password directly to Keycloak's token endpoint (`/protocol/openid-connect/token`).
- Keycloak issues a cryptographically signed JWT (JSON Web Token) containing the Access Token and Refresh Token.
- The backend forwards this JWT back to the React frontend.

**4. Frontend Session Management:**
- The React frontend receives the JWT, stores it in `localStorage`, and updates the React Context (`AuthContext.tsx`).
- To ensure React Router doesn't experience race conditions, the frontend performs a hard browser redirect (`window.location.href = '/dashboard'`), forcing the app to load fresh with the fully authorized session.

**5. API Security & Role-Based Access (RBAC):**
- **Frontend Interceptors:** The Axios instance intercepts every outgoing request and injects the JWT into the `Authorization: Bearer <token>` header.
- **Backend Verification:** When a request hits a protected Spring Boot endpoint, Spring Security catches it. It doesn't query Keycloak directly; instead, it mathematically validates the JWT signature using the public keys it downloaded from Keycloak's JWK URI (`KEYCLOAK_JWK_URI`).
- **Authorization:** If the token is valid, Spring extracts the user ID. The backend then checks the PostgreSQL App DB to determine what Roles the user possesses and authorizes the action accordingly.

---

## 🛠️ Initial Keycloak Setup Guide

If you ever wipe your Docker volumes (e.g., using `docker compose down -v`), Keycloak will start completely empty. You must manually recreate the `trust-agro` realm for the backend to function.

**1. Access the Admin Console**
- Go to [http://localhost:8081/admin](http://localhost:8081/admin)
- Login with the master admin credentials (Username: `admin`, Password: `admin`).

**2. Create the Realm**
- In the top-left dropdown (which currently says "master"), click **Create Realm**.
- Set the **Realm name** to `trust-agro`. (This exact name is required by the Spring Boot configuration).
- Click **Create**.

**3. Create the Backend API Client**
- Ensure you are in the `trust-agro` realm.
- Go to **Clients** -> **Create client**.
- **Client type:** `OpenID Connect`
- **Client ID:** `trust-agro-api`
- Click **Next**.
- Turn **ON** `Direct access grants` (Crucial: This allows the Spring Boot backend to perform the behind-the-scenes headless login).
- Turn **ON** `Service accounts roles` (Allows Spring Boot to talk to Keycloak to create new users).
- Click **Next**, then **Save**.

**4. Disable Required SSL (For Local Development)**
- Go to **Realm settings** (bottom left menu).
- On the **General** tab, find **Require SSL**.
- Change it from `external requests` to `None`.
- Click **Save**. (If you do not do this, Keycloak will refuse HTTP connections from the Docker network).

---

## 🚀 Running the System (Docker Compose)

### Startup Instructions

1. Start all services in detached mode:
   ```bash
   docker compose up -d
   ```

2. Access the interfaces:
   - **Main Web Application:** [http://localhost:3000](http://localhost:3000)
   - **Keycloak Admin Console:** [http://localhost:8081](http://localhost:8081)
   - **Backend API Base URL:** [http://localhost:8082/api](http://localhost:8082/api)

### Stopping and Cleaning Up
To stop the application without deleting data:
```bash
docker compose stop
```

To tear down the containers and **permanently delete** all databases (requires repeating the Keycloak setup guide above on next boot):
```bash
docker compose down -v
```
