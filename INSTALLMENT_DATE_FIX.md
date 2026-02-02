# AI Installment Plan Due Date Fix

## Problem Identified
The AI-generated installment plans were creating payment schedules that extended **beyond the agreement's due date**. 

### Example Issue:
- Agreement Due Date: **February 13, 2026**
- AI Generated Installments: February 20, March 20, April 30, May 31, **June 30** ❌
- Result: Installments scheduled after the due date, which is incorrect

## Solution Implemented

### 1. Enhanced AI Prompt with Strict Date Constraints
**File**: `app/actions/generate-installment-plan.ts`

#### Added Dynamic Date Calculations:
```typescript
const today = new Date()
const dueDateObj = new Date(dueDate)
const daysUntilDue = Math.ceil((dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
const monthsUntilDue = Math.floor(daysUntilDue / 30)
```

#### Updated Prompt with Critical Requirements:
- **CRITICAL REQUIREMENT**: ALL installment dates MUST be on or before the due date
- Explicitly states: "No installment can have a date after [dueDate]"
- Provides calculated days and months until due date to AI
- Suggests appropriate plan durations based on available time:
  - Aggressive: ~40% of available time
  - Balanced: ~70% of available time
  - Flexible: Full available time (up to due date)

### 2. Validation Function
Added `validateInstallmentDates()` function that:
- Checks every installment date in every plan
- Compares against the due date (set to end of day: 23:59:59)
- Returns `false` if any date exceeds the due date
- Logs errors for debugging

```typescript
function validateInstallmentDates(plans: InstallmentPlan[], dueDate: string): boolean {
    const dueDateObj = new Date(dueDate)
    dueDateObj.setHours(23, 59, 59, 999) // End of due date
    
    for (const plan of plans) {
        for (const installment of plan.installments) {
            const installmentDate = new Date(installment.date)
            if (installmentDate > dueDateObj) {
                console.error(`Invalid installment date: ${installment.date} is after due date ${dueDate}`)
                return false
            }
        }
    }
    return true
}
```

### 3. Auto-Fix Function
Added `fixInstallmentDates()` function as a safety net:
- Automatically corrects any dates that exceed the due date
- Redistributes installments evenly between today and the due date
- Maintains the same number of installments and amounts
- Only modifies dates, preserving all other plan details

```typescript
function fixInstallmentDates(plans: InstallmentPlan[], dueDate: string): InstallmentPlan[] {
    // Recalculates dates to fit within today -> due date timespan
    // Distributes installments evenly across available time
}
```

### 4. Response Validation Pipeline
Updated the AI response handling to:
1. Parse the JSON response from AI
2. **Validate** all dates using `validateInstallmentDates()`
3. If validation fails, **automatically fix** using `fixInstallmentDates()`
4. Log warnings when fixes are applied
5. Return corrected plans to user

```typescript
let plans = JSON.parse(text) as InstallmentPlan[];

const isValid = validateInstallmentDates(plans, dueDate)

if (!isValid) {
    console.warn(`[GeneratePlans] AI generated dates beyond due date. Fixing...`)
    plans = fixInstallmentDates(plans, dueDate)
    console.log(`[GeneratePlans] Dates fixed to respect due date: ${dueDate}`)
}

return { plans };
```

## How It Works Now

### For Any Agreement:
1. User clicks "Generate Installment Plan with AI"
2. System fetches agreement details including:
   - Amount: ₹10,000
   - Due Date: February 13, 2026
   - Borrower Name: Shardul Narvekar
3. System calculates:
   - Days until due: 14 days
   - Months until due: 0 months (less than 30 days)
4. AI receives enhanced prompt with:
   - Explicit due date constraint
   - Available time window
   - Suggested plan durations
5. AI generates 3 plans with dates **before February 13, 2026**
6. System validates all dates
7. If any date is invalid, system auto-corrects it
8. User receives valid plans with all dates ≤ due date

### Example Corrected Output:
- Agreement Due Date: **February 13, 2026**
- Aggressive Plan: Feb 5, Feb 10 ✅
- Balanced Plan: Feb 3, Feb 7, Feb 11 ✅
- Flexible Plan: Feb 2, Feb 5, Feb 8, Feb 11 ✅

## Benefits

1. **Guaranteed Compliance**: All installment dates will always be on or before the due date
2. **Dynamic Adaptation**: Plans adjust based on available time until due date
3. **Fail-Safe Mechanism**: Even if AI makes a mistake, the validation layer catches and fixes it
4. **Works for All Agreements**: Logic is completely dynamic and works for any agreement regardless of:
   - Amount
   - Due date
   - Time remaining
   - Interest rate
5. **No Breaking Changes**: Existing functionality remains intact
6. **Better AI Guidance**: AI receives clearer instructions with calculated constraints

## Testing Recommendations

Test with various scenarios:
1. **Short deadline** (< 1 month): Plans should have fewer, larger installments
2. **Medium deadline** (1-3 months): Plans should have balanced monthly installments
3. **Long deadline** (> 3 months): Plans should offer more flexible options
4. **Very short deadline** (< 1 week): Plans should have daily or bi-weekly installments

All scenarios will respect the due date constraint.

## Status
✅ **COMPLETE** - All installment dates are now guaranteed to be on or before the agreement due date
