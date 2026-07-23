# AUTH_CURRENT_STATE.md

## Current Authentication State

### Backend (COMPLETE)
- Register: POST `/api/auth/register` - Creates user, returns tokens
- Login: POST `/api/auth/login` - Validates credentials, returns tokens
- Logout: POST `/api/auth/logout` - Revokes refresh tokens
- Refresh: POST `/api/auth/refresh` - Rotates tokens
- Forgot Password: POST `/api/auth/forgot-password` - Stub (no email)
- Reset Password: POST `/api/auth/reset-password` - Stub (accepts any token)
- Get Me: GET `/api/auth/me` - Returns current user

### Frontend (MOCKED)
- Login screen: Uses `setTimeout` to simulate API call
- Register screen: Uses `setTimeout` to simulate API call
- No real API calls made
- Mock tokens stored in SecureStore

### API Client
- Axios client configured with interceptors
- Token storage via SecureStore exists
- Refresh token interceptor exists
- **BUG**: Refresh interceptor reads `response.data.data` but backend returns `response.data`

### Token Storage
- SecureStore for access and refresh tokens
- Token retrieval and clearing functions exist

### Session Restoration
- `loadStoredAuth` checks for tokens in SecureStore
- Sets `isAuthenticated` if tokens exist
- Does NOT validate tokens against backend

### Route Protection
- **NONE** - All screens accessible without auth

### Issues Found
1. `endpoints.ts` has wrong paths for forgot-password and reset-password
2. Refresh interceptor reads wrong response path
3. No auth API service file exists
4. Login/register use mock implementations
5. No route guards
6. No React Query integration for auth
