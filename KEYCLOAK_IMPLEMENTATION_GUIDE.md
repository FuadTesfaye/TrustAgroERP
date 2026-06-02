# Keycloak Implementation Guide - Trust Agro ERP

## What is Keycloak?

**Keycloak** is an open-source identity and access management solution. Think of it as a centralized "security guard" that handles all user authentication and authorization for your application.

### Simple Analogy

Imagine your ERP system is a building with many rooms (modules like Farm, Pharmacy, Finance). Instead of having separate security guards at each room checking ID cards, you have **one main security desk at the entrance** (Keycloak). Once someone passes through that main desk and gets a security badge (JWT token), they can access any room in the building without being checked again.

---

## Why Trust Agro Uses Keycloak

### Problems Keycloak Solves

1. **Centralized Authentication**: One place to manage all users
2. **Secure Password Storage**: Passwords are never stored in your application database
3. **Role-Based Access**: Easy to assign and manage user permissions
4. **Token-Based Security**: Modern JWT tokens instead of sessions
5. **Standards-Based**: Uses industry-standard OAuth2 and OpenID Connect protocols
6. **Scalability**: Can handle thousands of users and authentication requests

### What Keycloak Does for Trust Agro

- **User Registration**: Creates and stores user accounts securely
- **Login Verification**: Validates email and password combinations
- **Token Issuance**: Issues JWT tokens that prove user identity
- **Role Management**: Assigns roles (ADMIN, FARM_MANAGER, etc.) to users
- **Session Management**: Handles token refresh and expiration
- **Security Standards**: Implements OAuth2 and OpenID Connect protocols

---

## Keycloak Architecture in Trust Agro

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Trust Agro ERP System                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Keycloak Server (Port 8081)                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Master     │  │  trust-agro  │  │   Other      │      │
│  │   Realm      │  │   Realm      │  │   Realms     │      │
│  │  (Admin)     │  │  (Your App)  │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  - User Database (PostgreSQL)                                │
│  - Token Issuance                                            │
│  - Role Management                                           │
│  - Security Policies                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Keycloak Database (PostgreSQL)                  │
│              Port: 5433                                      │
│              Database: keycloak                              │
└─────────────────────────────────────────────────────────────┘
```

### Keycloak Components

**1. Realms**

A **realm** is a isolated space for managing users. Think of it as a separate "tenant" or organization.

- **Master Realm**: Default realm for Keycloak administration
- **trust-agro Realm**: Custom realm created specifically for Trust Agro ERP

**2. Clients**

A **client** represents an application that wants to use Keycloak for authentication.

- **trust-agro-api**: The backend Spring Boot application
- **Client Type**: OpenID Connect
- **Access Type**: Confidential (backend applications)
- **Direct Access Grants**: Enabled (allows password-based login)

**3. Users**

Users are the people who log into your system.

- **Stored in**: Keycloak database (separate from your application database)
- **Attributes**: Email, password, roles, first name, last name
- **Status**: Can be enabled/disabled

**4. Roles**

Roles define what users can do in the system.

- **Realm Roles**: ADMIN, GENERAL_MANAGER, etc.
- **Client Roles**: Specific to the trust-agro-api client
- **Role Mappings**: Link users to their roles

---

## How Keycloak is Implemented in Trust Agro

### Implementation Strategy: Headless Authentication

**Important**: Trust Agro uses a **headless** (custom) authentication flow. This means users never see Keycloak's default login pages. Instead, your React application handles the entire login experience, and the backend communicates with Keycloak behind the scenes.

### Why Headless?

- **Better UX**: Users stay on your branded interface
- **Control**: Full control over the login experience
- **Simplicity**: No redirects between different domains
- **OTP Integration**: Easy to integrate custom OTP verification

---

## Authentication Flow Step by Step

### User Registration Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │  React App  │    │Spring Boot  │    │  Keycloak   │
│  Browser    │    │  (Frontend) │    │  (Backend)  │    │   Server    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ 1. Fill Form     │                  │                  │
       │    (name, email, │                  │                  │
       │     password)    │                  │                  │
       │─────────────────►│                  │                  │
       │                  │                  │                  │
       │                  │ 2. POST /signup  │                  │
       │                  │─────────────────►│                  │
       │                  │                  │                  │
       │                  │                  │ 3. Save to App DB│
       │                  │                  │    (INACTIVE)     │
       │                  │                  │                  │
       │                  │                  │ 4. Create User   │
       │                  │                  │    in Keycloak    │
       │                  │                  │─────────────────►│
       │                  │                  │                  │
       │                  │                  │ 5. Generate OTP  │
       │                  │                  │                  │
       │                  │                  │ 6. Send Email    │
       │                  │                  │    (via SMTP)     │
       │                  │                  │                  │
       │ 7. Enter OTP     │                  │                  │
       │─────────────────►│                  │                  │
       │                  │                  │                  │
       │                  │ 8. POST /verify  │                  │
       │                  │─────────────────►│                  │
       │                  │                  │                  │
       │                  │                  │ 9. Validate OTP   │
       │                  │                  │                  │
       │                  │                  │ 10. Enable User  │
       │                  │                  │     in App DB     │
       │                  │                  │                  │
       │                  │                  │ 11. Enable User  │
       │                  │                  │     in Keycloak   │
       │                  │                  │─────────────────►│
       │                  │                  │                  │
       │ 12. Success      │                  │                  │
       │◄─────────────────│                  │                  │
```

