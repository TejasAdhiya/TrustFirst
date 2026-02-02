# Installment Upload Fix - Gemini Running Twice Issue

## Problems Identified

### 1. Gemini Running Twice
- **Issue**: AI was generating plans twice - once when user clicks "Generate Plan" and again when opening the upload page
- **Impact**: Slow performance, unnecessary API calls, wasted Gemini quota
- **Root Cause**: Upload page was regenerating the plan instead of using the already-selected plan

### 2. Upload Failing (400 Error)
- **Issue**: File uploads were failing with 400 error
- **Root Cause**: Plan wasn't saved to database before upload attempt, so validation failed

## Solutions Implemented

### Fix 1: Use SessionStorage to Pass Selected Plan

**Component: `components/installment-plan-generator.tsx`**

When user confirms a plan:
```typescript
const handleConfirmPlan = () => {
    if (selectedPlanIndex !== null && onPlanConfirmed) {
        const selectedPlan = plans[selectedPlanIndex]
        // Store plan in sessionStorage to avoid regenerating
        sessionStorage.setItem('selectedInstallmentPlan', JSON.stringify({
            planIndex: selectedPlanIndex,
            plan: selectedPlan
        }))
        onPlanConfirmed(selectedPlan, selectedPlanIndex)
        setIsOpen(false)
    }
}
```

**Benefits:**
- Plan data is immediately available on upload page
- No need to regenerate with Gemini
- Instant page load

### Fix 2: Load Plan from SessionStorage First

**Page: `app/dashboard/agreement/[id]/upload-proofs/page.tsx`**

Updated loading logic with priority order:
1. **First**: Check if plan already saved in database → Load it
2. **Second**: Check sessionStorage for just-selected plan → Save to DB, then load
3. **Third**: Fallback to regenerating (should rarely happen)

```typescript
if (data.agreement.selectedInstallmentPlan) {
    // Plan already in database - use it
    console.log('Loading existing plan from database')
    setInstallments(data.agreement.selectedInstallmentPlan.installments)
} else {
    // Check sessionStorage
    const storedPlanData = sessionStorage.getItem('selectedInstallmentPlan')
    if (storedPlanData) {
        // Save to database first, then load
        await savePlanToDatabase(storedPlanIndex, plan)
        sessionStorage.removeItem('selectedInstallmentPlan')
        setInstallments(plan.installments)
    }
}
```

### Fix 3: Ensure Plan is Saved Before Uploads

**Added safeguards:**
- Plan is saved to database immediately when upload page loads
- 500ms delay after save to ensure database write completes
- Better error handling if save fails
- Console logging for debugging

```typescript
const savePlanToDatabase = async (selectedPlanIndex: number, plan: any) => {
    console.log('Saving plan to database:', plan.planName)
    const saveResponse = await fetch(`/api/agreements/${id}/save-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            planIndex: selectedPlanIndex,
            planName: plan.planName,
            installments: plan.installments.map(inst => ({
                date: inst.date,
                amount: inst.amount,
                note: inst.note,
                proofUploaded: false,
            })),
        }),
    })
    
    // Wait to ensure write completes
    await new Promise(resolve => setTimeout(resolve, 500))
}
```

### Fix 4: Better Error Logging

**API: `app/api/agreements/[id]/upload-installment-proof/route.ts`**

Added detailed logging:
```typescript
if (!agreement.selectedInstallmentPlan) {
    console.error('Upload Error: No installment plan selected for agreement', id);
    return NextResponse.json(
        { error: 'No installment plan selected. Please select a plan first.' },
        { status: 400 }
    );
}

console.log('Agreement has plan with', agreement.selectedInstallmentPlan.installments.length, 'installments');
console.log('Uploading proof for installment index:', installmentIndex);
```

**Upload Page:**
```typescript
console.log('Uploading file for installment', index + 1, ':', file.name)
// ... after response
console.log('Upload successful:', data)
// or
console.error('Upload failed:', data)
```

## Flow After Fix

### User Journey:
1. User clicks "Generate Installment Plan with AI"
2. **Gemini runs ONCE** → Generates 3 plans
3. User selects a plan (e.g., "Balanced Approach")
4. User clicks "Confirm Selected Plan & Upload Payment Proofs"
5. Plan data stored in sessionStorage
6. User redirected to upload page
7. Upload page:
   - Reads plan from sessionStorage
   - Saves plan to database
   - Displays installments immediately
   - **NO Gemini call**
8. User uploads screenshots for each installment
9. All uploads work correctly

### Technical Flow:
```
[Generate Plans] 
    ↓ (Gemini API call)
[3 Plans Displayed]
    ↓ (User selects)
[Confirm Button]
    ↓ (Store in sessionStorage)
[Navigate to Upload Page]
    ↓ (Read from sessionStorage)
[Save to Database]
    ↓ (500ms delay)
[Display Installments]
    ↓ (User uploads)
[Upload Files] ✅ Success
```

## Benefits

1. **Performance**: Gemini only runs once instead of twice
2. **Speed**: Upload page loads instantly (no 16.9s wait)
3. **Reliability**: Plan is guaranteed to be in database before uploads
4. **Cost**: Saves Gemini API quota
5. **UX**: Smooth, fast experience

## Testing Checklist

- [x] Generate plan → Only 1 Gemini call in logs
- [x] Confirm plan → Redirects to upload page instantly
- [x] Upload page → Shows installments immediately
- [x] Upload file → Works without 400 error
- [x] Refresh upload page → Plan still loads from database
- [x] Multiple uploads → All work correctly

## Status
✅ **FIXED** - Gemini now runs only once, uploads work correctly
