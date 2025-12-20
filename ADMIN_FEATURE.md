# Admin Users Feature

This document describes the admin users feature that allows admin users to view all users and their data.

## What Was Implemented

### 1. Backend (Already Existed)
The backend already had admin endpoints in place:
- `GET /api/v1/admin/accounts/:account_id/users` - List all users for an account
- `GET /api/v1/admin/users/:user_id/data` - Get detailed user data including events and sessions
- `GET /api/v1/admin/projects` - Get all projects (admin only)
- `GET /api/v1/admin/events` - Get all events (admin only)
- `PUT /api/v1/admin/accounts/:account_id/admin` - Toggle admin status for an account

These endpoints are protected by:
- `authMiddleware` - Validates JWT token
- `adminMiddleware` - Checks if user is admin

### 2. Frontend Changes

#### Authentication Updates
- **Updated `lib/auth-options.ts`**: Added `isAdmin` field to session and token
- **Updated `types/next-auth.d.ts`**: Added `isAdmin` to Session, User, and JWT interfaces
- **Updated `lib/services/auth.ts`**: Added `isAdmin` to AuthUser interface

#### Admin Service
- **Created `lib/services/admin.ts`**: New service for admin endpoints
  - `getAccountUsers(accountId)` - Fetch all users for an account
  - `getUserData(userId)` - Fetch detailed user data
  - `getAllProjects()` - Fetch all projects
  - `getAllEvents(limit, offset)` - Fetch all events
  - `toggleAdminStatus(accountId, isAdmin)` - Toggle admin status

- **Updated `lib/api.ts`**: Exported admin service
- **Updated `lib/types.ts`**: Exported admin types (AdminUser, UserEventData)

#### Admin Users Page
- **Created `app/dashboard/admin/users/page.tsx`**: New admin page with:
  - List of all users in a table (email, user ID, account ID, created date)
  - "View Data" button for each user
  - Modal dialog showing detailed user data:
    - Total events, total sessions, event types count
    - Event breakdown by type
    - Recent events (last 100)
    - Session information
  - Access control: Redirects non-admin users to dashboard
  - Loading states and error handling

#### Navigation Updates
- **Updated `components/dashboard-sidebar.tsx`**:
  - Added "Admin" section to navigation (only visible to admin users)
  - Added "Admin - Users" menu item with Shield icon
  - Conditionally renders based on `session.isAdmin`

## How to Use

### Making a User an Admin

#### Option 1: Direct Database Update
```sql
UPDATE accounts SET is_admin = true WHERE email = 'admin@example.com';
```

#### Option 2: Using the Admin API (if you already have an admin)
```bash
curl -X PUT http://localhost:8080/api/v1/admin/accounts/{account_id}/admin \
  -H "Authorization: Bearer {admin_jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{"is_admin": true}'
```

### Accessing the Admin Page

1. Log in with an admin account
2. Look for the "Admin" section at the bottom of the sidebar
3. Click "Admin - Users" to view all users
4. Click "View Data" on any user to see their detailed analytics

## Data Displayed

For each user, the admin page shows:

### Summary Metrics
- **Total Events**: Total number of events tracked for the user
- **Total Sessions**: Number of unique sessions
- **Event Types**: Number of distinct event types

### Event Breakdown
- List of all event types with their count
- Sorted by count (most frequent first)

### Recent Events
- Last 100 events for the user
- Shows: Event type, timestamp, properties (truncated)

### Sessions
- All sessions with event counts
- Shows first 10 sessions, with indication if more exist
- Session ID and event count per session

## Security

- All admin endpoints require:
  1. Valid JWT token (authenticated user)
  2. `is_admin = true` in the account record
- Non-admin users attempting to access admin pages are redirected to the main dashboard
- Admin status is checked both client-side (for UI) and server-side (for API calls)

## Future Enhancements

Potential improvements:
- Pagination for large user lists
- Search and filter users
- Export user data to CSV/JSON
- User analytics dashboard (charts, graphs)
- Bulk operations (export multiple users)
- User impersonation for debugging
- Account management (suspend, delete users)
- Admin activity logs
