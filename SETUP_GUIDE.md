# Google OAuth Setup Guide

This guide walks you through setting up Google Sign-In for House of Kendles using Supabase Authentication.

## Prerequisites

- A Supabase project (you should already have this)
- A Google Cloud Console account
- Access to your Supabase Dashboard

---

## Step 1: Enable Google Provider in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers** (in the left sidebar)
4. Find **Google** in the list of providers
5. Toggle it **ON**
6. Keep this page open – you'll need to paste credentials here later

---

## Step 2: Create Google OAuth Credentials

### 2.1 Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Select your existing project or create a new one:
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it (e.g., "House of Kendles")
   - Click "Create"

### 2.2 Enable Required APIs

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API" (or "Google Identity Services")
3. Click on it and press **Enable**

### 2.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have Google Workspace)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: House of Kendles
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. On the **Scopes** page, click **Add or Remove Scopes**:
   - Select `/auth/userinfo.email`
   - Select `/auth/userinfo.profile`
   - Click **Update**
7. Click **Save and Continue** through the remaining steps
8. If in testing mode, add your test email addresses

### 2.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application** as the application type
4. Give it a name (e.g., "House of Kendles Web App")
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for local development)
   - `https://your-domain.com` (for production)
6. Under **Authorized redirect URIs**, add:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
   
   > **Important**: Replace `YOUR_SUPABASE_PROJECT_ID` with your actual Supabase project reference ID.
   > You can find this in your Supabase Dashboard URL or in Project Settings.

7. Click **Create**
8. **Copy the Client ID and Client Secret** – you'll need these next

---

## Step 3: Configure Supabase with Google Credentials

1. Go back to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Google**
3. Paste your credentials:
   - **Client ID**: Paste the Client ID from Google
   - **Client Secret**: Paste the Client Secret from Google
4. Click **Save**

---

## Step 4: Configure Redirect URLs

### In Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set the **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (for production)
4. Click **Save**

---

## Step 5: Set Environment Variables

Create or update your `.env.local` file:

```bash
# Copy from your Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# The base URL of your site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, update `NEXT_PUBLIC_SITE_URL` to your actual domain.

---

## Step 6: Verify Database Function

Ensure the `get_or_create_customer()` function exists in your Supabase database. This function should:

1. Check if a customer with the current user's `auth.uid()` exists
2. If yes, return the existing customer
3. If no, create a new customer with:
   - `user_id` = `auth.uid()`
   - `email` = user's email from `auth.email()`
   - `name` = user's name from `auth.raw_user_meta_data->>'full_name'`

Example SQL function:

```sql
CREATE OR REPLACE FUNCTION get_or_create_customer()
RETURNS customers
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer customers;
BEGIN
  -- Try to find existing customer
  SELECT * INTO v_customer
  FROM customers
  WHERE user_id = auth.uid();
  
  -- If found, return it
  IF FOUND THEN
    RETURN v_customer;
  END IF;
  
  -- Create new customer
  INSERT INTO customers (
    user_id,
    email,
    name
  ) VALUES (
    auth.uid(),
    auth.email(),
    COALESCE(
      auth.raw_user_meta_data->>'full_name',
      auth.raw_user_meta_data->>'name',
      'Customer'
    )
  )
  RETURNING * INTO v_customer;
  
  RETURN v_customer;
END;
$$;
```

---

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/sign-in`

3. Click "Continue with Google"

4. Sign in with your Google account

5. You should be redirected back to the app and see:
   - Your avatar in the navbar
   - Your name in the dropdown menu

6. Check Supabase Dashboard → **Table Editor** → **customers**:
   - A new row should exist with your `user_id`, email, and name

---

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Make sure the redirect URI in Google Cloud Console matches exactly:
  `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

### "Error 400: redirect_uri_mismatch"
- Double-check all redirect URIs in Google Cloud Console
- Ensure no trailing slashes

### Customer record not created
- Check the `get_or_create_customer()` function exists
- Verify RLS policies allow the function to insert/select

### Signed in but no avatar shown
- The avatar comes from Google's profile picture
- Some accounts may not have a picture set

---

## Production Checklist

Before going live:

- [ ] Add production domain to Google OAuth authorized origins
- [ ] Add production callback URL to Google OAuth redirect URIs
- [ ] Add production URL to Supabase Authentication redirect URLs
- [ ] Update `NEXT_PUBLIC_SITE_URL` environment variable
- [ ] Publish OAuth consent screen (move from Testing to Production)
- [ ] Test the complete flow on production

---

## Security Notes

1. **Never expose** your Supabase service role key or Google Client Secret in client-side code
2. The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose – it's designed for client-side use
3. Always use HTTPS in production
4. Review and configure [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security) policies for your tables
