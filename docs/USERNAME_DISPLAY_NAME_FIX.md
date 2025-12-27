# Username & Display Name Fix

## Problem
When updating the display name in the profile, it would revert back to the original username from signup after signing out and back in. This was confusing and prevented users from customizing their display name.

## Root Causes

1. **Auth State Change Handler Overwriting Data**: The `onAuthStateChange` handler in `useAuth.ts` was overwriting both `username` and `display_name` every time a user signed in, using the metadata from signup.

2. **Database Trigger Issue**: The `handle_new_user()` trigger was looking for `full_name` in metadata instead of properly handling `username` and `display_name`.

3. **Unclear UX**: The distinction between username and display name wasn't clear to users.

## Solution

### Design Decision
We maintain **two separate fields** for future group/social features:

- **Username** (`@conner_contreras`): 
  - Unique identifier
  - Set once at signup
  - Cannot be changed (for now)
  - Used for mentions, URLs, and unique identification
  
- **Display Name** ("Conner Contreras"):
  - Friendly, human-readable name
  - Can be changed anytime
  - Shown prominently in UI
  - Used for visual identification

### Code Changes

#### 1. Fixed Auth State Change Handler (`src/hooks/useAuth.ts`)

**Before**: Always overwrote both fields on sign-in
```typescript
if (metadata?.username) {
  await supabase.from('profiles').update({
    username: metadata.username,
    display_name: metadata.display_name || metadata.username,
  }).eq('id', session.user.id)
}
```

**After**: Only updates if username is not already set, preserves existing display_name
```typescript
if (metadata?.username) {
  const existingProfile = await fetchProfile(session.user.id)
  
  if (!existingProfile?.username) {
    await supabase.from('profiles').update({
      username: metadata.username,
      display_name: existingProfile?.display_name || metadata.display_name || metadata.username,
    }).eq('id', session.user.id)
  }
}
```

#### 2. Fixed Database Trigger (`supabase/migrations/006_fix_profile_creation.sql`)

**Before**: Only set display_name from full_name
```sql
INSERT INTO public.profiles (id, display_name)
VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
```

**After**: Properly handles username and display_name with fallbacks
```sql
INSERT INTO public.profiles (id, username, display_name)
VALUES (
  NEW.id,
  NEW.raw_user_meta_data->>'username',
  COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name'
  )
);
```

#### 3. Improved Profile Edit UI (`src/pages/Profile.tsx`)

- Shows username as read-only with explanation "(set at enlistment)"
- Display name is clearly editable
- Added helpful hint: "This is how your name appears to other soldiers"
- Only updates display_name, not username

## Migration Steps

### 1. Run Database Migration

In your Supabase SQL Editor, run:

```sql
-- Migration: Fix Profile Creation
-- Updates the handle_new_user trigger to properly set username and display_name

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'full_name'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Deploy Code Changes

The code changes are already in place:
- `src/hooks/useAuth.ts` - Fixed auth state handler
- `src/pages/Profile.tsx` - Improved UI
- `src/components/profile/ProfileHeader.tsx` - Added clarifying comments

### 3. Test

1. Update your display name in the profile page
2. Click "SAVE CHANGES"
3. Sign out
4. Sign back in
5. Verify your display name persists (not reverted to username)

## Future Enhancements

- Allow username changes (with uniqueness validation)
- Add username availability checker during signup
- Show username in more places (group mentions, etc.)
- Add profile search by username or display name