### User Login Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │  React App  │    │Spring Boot  │    │  Keycloak   │
│  Browser    │    │  (Frontend) │    │  (Backend)  │    │   Server    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ 1. Enter Email   │                  │                  │
       │    & Password     │                  │                  │
       │─────────────────►│                  │                  │
       │                  │                  │                  │
       │                  │ 2. POST /login   │                  │
       │                  │─────────────────►│                  │
       │                  │                  │                  │
       │                  │                  │ 3. Validate with  │
       │                  │                  │    Keycloak       │
       │                  │                  │─────────────────►│
       │                  │                  │                  │
       │                  │                  │ 4. Return JWT     │
       │                  │                  │◄─────────────────│
       │                  │                  │                  │
       │                  │ 5. Return JWT    │                  │
       │                  │◄─────────────────│                  │
       │                  │                  │                  │
       │ 6. Store JWT     │                  │                  │
       │    (localStorage)│                  │                  │
       │◄─────────────────│                  │                  │
       │                  │                  │                  │
       │ 7. Redirect to   │                  │                  │
       │    Dashboard     │                  │                  │
       │─────────────────►│                  │                  │
```

### API Request Flow (After Login)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │  React App  │    │Spring Boot  │    │  Keycloak   │
│  Browser    │    │  (Frontend) │    │  (Backend)  │    │   Server    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ 1. API Request   │                  │                  │
       │    (with JWT)     │                  │                  │
       │─────────────────►│                  │                  │
       │                  │                  │                  │
       │                  │ 2. API Request   │                  │
       │    (with JWT in   │                  │                  │
       │     Authorization │                  │                  │
       │     header)       │                  │                  │
       │                  │─────────────────►│                  │
       │                  │                  │                  │
       │                  │                  │ 3. Validate JWT   │
       │                  │                  │    (signature)    │
       │                  │                  │                  │
       │                  │                  │ 4. Extract User   │
       │                  │                  │    Info            │
       │                  │                  │                  │
       │                  │                  │ 5. Check Roles    │
       │                  │                  │    (from App DB)  │
       │                  │                  │                  │
       │                  │                  │ 6. Process        │
       │                  │                  │    Request        │
       │                  │                  │                  │
       │                  │ 7. Return Data   │                  │
       │                  │◄─────────────────│                  │
       │                  │                  │                  │
       │ 8. Display Data  │                  │                  │
       │◄─────────────────│                  │                  │
```

