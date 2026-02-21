# 🎯 SETU AI - Complete Project Explanation (Simple Language)

## 📖 Table of Contents
1. [What is Setu AI?](#what-is-setu-ai)
2. [The Problem We're Solving](#the-problem)
3. [Tech Stack (Technologies Used)](#tech-stack)
4. [Project Architecture](#architecture)
5. [File Structure Explained](#file-structure)
6. [How Everything Works Together](#how-it-works)
7. [Key Features Explained](#features)
8. [Database Models](#database)
9. [API Routes Explained](#api-routes)
10. [User Journey](#user-journey)

---

## 🎯 What is Setu AI?

**Simple Explanation:**
Imagine you lend $500 to your friend or family member. Usually, it's awkward to ask for your money back, right? Setu AI solves this problem!

**What it does:**
- Creates a digital agreement when you lend money
- Tracks who owes what to whom
- Sends automatic reminders (so you don't have to be the bad guy)
- Uses AI calling feature to handle awkward conversations
- Keeps a "trust score" for everyone
- Lets you add a witness (like a mutual friend) to make it official

**Why "Setu"?**
"Setu" means "bridge" in Hindi - we're building a bridge between money and relationships!

---

## 🔥 The Problem We're Solving

**Real-Life Scenario:**
1. Your cousin needs $1000 for rent
2. You lend it to them
3. They promise to pay back in 2 months
4. 2 months pass... nothing
5. You feel awkward asking for your money
6. Your cousin forgot or is avoiding you
7. Relationship gets weird

**Our Solution:**
1. Create agreement on Setu AI
2. Both parties get email confirmation
3. App tracks the due date
4. AI sends polite reminders automatically
5. Trust score keeps everyone accountable
6. Witness adds extra credibility
7. AI Calls on behalf of the money lender asking for money politely

---


## 🛠️ Tech Stack (Technologies Used)

### Frontend (What Users See)
**Next.js 16** - Think of this as the framework that builds our website
- **What it does:** Creates all the pages users see
- **Why we use it:** Fast, modern, and great for building web apps
- **Simple analogy:** Like the blueprint and construction crew for a house

**React 19** - The UI library
- **What it does:** Makes interactive buttons, forms, and dynamic content
- **Why we use it:** Makes the website feel smooth and responsive
- **Simple analogy:** Like the furniture and decorations that make the house livable

**TypeScript** - JavaScript with superpowers
- **What it does:** Helps us write code with fewer bugs
- **Why we use it:** Catches mistakes before they become problems
- **Simple analogy:** Like spell-check for code

**Tailwind CSS** - Styling framework
- **What it does:** Makes everything look pretty and professional
- **Why we use it:** Fast way to design beautiful interfaces
- **Simple analogy:** Like having a professional interior designer

### Backend (Behind the Scenes)
**MongoDB** - Our database
- **What it does:** Stores all the data (users, agreements, notifications)
- **Why we use it:** Flexible, fast, and perfect for our needs
- **Simple analogy:** Like a giant filing cabinet that never loses anything

**Mongoose** - Database helper
- **What it does:** Makes it easier to work with MongoDB
- **Why we use it:** Organizes our data neatly
- **Simple analogy:** Like labels on filing cabinet drawers

**Firebase Authentication** - Login system
- **What it does:** Handles user sign-up and sign-in
- **Why we use it:** Secure, reliable, and easy to use
- **Simple analogy:** Like a security guard at the entrance

**NodeMailer** - Email service
- **What it does:** Sends automated emails to users
- **Why we use it:** Keeps everyone informed automatically
- **Simple analogy:** Like having a personal assistant who sends emails for you

### UI Components
**Radix UI** - Pre-built components
- **What it does:** Provides buttons, dialogs, menus, etc.
- **Why we use it:** Professional, accessible, and saves time
- **Simple analogy:** Like buying furniture from IKEA instead of building from scratch

**Lucide React** - Icons
- **What it does:** Provides all the little icons you see (arrows, users, etc.)
- **Why we use it:** Makes the UI intuitive and pretty
- **Simple analogy:** Like road signs that help you navigate

---


## 🏗️ Project Architecture (How Everything Connects)

### The Big Picture

```
USER (Browser)
    ↓
FRONTEND (Next.js Pages)
    ↓
API ROUTES (Backend Logic)
    ↓
DATABASE (MongoDB)
    ↓
EMAIL SERVICE (NodeMailer)
```

### Simple Explanation:

1. **User opens website** → Sees beautiful pages (Frontend)
2. **User clicks button** → Request goes to API (Backend)
3. **API processes request** → Talks to database
4. **Database saves/retrieves data** → Sends back to API
5. **API sends response** → Frontend updates what user sees
6. **If needed** → Email service sends notifications

### Real Example: Creating an Agreement

1. **You fill out form** (Frontend: create/page.tsx)
2. **Click "Create Agreement"** (Frontend sends data)
3. **API receives request** (Backend: /api/agreements/route.ts)
4. **API checks if borrower exists** (Database query)
5. **API creates agreement** (Saves to MongoDB)
6. **API sends emails** (NodeMailer sends to borrower & witness)
7. **API responds "Success!"** (Frontend shows confirmation)
8. **You see dashboard updated** (Frontend refreshes data)

---


## 📁 File Structure Explained (What Each Folder Does)

### Root Level Files

**`.env` and `.env.local`**
- **What:** Secret configuration files
- **Contains:** Database passwords, email credentials, API keys
- **Why:** Keeps sensitive information private
- **Analogy:** Like your house keys - you don't share them publicly

**`package.json`**
- **What:** List of all tools/libraries we use
- **Contains:** Dependencies (like React, Next.js, MongoDB)
- **Why:** Tells the computer what to install
- **Analogy:** Like a shopping list for building the app

**`firebase.ts`**
- **What:** Connects to Firebase for authentication
- **Does:** Sets up login/signup system
- **Why:** Handles user accounts securely
- **Analogy:** Like setting up the lock system for your house

**`next.config.mjs`**
- **What:** Configuration for Next.js
- **Does:** Tells Next.js how to behave
- **Why:** Customizes the framework for our needs
- **Analogy:** Like settings on your phone

### `/app` Folder - All the Pages

**`/app/page.tsx`** - Landing Page
- **What:** First page visitors see
- **Shows:** Hero section, features, "Get Started" button
- **Purpose:** Convince people to sign up
- **Analogy:** Like the storefront window

**`/app/layout.tsx`** - Main Layout
- **What:** Wrapper for all pages
- **Contains:** HTML structure, fonts, metadata
- **Purpose:** Consistent look across all pages
- **Analogy:** Like the frame of a house

**`/app/auth/signin/page.tsx`** - Sign In Page
- **What:** Login page
- **Shows:** Email/password form
- **Purpose:** Let existing users log in
- **Analogy:** Like the front door with a lock

**`/app/auth/signup/page.tsx`** - Sign Up Page
- **What:** Registration page
- **Shows:** Create account form
- **Purpose:** Let new users join
- **Analogy:** Like getting keys to a new apartment

**`/app/dashboard/page.tsx`** - Main Dashboard
- **What:** Home screen after login
- **Shows:** 
  - Money you lent (green)
  - Money you borrowed (orange)
  - List of all agreements
  - "Create Agreement" button
- **Purpose:** Overview of all your lending/borrowing
- **Analogy:** Like your bank account homepage

**`/app/dashboard/create/page.tsx`** - Create Agreement
- **What:** Form to create new agreement
- **Shows:** 4-step wizard
  1. Loan details (who, how much, when)
  2. Buffer days (grace period)
  3. Add witness (optional)
  4. Upload proof (screenshot of payment)
- **Purpose:** Create new lending agreement
- **Analogy:** Like filling out a contract

**`/app/dashboard/agreement/[id]/page.tsx`** - Agreement Details
- **What:** Shows one specific agreement
- **Shows:**
  - Borrower info
  - Amount and due date
  - Trust score
  - Timeline of events
  - Witness status
  - Action buttons (approve, settle, remind)
- **Purpose:** Manage individual agreement
- **Analogy:** Like opening a specific file from your filing cabinet

**`/app/dashboard/notifications/page.tsx`** - Notifications
- **What:** Shows all alerts
- **Shows:** List of notifications (witness approved, payment due, etc.)
- **Purpose:** Keep users informed
- **Analogy:** Like your phone's notification center

**`/app/dashboard/profile/page.tsx`** - User Profile
- **What:** User's personal page
- **Shows:** Name, email, trust score, statistics
- **Purpose:** View and edit profile
- **Analogy:** Like your profile on social media

---


### `/app/api` Folder - Backend Logic (The Brain)

**`/app/api/agreements/route.ts`** - Main Agreements API
- **What:** Handles creating and fetching agreements
- **Does:**
  - GET: Fetch all agreements for a user
  - POST: Create new agreement
- **Checks:** 
  - Is borrower registered?
  - Is witness registered?
  - Are all fields valid?
- **Then:** Saves to database and sends emails
- **Analogy:** Like a bank teller processing your transaction

**`/app/api/agreements/[id]/route.ts`** - Single Agreement API
- **What:** Handles one specific agreement
- **Does:**
  - GET: Fetch agreement details
  - PATCH: Update agreement (like settling it)
  - DELETE: Remove agreement
- **Purpose:** Manage individual agreements
- **Analogy:** Like pulling up one specific bank transaction

**`/app/api/agreements/[id]/approve-witness/route.ts`** - Witness Approval
- **What:** Handles witness approval
- **Does:**
  - Updates `witnessApproved` to true
  - Changes status to "active"
  - Sends email to lender
  - Creates notification
- **Purpose:** Let witness approve the agreement
- **Analogy:** Like a notary signing a document

**`/app/api/agreements/[id]/send-reminder/route.ts`** - Payment Reminder
- **What:** Sends reminder email
- **Does:**
  - Fetches agreement details
  - Calculates days remaining
  - Sends email to borrower
- **Purpose:** Remind borrower about payment
- **Analogy:** Like a friendly nudge from a friend

**`/app/api/auth/signin/route.ts`** - Sign In API
- **What:** Handles login
- **Does:** Verifies credentials with Firebase
- **Purpose:** Let users log in
- **Analogy:** Like checking ID at the door

**`/app/api/auth/signup/route.ts`** - Sign Up API
- **What:** Handles registration
- **Does:**
  - Creates Firebase account
  - Creates user in MongoDB
  - Sets initial trust score to 100
- **Purpose:** Let new users join
- **Analogy:** Like opening a new bank account

**`/app/api/notifications/route.ts`** - Notifications API
- **What:** Handles notifications
- **Does:**
  - GET: Fetch all notifications for user
  - POST: Create new notification
- **Purpose:** Keep users informed
- **Analogy:** Like a message inbox

**`/app/api/users/[uid]/route.ts`** - User API
- **What:** Handles user data
- **Does:**
  - GET: Fetch user profile
  - PATCH: Update user info
- **Purpose:** Manage user accounts
- **Analogy:** Like your profile settings

---


### `/models` Folder - Database Blueprints

**`models/User.ts`** - User Model
- **What:** Defines what a "User" looks like in database
- **Contains:**
  - uid (unique ID from Firebase)
  - name
  - email
  - phone
  - trustScore (starts at 100)
  - createdAt (when they joined)
- **Purpose:** Structure for user data
- **Analogy:** Like a form template for new employees

**`models/Agreement.ts`** - Agreement Model
- **What:** Defines what an "Agreement" looks like
- **Contains:**
  - Lender info (name, email, ID)
  - Borrower info (name, email, phone)
  - Amount (how much money)
  - Due date (when to pay back)
  - Purpose (why they need money)
  - Witness info (optional)
  - Trust score (starts at 100)
  - Status (active, settled, etc.)
  - Timeline (history of events)
  - Proof files (screenshots)
- **Purpose:** Structure for agreement data
- **Analogy:** Like a contract template

**`models/Notification.ts`** - Notification Model
- **What:** Defines what a "Notification" looks like
- **Contains:**
  - userId (who gets the notification)
  - type (witness_approved, payment_due, etc.)
  - title (short headline)
  - description (details)
  - read (true/false)
  - agreementId (which agreement it's about)
  - createdAt (when it was created)
- **Purpose:** Structure for notifications
- **Analogy:** Like a message template

---

### `/lib` Folder - Helper Functions

**`lib/mongodb.ts`** - Database Connection
- **What:** Connects to MongoDB database
- **Does:**
  - Establishes connection
  - Caches connection (reuses it)
  - Handles errors
- **Purpose:** Talk to database
- **Analogy:** Like a phone line to the bank

**`lib/email.ts`** - Email Service
- **What:** Sends emails using NodeMailer
- **Contains:**
  - Email configuration (Gmail SMTP)
  - 4 email templates:
    1. Agreement Request (to borrower)
    2. Witness Approval Request (to witness)
    3. Witness Approved (to lender)
    4. Payment Reminder (to borrower)
- **Does:** Sends beautiful HTML emails
- **Purpose:** Automated email notifications
- **Analogy:** Like having a secretary who sends emails for you

**`lib/utils.ts`** - Utility Functions
- **What:** Helper functions
- **Contains:** `cn()` function for combining CSS classes
- **Purpose:** Make code cleaner
- **Analogy:** Like a Swiss Army knife of small tools

---

### `/components` Folder - Reusable UI Parts

**`components/ui/`** - UI Components
- **What:** Pre-built UI pieces
- **Contains:**
  - button.tsx (buttons)
  - input.tsx (text fields)
  - card.tsx (containers)
  - dialog.tsx (pop-ups)
  - toast.tsx (notifications)
  - And 50+ more!
- **Purpose:** Consistent, reusable UI elements
- **Analogy:** Like LEGO blocks you can reuse

**`components/theme-provider.tsx`** - Theme Manager
- **What:** Handles dark/light mode
- **Does:** Switches between themes
- **Purpose:** User preference for appearance
- **Analogy:** Like a light switch

---


## 🔄 How Everything Works Together

### Example 1: User Signs Up

**Step-by-Step:**

1. **User visits website** → Sees landing page (`app/page.tsx`)
2. **Clicks "Sign Up"** → Goes to signup page (`app/auth/signup/page.tsx`)
3. **Fills form** → Enters name, email, password
4. **Clicks "Create Account"** → Frontend sends data to API
5. **API receives request** → (`app/api/auth/signup/route.ts`)
6. **API creates Firebase account** → Firebase handles authentication
7. **API creates MongoDB user** → Saves to database using `User` model
8. **API sets trust score to 100** → Everyone starts with perfect score
9. **API responds "Success!"** → Frontend receives confirmation
10. **User redirected to dashboard** → Now logged in!

**Files Involved:**
- `app/auth/signup/page.tsx` (Frontend form)
- `app/api/auth/signup/route.ts` (Backend logic)
- `firebase.ts` (Authentication)
- `models/User.ts` (Database structure)
- `lib/mongodb.ts` (Database connection)

---

### Example 2: Creating an Agreement

**Step-by-Step:**

1. **User clicks "Create Agreement"** → Goes to create page
2. **Fills Step 1** → Borrower details, amount, date
3. **Fills Step 2** → Buffer days (grace period)
4. **Fills Step 3** → Witness info (optional)
5. **Fills Step 4** → Uploads payment proof
6. **Clicks "Create Agreement"** → Frontend sends all data to API
7. **API receives request** → (`app/api/agreements/route.ts`)
8. **API checks borrower exists** → Queries MongoDB for borrower email
9. **If not found** → Returns error "User not registered"
10. **API checks witness exists** → Queries MongoDB for witness email
11. **If not found** → Returns error "Witness not registered"
12. **API creates agreement** → Saves to MongoDB using `Agreement` model
13. **API sends email to borrower** → Uses NodeMailer
14. **API sends email to witness** → Uses NodeMailer
15. **API creates notifications** → Saves to MongoDB
16. **API responds "Success!"** → Frontend receives confirmation
17. **User redirected to dashboard** → Sees new agreement!

**Files Involved:**
- `app/dashboard/create/page.tsx` (Frontend form)
- `app/api/agreements/route.ts` (Backend logic)
- `models/Agreement.ts` (Database structure)
- `models/User.ts` (Check if users exist)
- `lib/email.ts` (Send emails)
- `lib/mongodb.ts` (Database connection)

---

### Example 3: Witness Approves Agreement

**Step-by-Step:**

1. **Witness receives email** → "You've been added as witness"
2. **Clicks link in email** → Opens agreement page
3. **Logs in** → Firebase authentication
4. **Sees agreement details** → (`app/dashboard/agreement/[id]/page.tsx`)
5. **Sees "Approve as Witness" button** → Only visible to witness
6. **Clicks button** → Frontend calls API
7. **API receives request** → (`app/api/agreements/[id]/approve-witness/route.ts`)
8. **API updates agreement** → Sets `witnessApproved: true`
9. **API updates status** → Changes to "active"
10. **API updates timeline** → Adds "Witness Approved" event
11. **API creates notification** → For lender
12. **API sends email to lender** → "Witness approved your agreement"
13. **API responds "Success!"** → Frontend receives confirmation
14. **Button disappears** → Shows "Approved" status
15. **Lender gets email** → Knows witness approved

**Files Involved:**
- `app/dashboard/agreement/[id]/page.tsx` (Frontend UI)
- `app/api/agreements/[id]/approve-witness/route.ts` (Backend logic)
- `models/Agreement.ts` (Update agreement)
- `models/Notification.ts` (Create notification)
- `lib/email.ts` (Send email to lender)

---

### Example 4: Lender Settles Agreement

**Step-by-Step:**

1. **Borrower pays back money** → Outside the app
2. **Lender opens agreement** → (`app/dashboard/agreement/[id]/page.tsx`)
3. **Sees "Settle Up / Close Loan" button** → Only visible to lender
4. **Clicks button** → Confirmation dialog appears
5. **Confirms settlement** → Frontend calls API
6. **API receives request** → (`app/api/agreements/[id]/route.ts`)
7. **API updates agreement** → Sets `status: "settled"`
8. **API responds "Success!"** → Frontend receives confirmation
9. **User redirected to dashboard** → Agreement now in "Settled" section
10. **All parties see "Settled"** → Lender, borrower, witness

**Files Involved:**
- `app/dashboard/agreement/[id]/page.tsx` (Frontend UI)
- `app/api/agreements/[id]/route.ts` (Backend logic)
- `models/Agreement.ts` (Update agreement)

---


## 🎨 Key Features Explained

### 1. Trust Score System

**What it is:**
- A number from 0-100 that shows how reliable someone is
- Everyone starts at 100 (perfect score)
- Drops if payments are late
- Visible to everyone

**How it works:**
- On-time payment → Score stays 100
- Late payment → Score drops
- Strict mode → Drops faster
- Lenient mode → Grace period before dropping

**Why it matters:**
- Encourages people to pay on time
- Shows history of reliability
- Builds trust in the community

**Code Location:**
- `models/Agreement.ts` (trustScore field)
- `app/dashboard/agreement/[id]/page.tsx` (displays score)

---

### 2. Witness System

**What it is:**
- A third person who verifies the agreement
- Like a notary, but informal
- Adds credibility to the agreement

**How it works:**
- Lender adds witness when creating agreement
- Witness receives email
- Witness logs in and approves
- Witness does NOT see the amount (privacy!)
- Lender gets notified when approved

**Why it matters:**
- Adds accountability
- Prevents disputes
- Makes agreement more official

**Code Location:**
- `app/dashboard/create/page.tsx` (add witness)
- `app/api/agreements/[id]/approve-witness/route.ts` (approval logic)
- `lib/email.ts` (witness emails)

---

### 3. AI Mediation (Future Feature)

**What it is:**
- AI that handles awkward conversations
- Sends polite reminders
- Suggests payment plans
- Mediates disputes

**How it works:**
- Lender clicks "Ask AI to Call Borrower"
- AI makes phone call (using Vapi)
- AI has empathetic conversation
- AI reports back to lender

**Why it matters:**
- Removes awkwardness
- Professional communication
- Maintains relationships

**Code Location:**
- `app/dashboard/agreement/[id]/page.tsx` (AI chat interface)
- Currently simulated, will integrate real AI later

---

### 4. Automated Email Notifications

**What it is:**
- Automatic emails sent at key moments
- Professional HTML templates
- Personalized for each user

**Types of emails:**
1. **Agreement Request** → Sent to borrower when agreement created
2. **Witness Approval Request** → Sent to witness
3. **Witness Approved** → Sent to lender when witness approves
4. **Payment Reminder** → Sent to borrower before due date

**How it works:**
- NodeMailer connects to Gmail SMTP
- Uses HTML templates with styling
- Includes clickable buttons
- Links to ngrok URL (live app)

**Code Location:**
- `lib/email.ts` (all email logic and templates)
- `.env` (email credentials)

---

### 5. Buffer Days (Private Feature)

**What it is:**
- Grace period only lender knows about
- Gives borrower extra time before consequences
- Lender sets 0-14 days

**How it works:**
- Borrower sees: "Due February 15"
- Lender sets: 3 buffer days
- Reality: Trust score drops February 18
- Reminders start: February 18

**Why it matters:**
- Gives flexibility
- Prevents harsh penalties
- Lender controls strictness

**Code Location:**
- `app/dashboard/create/page.tsx` (buffer slider)
- `models/Agreement.ts` (bufferDays field)

---

### 6. Proof Upload System

**What it is:**
- Upload screenshots of payment
- Visible to all parties
- Creates transparency

**How it works:**
- Lender uploads proof when creating agreement
- Borrower can upload proof when paying back
- Files stored (currently placeholder, will use cloud storage)

**Why it matters:**
- Prevents "I already paid" disputes
- Creates paper trail
- Builds trust

**Code Location:**
- `app/dashboard/create/page.tsx` (upload interface)
- `models/Agreement.ts` (lenderProof, borrowerProof fields)

---

### 7. Role-Based Access Control

**What it is:**
- Different users see different things
- Different permissions for different roles

**Roles:**
1. **Lender** → Can settle agreement, send reminders
2. **Borrower** → Can view, upload payment proof (future)
3. **Witness** → Can approve agreement

**How it works:**
- Frontend checks: `isLender`, `isBorrower`, `isWitness`
- Shows/hides buttons based on role
- Backend validates permissions

**Code Location:**
- `app/dashboard/agreement/[id]/page.tsx` (role detection)

---

### 8. Real-Time Dashboard

**What it is:**
- Live view of all agreements
- Updates automatically
- Shows money lent vs borrowed

**What it shows:**
- Total money lent (green)
- Total money borrowed (orange)
- Net balance
- List of active agreements
- List of settled agreements

**How it works:**
- Fetches data from MongoDB
- Calculates totals
- Determines if user is lender or borrower
- Shows appropriate color coding

**Code Location:**
- `app/dashboard/page.tsx` (main dashboard)
- `app/api/agreements/route.ts` (fetch agreements)

---


## 💾 Database Models (Data Structure)

### User Collection

**What it stores:** Information about each user

**Fields:**
```javascript
{
  uid: "abc123",              // Unique ID from Firebase
  name: "John Doe",           // User's full name
  email: "john@example.com",  // Email address
  phone: "+1234567890",       // Phone number (optional)
  trustScore: 100,            // Reliability score (0-100)
  createdAt: "2026-01-28",    // When they joined
}
```

**Simple Explanation:**
- Like a profile card for each user
- Stores basic info
- Trust score tracks reliability
- Everyone starts with 100

**Real Example:**
```javascript
{
  uid: "firebase_user_123",
  name: "Sarah Chen",
  email: "sarah@gmail.com",
  phone: "+1-555-0123",
  trustScore: 100,
  createdAt: "2026-01-15"
}
```

---

### Agreement Collection

**What it stores:** Information about each lending agreement

**Fields:**
```javascript
{
  _id: "agreement_123",           // Unique ID
  lenderId: "user_abc",           // Who lent the money
  lenderName: "John Doe",         // Lender's name
  lenderEmail: "john@example.com", // Lender's email
  borrowerId: "user_xyz",         // Who borrowed
  borrowerName: "Sarah Chen",     // Borrower's name
  borrowerEmail: "sarah@gmail.com", // Borrower's email
  borrowerPhone: "+1-555-0123",   // Borrower's phone
  amount: 2500,                   // How much money
  purpose: "Rent for March",      // Why they need it
  dueDate: "2026-03-15",          // When to pay back
  bufferDays: 3,                  // Grace period (private)
  witnessName: "Mike Smith",      // Witness name
  witnessEmail: "mike@gmail.com", // Witness email
  witnessPhone: "+1-555-0456",    // Witness phone
  witnessApproved: false,         // Has witness approved?
  status: "pending_witness",      // Current status
  trustScore: 100,                // Agreement trust score
  strictMode: false,              // Strict or lenient
  timeline: [                     // History of events
    {
      event: "Agreement Created",
      date: "2026-01-28",
      completed: true
    },
    {
      event: "Witness Approved",
      date: null,
      completed: false
    }
  ],
  lenderProof: {                  // Lender's payment proof
    fileName: "payment.png",
    fileUrl: "/uploads/payment.png",
    uploadedAt: "2026-01-28"
  },
  borrowerProof: null,            // Borrower's proof (when paid)
  aiMessages: [],                 // AI chat history
  createdAt: "2026-01-28"         // When created
}
```

**Simple Explanation:**
- Like a contract document
- Stores all agreement details
- Tracks status and timeline
- Includes proof files

**Status Values:**
- `pending_witness` → Waiting for witness approval
- `active` → Witness approved, agreement active
- `reviewing` → Under review
- `settled` → Paid back and closed
- `overdue` → Past due date

---

### Notification Collection

**What it stores:** Alerts for users

**Fields:**
```javascript
{
  _id: "notification_123",        // Unique ID
  userId: "user_abc",             // Who gets this notification
  type: "witness_approved",       // Type of notification
  title: "Witness Approved",      // Short headline
  description: "Mike approved your agreement", // Details
  read: false,                    // Has user seen it?
  agreementId: "agreement_123",   // Related agreement
  createdAt: "2026-01-28"         // When created
}
```

**Notification Types:**
- `witness_approved` → Witness approved agreement
- `payment_due` → Payment due soon
- `payment_overdue` → Payment is late
- `agreement_settled` → Agreement closed
- `reminder_sent` → Reminder was sent

**Simple Explanation:**
- Like push notifications
- Keeps users informed
- Links to related agreement
- Tracks if read or unread

---


## 🛣️ API Routes Explained (Backend Endpoints)

### What is an API Route?

**Simple Explanation:**
- Like a waiter in a restaurant
- Frontend (customer) makes a request
- API (waiter) processes it
- Database (kitchen) provides data
- API brings back response

**Example:**
- You click "Create Agreement" (order food)
- Frontend sends data to API (waiter takes order)
- API saves to database (kitchen cooks)
- API responds "Success!" (waiter brings food)

---

### Agreement Routes

#### 1. `POST /api/agreements` - Create Agreement

**What it does:** Creates a new lending agreement

**Receives:**
```javascript
{
  lenderId: "user_123",
  borrowerEmail: "sarah@gmail.com",
  amount: 2500,
  dueDate: "2026-03-15",
  // ... more fields
}
```

**Process:**
1. Checks if borrower exists in database
2. Checks if witness exists (if provided)
3. Creates agreement in MongoDB
4. Sends email to borrower
5. Sends email to witness
6. Creates notifications

**Returns:**
```javascript
{
  message: "Agreement created successfully",
  agreement: { /* agreement data */ }
}
```

**Error Cases:**
- Borrower not registered → "User not registered"
- Witness not registered → "Witness not registered"
- Missing fields → "Validation error"

---

#### 2. `GET /api/agreements?userId=abc123` - Get All Agreements

**What it does:** Fetches all agreements for a user

**Receives:** User ID in URL

**Process:**
1. Finds all agreements where user is lender OR borrower
2. Returns array of agreements

**Returns:**
```javascript
{
  agreements: [
    { /* agreement 1 */ },
    { /* agreement 2 */ },
    // ...
  ]
}
```

---

#### 3. `GET /api/agreements/[id]` - Get One Agreement

**What it does:** Fetches details of one agreement

**Receives:** Agreement ID in URL

**Process:**
1. Finds agreement by ID
2. Returns agreement data

**Returns:**
```javascript
{
  agreement: { /* agreement data */ }
}
```

---

#### 4. `PATCH /api/agreements/[id]` - Update Agreement

**What it does:** Updates agreement fields

**Receives:**
```javascript
{
  status: "settled",
  // or any other field to update
}
```

**Process:**
1. Finds agreement by ID
2. Updates specified fields
3. Saves to database

**Returns:**
```javascript
{
  message: "Agreement updated successfully",
  agreement: { /* updated data */ }
}
```

**Use Cases:**
- Settle agreement (status: "settled")
- Update trust score
- Toggle strict mode
- Add AI messages

---

#### 5. `POST /api/agreements/[id]/approve-witness` - Witness Approval

**What it does:** Witness approves the agreement

**Receives:** Agreement ID in URL

**Process:**
1. Finds agreement
2. Sets `witnessApproved: true`
3. Changes `status: "active"`
4. Updates timeline
5. Creates notification for lender
6. Sends email to lender

**Returns:**
```javascript
{
  message: "Witness approved successfully",
  agreement: { /* updated data */ }
}
```

---

#### 6. `POST /api/agreements/[id]/send-reminder` - Send Reminder

**What it does:** Sends payment reminder to borrower

**Receives:** Agreement ID in URL

**Process:**
1. Finds agreement
2. Calculates days until due
3. Sends email to borrower

**Returns:**
```javascript
{
  message: "Reminder sent successfully"
}
```

---

### User Routes

#### 7. `GET /api/users/[uid]` - Get User Profile

**What it does:** Fetches user information

**Receives:** User ID in URL

**Process:**
1. Finds user by ID
2. Returns user data

**Returns:**
```javascript
{
  user: {
    uid: "user_123",
    name: "John Doe",
    email: "john@example.com",
    trustScore: 100
  }
}
```

---

#### 8. `PATCH /api/users/[uid]` - Update User

**What it does:** Updates user information

**Receives:**
```javascript
{
  name: "John Smith",
  phone: "+1-555-9999"
}
```

**Process:**
1. Finds user by ID
2. Updates fields
3. Saves to database

**Returns:**
```javascript
{
  message: "User updated successfully",
  user: { /* updated data */ }
}
```

---

### Notification Routes

#### 9. `GET /api/notifications?userId=abc123` - Get Notifications

**What it does:** Fetches all notifications for user

**Receives:** User ID in URL

**Process:**
1. Finds all notifications for user
2. Sorts by newest first
3. Returns array

**Returns:**
```javascript
{
  notifications: [
    {
      title: "Witness Approved",
      description: "Mike approved your agreement",
      read: false,
      createdAt: "2026-01-28"
    },
    // ...
  ]
}
```

---

#### 10. `POST /api/notifications` - Create Notification

**What it does:** Creates a new notification

**Receives:**
```javascript
{
  userId: "user_123",
  type: "witness_approved",
  title: "Witness Approved",
  description: "Mike approved your agreement",
  agreementId: "agreement_123"
}
```

**Process:**
1. Creates notification in database
2. Returns created notification

**Returns:**
```javascript
{
  message: "Notification created",
  notification: { /* notification data */ }
}
```

---

### Authentication Routes

#### 11. `POST /api/auth/signup` - Sign Up

**What it does:** Creates new user account

**Receives:**
```javascript
{
  email: "john@example.com",
  password: "securePassword123",
  name: "John Doe"
}
```

**Process:**
1. Creates Firebase account
2. Creates user in MongoDB
3. Sets trustScore: 100
4. Returns user data

**Returns:**
```javascript
{
  message: "User created successfully",
  user: { /* user data */ }
}
```

---

#### 12. `POST /api/auth/signin` - Sign In

**What it does:** Logs in existing user

**Receives:**
```javascript
{
  email: "john@example.com",
  password: "securePassword123"
}
```

**Process:**
1. Verifies credentials with Firebase
2. Returns user data

**Returns:**
```javascript
{
  message: "Sign in successful",
  user: { /* user data */ }
}
```

---


## 👤 Complete User Journey

### Journey 1: New User Signs Up

**Sarah wants to join Setu AI**

1. **Visits website** → `setuai.com` (landing page)
2. **Sees hero section** → "Trust & Transparency in Informal Finance"
3. **Clicks "Sign Up Free"** → Goes to signup page
4. **Fills form:**
   - Name: Sarah Chen
   - Email: sarah@gmail.com
   - Password: ••••••••
5. **Clicks "Create Account"** → API creates account
6. **Account created:**
   - Firebase account created
   - MongoDB user created
   - Trust score set to 100
7. **Redirected to dashboard** → Sees empty state
8. **Dashboard shows:**
   - "You Lent: $0"
   - "You Borrowed: $0"
   - "No Active Agreements"
   - Big "Create Trust Agreement" button

**Files Used:**
- `app/page.tsx` → Landing page
- `app/auth/signup/page.tsx` → Signup form
- `app/api/auth/signup/route.ts` → Create account
- `app/dashboard/page.tsx` → Dashboard

---

### Journey 2: Lender Creates Agreement

**John wants to lend $2500 to Sarah**

1. **Opens dashboard** → Clicks "Create Trust Agreement"
2. **Step 1: Loan Details**
   - Borrower Name: Sarah Chen
   - Email: sarah@gmail.com
   - Phone: +1-555-0123
   - Amount: $2500
   - Return Date: March 15, 2026
   - Purpose: "Rent for March"
   - Clicks "Continue"
3. **Step 2: Buffer Days**
   - Sees slider (0-14 days)
   - Sets 3 buffer days
   - Sees explanation: "Grace period before reminders"
   - Clicks "Continue"
4. **Step 3: Add Witness**
   - Witness Name: Mike Smith
   - Email: mike@gmail.com
   - Phone: +1-555-0456
   - Clicks "Continue"
5. **Step 4: Upload Proof**
   - Uploads screenshot of bank transfer
   - File: "payment_proof.png"
   - Clicks "Create Agreement"
6. **API processes:**
   - Checks if Sarah is registered ✓
   - Checks if Mike is registered ✓
   - Creates agreement in database
   - Sends email to Sarah
   - Sends email to Mike
   - Creates notifications
7. **Success!**
   - Redirected to dashboard
   - Sees new agreement
   - Status: "Pending Witness"
   - Amount: +$2500 (green, because he lent)

**Emails Sent:**
- **To Sarah:** "John wants to create a lending agreement with you"
- **To Mike:** "John wants you to witness their agreement"

**Files Used:**
- `app/dashboard/create/page.tsx` → Create form
- `app/api/agreements/route.ts` → Create agreement
- `lib/email.ts` → Send emails

---

### Journey 3: Borrower Receives Agreement

**Sarah receives the agreement**

1. **Receives email** → "John wants to create a lending agreement"
2. **Email contains:**
   - Amount: $2500
   - Due date: March 15, 2026
   - Purpose: Rent for March
   - Button: "View Agreement"
3. **Clicks "View Agreement"** → Opens app
4. **Logs in** → Already has account
5. **Sees dashboard:**
   - "You Borrowed: $2500" (orange)
   - Agreement listed
6. **Clicks agreement** → Opens details page
7. **Sees:**
   - Lender: John Doe
   - Amount: $2500
   - Due date: March 15, 2026
   - Status: "Pending Witness"
   - Trust score: 100
   - Timeline showing events
8. **Cannot settle** → Only lender can settle
9. **Sees disabled button** → "Mark as Paid (Coming Soon)"

**Files Used:**
- `lib/email.ts` → Email template
- `app/dashboard/page.tsx` → Dashboard
- `app/dashboard/agreement/[id]/page.tsx` → Agreement details

---

### Journey 4: Witness Approves

**Mike approves the agreement**

1. **Receives email** → "John wants you to witness their agreement"
2. **Email contains:**
   - Lender: John Doe
   - Borrower: Sarah Chen
   - Note: "You will NOT see the amount"
   - Button: "Review & Approve"
3. **Clicks button** → Opens app
4. **Logs in** → Already has account
5. **Sees agreement** → In his dashboard
6. **Clicks agreement** → Opens details
7. **Sees:**
   - Lender: John Doe
   - Borrower: Sarah Chen
   - Amount: HIDDEN (privacy!)
   - Status: "Pending Witness"
   - Big green button: "Approve as Witness"
8. **Clicks "Approve as Witness"** → API processes
9. **API does:**
   - Sets witnessApproved: true
   - Changes status: "active"
   - Updates timeline
   - Creates notification for John
   - Sends email to John
10. **Success!**
    - Button disappears
    - Shows "Approved" status
    - Mike's job done!

**John receives email:** "Mike approved your agreement"

**Files Used:**
- `app/dashboard/agreement/[id]/page.tsx` → Approval button
- `app/api/agreements/[id]/approve-witness/route.ts` → Approval logic
- `lib/email.ts` → Email to lender

---

### Journey 5: Payment Reminder

**Due date approaching**

1. **March 12, 2026** → 3 days before due date
2. **John opens agreement** → Sees "3 days remaining"
3. **Clicks "Send Payment Reminder"** → API sends email
4. **Sarah receives email:**
   - Subject: "Payment reminder: 3 days until due date"
   - Amount: $2500
   - Due date: March 15, 2026
   - Button: "View Agreement"
5. **Sarah clicks button** → Opens agreement
6. **Sarah sees:**
   - "3 days remaining"
   - Orange warning badge
   - All agreement details
7. **Sarah pays John** → Outside the app (bank transfer)
8. **Sarah uploads proof** → (Future feature)

**Files Used:**
- `app/dashboard/agreement/[id]/page.tsx` → Reminder button
- `app/api/agreements/[id]/send-reminder/route.ts` → Send email
- `lib/email.ts` → Reminder template

---

### Journey 6: Lender Settles Agreement

**Sarah paid back, John closes agreement**

1. **Sarah transfers $2500** → Bank transfer
2. **John receives money** → Confirms payment
3. **John opens agreement** → Sees details
4. **Clicks "Settle Up / Close Loan"** → Confirmation dialog
5. **Dialog asks:** "Are you sure? This cannot be undone"
6. **John confirms** → API processes
7. **API does:**
   - Sets status: "settled"
   - Updates agreement
8. **Success!**
   - Redirected to dashboard
   - Agreement moves to "Settled" section
   - Shows "Agreement Settled" badge
9. **Sarah sees:**
   - Agreement now settled
   - No more actions needed
10. **Mike sees:**
    - Agreement settled
    - His witness job complete

**Files Used:**
- `app/dashboard/agreement/[id]/page.tsx` → Settle button
- `app/api/agreements/[id]/route.ts` → Update status
- `app/dashboard/page.tsx` → Shows settled section

---


## 🎓 Technical Terms Explained (Glossary)

### Frontend Terms

**Next.js**
- **What:** A framework for building websites
- **Simple:** Like a construction kit for websites
- **Why:** Makes building fast, modern websites easier

**React**
- **What:** A library for building user interfaces
- **Simple:** Like LEGO blocks for websites
- **Why:** Makes interactive websites smooth and fast

**TypeScript**
- **What:** JavaScript with type checking
- **Simple:** JavaScript with spell-check
- **Why:** Catches errors before they happen

**Component**
- **What:** Reusable piece of UI
- **Simple:** Like a LEGO block you can reuse
- **Example:** Button, Card, Input field

**State**
- **What:** Data that can change
- **Simple:** Like a variable that updates the screen
- **Example:** Form input, loading status

**Hook**
- **What:** Special React function
- **Simple:** Like a tool that gives components superpowers
- **Example:** `useState`, `useEffect`

**Props**
- **What:** Data passed to components
- **Simple:** Like arguments to a function
- **Example:** Button text, card title

---

### Backend Terms

**API (Application Programming Interface)**
- **What:** Way for frontend and backend to talk
- **Simple:** Like a waiter between customer and kitchen
- **Example:** `/api/agreements`

**Route**
- **What:** URL path that does something
- **Simple:** Like an address for a specific action
- **Example:** `/api/agreements/create`

**HTTP Methods**
- **GET:** Fetch data (like reading)
- **POST:** Create new data (like writing)
- **PATCH:** Update existing data (like editing)
- **DELETE:** Remove data (like erasing)

**Request**
- **What:** Data sent from frontend to backend
- **Simple:** Like placing an order
- **Example:** Form data, user ID

**Response**
- **What:** Data sent from backend to frontend
- **Simple:** Like receiving your order
- **Example:** Success message, error, data

**Endpoint**
- **What:** Specific API route
- **Simple:** Like a specific menu item
- **Example:** `/api/agreements/123`

---

### Database Terms

**MongoDB**
- **What:** NoSQL database
- **Simple:** Like a giant filing cabinet
- **Why:** Flexible, fast, easy to use

**Collection**
- **What:** Group of similar documents
- **Simple:** Like a folder in the filing cabinet
- **Example:** Users collection, Agreements collection

**Document**
- **What:** Single record in a collection
- **Simple:** Like one file in a folder
- **Example:** One user, one agreement

**Schema**
- **What:** Structure of a document
- **Simple:** Like a template or form
- **Example:** User has name, email, trustScore

**Query**
- **What:** Request to find data
- **Simple:** Like searching in the filing cabinet
- **Example:** Find user by email

**Mongoose**
- **What:** MongoDB helper library
- **Simple:** Makes working with MongoDB easier
- **Why:** Adds structure and validation

---

### Authentication Terms

**Firebase**
- **What:** Google's backend service
- **Simple:** Like a security system
- **Why:** Handles login/signup securely

**Authentication**
- **What:** Verifying who someone is
- **Simple:** Like checking ID at the door
- **Example:** Login with email/password

**Authorization**
- **What:** Checking what someone can do
- **Simple:** Like checking if you have permission
- **Example:** Only lender can settle

**UID (User ID)**
- **What:** Unique identifier for each user
- **Simple:** Like a social security number
- **Example:** "firebase_user_abc123"

**Token**
- **What:** Proof of authentication
- **Simple:** Like a ticket that proves you paid
- **Why:** Keeps you logged in

---

### Email Terms

**NodeMailer**
- **What:** Library for sending emails
- **Simple:** Like a post office for your app
- **Why:** Sends automated emails

**SMTP (Simple Mail Transfer Protocol)**
- **What:** Email sending protocol
- **Simple:** Like the postal service rules
- **Example:** Gmail SMTP server

**HTML Email**
- **What:** Email with styling and formatting
- **Simple:** Like a fancy letter vs plain text
- **Why:** Looks professional

**Template**
- **What:** Reusable email design
- **Simple:** Like a form letter you fill in
- **Example:** "Hi {name}, you have a new agreement"

---

### UI/UX Terms

**UI (User Interface)**
- **What:** What users see and interact with
- **Simple:** Like the dashboard of a car
- **Example:** Buttons, forms, colors

**UX (User Experience)**
- **What:** How users feel using the app
- **Simple:** Like how comfortable the car is to drive
- **Example:** Easy navigation, clear messages

**Responsive Design**
- **What:** Works on all screen sizes
- **Simple:** Like clothes that fit everyone
- **Why:** Works on phone, tablet, desktop

**Loading State**
- **What:** Shows something is happening
- **Simple:** Like a spinning wheel
- **Why:** Tells user to wait

**Empty State**
- **What:** What shows when there's no data
- **Simple:** Like an empty inbox
- **Example:** "No agreements yet"

---

### Development Terms

**Environment Variables**
- **What:** Secret configuration values
- **Simple:** Like passwords stored safely
- **Example:** Database URL, API keys
- **File:** `.env`

**Deployment**
- **What:** Publishing app to the internet
- **Simple:** Like opening a store to customers
- **Example:** Deploying to Vercel

**Localhost**
- **What:** Your computer as a server
- **Simple:** Like testing in your garage
- **Example:** `http://localhost:3000`

**Production**
- **What:** Live version users see
- **Simple:** Like the actual store
- **Example:** `https://setuai.com`

**Git**
- **What:** Version control system
- **Simple:** Like save points in a video game
- **Why:** Track changes, collaborate

**npm (Node Package Manager)**
- **What:** Tool for installing libraries
- **Simple:** Like an app store for code
- **Example:** `npm install react`

---


## 🎤 How to Explain to Judges (Hackathon Pitch)

### 30-Second Elevator Pitch

"Setu AI solves the awkwardness of lending money to friends and family. We create digital agreements, track trust scores, and use AI to send polite reminders - so you never have to be the bad guy asking for your money back. It's like Venmo meets a smart contract, but for informal lending."

---

### 2-Minute Demo Script

**1. The Problem (15 seconds)**
"Have you ever lent money to a friend or family member and felt awkward asking for it back? That's the problem we're solving."

**2. The Solution (15 seconds)**
"Setu AI creates digital lending agreements with automatic reminders, trust scores, and optional witnesses - making informal lending transparent and stress-free."

**3. Live Demo (60 seconds)**

**Show Dashboard:**
"Here's my dashboard. I can see I've lent $5,000 and borrowed $2,000. My net balance is +$3,000."

**Create Agreement:**
"Let me create a new agreement. I'm lending $500 to my friend Sarah for rent."
- Fill in borrower details
- Set due date
- Add witness (optional)
- Upload payment proof

**Show Agreement Details:**
"Here's the agreement. Sarah sees it on her dashboard too. Notice the trust score - everyone starts at 100."

**Witness Approval:**
"Our witness Mike gets an email and can approve the agreement. He doesn't see the amount - privacy!"

**Settlement:**
"When Sarah pays me back, I click 'Settle Up' and the agreement closes for everyone."

**4. Key Features (30 seconds)**
- "Trust scores keep everyone accountable"
- "AI sends polite reminders automatically"
- "Witnesses add credibility"
- "All data is real-time from MongoDB"
- "Email notifications keep everyone informed"

---

### Technical Deep Dive (For Technical Judges)

**Architecture:**
"We built this with Next.js 16 for the frontend, MongoDB for the database, and Firebase for authentication. The app is fully responsive and works on all devices."

**Key Technical Decisions:**

1. **Next.js App Router**
   - "We use Next.js 16 with the App Router for server-side rendering and optimal performance"
   - "API routes are co-located with pages for better organization"

2. **MongoDB + Mongoose**
   - "We chose MongoDB for its flexibility with our data structure"
   - "Mongoose provides schema validation and type safety"

3. **Firebase Authentication**
   - "Firebase handles all authentication securely"
   - "We sync user data to MongoDB for our application logic"

4. **NodeMailer for Emails**
   - "We built custom HTML email templates"
   - "Automated emails for all key events"

5. **TypeScript**
   - "Full type safety across the entire codebase"
   - "Catches errors at compile time"

6. **Real-Time Data**
   - "No dummy data - everything is live from MongoDB"
   - "Dashboard updates reflect actual database state"

**Scalability:**
- "MongoDB Atlas for cloud database"
- "Firebase scales automatically"
- "Next.js can be deployed to Vercel for global CDN"

**Security:**
- "Environment variables for sensitive data"
- "Firebase handles password hashing"
- "Role-based access control"

---

### Common Judge Questions & Answers

**Q: How do you make money?**
A: "We could charge a small fee per agreement (like $1-2), or offer premium features like AI mediation calls, payment plans, and dispute resolution. For now, we're focused on user adoption."

**Q: What if someone doesn't pay?**
A: "Their trust score drops, making it harder to borrow in the future. We're building a reputation system. In the future, we could integrate with credit bureaus or offer insurance."

**Q: How is this different from Venmo or PayPal?**
A: "Venmo is for instant payments. We're for lending over time. We add trust scores, witnesses, reminders, and AI mediation - features designed specifically for informal lending."

**Q: What about legal enforceability?**
A: "We're not replacing legal contracts. We're for informal lending between people who trust each other. The social pressure and trust scores are the enforcement mechanism."

**Q: How do you handle disputes?**
A: "We're building AI mediation that can have empathetic conversations with both parties. The witness also adds accountability. In the future, we could offer human mediators."

**Q: What's your target market?**
A: "Anyone who lends or borrows money informally - especially immigrant communities, college students, and families. Our initial focus is the Indian diaspora, where informal lending is common."

**Q: How did you build this so fast?**
A: "We used modern tools like Next.js, MongoDB, and Firebase that handle a lot of the heavy lifting. We focused on core features first and used pre-built UI components from Radix UI."

**Q: What's next?**
A: "We want to add:
- Real AI phone calls (using Vapi)
- Payment plan suggestions
- Integration with payment apps
- Mobile app
- Multi-currency support"

---

### Key Metrics to Mention

**Technical Achievements:**
- ✅ Full-stack application in 48 hours
- ✅ 100% TypeScript for type safety
- ✅ Real-time data from MongoDB
- ✅ Automated email system
- ✅ Role-based access control
- ✅ Responsive design (mobile + desktop)
- ✅ Zero dummy data - all real

**Features Implemented:**
- ✅ User authentication
- ✅ Create agreements
- ✅ Witness system
- ✅ Trust scores
- ✅ Email notifications
- ✅ Dashboard with analytics
- ✅ Settlement flow
- ✅ Payment reminders

**Code Quality:**
- ✅ Clean, organized file structure
- ✅ Reusable components
- ✅ Error handling
- ✅ Loading states
- ✅ Empty states
- ✅ Responsive UI

---

### Demo Tips

**Before Demo:**
1. Have test accounts ready (lender, borrower, witness)
2. Have sample agreements created
3. Test all flows beforehand
4. Have backup screenshots if internet fails

**During Demo:**
1. Start with the problem (relatable story)
2. Show the solution (live demo)
3. Highlight unique features (trust score, witness, AI)
4. End with impact (how it helps people)

**What to Show:**
1. ✅ Landing page (first impression)
2. ✅ Dashboard (overview)
3. ✅ Create agreement (main flow)
4. ✅ Agreement details (all features)
5. ✅ Email notifications (automation)
6. ✅ Witness approval (unique feature)
7. ✅ Settlement (completion)

**What NOT to Show:**
- ❌ Code (unless asked)
- ❌ Database directly
- ❌ Error states (unless intentional)
- ❌ Incomplete features

---

### Closing Statement

"Setu AI bridges the gap between money and relationships. We make informal lending transparent, stress-free, and accountable. With trust scores, witnesses, and AI mediation, we're building the future of peer-to-peer finance. Thank you!"

---

## 🎯 Quick Reference Card

### Tech Stack Summary
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** MongoDB Atlas, Mongoose
- **Auth:** Firebase Authentication
- **Email:** NodeMailer (Gmail SMTP)
- **UI:** Radix UI, Lucide Icons
- **Deployment:** Vercel (frontend), MongoDB Atlas (database)

### Key Files to Know
- `app/page.tsx` → Landing page
- `app/dashboard/page.tsx` → Main dashboard
- `app/dashboard/create/page.tsx` → Create agreement
- `app/dashboard/agreement/[id]/page.tsx` → Agreement details
- `app/api/agreements/route.ts` → Create/fetch agreements
- `models/Agreement.ts` → Agreement schema
- `lib/email.ts` → Email templates

### Key Features
1. Trust Score System (0-100)
2. Witness Verification
3. Automated Email Notifications
4. Role-Based Access Control
5. Real-Time Dashboard
6. Buffer Days (Grace Period)
7. Payment Reminders
8. Settlement Flow

### Unique Selling Points
- 🎯 Solves real problem (awkward money conversations)
- 🤝 Trust scores build accountability
- 👥 Witness system adds credibility
- 🤖 AI mediation (future)
- 📧 Automated reminders
- 🔒 Privacy-focused (witness doesn't see amount)
- 💯 Everyone starts with 100 trust score

---

**Good luck with your hackathon! You've got this! 🚀**

