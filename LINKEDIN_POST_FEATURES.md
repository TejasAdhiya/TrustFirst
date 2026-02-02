# SETU AI - LinkedIn Post Feature Brief

## Project Overview
**Setu AI** - A trust-based peer-to-peer lending platform that digitizes informal money lending between friends and family with AI-powered features.

---

## 🎯 KEY HIGHLIGHTING FEATURES

### 1. **AI-Powered Conversational Calling**
- **VAPI AI Integration** - Automated voice calls to borrowers for payment reminders
- Conversational AI that speaks naturally and professionally
- One-click AI call initiation by lenders
- Real-time call status tracking

### 2. **Google Gemini 2.5 Pro AI Installment Planner**
- Generates 3 personalized repayment plans (Aggressive, Balanced, Flexible)
- AI analyzes amount, due date, and borrower context
- Smart date validation - ensures all installments are before due date
- Structured JSON output with detailed payment schedules

### 3. **Group Lending (Many-to-One)**
- Create groups of friends/family/colleagues
- Request money from entire group
- Multiple people can contribute partial amounts
- Each contribution creates individual 1-on-1 agreements
- Request auto-closes when full amount received
- Admin controls for group creators

### 4. **Dynamic Trust Score System**
- Real-time trust score (0-100) for each agreement
- Score drops if payments are late
- Strict Mode option for faster score penalties
- Visual trust score indicator with color coding

### 5. **Witness Verification System**
- Add third-party witness to agreements
- Email-based witness approval workflow
- Witness can approve/reject agreements
- Adds legal credibility to informal lending

### 6. **Real-Time Location Tracking**
- **Radar.io Integration** - Track borrower's live location
- Location history with timestamps
- Address geocoding (city, state, country)
- Privacy-focused - only when borrower shares

### 7. **Payment Proof Upload System**
- Upload multiple payment screenshots per installment
- Grid-based UI for organized proof management
- Each installment tracked individually
- View/remove uploaded proofs
- Progress tracking (X/Y proofs uploaded)

### 8. **Smart Email Notifications**
- Automated email reminders to borrowers
- Agreement creation confirmations
- Witness approval requests
- Payment due date reminders
- Settlement notifications

### 9. **Firebase Authentication**
- Secure user authentication
- Email/password login
- User profile management
- Role-based access (lender/borrower/witness)

### 10. **MongoDB Database**
- Scalable NoSQL database
- Real-time data synchronization
- Complex relationship handling
- Efficient querying for agreements, groups, requests

---

## 🛠️ ADVANCED TECHNICAL FEATURES

### AI & Automation
- **Google Gemini 2.5 Pro** - Premium AI model for intelligent plan generation
- **VAPI AI** - Conversational AI for voice calls
- **Make.com Webhooks** - Automation workflows for AI calls

### Location & Mapping
- **Radar.io** - Real-time location tracking and geocoding
- Location context with detailed address information

### Database & Backend
- **MongoDB** - NoSQL database with Mongoose ODM
- Complex schema relationships (Agreements, Groups, Requests, Users)
- Nested document handling for installment plans

### Email System
- Automated email workflows
- Dynamic email templates
- Link-based actions (approve witness, view agreement)

---

## 💡 UNIQUE VALUE PROPOSITIONS

1. **Digitizes Informal Lending** - Brings structure to casual money lending
2. **AI-First Approach** - Uses cutting-edge AI for planning and communication
3. **Trust-Based System** - Maintains relationships while ensuring accountability
4. **Group Dynamics** - Enables community-based lending
5. **Proof Management** - Complete payment tracking with screenshot evidence
6. **Location Awareness** - Adds security layer with location tracking
7. **Witness System** - Legal credibility without formal contracts

---

## 📊 CORE WORKFLOWS

### Lending Flow
1. Lender creates agreement with amount, due date, purpose
2. Optional: Add witness for verification
3. Borrower receives notification
4. Agreement becomes active
5. AI generates installment plans
6. Borrower uploads payment proofs
7. Lender can send reminders or AI calls
8. Agreement settles when paid

### Group Lending Flow
1. User creates group and adds members
2. Member requests money from group
3. Multiple members contribute partial amounts
4. Each contribution = separate agreement
5. Request closes when full amount received
6. Individual agreements tracked separately

---

## 🎨 USER EXPERIENCE HIGHLIGHTS

- Clean, modern dark-themed UI
- Real-time updates and notifications
- Mobile-responsive design
- Intuitive navigation
- Visual progress indicators
- Color-coded status badges
- Interactive AI plan selection
- Grid-based proof upload interface

---

## 🔒 SECURITY & PRIVACY

- Firebase authentication
- Secure file uploads
- Role-based access control
- Email verification
- Location sharing with consent
- Encrypted data storage

---

## 📈 SCALABILITY

- Cloud-based architecture
- NoSQL database for flexibility
- API-first design
- Modular feature implementation
- Webhook-based integrations

---

## USE THIS FOR LINKEDIN POST

**Project Name**: Setu AI

**Tagline**: Trust-based P2P lending platform powered by AI

**Key Technologies to Highlight**:
- Google Gemini 2.5 Pro (AI Planning)
- VAPI AI (Conversational Calling)
- Radar.io (Location Tracking)
- Firebase (Authentication)
- MongoDB (Database)
- Make.com (Automation)

**Core Features to Mention**:
1. AI-powered installment planning
2. Conversational AI calling for reminders
3. Group lending (many-to-one)
4. Dynamic trust scoring
5. Witness verification system
6. Real-time location tracking
7. Payment proof management
8. Automated email workflows

**Impact Statement**:
"Transforming informal lending between friends and family into a structured, AI-powered experience that maintains trust while ensuring accountability."

**Problem Solved**:
"Awkward money conversations, forgotten payments, and lack of documentation in peer-to-peer lending."

**Innovation Highlight**:
"First platform to combine AI-generated payment plans, conversational AI reminders, and group lending dynamics in one solution."
