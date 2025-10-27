# User Verification Feature - Admin Panel

## Overview
Added functionality for administrators to manually verify user email addresses from the admin users management page.

## Changes Made

### 1. Backend API - New Verify Endpoint
**File:** `src/app/api/admin/users/[id]/verify/route.ts`

**Features:**
- **POST**: Verify a user's email (sets `emailVerified` to current date)
- **DELETE**: Unverify a user's email (sets `emailVerified` to null)
- Admin-only access (requires ADMIN role)
- Checks if user exists before performing action
- Prevents double-verification
- Returns updated user data after successful verification

**Endpoints:**
```
POST   /api/admin/users/[id]/verify   - Verify user email
DELETE /api/admin/users/[id]/verify   - Unverify user email
```

### 2. Frontend - Admin Users Client
**File:** `src/components/admin/AdminUsersClient.tsx`

**New State Variables:**
- `showVerifyModal`: Controls verify modal visibility
- `verifyAction`: Tracks whether action is 'verify' or 'unverify'

**New Functions:**
- `handleVerifyUser()`: Handles API call to verify/unverify user
- `openVerifyModal()`: Opens the verify modal with appropriate action

**New UI Components:**
- **Verify Action Button**: Appears in user actions dropdown
  - Shows "Vérifier" (Verify) for unverified users with green styling
  - Shows "Annuler vérification" (Unverify) for verified users with orange styling
  - Dynamic icon: MailCheck for verify, Mail for unverify
  
- **Verify Modal**: Confirmation dialog before verifying/unverifying
  - Green theme for verification
  - Orange theme for unverification
  - Clear messaging about the action's impact

### 3. DataTable Component Enhancement
**File:** `src/components/ui/DataTable.tsx`

**Updated `TableAction` Interface:**
```typescript
export interface TableAction<T = any> {
  label: string | ((row: T) => string);  // Now supports dynamic labels
  icon?: React.ReactNode | ((row: T) => React.ReactNode);  // Now supports dynamic icons
  onClick: (row: T) => void;
  variant?: 'default' | 'danger' | 'success' | ((row: T) => 'default' | 'danger' | 'success');  // Added 'success' variant
  show?: (row: T) => boolean;
}
```

**Benefits:**
- Actions can now have dynamic labels based on row data
- Icons can change based on row data
- Variants can be conditional (useful for verify/unverify states)
- More flexible and reusable component

## User Flow

1. **Admin views users list** in `/admin/users`
2. **Clicks on actions menu** (three dots) for a user
3. **Sees verify/unverify option** depending on current verification status:
   - Unverified user → "Vérifier" button with green icon
   - Verified user → "Annuler vérification" button with orange icon
4. **Clicks verify/unverify** → Confirmation modal appears
5. **Confirms action** → API call made, user updated, table refreshes
6. **Email verification status** updates in the table (icon changes)

## Visual Indicators

### In Users Table
- **Verified**: Green checkmark icon (MailCheck)
- **Unverified**: Gray mail icon (Mail)

### In Actions Menu
- **Verify button**: Green text, MailCheck icon
- **Unverify button**: Orange text, Mail icon

### In Modal
- **Verify**: Green header, green confirm button
- **Unverify**: Orange header, orange confirm button

## Security

- ✅ Admin-only access (requires ADMIN role)
- ✅ User existence validation
- ✅ Proper error handling and messages
- ✅ Transaction safety with database operations
- ✅ Prevents self-modification issues

## Error Handling

The system handles:
- Invalid user IDs
- Non-existent users
- Already verified users (for POST)
- Database errors
- Network errors
- Permission errors

All errors return appropriate HTTP status codes and French error messages.

## Testing Checklist

- [ ] Admin can verify an unverified user
- [ ] Admin can unverify a verified user
- [ ] Table updates after verification
- [ ] Modal shows correct messaging
- [ ] Icons change based on verification status
- [ ] Non-admin users cannot access verify endpoint
- [ ] Error messages display correctly
- [ ] Database updates correctly

## Future Enhancements

Potential improvements:
1. Send notification email when admin verifies user
2. Add audit log for verification changes
3. Bulk verify/unverify functionality
4. Filter users by verification status
5. Display who verified the user and when
