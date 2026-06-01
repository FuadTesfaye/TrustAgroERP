# Trust Agro ERP - Authentication Setup Guide

This document outlines the setup, configuration, and security considerations for the Email OTP Verification system used in Trust Agro ERP.

## 1. Keycloak Configuration

The system uses Keycloak as the Identity Provider. For the backend to communicate with Keycloak to check if a user exists, you need to configure a Service Account.

### Realm Settings
- **Realm Name**: `trust-agro`
- **Registration allowed**: `false` (Registration is handled purely via our custom API).
- **Email as username**: `true`
- **Verify email**: `false` (Verification is handled via our custom OTP flow).
- **Edit username**: `false`

### Admin Service Account
To allow the Spring Boot backend (`KeycloakAdminClient`) to query Keycloak, you must set up a client with service account roles:
1. In the `trust-agro` realm, go to **Clients** -> **Create client**.
2. **Client ID**: `admin-cli` (or another custom name matching your `application.properties`).
3. Set **Client authentication** to `On`.
4. Check **Service accounts roles** in Authentication flow.
5. Save the client.
6. Go to the **Credentials** tab and copy the **Client secret**. Update your `application.properties` with this secret.
7. Go to the **Service account roles** tab, click **Assign role**, switch to **Filter by clients**, select `realm-management`, and assign the `view-users` and `manage-users` roles.

### Custom Required Action
The prompt specified a custom required action `EMAIL_OTP_VERIFICATION`. 
Ensure you have deployed the custom SPI jar (if applicable) to your Keycloak server and enabled it under **Authentication** -> **Required Actions**.

---

## 2. SMTP Configuration

To send the OTP emails, a valid SMTP server must be configured in `application.properties`.

```properties
spring.mail.host=smtp.example.com
spring.mail.port=587
spring.mail.username=your-username
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.ssl.protocols=TLSv1.3
```

- For local development, it is recommended to use **MailHog** or **Mailtrap**.
- For production, use a transactional email provider like SendGrid, AWS SES, or Mailgun over TLS 1.3.

---

## 3. Database Initialization

Run the provided SQL script to create the necessary tables for OTP storage.
File location: `backend/src/main/resources/db/init_email_otp.sql`

```sql
psql -U your_db_user -d trust_agro_db -f init_email_otp.sql
```

A scheduled task should be implemented (or a cron job on the DB server) to clean up expired OTPs to save space:
`DELETE FROM email_otp_codes WHERE expires_at < NOW();`

---

## 4. Security Checklist

- [ ] **Cryptographic Security**: OTPs are generated using `SecureRandom` to prevent predictability. Sequential patterns are implicitly avoided by true randomness, but custom checks can be added if strict pattern rejection is required.
- [ ] **Rate Limiting**: Configured maximum 3 OTP requests per email per purpose and max 3 verification attempts per OTP.
- [ ] **Email Security**: The email template uses plain text fallbacks. TLS 1.3 is enforced for SMTP connections. The OTP is **not** included in the email subject.
- [ ] **Token Storage**: The React application stores the JWT access token purely in React state (Memory). It does **not** use `localStorage`.
- [ ] **CSRF Protection**: If HTTP-only cookies are used for refresh tokens, ensure CSRF protection is configured in Spring Security.
- [ ] **Concurrent Sessions**: Keycloak can be configured to limit concurrent sessions to 3 per user. (Realm Settings -> Sessions -> Maximum concurrent sessions).

---

## 5. API OpenAPI Definitions

### `POST /api/auth/signup/otp`
Initiates the signup process by sending an OTP to the user.
- **Request Body**: `{ "email": "user@example.com", "password": "..." }`
- **Response**: `200 OK`

### `POST /api/auth/signup/verify`
Verifies the signup OTP.
- **Request Body**: `{ "email": "user@example.com", "otpCode": "123456" }`
- **Response**: `200 OK` containing boolean `true`.

### `POST /api/auth/login/otp`
Initiates the login process by sending an OTP to an existing user.
- **Request Body**: `{ "email": "user@example.com" }`
- **Response**: `200 OK`

### `POST /api/auth/login/verify`
Verifies the login OTP and returns JWT tokens.
- **Request Body**: `{ "email": "user@example.com", "otpCode": "123456" }`
- **Response**: `200 OK` containing `LoginResponse` with token and user details.
