# 🚀 SETU AI - Quick Cheat Sheet for Hackathon

## 📝 One-Liner
"Setu AI makes lending money to friends and family stress-free with digital agreements, trust scores, and AI reminders."

---

## 🎯 The Problem (30 seconds)
"You lend $500 to your cousin. They promise to pay back in 2 months. 2 months pass... nothing. You feel awkward asking. Your cousin forgot. Relationship gets weird. This happens to millions of people every day."

---

## ✨ Our Solution (30 seconds)
"Setu AI creates digital lending agreements with:
- Automatic reminders (so you don't have to ask)
- Trust scores (keeps everyone accountable)
- Witnesses (adds credibility)
- AI mediation (handles awkward conversations)
- All transparent and stress-free!"

---

## 🛠️ Tech Stack (Quick Answer)
**Frontend:** Next.js 16 + React + TypeScript + Tailwind
**Backend:** Next.js API Routes + MongoDB + Mongoose
**Auth:** Firebase
**Email:** NodeMailer
**Deployment:** Vercel + MongoDB Atlas

---

## 🎨 Key Features (Memorize These!)

1. **Trust Score System**
   - Everyone starts at 100
   - Drops if payment is late
   - Visible to everyone
   - Builds accountability

2. **Witness System**
   - Third person verifies agreement
   - Doesn't see the amount (privacy!)
   - Adds credibility
   - Gets email to approve

3. **Automated Emails**
   - Agreement created → Email to borrower
   - Witness added → Email to witness
   - Witness approves → Email to lender
   - Payment due → Reminder to borrower

4. **Role-Based Access**
   - Lender: Can settle, send reminders
   - Borrower: Can view, upload proof
   - Witness: Can approve

5. **Real-Time Dashboard**
   - Shows money lent (green)
   - Shows money borrowed (orange)
   - Net balance
   - All agreements

---

## 📁 File Structure (Quick Map)

```
/app
  /page.tsx                    → Landing page
  /dashboard
    /page.tsx                  → Main dashboard
    /create/page.tsx           → Create agreement
    /agreement/[id]/page.tsx   → Agreement details
  /api
    /agreements/route.ts       → Create/fetch agreements
    /agreements/[id]/
      /route.ts                → Update agreement
      /approve-witness/route.ts → Witness approval
      /send-reminder/route.ts  → Send reminder

/models
  /User.ts                     → User schema
  /Agreement.ts                → Agreement schema
  /Notification.ts             → Notification schema

/lib
  /mongodb.ts                  → Database connection
  /email.ts                    → Email templates
  /utils.ts                    → Helper functions
```

---

## 🔄 User Flow (Quick Version)

**1. Sign Up**
User → Signup page → Firebase creates account → MongoDB saves user → Dashboard

**2. Create Agreement**
Lender → Fill form → API checks users exist → Save to DB → Send emails → Dashboard

**3. Witness Approves**
Witness → Gets email → Clicks link → Logs in → Clicks approve → Lender notified

**4. Send Reminder**
Lender → Clicks remind → API sends email → Borrower gets reminder

**5. Settle Agreement**
Lender → Clicks settle → Confirms → Status changes to "settled" → Everyone sees it

---

## 💡 Demo Script (2 Minutes)

**[0:00-0:15] Problem**
"Ever lent money to a friend and felt awkward asking for it back? That's what we're solving."

**[0:15-0:30] Solution**
"Setu AI creates digital agreements with trust scores, witnesses, and AI reminders."

**[0:30-1:30] Live Demo**
1. Show dashboard → "I lent $5000, borrowed $2000"
2. Create agreement → "Lending $500 to Sarah"
3. Show agreement → "Trust score 100, witness pending"
4. Show witness approval → "Mike approves, doesn't see amount"
5. Show settlement → "Sarah paid, I close it"

**[1:30-2:00] Impact**
"We make informal lending transparent and stress-free. No more awkward conversations!"

---

## 🎤 Judge Questions (Quick Answers)

**"How do you make money?"**
→ "Small fee per agreement, or premium features like AI calls and payment plans."

**"What if they don't pay?"**
→ "Trust score drops, making future borrowing harder. Social pressure works."

**"How is this different from Venmo?"**
→ "Venmo is instant payments. We're for lending over time with accountability."

**"Is it legally binding?"**
→ "No, we're for informal lending between people who trust each other."

**"What's your target market?"**
→ "Anyone who lends informally - families, friends, immigrant communities."

**"What's next?"**
→ "Real AI phone calls, payment plans, mobile app, multi-currency."

---

## 🏆 Key Achievements (Brag About These!)

✅ Full-stack app in 48 hours
✅ 100% TypeScript (type-safe)
✅ Real-time data (no dummy data)
✅ Automated email system
✅ Role-based access control
✅ Responsive design
✅ Clean, organized code
✅ 8 complete user flows

---

## 🎯 Unique Selling Points

1. **Trust Scores** → Accountability through reputation
2. **Witness System** → Adds credibility without seeing amount
3. **AI Mediation** → Handles awkward conversations
4. **Buffer Days** → Private grace period for lender
5. **Automated Everything** → Emails, reminders, notifications
6. **Privacy-First** → Witness doesn't see amount
7. **Real-Time** → Everything updates instantly

---

## 📊 Database Models (Quick Reference)

**User:**
- uid, name, email, phone, trustScore (100), createdAt

**Agreement:**
- lender info, borrower info, amount, dueDate, purpose
- witness info, witnessApproved, status, trustScore
- timeline, proofs, aiMessages

**Notification:**
- userId, type, title, description, read, agreementId

---

## 🔑 Environment Variables

```
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_FIREBASE_API_KEY=...
EMAIL_USER=jeelnandha52@gmail.com
EMAIL_PASSWORD=tvorftqslbbdyaof
NEXT_PUBLIC_APP_URL=https://...ngrok-free.dev
```

---

## 🚨 Common Mistakes to Avoid

❌ Don't say "it's like Venmo" (we're different!)
❌ Don't focus on code (focus on problem/solution)
❌ Don't show incomplete features
❌ Don't forget to mention trust scores
❌ Don't skip the witness system (it's unique!)

