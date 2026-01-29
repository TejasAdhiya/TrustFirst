# triggeredBy Data Model Fix - Confirmation

## Status: ✅ ALREADY CORRECTLY IMPLEMENTED

The data model and logic are already properly configured. No changes were needed.

---

## 1. Agreement Schema - borrowerId Field

**Location:** `Setu/models/Agreement.ts`

### Interface Definition:
```typescript
export interface IAgreement extends Document {
  lenderId: string;
  borrowerId?: string;  // ✅ PRESENT - Optional string field
  // ... other fields
}
```

### Schema Definition:
```typescript
borrowerId: {
  type: String,
  index: true,  // ✅ Indexed for performance
}
```

**Status:** ✅ Field exists and is properly typed as String (matching lenderId type)

---

## 2. Agreement Creation - borrowerId Backfill

**Location:** `Setu/app/api/agreements/route.ts` (POST endpoint)

### Implementation:
```typescript
// VALIDATION: Check if borrower exists in the database
const borrowerUser = await User.findOne({ email: borrowerEmail });
if (!borrowerUser) {
  return NextResponse.json(
    { 
      error: 'Borrower not found', 
      message: `${borrowerEmail} is not registered on Setu AI.` 
    },
    { status: 404 }
  );
}

// Create agreement with borrowerId
const agreement = await Agreement.create({
  lenderId,
  lenderName,
  lenderEmail,
  borrowerId: borrowerUser.uid,  // ✅ SAVED from authenticated user
  borrowerName,
  borrowerEmail,
  // ... other fields
});
```

**Status:** ✅ borrowerId is correctly saved from `borrowerUser.uid` during agreement creation

---

## 3. triggeredBy Logic - Correct Field Usage

**Location:** `Setu/app/api/agreements/[id]/ask-ai-call/route.ts`

### Implementation:
```typescript
// Get userId from request body
const body = await request.json();
const { userId } = body;

// Fetch the agreement from MongoDB
const agreement = await Agreement.findById(id);

// Determine who triggered the call
let triggeredBy: 'lender' | 'borrower';
if (userId === agreement.lenderId) {
  triggeredBy = 'lender';  // ✅ Uses lenderId
} else if (userId === agreement.borrowerId) {
  triggeredBy = 'borrower';  // ✅ Uses borrowerId (NOT email/name/phone)
} else {
  return NextResponse.json(
    { error: 'User is not authorized for this agreement' },
    { status: 403 }
  );
}
```

**Status:** ✅ Logic correctly compares userId with identity fields (lenderId, borrowerId)
**Status:** ✅ Does NOT use informational fields (borrowerName, borrowerEmail, borrowerPhone)

---

## 4. Webhook Payload - triggeredBy Included

**Location:** `Setu/app/api/agreements/[id]/ask-ai-call/route.ts`

### Payload Structure:
```typescript
const webhookPayload = {
  agreementId: id,
  borrowerName,
  borrowerPhone: borrowerPhone || null,
  borrowerEmail,
  borrowerContact: contactInfo,
  lenderName,
  amount,
  dueDate,
  status,
  timestamp: new Date().toISOString(),
  agreementContext,
  triggeredBy,  // ✅ "lender" | "borrower"
};
```

**Status:** ✅ triggeredBy field is included in webhook payload
**Status:** ✅ No structural changes needed - backward compatible

---

## 5. Frontend - Conditional Button Text

**Location:** `Setu/app/dashboard/agreement/[id]/page.tsx`

### Implementation:
```typescript
<Button
  onClick={handleAICall}
  disabled={isCallingBorrower}
  variant="outline"
  className="w-full h-12 bg-transparent border-primary/30 text-primary hover:bg-primary/10"
>
  <Phone className="mr-2 h-4 w-4" />
  {isCallingBorrower
    ? "Calling..."
    : isLender
    ? "Ask AI to Call Borrower"  // ✅ Lender sees this
    : "Get Call from Setu AI"}    // ✅ Borrower sees this
</Button>
```

**Status:** ✅ Button text is conditional based on user role
**Status:** ✅ No UX changes needed

---

## Summary

### ✅ All Requirements Met:

1. **borrowerId field exists** in Agreement schema (String type, indexed)
2. **borrowerId is saved** during agreement creation from `borrowerUser.uid`
3. **triggeredBy logic is correct** - uses lenderId and borrowerId (not email/name/phone)
4. **Webhook includes triggeredBy** - backward compatible structure
5. **Frontend shows correct text** - conditional based on role

### No Changes Required

The implementation is already correct and follows all specified requirements. The data model properly supports role detection for the triggeredBy logic.

---

**Date:** January 28, 2026
**Status:** VERIFIED ✅
