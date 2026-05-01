# 🤝 TrustFirst - Web3-Powered P2P Lending Platform

<div align="center">

![TrustFirst](https://img.shields.io/badge/TrustFirst-NEAR%20Blockchain-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![NEAR AI](https://img.shields.io/badge/NEAR-AI%20Cloud-green?style=for-the-badge)

**Blockchain-powered informal lending with AI mediation and TEE security**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Web3 Integration](#-web3-integration)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Web3 Integration](#-web3-integration)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Features Deep Dive](#-features-deep-dive)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**TrustFirst** is a Web3-powered peer-to-peer lending platform that brings transparency and accountability to informal money lending. Built on NEAR blockchain with AI-powered mediation, TrustFirst transforms casual lending into a secure, trackable, and trust-based experience.

### The Problem
- Awkward money conversations between friends/family
- Forgotten payments and broken promises
- Lack of documentation for informal loans
- No structured repayment plans
- Difficulty tracking multiple small loans
- No privacy in financial negotiations

### The Solution
TrustFirst provides:
- ✅ **NEAR Blockchain** for transparent, immutable agreements
- ✅ **NEAR AI Cloud** with TEE security for private AI negotiations
- ✅ AI-generated personalized repayment plans
- ✅ Automated reminders via email and AI voice calls
- ✅ Group lending for community support
- ✅ Payment proof tracking with screenshots
- ✅ Witness verification for added credibility
- ✅ Real-time location tracking for security
- ✅ Privacy-preserving AI chat for deadline extensions

---

## 🎯 Key Features

### 1. **NEAR Blockchain Integration** ⛓️
- **Immutable Agreements**: All lending agreements stored on NEAR blockchain
- **Transparent History**: Complete audit trail of all transactions
- **Smart Contracts**: Automated agreement enforcement
- **Decentralized Trust**: No central authority needed
- **On-chain Verification**: Cryptographic proof of agreements

### 2. **NEAR AI Cloud with TEE Security** 🔒
- **Trusted Execution Environment (TEE)**: All AI processing happens in secure enclaves
- **Privacy-Preserving AI**: Conversations encrypted and private
- **Claude Sonnet 4.5**: Powered by Anthropic's latest model via NEAR AI
- **AI Negotiation Chat**: Borrowers can chat with AI to:
  - Extend deadlines (using buffer days)
  - Get payment advice
  - Check payment history
  - Request installment plans
- **Role-Aware AI**: Different capabilities for borrowers vs lenders
- **Context-Aware**: AI knows agreement details, buffer days, payment history
- **Real-time Updates**: Agreement updates instantly after AI approval

### 3. **AI-Powered Installment Planning** 🤖
- **Google Gemini 2.5 Flash**: Multiple free models with fallback
- Generates 3 personalized repayment plans:
  - **Aggressive**: Fast repayment, higher installments
  - **Balanced**: Moderate payments over reasonable time
  - **Flexible**: Smaller payments spread over longer period
- Smart date validation ensures all payments before due date
- Considers borrower context and financial capacity

### 4. **Conversational AI Calling** 📞
- **VAPI AI** integration for natural voice calls
- Automated payment reminders via phone
- Professional, empathetic conversation flow
- One-click call initiation by lenders
- Real-time call status tracking
- **Make.com** automation for call workflows

### 5. **Group Lending (Many-to-One)** 👥
- Create groups of friends, family, or colleagues
- Request money from entire group
- Multiple people contribute partial amounts
- Each contribution creates individual 1-on-1 agreement
- Request auto-closes when full amount received
- Admin controls for group creators

### 6. **Dynamic Trust Score System** 📊
- Real-time trust score (0-100) for each agreement
- Score decreases if payments are late
- **Strict Mode** option for faster penalties
- Visual indicators with color coding
- Blockchain-verified payment history

### 7. **Witness Verification** ✅
- Add third-party witness to agreements
- Email-based approval workflow
- Witness can approve/reject agreements
- Adds legal credibility to informal lending
- Notification system for all parties

### 8. **Real-Time Location Tracking** 📍
- **Radar.io** integration
- Track borrower's live location (with consent)
- Location history with timestamps
- Address geocoding (city, state, country)
- Privacy-focused implementation

### 9. **Payment Proof Management** �
- Upload multiple payment screenshots
- Grid-based UI for organized tracking
- Individual proof for each installment
- View/remove uploaded proofs
- Progress tracking (X/Y proofs uploaded)

### 10. **Smart Email Notifications** �
- Automated email workflows
- Professional HTML email templates
- Clickable buttons with live URLs
- Real-time delivery status

---

## 🌐 Web3 Integration

### NEAR Blockchain
TrustFirst leverages NEAR Protocol for:

1. **Agreement Storage**: All agreements stored on-chain
2. **Immutable Records**: Cannot be altered or deleted
3. **Transparent History**: Public verification of agreements
4. **Smart Contracts**: Automated enforcement of terms
5. **Decentralized Trust**: No central authority needed

### NEAR AI Cloud
TrustFirst uses NEAR AI Cloud for secure AI processing:

1. **TEE Security**: Trusted Execution Environment ensures privacy
2. **Encrypted Processing**: All AI conversations are encrypted
3. **No Data Leakage**: Even platform operators can't see raw data
4. **Claude Sonnet 4.5**: Latest AI model via NEAR AI
5. **Real-time Negotiation**: Instant deadline extensions and advice

**Test NEAR AI Integration:**
```
GET /api/test-near-ai
```
Returns:
- Model: anthropic/claude-sonnet-4-5
- Response time
- Token usage
- Actual AI response

### Privacy Features
- **TEE-Secured Chats**: All negotiations happen in secure enclaves
- **End-to-End Encryption**: Messages encrypted in transit
- **Zero-Knowledge Proofs**: Verify without revealing data
- **Decentralized Storage**: No single point of failure

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.0** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful component library
- **Lucide Icons** - Modern icon set

### Backend & Database
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB Atlas** - Cloud NoSQL database
- **Mongoose** - MongoDB ODM

### Web3 & Blockchain
- **NEAR Protocol** - Layer-1 blockchain for agreements
- **NEAR AI Cloud** - TEE-secured AI processing
- **Claude Sonnet 4.5** - AI model via NEAR AI

### AI & Automation
- **NEAR AI Cloud** - Privacy-preserving AI negotiations
- **Google Gemini 2.5 Flash** - AI installment planning
- **VAPI AI** - Conversational voice calling
- **Make.com** - Webhook automation workflows

### External Services
- **Firebase** - Authentication & user management
- **Radar.io** - Location tracking & geocoding
- **Nodemailer** - Email delivery
- **Ngrok** - Local development tunneling

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                     Next.js 16 + React                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                        │
│              (Serverless Functions)                          │
└─┬───────┬──────┬──────────┬──────────┬──────────┬──────────┘
  │       │      │          │          │          │
  ▼       ▼      ▼          ▼          ▼          ▼
┌────┐ ┌────┐ ┌──────┐  ┌──────┐  ┌──────┐  ┌────────┐
│ DB │ │NEAR│ │NEAR  │  │Gemini│  │VAPI  │  │Radar.io│
│    │ │ AI │ │Block │  │  AI  │  │  AI  │  │Location│
└────┘ └────┘ └──────┘  └──────┘  └──────┘  └────────┘
MongoDB  TEE   Chain                                    
```

### Data Flow

1. **User Authentication**: Firebase handles login/signup
2. **Agreement Creation**: Stored in MongoDB + NEAR blockchain
3. **AI Negotiation**: NEAR AI Cloud with TEE security
4. **AI Planning**: Gemini generates installment plans
5. **Notifications**: Nodemailer sends emails
6. **Voice Calls**: VAPI AI makes conversational calls
7. **Location**: Radar.io tracks borrower location
8. **File Storage**: Local filesystem for payment proofs

## 🎨 Features Deep Dive

### AI Installment Planning

The AI installment planner uses Google Gemini 2.5 Pro to generate personalized repayment schedules:

1. **Input Analysis**: Analyzes amount, due date, and borrower context
2. **Plan Generation**: Creates 3 distinct plans with different strategies
3. **Date Validation**: Ensures all installments are before due date
4. **Smart Scheduling**: Distributes payments evenly (monthly/bi-weekly)
5. **User Selection**: Borrower selects preferred plan
6. **Proof Tracking**: Each installment tracked with screenshot uploads

**Example Plans for ₩10,000 due in 3 months:**

- **Aggressive**: 2 payments of ₩5,000 each (1 month)
- **Balanced**: 3 payments of ₩3,333 each (2 months)
- **Flexible**: 4 payments of ₩2,500 each (3 months)

### Group Lending Workflow

1. **Create Group**: User creates group and adds members
2. **Request Money**: Member posts money request to group
3. **Contributions**: Multiple members contribute partial amounts
4. **Agreement Creation**: Each contribution creates 1-on-1 agreement
5. **Request Closure**: Auto-closes when full amount received
6. **Individual Tracking**: Each agreement tracked separately

**Example:**
- Alice requests ₩10,000 from "College Friends" group
- Bob contributes ₩3,000 → Creates Agreement #1 (Bob → Alice)
- Charlie contributes ₩4,000 → Creates Agreement #2 (Charlie → Alice)
- David contributes ₩3,000 → Creates Agreement #3 (David → Alice)
- Request closes, Alice has 3 separate agreements to repay

### Trust Score Algorithm

```typescript
// Initial score: 80
let trustScore = 80

// If payment is late:
if (daysOverdue > 0) {
  if (strictMode) {
    trustScore -= (daysOverdue * 2) // Faster penalty
  } else {
    trustScore -= daysOverdue // Normal penalty
  }
}

// Minimum score: 0
trustScore = Math.max(0, trustScore)
```

### Email Templates

All emails use professional HTML templates with:
- Responsive design
- Branded colors
- Clickable buttons
- Dynamic content
- Ngrok URLs for live access

**Email Types:**
1. Agreement Request
2. Witness Approval Request
3. Witness Approved Notification
4. Payment Reminder
5. Settlement Confirmation

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Go to https://vercel.com/new
- Import your repository
- Add environment variables
- Deploy

3. **Update URLs**
- Replace ngrok URL with Vercel URL
- Update `NEXT_PUBLIC_APP_URL`
- Update Firebase authorized domains

### Environment Variables on Vercel

Add all variables from `.env.local` to Vercel:
- Settings → Environment Variables
- Add each variable
- Redeploy

### Custom Domain

1. Add domain in Vercel settings
2. Update DNS records
3. Update `NEXT_PUBLIC_APP_URL`
4. Update Firebase authorized domains

---

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting PR

---



## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **VAPI AI** for conversational calling
- **Radar.io** for location services
- **Firebase** for authentication
- **MongoDB** for database
- **Vercel** for hosting
- **Shadcn/ui** for beautiful components

---


<div align="center">


⭐ Star this repo if you find it helpful!

</div>
