# Mailjet Email Setup & Debugging Guide

## Problem
Emails are not being received even though Mailjet is accepting them (status shows success).

## Root Cause
Mailjet requires **domain verification** for the `FROM_EMAIL` address. Sending from an unverified email (like a Gmail account) may result in:
- Emails being queued but not delivered
- Emails going to spam
- Silent failures during development

## Solutions

### Solution 1: Use Mailjet's Verified Sandbox Domain (Quickest for Development)

1. Log in to [Mailjet Dashboard](https://app.mailjet.com)
2. Go to **Sender addresses & domains** (Settings > Senders & Domains)
3. Look for your **Sandbox** domain (usually something like `sandbox.mailjet.com` or similar)
4. Use this sandbox domain in `FROM_EMAIL` in `.env`:

```env
# In backend/.env
FROM_EMAIL=no-reply@sandbox.mailjet.com
```

This sandbox domain is pre-verified and will deliver emails immediately.

### Solution 2: Verify Your Own Domain

1. In Mailjet Dashboard, go to **Sender addresses & domains**
2. Click **Add a sender domain**
3. Enter your domain (e.g., `example.com`)
4. Follow the DNS verification instructions (add TXT/MX records)
5. Once verified, use it in `.env`:

```env
FROM_EMAIL=no-reply@example.com
```

### Solution 3: Use a Verified Email Address (if available)

If you already have a verified email in Mailjet:
1. Go to **Account settings > Sender addresses**
2. Add your email and verify it
3. Once verified, use it in `FROM_EMAIL`:

```env
FROM_EMAIL=your-verified-email@domain.com
```

### Solution 4: Use Console Logging for Development (No Email Setup Required)

If you just want to test locally without sending real emails:

1. Comment out or remove `MAILJET_API_KEY` and `MAILJET_SECRET` from `.env`
2. The system will automatically fall back to console logging
3. Reset tokens will be logged to the backend console/terminal
4. Copy the token from the logs and test manually

```env
# In backend/.env - comment these out
# MAILJET_API_KEY=...
# MAILJET_SECRET=...
```

## Recommended Development Setup

For **local development**, use **Solution 4** (console logging):

```env
# backend/.env
# ... other vars ...
# Leave MAILJET_API_KEY and MAILJET_SECRET empty or commented out
```

Then in the backend terminal, when you trigger forgot-password, you'll see:

```
--- Email (fallback) ---
To: user@example.com
Subject: KIET Traveller — Password Reset
Text: Reset your password: http://localhost:4028/reset-password?token=abc123def456...
HTML: <p>You requested a password reset...</p>
------------------------
```

Copy the token from the logs and manually visit:
```
http://localhost:4028/reset-password?token=abc123def456...
```

## For Production

Once you're ready for production:

1. Verify a production domain in Mailjet (or use an email service like AWS SES, SendGrid, etc.)
2. Update `FROM_EMAIL` to use the verified sender
3. Update `MAILJET_API_KEY` and `MAILJET_SECRET` with production credentials
4. Test with real email addresses

## Debugging Mailjet Issues

If emails still don't arrive:

1. Check Mailjet Activity Log:
   - Go to **Mailjet Dashboard > Activity Log**
   - Look for your sent emails
   - Check their delivery status (Sent, Opened, Bounced, Blocked, etc.)

2. Enable detailed logging in `backend/utils/email.js`:
   - The code already logs full Mailjet API responses
   - Check backend terminal for `Mailjet API response: {...}` output

3. Verify sender domain:
   - Mailjet will show warnings if sender is not verified
   - Always verify the sender domain before sending in production

## Testing Email Flow

### Using Console Logging (Local):
```bash
# 1. Edit backend/.env
MAILJET_API_KEY=      # Leave empty
MAILJET_SECRET=       # Leave empty

# 2. Start backend
cd backend
npm run dev

# 3. Go to frontend http://localhost:4028/forgot-password
# 4. Enter an email address
# 5. Check backend terminal for reset link in logs
# 6. Click the link or copy-paste into browser
```

### Using Mailjet (Production):
```bash
# 1. Edit backend/.env
MAILJET_API_KEY=your_api_key_from_dashboard
MAILJET_SECRET=your_secret_from_dashboard
FROM_EMAIL=no-reply@yourdomain.com   # Must be verified

# 2. Start backend
cd backend
npm run dev

# 3. Go to frontend http://localhost:4028/forgot-password
# 4. Enter your email
# 5. Check your inbox (and spam folder)
```

## Quick Checklist

- [ ] MAILJET_API_KEY is set correctly
- [ ] MAILJET_SECRET is set correctly
- [ ] FROM_EMAIL is a verified sender in Mailjet
- [ ] Backend is restarted after `.env` changes
- [ ] Check Mailjet Activity Log for delivery status
- [ ] Check spam/promotions folder if email doesn't appear
- [ ] For development, use console logging (leave keys empty)