---

## Technical Implementation Details

### Backend Configuration

**1. Maven Dependencies**

```xml
<!-- Keycloak Admin Client -->
<dependency>
    <groupId>org.keycloak</groupId>
    <artifactId>keycloak-admin-client</artifactId>
    <version>24.0.0</version>
</dependency>

<!-- OAuth2 Resource Server -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

**2. Application Properties**

```properties
# Keycloak Configuration
keycloak.server-url=http://localhost:8081
keycloak.realm=trust-agro
keycloak.admin.client-id=admin-cli
keycloak.admin.client-secret=secret
keycloak.admin.username=admin
keycloak.admin.password=admin

# JWT Validation
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:8081/realms/trust-agro/protocol/openid-connect/certs
```

**3. Keycloak Admin Client Service**

The backend uses the Keycloak Admin Client to programmatically manage users:

```java
@Service
public class KeycloakAdminClient {
    
    private Keycloak keycloak;
    
    public KeycloakAdminClient() {
        this.keycloak = Keycloak.getInstance(
            "http://localhost:8081",
            "master",
            "admin-cli",
            "admin",
            "admin"
        );
    }
    
    // Create a new user in Keycloak
    public void createUser(String email, String password, String fullName) {
        RealmResource realm = keycloak.realm("trust-agro");
        UsersResource users = realm.users();
        
        UserRepresentation user = new UserRepresentation();
        user.setUsername(email);
        user.setEmail(email);
        user.setEnabled(false); // Disabled until OTP verified
        user.setFirstName(fullName);
        
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(false);
        user.setCredentials(List.of(credential));
        
        Response response = users.create(user);
        response.close();
    }
    
    // Enable a user after OTP verification
    public void enableUser(String email) {
        RealmResource realm = keycloak.realm("trust-agro");
        UsersResource users = realm.users();
        
        UserRepresentation user = users.search(email).get(0);
        user.setEnabled(true);
        users.get(user.getId()).update(user);
    }
    
    // Get JWT token for a user (Direct Access Grant)
    public String getToken(String email, String password) {
        Map<String, Object> credentials = new HashMap<>();
        credentials.put("grant_type", "password");
        credentials.put("client_id", "trust-agro-api");
        credentials.put("username", email);
        credentials.put("password", password);
        
        Keycloak keycloak = Keycloak.getInstance(
            "http://localhost:8081",
            "trust-agro",
            "trust-agro-api",
            credentials
        );
        
        return keycloak.tokenManager().getAccessToken().getToken();
    }
}
```

**4. Spring Security Configuration**

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwkSetUri;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwkSetUri(jwkSetUri)
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            );
        
        return http.build();
    }
    
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }
    
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthorityPrefix("ROLE_");
        converter.setAuthoritiesClaimName("roles");
        return new KeycloakJwtAuthenticationConverter(converter);
    }
}
```

### Frontend Integration

**1. Axios Interceptor**

The frontend automatically adds the JWT token to every API request:

```javascript
// api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8082/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**2. Auth Context**

```javascript
// context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      // Hard redirect to avoid race conditions
      window.location.href = '/dashboard';
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## JWT Token Structure

### What is a JWT?

**JWT (JSON Web Token)** is a compact, URL-safe means of representing claims to be transferred between two parties. In Trust Agro, JWTs are used to prove user identity without storing session data on the server.

### JWT Structure

A JWT consists of three parts separated by dots:

```
header.payload.signature
```

**Example Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Token Parts Explained

**1. Header**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- **alg**: Algorithm used to sign the token (HS256 = HMAC-SHA256)
- **typ**: Token type (JWT)

**2. Payload (Claims)**

```json
{
  "sub": "user@email.com",
  "email": "user@email.com",
  "roles": ["FARM_MANAGER"],
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516325422
}
```

- **sub**: Subject (user identifier)
- **email**: User email
- **roles**: User roles
- **name**: User full name
- **iat**: Issued at (timestamp)
- **exp**: Expiration time (timestamp)