✅ DO tell a relatable story
✅ DO show live demo
✅ DO highlight unique features
✅ DO mention scalability
✅ DO show passion!

---

## 🎬 Opening Line Options

1. "Have you ever lent money to a friend and regretted it?"
2. "Raise your hand if you've lent money and never got it back."
3. "What if I told you there's a way to lend money without ruining friendships?"
4. "We're solving a $2 trillion problem - informal lending."

---

## 🎯 Closing Line Options

1. "Setu AI - bridging money and relationships."
2. "Making informal lending transparent, one agreement at a time."
3. "We're building the future of peer-to-peer finance."
4. "Thank you! Questions?"

---

## 📱 Quick Stats to Mention

- 🎯 Solves problem for millions of people
- 💰 Informal lending market: $2+ trillion globally
- 👥 Target: 500M+ people who lend informally
- ⚡ Built in 48 hours
- 🚀 Ready to scale

---

## 🎓 Technical Terms (If Asked)

**Next.js** → React framework for web apps
**MongoDB** → NoSQL database (flexible, fast)
**Firebase** → Authentication service (secure login)
**TypeScript** → JavaScript with type safety
**API Route** → Backend endpoint (like /api/agreements)
**Mongoose** → MongoDB helper (adds structure)
**NodeMailer** → Email sending library

---

## 💪 Confidence Boosters

✅ You built a REAL product
✅ It solves a REAL problem
✅ It's FULLY functional
✅ The code is CLEAN
✅ The UI is BEAUTIFUL
✅ You understand EVERY part
✅ You can EXPLAIN it simply

**You've got this! 🚀**

---

## 🎯 Last-Minute Checklist

Before demo:
- [ ] Test all flows
- [ ] Have test accounts ready
- [ ] Check internet connection
- [ ] Have backup screenshots
- [ ] Practice pitch 3 times
- [ ] Smile and breathe!

During demo:
- [ ] Start with problem
- [ ] Show solution
- [ ] Live demo
- [ ] Highlight unique features
- [ ] End with impact
- [ ] Thank judges

After demo:
- [ ] Answer questions confidently
- [ ] Don't apologize for anything
- [ ] Show passion
- [ ] Thank them again

---

**Remember: You're not just showing code, you're solving a real problem that affects millions of people. Be confident! 💪**

