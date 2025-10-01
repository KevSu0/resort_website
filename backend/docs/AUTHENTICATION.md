# Authentication System Documentation

## Overview

This document describes the complete authentication system implemented for the Resort Admin Panel backend. The system provides secure JWT-based authentication with role-based access control (RBAC), multi-tenant support, and comprehensive security features.

## Features

### Core Authentication
- **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **Password Security**: bcrypt hashing with configurable salt rounds (default: 12)
- **Session Management**: Database-backed session tracking with expiration
- **Multi-tenant Support**: Site-scoped user sessions and permissions

### Security Features
- **Rate Limiting**: Configurable rate limiting for auth endpoints
- **Account Lockout**: Progressive account lockout after failed attempts
- **Input Sanitization**: XSS protection and input validation
- **Security Headers**: Helmet.js integration for security headers
- **IP-based Security**: Suspicious activity detection and monitoring

### Role-Based Access Control (RBAC)
- **Hierarchical Permissions**: Role-based permission system
- **Site-level Access Control**: Multi-tenant permission management
- **Resource-based Authorization**: Fine-grained access control
- **Permission Middleware**: Easy route protection

## Architecture

### Services

#### JWT Service (`src/services/jwt.ts`)
Handles JWT token generation, validation, and management.

**Key Methods:**
- `generateAccessToken(payload)` - Create access token (15min expiry)
- `generateRefreshToken(userId, sessionId)` - Create refresh token (7d expiry)
- `verifyAccessToken(token)` - Validate and decode access token
- `verifyRefreshToken(token)` - Validate and decode refresh token
- `generateTokenPair(payload, sessionId)` - Generate both tokens

#### Password Service (`src/services/password.ts`)
Handles password hashing, verification, and validation.

**Key Methods:**
- `hashPassword(password)` - Hash password with bcrypt
- `verifyPassword(password, hash)` - Verify password against hash
- `validatePasswordStrength(password)` - Validate password requirements
- `generateSecurePassword(length)` - Generate secure random password

### Middleware

#### Authentication Middleware (`src/middleware/auth.ts`)
Provides route authentication and user context.

**Middleware Functions:**
- `authenticate` - Required authentication for protected routes
- `optionalAuthenticate` - Optional authentication (doesn't fail if no token)
- `requireSiteAccess` - Verify user has access to specific site
- `requireMinimumRole(role)` - Role-based access control
- `requireOwnershipOrAdmin` - Resource ownership verification

#### RBAC Middleware (`src/middleware/rbac.ts`)
Implements role-based access control system.

**Permissions:**
- User Management: `users:read`, `users:create`, `users:update`, `users:delete`
- Site Management: `sites:read`, `sites:create`, `sites:update`, `sites:delete`
- Content Management: `content:read`, `content:create`, `content:update`, `content:delete`, `content:publish`
- Media Management: `media:read`, `media:create`, `media:update`, `media:delete`
- Property Management: `properties:read`, `properties:create`, `properties:update`, `properties:delete`
- Booking Management: `bookings:read`, `bookings:create`, `bookings:update`, `bookings:delete`
- Analytics: `analytics:read`, `reports:read`
- Settings: `settings:read`, `settings:update`
- System: `system:read`, `system:update`, `system:backup`, `system:restore`
- Audit: `audit:read`

**Role Hierarchy:**
1. `SUPER_ADMIN` - All permissions
2. `BRAND_ADMIN` - Brand-level management
3. `SITE_ADMIN` - Site-level management
4. `EDITOR` - Content editing and publishing
5. `AUTHOR` - Content creation
6. `VIEWER` - Read-only access
7. `USER` - Basic access

#### Security Middleware (`src/middleware/securityEnhancements.ts`)
Enhanced security features and monitoring.

**Features:**
- Account lockout with progressive penalties
- Suspicious activity detection
- Input sanitization
- IP-based security monitoring
- Request size limiting

### Controllers

#### Auth Controller (`src/controllers/authController.ts`)
Handles authentication endpoints and user session management.

**Endpoints:**
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - Session termination
- `GET /auth/me` - Current user information
- `GET /auth/check` - Token validation

### Routes

#### Auth Routes (`src/routes/auth.ts`)
Defines authentication endpoints with validation and rate limiting.

## API Endpoints

### Authentication Endpoints

#### POST /auth/login
Authenticates a user and returns access/refresh tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "siteId": "optional-site-id",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "SITE_ADMIN",
    "brandId": "brand-id",
    "siteIds": ["site-id-1", "site-id-2"],
    "permissions": ["content:read", "content:create", ...],
    "emailVerified": true
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  },
  "session": {
    "id": "session-id",
    "expiresAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### POST /auth/refresh
Refreshes an access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "new-jwt-access-token"
}
```

#### POST /auth/logout
Terminates a user session.

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET /auth/me
Returns current user information.

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "SITE_ADMIN",
    "brandId": "brand-id",
    "emailVerified": true,
    "lastLoginAt": "2024-01-01T12:00:00.000Z",
    "permissions": ["content:read", "content:create", ...],
    "currentSiteId": "site-id",
    "currentSiteRole": "SITE_ADMIN",
    "siteUsers": [...]
  }
}
```

