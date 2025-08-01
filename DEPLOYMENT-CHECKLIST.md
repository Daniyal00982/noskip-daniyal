# 🚀 Vercel Deployment Checklist - Step by Step

## ✅ **Step 1: Database Setup (Required First)**

### **Option A: Neon Database (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub/Google
3. Create new project "noskip-production" 
4. Copy the DATABASE_URL (looks like):
   ```
   postgresql://username:password@ep-xxxx.us-east-1.aws.neon.tech/neondb
   ```

### **Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Settings → Database → Connection string → Copy

---

## ✅ **Step 2: Vercel Deployment**

### **A. Connect to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select your "noskip" repository
5. Click "Import"

### **B. Configure Environment Variables**
In the deployment screen, add these variables:

```env
DATABASE_URL=postgresql://username:password@ep-xxxx.us-east-1.aws.neon.tech/neondb
OPENAI_API_KEY=sk-your-openai-key-here
SESSION_SECRET=any-random-string-here
NODE_ENV=production
```

### **C. Deploy**
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://noskip-xxx.vercel.app`

---

## ✅ **Step 3: Database Schema Setup**

After successful deployment, run this command locally:
```bash
npx drizzle-kit push
```

This creates all the necessary tables in your production database.

---

## ✅ **Step 4: Test Your Deployment**

### **Test URLs:**
1. **Frontend:** `https://your-app.vercel.app`
2. **API Health:** `https://your-app.vercel.app/api`
3. **Goals API:** `https://your-app.vercel.app/api/goals`

### **Test Flow:**
1. Open your app URL
2. Create a new goal
3. Mark a day complete
4. Check if streak updates

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Build Fails**
- Solution: Vercel auto-detects our `vercel.json` config
- If needed, manually set build command to: `node build-vercel.js`

### **Issue 2: Database Connection Error**
- Check DATABASE_URL format is correct
- Ensure database allows external connections
- Verify environment variable is saved

### **Issue 3: API Routes Not Working**
- Check function logs in Vercel dashboard
- Verify CORS headers in browser network tab
- Environment variables must be added and deployment rerun

### **Issue 4: Missing Environment Variables**
- Go to Vercel dashboard → Settings → Environment Variables
- Add missing variables
- Redeploy (automatic after saving variables)

---

## 📊 **Post-Deployment**

### **Monitoring:**
- Vercel Dashboard → Functions tab for logs
- Analytics tab for performance metrics
- Deployments tab for deployment history

### **Custom Domain (Optional):**
1. Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown

### **Team Access (Optional):**
1. Settings → General → Team Members
2. Invite team members if needed

---

## 🎯 **Success Indicators**

Your deployment is successful when:
- [ ] Frontend loads without errors
- [ ] You can create a new goal
- [ ] Goal appears in dashboard
- [ ] You can mark day complete
- [ ] Streak counter updates
- [ ] No console errors in browser

---

## 📞 **Need Help?**

If you face any issues:
1. Check Vercel function logs in dashboard
2. Verify all environment variables are set
3. Test database connection string separately
4. Check browser console for frontend errors

**Your Noskip app should be live and working perfectly on Vercel!** 🎉