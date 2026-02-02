# Ngrok Setup Guide for Setu Project

## Current Status
Your project already has ngrok configured, but the URL might be expired or not running.

**Current ngrok URL in config:**
```
https://unlocomotive-unthreateningly-arlena.ngrok-free.dev
```

---

## How to Start Ngrok and Link to Setu

### Step 1: Start Your Development Server
```bash
npm run dev
```
This should start on `http://localhost:3000`

### Step 2: Start Ngrok Tunnel
Open a **NEW terminal window** and run:

```bash
ngrok http 3000
```

Or if you have ngrok installed via npm:
```bash
npx ngrok http 3000
```

### Step 3: Get Your New Ngrok URL
After running ngrok, you'll see output like:
```
Forwarding   https://abc-def-ghi.ngrok-free.dev -> http://localhost:3000
```

Copy the HTTPS URL (e.g., `https://abc-def-ghi.ngrok-free.dev`)

### Step 4: Update Environment Variables
Update both `.env` and `.env.local` files:

**In `.env`:**
```env
NEXT_PUBLIC_APP_URL=https://YOUR-NEW-NGROK-URL.ngrok-free.dev
```

**In `.env.local`:**
```env
NEXT_PUBLIC_APP_URL=https://YOUR-NEW-NGROK-URL.ngrok-free.dev
```

### Step 5: Update Next.js Config
Edit `next.config.mjs`:

```javascript
experimental: {
  allowedDevOrigins: [
    'YOUR-NEW-NGROK-URL.ngrok-free.dev',  // Update this line
  ],
}
```

### Step 6: Restart Your Dev Server
1. Stop the dev server (Ctrl+C)
2. Start it again: `npm run dev`

---

## Quick Command Reference

### Option 1: Using npx (Recommended)
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start ngrok
npx ngrok http 3000
```

### Option 2: Using global ngrok
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000
```

### Option 3: With custom domain (if you have ngrok account)
```bash
ngrok http 3000 --domain=your-custom-domain.ngrok-free.app
```

---

## Why Ngrok is Needed

Ngrok is required for:

1. **Email Links** - So users can click email links and access the live app
2. **Webhook Callbacks** - For VAPI AI calls and Make.com webhooks
3. **External Access** - Testing from mobile devices or sharing with others
4. **Firebase Redirects** - For authentication callbacks

---

## Troubleshooting

### Issue: "ngrok not found"
**Solution:** Install ngrok
```bash
npm install ngrok
```

### Issue: "Tunnel not found"
**Solution:** Ngrok tunnel expired (free tier expires after 2 hours)
- Restart ngrok
- Update the new URL in `.env` files
- Restart dev server

### Issue: "ERR_NGROK_108"
**Solution:** Port 3000 is not running
- Make sure `npm run dev` is running first
- Then start ngrok

### Issue: Email links still use old URL
**Solution:** 
1. Update `NEXT_PUBLIC_APP_URL` in both `.env` files
2. Restart dev server
3. Test with: `http://localhost:3000/api/test-app-url`

---

## Verification Steps

### 1. Check if ngrok is running
Visit your ngrok URL in browser - should show your Setu app

### 2. Check environment variable
```bash
# Visit this in browser:
http://localhost:3000/api/test-app-url

# Should return:
{
  "appUrl": "https://your-ngrok-url.ngrok-free.dev",
  "message": "This is the URL that will be used in emails"
}
```

### 3. Test email links
- Create a test agreement
- Check the email
- Click "View Agreement" button
- Should open ngrok URL (not localhost)

---

## Keeping Ngrok Running

### Free Tier Limitations:
- Tunnel expires after 2 hours of inactivity
- Random URL each time (unless you have paid account)
- Need to restart and update URLs frequently

### Paid Tier Benefits:
- Custom domain (e.g., `setu.ngrok.app`)
- Tunnel stays alive longer
- No need to update URLs constantly

---

## Alternative: Use Ngrok Authtoken

If you have an ngrok account:

### 1. Get your authtoken
Visit: https://dashboard.ngrok.com/get-started/your-authtoken

### 2. Set authtoken
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### 3. Use reserved domain (if available)
```bash
ngrok http 3000 --domain=your-reserved-domain.ngrok-free.app
```

---

## Current Project Configuration

### Files that use NEXT_PUBLIC_APP_URL:
- `lib/email.ts` - Email link generation
- `app/api/test-app-url/route.ts` - URL verification
- All email templates

### Files that need ngrok domain:
- `.env`
- `.env.local`
- `next.config.mjs`

---

## Quick Fix Script

Create a file `update-ngrok.sh`:

```bash
#!/bin/bash
# Get new ngrok URL from user
echo "Enter your new ngrok URL (e.g., https://abc-123.ngrok-free.dev):"
read NGROK_URL

# Update .env
sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$NGROK_URL|g" .env

# Update .env.local
sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$NGROK_URL|g" .env.local

echo "✅ Updated .env files with: $NGROK_URL"
echo "⚠️  Don't forget to update next.config.mjs manually!"
echo "⚠️  Restart your dev server: npm run dev"
```

Make it executable:
```bash
chmod +x update-ngrok.sh
```

Run it:
```bash
./update-ngrok.sh
```

---

## Summary

**To link ngrok to Setu project:**

1. ✅ Start dev server: `npm run dev`
2. ✅ Start ngrok: `npx ngrok http 3000`
3. ✅ Copy the HTTPS URL
4. ✅ Update `.env` and `.env.local` with new URL
5. ✅ Update `next.config.mjs` with new domain
6. ✅ Restart dev server
7. ✅ Test: Visit `/api/test-app-url`

**Your ngrok is now linked to Setu! 🎉**