#### GET /auth/check
Validates if the current access token is valid.

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "userId": "user-id",
    "email": "user@example.com",
    "role": "SITE_ADMIN",
    "siteId": "site-id",
    "brandId": "brand-id"
  },
  "session": {
    "id": "session-id",
    "expiresAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## Security Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-jwt-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-min-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Password Security
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Features

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character
   - No common passwords
   - No sequential characters
   - No repeated characters

2. **Account Lockout:**
   - 5 failed attempts → 15-minute lockout
   - 4 failed attempts → 30-minute lockout
   - 3 failed attempts → 1-hour lockout
   - Progressive penalties

3. **Rate Limiting:**
   - Login: 5 attempts per 15 minutes
   - Token refresh: 20 attempts per 15 minutes
   - General API: 100 requests per 15 minutes

4. **Token Security:**
   - Access tokens: 15 minutes expiry
   - Refresh tokens: 7 days expiry
   - Secure HTTP-only cookies for refresh tokens
   - Token blacklisting on logout

## Usage Examples

### Protecting Routes

```typescript
import { authenticate, requirePermission } from '../middleware/auth';
import { requireSiteAdmin } from '../middleware/rbac';

// Require authentication
router.get('/profile', authenticate, getProfile);

// Require specific permission
router.post('/content', authenticate, requirePermission('content:create'), createContent);

// Require minimum role
router.delete('/users/:id', authenticate, requireSiteAdmin, deleteUser);

// Require site access
router.get('/sites/:siteId/dashboard', authenticate, requireSiteAccess, getDashboard);
```

### Checking Permissions

```typescript
import { hasPermission, getUserPermissions } from '../middleware/rbac';

// Check if user has permission
const canEditContent = hasPermission(user.role, 'content:update');

// Get all user permissions
const permissions = getUserPermissions(user.role, siteRole);
```

### Password Validation

```typescript
import { PasswordService } from '../services/password';

// Validate password strength
const validation = PasswordService.validatePasswordStrength(password);
if (!validation.isValid) {
  console.log('Password errors:', validation.errors);
}

// Hash password
const hashedPassword = await PasswordService.hashPassword(password);

// Verify password
const isValid = await PasswordService.verifyPassword(password, hashedPassword);
```

## Testing

Run the authentication service tests:

```bash
npx tsx src/test/auth.test.ts
```

This will test:
- JWT token generation and validation
- Password hashing and verification
- Password strength validation

## Best Practices

1. **Security:**
   - Always use HTTPS in production
   - Store secrets securely using environment variables
   - Regularly rotate JWT secrets
   - Monitor authentication logs for suspicious activity

2. **Performance:**
   - Implement proper session cleanup
   - Use Redis for session storage in production
   - Cache user permissions where appropriate

3. **User Experience:**
   - Provide clear error messages for authentication failures
   - Implement proper password reset functionality
   - Show remaining lockout time to users

4. **Monitoring:**
   - Log authentication events
   - Monitor failed login attempts
   - Track token refresh patterns
   - Alert on suspicious activity

## Error Codes

The authentication system uses standardized error codes:

- `TOKEN_REQUIRED` - Access token is required
- `TOKEN_EXPIRED` - Access token has expired
- `TOKEN_INVALID` - Access token is invalid
- `SESSION_INVALID` - Session is invalid or expired
- `ACCOUNT_LOCKED` - Account is temporarily locked
- `INSUFFICIENT_PRIVILEGES` - User lacks required permissions
- `SITE_ACCESS_DENIED` - User lacks access to specified site
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INVALID_CREDENTIALS` - Invalid email or password
- `ACCOUNT_INACTIVE` - User account is not active
- `EMAIL_NOT_VERIFIED` - Email address not verified

## Future Enhancements

1. **Multi-factor Authentication (MFA)**
2. **OAuth 2.0 / OpenID Connect integration**
3. **Social login providers**
4. **Advanced password policies**
5. **Session analytics and insights**
6. **Biometric authentication support**
7. **Device management and trust**
8. **Advanced threat detection**