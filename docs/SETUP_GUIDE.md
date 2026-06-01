# Trust Agro ERP - Email OTP Authentication Setup Guide

This guide details the steps required to configure the backend and Keycloak to support the 2-step Email OTP verification flow.

## 1. Keycloak Configuration

Since we are orchestrating the OTP generation, sending, and verification within the Spring Boot backend, we bypass Keycloak's native OTP and registration screens.

### Realm Settings
1. Go to **Realm Settings**.
2. **Registration allowed**: `OFF` (Registration is handled purely via the `/api/auth/signup/otp` endpoint).
3. **Email as username**: `ON` (Required so users can log in with their email).
4. **Verify email**: `OFF` (The Spring Boot backend will perform verification before marking the user as active or issuing tokens).
5. **Edit username**: `OFF`.

### Custom Required Action (Optional depending on backend approach)
If you decide to enforce verification inside Keycloak using a Custom Required Action JAR:
1. Deploy your JAR containing the `EMAIL_OTP_VERIFICATION` action to `keycloak/standalone/deployments/`.
2. Go to **Authentication** > **Required Actions** and register the new action.
3. Make it **Default Action** or assign it to users when they are created via the Admin API.

*Note: The current implementation handles OTP within the Spring Boot backend entirely, so deploying a custom Keycloak Required Action is not strictly necessary unless you want Keycloak to natively block token issuance for users accessing Keycloak directly.*

## 2. SMTP Configuration

To send OTP emails, configure a valid SMTP server in your environment variables or directly in `application.properties`:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.ssl.protocols=TLSv1.3
```

Ensure that your SMTP provider supports `TLSv1.3` as mandated by our security requirements.

## 3. Database Maintenance

The `email_otp_codes` table is created via the SQL migration scripts (`init_email_otp.sql`).
Since this table stores temporary codes, it will grow over time. We recommend setting up a scheduled cleanup job (e.g., using `@Scheduled` in Spring Boot or a cron job running a simple SQL query):

```sql
DELETE FROM email_otp_codes WHERE expires_at < NOW();
```
