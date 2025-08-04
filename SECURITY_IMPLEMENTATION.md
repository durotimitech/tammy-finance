# Trading 212 API Key Encryption Security Implementation

## Overview

This document describes the security measures implemented for protecting Trading 212 API keys in the Net Worth Tracker application.

## Security Measures Implemented

### 1. Client-Side Encryption (E2E Encryption)

- API keys are encrypted on the client-side using the Web Crypto API before transmission
- Uses AES-256-GCM encryption algorithm (military-grade encryption)
- Encryption parameters:
  - Key length: 256 bits
  - IV length: 96 bits (12 bytes)
  - Salt length: 256 bits (32 bytes)
  - PBKDF2 iterations: 100,000 rounds
  - Authentication tag: 128 bits (16 bytes)

### 2. Unique Encryption Keys Per User

- Each encryption uses a unique password derived from:
  - User ID (ensures user isolation)
  - Timestamp (ensures each encryption is unique)
  - Combined with a client-side suffix

### 3. Protection Against Common Attacks

#### Man-in-the-Middle (MITM) Attacks

- API keys are encrypted before leaving the browser
- Even if HTTPS is compromised, the payload remains encrypted
- Server never receives plain-text API keys during storage

#### Database Breaches

- API keys are stored encrypted in the database
- Each user's data is encrypted with unique keys
- Database compromise doesn't expose plain-text API keys

#### Cross-Site Scripting (XSS)

- Encryption happens immediately when user submits the form
- API keys are not stored in browser localStorage or sessionStorage
- Minimal exposure window for plain-text data

### 4. Browser Compatibility Checks

- Application verifies Web Crypto API support before allowing encryption
- Graceful error handling for unsupported browsers
- Clear user messaging about browser requirements

### 5. Secure Data Flow

1. User enters API key in password-type input field
2. On submission, key is immediately encrypted in the browser
3. Only encrypted payload is sent to the server
4. Server stores encrypted data with metadata (salt, IV, auth tag)
5. When needed, server decrypts the key server-side for API calls
6. Decrypted keys are never sent back to the client

### 6. Authentication & Authorization

- All credential operations require authenticated users
- Row Level Security (RLS) ensures users can only access their own credentials
- Server-side validation of user authentication before any operations

### 7. Testing & Validation

- Comprehensive test suite for encryption/decryption flow
- Tests for edge cases (unsupported browsers, authentication failures)
- Validation of encrypted payload structure

## Implementation Files

- **Client-side encryption**: `/src/lib/crypto/client.ts`
- **Server-side decryption**: `/src/lib/crypto.ts`
- **Modal component**: `/src/components/Settings/Trading212ConnectionModal.tsx`
- **API routes**: `/src/app/api/credentials/route.ts`, `/src/app/api/credentials/[name]/route.ts`
- **Tests**: `/src/components/Settings/Trading212ConnectionModal.test.tsx`, `/src/lib/crypto/client.test.ts`

## Future Enhancements

1. Consider implementing key rotation mechanisms
2. Add rate limiting for credential operations
3. Implement audit logging for credential access
4. Consider hardware security module (HSM) integration for enterprise deployments

## Compliance Notes

This implementation follows industry best practices for handling sensitive API credentials and aligns with:

- OWASP guidelines for cryptographic storage
- PCI DSS requirements for encryption at rest
- GDPR requirements for data protection