**3. Signature**

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

- Created by signing the header and payload with a secret key
- Used to verify the token hasn't been tampered with

### Token Validation

When the backend receives a JWT:

1. **Decode** the token
2. **Verify** the signature using Keycloak's public key
3. **Check** expiration time
4. **Extract** user information
5. **Authorize** based on roles

---

## Keycloak Setup Guide

### Initial Setup (One-Time)

**Step 1: Access Keycloak Admin Console**

- URL: http://localhost:8081/admin
- Username: `admin`
- Password: `admin`

**Step 2: Create the trust-agro Realm**

1. Click the realm dropdown (top-left, says "master")
2. Click "Create Realm"
3. Name: `trust-agro`
4. Click "Create"

**Step 3: Create the Backend Client**

1. Go to "Clients" in the left menu
2. Click "Create client"
3. Fill in:
   - Client type: `OpenID Connect`
   - Client ID: `trust-agro-api`
4. Click "Next"
5. Enable:
   - **Direct access grants** (important for headless login)
   - **Service accounts roles** (for backend to manage users)
6. Click "Next", then "Save"

**Step 4: Disable SSL (Development Only)**

1. Go to "Realm settings" (bottom-left)
2. On "General" tab
3. Change "Require SSL" to `None`
4. Click "Save"

**Step 5: Create Roles**

1. Go to "Realm roles" in the left menu
2. Click "Create role"
3. Create all required roles:
   - ADMIN
   - GENERAL_MANAGER
   - OPERATIONS_MANAGER
   - FARM_MANAGER
   - VETERINARY_OFFICER
   - STORE_KEEPER
   - PHARMACY_SALES
   - FINANCE_OFFICER
   - EXTENSION_WORKER

---

## Keycloak Database

### Separate Database for Security

Trust Agro uses **two separate PostgreSQL databases**:

1. **app-db (Port 5432)**: Application data (farms, inventory, etc.)
2. **keycloak-db (Port 5433)**: Keycloak authentication data

### Why Separate Databases?

- **Security**: Authentication data is isolated from business data
- **Compliance**: Easier to manage data retention policies
- **Performance**: Separate optimization strategies
- **Backup**: Can backup authentication data independently

### Keycloak Tables

Keycloak creates its own tables in the keycloak-db:

- **USER_ENTITY**: User accounts
- **CREDENTIAL**: Password hashes
- **REALM**: Realm configurations
- **CLIENT**: Application clients
- **USER_ROLE_MAPPING**: Role assignments
- **USER_ATTRIBUTE**: Custom user attributes

---

## Security Features

### Password Security

- **Hashing**: Passwords are hashed using BCrypt
- **Storage**: Never stored in plain text
- **Validation**: Keycloak enforces password policies

### Token Security

- **Signature**: Tokens are cryptographically signed
- **Expiration**: Tokens expire after 24 hours
- **Refresh**: Can refresh tokens without re-login
- **Revocation**: Can revoke tokens if needed

### Communication Security

- **HTTPS**: Production should use HTTPS
- **TLS**: Encrypted communication between services
- **CORS**: Configured to allow only trusted origins

---

## Common Operations

### Creating a User Programmatically

```java
// In your AuthService
public void registerUser(SignupRequest request) {
    // 1. Save to application database (INACTIVE)
    User appUser = new User();
    appUser.setEmail(request.getEmail());
    appUser.setFullName(request.getFullName());
    appUser.setPassword(passwordEncoder.encode(request.getPassword()));
    appUser.setStatus(UserStatus.INACTIVE);
    userRepository.save(appUser);
    
    // 2. Create in Keycloak (disabled)
    keycloakAdminClient.createUser(
        request.getEmail(),
        request.getPassword(),
        request.getFullName()
    );
    
    // 3. Generate and send OTP
    String otp = otpService.generateOTP(request.getEmail());
    emailService.sendOTPEmail(request.getEmail(), otp);
}
```

