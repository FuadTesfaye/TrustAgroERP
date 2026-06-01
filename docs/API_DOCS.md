# Trust Agro - Email OTP Auth API Documentation

Base Path: `/api/auth`

## 1. Request Signup OTP
Initiates the signup process by requesting a 6-digit verification code.

**Endpoint:** `POST /signup/otp`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Success",
  "data": null
}
```

## 2. Verify Signup OTP
Verifies the OTP sent to the user's email during signup, marking the account as verified.

**Endpoint:** `POST /signup/verify`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otpCode": "123456"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Success",
  "data": true
}
```
*Note: Returns 400 Bad Request if the OTP is invalid or expired.*

## 3. Request Login OTP
Validates the user's email and password against Keycloak/Local DB. If valid, an OTP is generated and emailed to the user.

**Endpoint:** `POST /login/otp`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Success",
  "data": null
}
```

## 4. Verify Login OTP
Verifies the login OTP. If valid, issues the JWT access tokens for the authenticated session.

**Endpoint:** `POST /login/verify`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otpCode": "123456"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Success",
  "data": {
    "token": "eyJhbGciOi...",
    "type": "Bearer",
    "expiresIn": 86400000,
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER",
    "roles": ["USER", "FARMER"]
  }
}
```
