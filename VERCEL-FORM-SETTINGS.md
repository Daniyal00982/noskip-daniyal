# 🎯 Vercel Form - Exact Settings

## **Build Command को Change करें:**

**Current:** `node build-vercel.js`
**Change to:** `npx vite build --config vite.config.vercel.ts`

**यह exact command edit field में paste करें:**
```
npx vite build --config vite.config.vercel.ts
```

---

## **Other Settings (Already Correct):**
- ✅ **Output Directory:** `dist/public` 
- ✅ **Install Command:** `npm install`

---

## **Environment Variables (Most Important):**
Click on "Environment Variables" section और add करें:

```
Name: DATABASE_URL
Value: postgresql://username:password@ep-xxxx.us-east-1.aws.neon.tech/neondb

Name: OPENAI_API_KEY  
Value: sk-your-openai-key-here

Name: SESSION_SECRET
Value: noskip_production_secret_2025

Name: NODE_ENV
Value: production
```

---

## **Fix Steps:**
1. Edit Build Command field
2. Replace with: `npx vite build --config vite.config.vercel.ts`
3. Add Environment Variables (4 variables)
4. Click Deploy

**यह change करते ही build successful हो जाएगा!**