### Verifying OTP and Activating User

```java
public void verifyOTP(VerifyOTPRequest request) {
    // 1. Validate OTP
    if (!otpService.validateOTP(request.getEmail(), request.getOtpCode())) {
        throw new BusinessException("Invalid or expired OTP");
    }
    
    // 2. Activate in application database
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    user.setStatus(UserStatus.ACTIVE);
    userRepository.save(user);
    
    // 3. Enable in Keycloak
    keycloakAdminClient.enableUser(request.getEmail());
}
```

### Getting JWT Token

```java
public LoginResponse login(LoginRequest request) {
    // 1. Validate credentials with Keycloak
    String token = keycloakAdminClient.getToken(
        request.getEmail(),
        request.getPassword()
    );
    
    // 2. Get user from application database
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    
    // 3. Return token and user info
    return LoginResponse.builder()
        .token(token)
        .type("Bearer")
        .expiresIn(86400000) // 24 hours
        .id(user.getId())
        .name(user.getFullName())
        .email(user.getEmail())
        .role(user.getRole())
        .build();
}
```

---

## Troubleshooting

### Common Issues

**1. "Invalid user credentials"**

- Check if user exists in Keycloak
- Verify user is enabled (not disabled)
- Check password is correct
- Ensure trust-agro realm exists

**2. "Client not found"**

- Verify trust-agro-api client exists
- Check client ID matches configuration
- Ensure Direct Access Grants is enabled

**3. "Token validation failed"**

- Check JWK URI is correct
- Verify Keycloak is accessible
- Check token hasn't expired

**4. CORS errors**

- Check CORS configuration in backend
- Verify frontend URL is in allowed origins
- Check browser console for specific error

### Debug Mode

Enable Keycloak debug logging:

```properties
# application.properties
logging.level.org.keycloak=DEBUG
logging.level.org.springframework.security=DEBUG
```

---

## Best Practices

### Security

1. **Never store passwords** in your application database
2. **Use HTTPS** in production
3. **Rotate secrets** regularly
4. **Implement rate limiting** on authentication endpoints
5. **Monitor failed login attempts**

### Performance

1. **Cache JWT validation** where possible
2. **Use connection pooling** for Keycloak Admin Client
3. **Implement token refresh** to reduce re-authentication
4. **Monitor Keycloak performance** metrics

### Maintenance

1. **Regular backups** of Keycloak database
2. **Monitor user growth** and plan scaling
3. **Review role assignments** periodically
4. **Keep Keycloak updated** to latest version

---

## Summary

### Keycloak in Trust Agro: Quick Reference

| Aspect | Implementation |
|--------|----------------|
| **Purpose** | Centralized authentication and authorization |
| **Location** | Docker container (port 8081) |
| **Database** | Separate PostgreSQL (port 5433) |
| **Realm** | trust-agro |
| **Client** | trust-agro-api |
| **Protocol** | OAuth2 + OpenID Connect |
| **Token Type** | JWT (24-hour expiry) |
| **Authentication** | Headless (custom UI) |
| **User Storage** | Keycloak database only |
| **Role Storage** | Keycloak + Application database |
| **Admin Access** | http://localhost:8081/admin |

### Key Benefits

✅ **Secure**: Industry-standard security protocols
✅ **Scalable**: Handles thousands of users
✅ **Flexible**: Custom authentication flows
✅ **Standards-based**: OAuth2 and OpenID Connect
✅ **Maintainable**: Centralized user management
✅ **Future-proof**: Easy to add new authentication methods

---

## Additional Resources

- **Keycloak Documentation**: https://www.keycloak.org/documentation
- **OAuth2 Specification**: https://oauth.net/2/
- **JWT Introduction**: https://jwt.io/introduction
- **Spring Security OAuth2**: https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html

---

**Document Version**: 1.0  
**Last Updated**: June 2026  
**Trust Agro ERP System**
