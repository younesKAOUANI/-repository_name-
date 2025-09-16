# Authentication Architecture

## Overview

This Pharmapedia project uses a clean, layered authentication architecture with clear separation of concerns.

## Architecture Layers

### 1. **NextAuth Configuration** (`src/lib/auth.ts`)
- Handles the core authentication setup
- Configures providers, adapters, and callbacks
- Manages session strategy (JWT)
- **Purpose**: Authentication framework configuration only

### 2. **Auth Service** (`src/services/auth.service.ts`)
- Contains all authentication business logic
- Handles user registration, password management, profile updates
- Manages password resets, email changes, account deletion
- **Purpose**: Core authentication operations and user management

### 3. **API Routes** (`src/app/api/auth/`)
- REST endpoints for authentication operations
- Input validation and error handling
- Session management and authorization
- **Purpose**: HTTP interface for authentication operations

### 4. **Types** (`src/types/next-auth.d.ts`)
- TypeScript definitions for NextAuth
- Session and JWT type extensions
- **Purpose**: Type safety for authentication

## File Structure

```
src/
├── lib/
│   └── auth.ts                    # NextAuth configuration
├── services/
│   └── auth.service.ts            # Authentication business logic
├── app/api/auth/
│   ├── signup/route.ts           # User registration
│   ├── forgot-password/route.ts  # Password reset initiation
│   ├── reset-password/route.ts   # Password reset completion
│   ├── change-password/route.ts  # Password change (authenticated)
│   └── profile/route.ts          # Profile management
├── types/
│   └── next-auth.d.ts            # NextAuth type definitions
└── utils/
    └── validation.utils.ts        # Input validation utilities
```

## Services Responsibilities

### AuthService Methods

| Method | Purpose | Authentication Required |
|--------|---------|----------------------|
| `signUp()` | User registration | No |
| `verifyCredentials()` | Login validation | No |
| `forgotPassword()` | Password reset initiation | No |
| `resetPassword()` | Password reset with token | No |
| `changePassword()` | Change password | Yes |
| `changeEmail()` | Change email address | Yes |
| `verifyEmailChange()` | Confirm email change | No |
| `updateProfile()` | Update user profile | Yes |
| `deleteAccount()` | Delete user account | Yes |
| `getUserProfile()` | Get user profile | Yes |

## API Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|--------------|
| `/api/auth/signup` | POST | User registration | No |
| `/api/auth/forgot-password` | POST | Request password reset | No |
| `/api/auth/reset-password` | POST | Reset password with token | No |
| `/api/auth/change-password` | POST | Change password | Yes |
| `/api/auth/profile` | GET | Get user profile | Yes |
| `/api/auth/profile` | PUT | Update user profile | Yes |
| `/api/auth/profile` | DELETE | Delete account | Yes |

## Security Features

1. **Password Hashing**: Uses bcryptjs with salt rounds
2. **Token-based Password Reset**: Secure token generation for password resets
3. **Email Verification**: Pending email verification system
4. **Session Management**: JWT-based sessions via NextAuth
5. **Input Validation**: Comprehensive validation utilities
6. **Error Handling**: Secure error responses without information leakage

## Usage Examples

### Client-side Registration
```typescript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securepassword',
    role: 'student',
    year: 3,
    university: 'Medical University'
  })
});
```

### Server-side Session Check
```typescript
import { auth } from '@/lib/auth';

const session = await auth();
if (session?.user) {
  // User is authenticated
}
```

## Missing Dependencies

To complete the setup, install these packages:

```bash
npm install next-auth @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

## Database Requirements

The Prisma schema needs these additional fields for full functionality:

```prisma
model User {
  // ... existing fields
  password            String?
  resetToken          String?
  resetTokenExpiry    DateTime?
  pendingEmail        String?
  emailVerificationToken String?
  year                Int?
  university          String?
}
```

This architecture ensures clean separation of concerns while maintaining security and scalability.
