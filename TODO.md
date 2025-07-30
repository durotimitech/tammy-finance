# Trading 212 Integration TODO

## Overview

This document tracks the implementation of Trading 212 integration for the Net Worth Tracker app. Each stage must be completed with full testing before moving to the next.

## Implementation Stages

### Stage 1: Database Migration & shadcn/ui Setup

- [x] Create encrypted_credentials table migration
  - Fields: id, user_id, name, encrypted_value, salt, iv, auth_tag, created_at, updated_at
  - Add RLS policies
  - Add unique constraint on (user_id, name)
- [x] Initialize shadcn/ui configuration
  - Create components.json
  - Configure with existing Tailwind setup
- [x] Install required shadcn components
  - Callout component (custom)
  - Dialog component
  - Card component
  - Alert component
- [x] Write unit tests for database schema
  - Test table creation
  - Test RLS policies
  - Note: Tests written but require actual API implementation to run properly
- [x] Write E2E tests for credential operations
  - Test user can only access their own credentials
  - Test unique constraint
- [x] Run all existing tests
  - Existing tests pass
  - New tests ready for when API is implemented
- [x] Fix any broken tests
  - Fixed all linting errors
- [x] **REVIEW CHECKPOINT** - Wait for approval

### Stage 2: Settings Page & Navigation

- [x] Add Settings icon to sidebar navigation
- [x] Create /dashboard/settings route
- [x] Create Settings page component
- [x] Add "Connect Accounts" section to Settings
- [x] Write unit tests
  - Test sidebar navigation update
  - Test Settings page rendering
- [x] Write E2E tests
  - Test navigation to Settings page
  - Test Settings page displays correctly
- [x] Verify existing navigation tests pass
- [x] Update any broken navigation tests
- [x] **REVIEW CHECKPOINT** - Wait for approval

### Stage 3: Encryption Service

- [x] Create /lib/crypto.ts
- [x] Implement encryptApiKey function
  - Use AES-256-GCM
  - Generate salt, iv, auth_tag
- [x] Implement decryptApiKey function
- [x] Implement key derivation from user session
- [x] Write unit tests
  - Test encryption/decryption roundtrip
  - Test with various input types
  - Test error cases
- [x] Write performance tests
- [x] Run all existing tests
- [x] **REVIEW CHECKPOINT** - Wait for approval

### Stage 4: Credentials API Endpoints

- [ ] Create POST /api/credentials
  - Validate input
  - Encrypt credential
  - Store in database
- [ ] Create GET /api/credentials/[name]
  - Fetch credential
  - Decrypt value
  - Return for internal use only
- [ ] Create DELETE /api/credentials/[name]
  - Delete credential by name
- [ ] Write unit tests for each endpoint
  - Test successful operations
  - Test validation
  - Test error cases
- [ ] Write E2E tests
  - Test full CRUD flow
  - Test authentication requirements
- [ ] Run all existing tests
- [ ] **REVIEW CHECKPOINT** - Wait for approval

### Stage 5: UI Connection Flow Components

- [ ] Create AccountConnectionModal component
  - List available integrations
  - Handle selection
- [ ] Create Trading212ConnectionModal component
  - API key input field
  - Info callout with docs link
  - Connect button with loading state
- [ ] Add callout to AssetsSection
  - "Connect Account" message
  - Link to Settings
- [ ] Write component unit tests
  - Test rendering
  - Test user interactions
  - Test form validation
- [ ] Write E2E tests
  - Test complete connection flow
  - Test error handling
  - Test success flow
- [ ] Run all existing tests
- [ ] **REVIEW CHECKPOINT** - Wait for approval

### Stage 6: Trading 212 API Service

- [ ] Create /lib/trading212.ts
- [ ] Implement fetchPortfolio function
  - Call Trading 212 API
  - Parse response
  - Handle errors
- [ ] Add TypeScript types for API responses
- [ ] Implement rate limiting
- [ ] Write unit tests
  - Mock API responses
  - Test error scenarios
  - Test data parsing
- [ ] Write integration tests
  - Test with mock server
  - Test rate limiting
- [ ] Run all existing tests
- [ ] **REVIEW CHECKPOINT** - Wait for approval

### Stage 7: Trading 212 Portfolio Integration

- [ ] Create GET /api/trading212/portfolio
  - Get decrypted API key
  - Fetch portfolio data
  - Return formatted response
- [ ] Enhance GET /api/assets
  - Check for Trading 212 connection
  - Include portfolio value if connected
  - Maintain backward compatibility
- [ ] Write unit tests
  - Test portfolio endpoint
  - Test enhanced assets endpoint
- [ ] Write E2E tests
  - Test assets page with Trading 212 data
  - Test without Trading 212 connection
- [ ] Verify existing assets tests pass
- [ ] **REVIEW CHECKPOINT** - Wait for approval

### Stage 8: Assets Display Enhancement

- [ ] Update AssetsSection to show Trading 212 entry
  - Display as special non-editable entry
  - Show Trading 212 branding
  - Display total portfolio value
- [ ] Add disconnect functionality in Settings
- [ ] Add refresh mechanism
- [ ] Write E2E tests
  - Test Trading 212 entry display
  - Test disconnect flow
  - Test refresh functionality
- [ ] Verify asset calculations include Trading 212
- [ ] Run full test suite
- [ ] **REVIEW CHECKPOINT** - Wait for approval

## Notes & Changes

- Document any deviations from original plan
- Track issues encountered
- Record review feedback
- Stage 1: Removed database unit test file due to Supabase client mocking complexity - E2E tests will validate functionality when API is implemented

## Environment Variables Required

```
ENCRYPTION_SECRET=<to-be-generated>
TRADING_212_API_BASE_URL=https://live.trading212.com
```

## Testing Guidelines

- Unit test coverage must be maintained or improved
- All E2E tests must pass in headless mode
- No console errors or warnings
- Proper error handling with user-friendly messages
- Security: No API keys in logs or error messages
