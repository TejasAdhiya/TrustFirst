# Installment Payment Proof Upload Feature

## Overview
Implemented a complete system for borrowers to upload payment proof screenshots for each installment in their selected AI-generated payment plan.

## User Flow

### 1. Select Installment Plan
- User views agreement details
- Clicks "Generate Installment Plan with AI"
- AI generates 3 plans (Aggressive, Balanced, Flexible)
- User selects one plan by clicking on it
- "SELECTED" badge appears on chosen plan
- User clicks "Confirm Selected Plan & Upload Payment Proofs" button

### 2. Upload Payment Proofs
- User is redirected to `/dashboard/agreement/[id]/upload-proofs` page
- Page displays all installments from selected plan in a **grid layout**
- Each installment card shows:
  - Installment number (1, 2, 3, etc.)
  - Payment date
  - Payment amount
  - Upload button or uploaded proof status

### 3. Upload Process
- User clicks "Upload Screenshot" on any installment card
- Selects image file from device
- File is validated (must be image, max 5MB)
- File uploads to server
- Card updates to show:
  - Green checkmark icon
  - File name
  - "View" and "Remove" buttons

### 4. Progress Tracking
- Progress bar shows X / Y proofs uploaded
- Once all proofs uploaded, success message appears
- User can return to agreement page

## Technical Implementation

### Database Schema Updates

**Agreement Model** (`models/Agreement.ts`):
```typescript
selectedInstallmentPlan?: {
  planIndex: number;
  planName: string;
  installments: Array<{
    date: string;
    amount: number;
    note?: string;
    proofUploaded: boolean;
    proofUrl?: string;
    proofFileName?: string;
    uploadedAt?: Date;
  }>;
}
```

### Component Updates

**InstallmentPlanGenerator** (`components/installment-plan-generator.tsx`):
- Added `agreementId` prop
- Added `onPlanConfirmed` callback prop
- Added "Confirm" button at bottom of dialog
- When confirmed, calls callback with selected plan data

**Agreement Detail Page** (`app/dashboard/agreement/[id]/page.tsx`):
- Passes `agreementId` to InstallmentPlanGenerator
- Passes `onPlanConfirmed` callback that navigates to upload page
- Navigation includes plan index as query parameter

### New Page

**Upload Proofs Page** (`app/dashboard/agreement/[id]/upload-proofs/page.tsx`):

**Features:**
- Grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)
- Progress card showing upload completion
- Individual cards for each installment with:
  - Sequential numbering (1, 2, 3...)
  - Date and amount display
  - Upload button
  - File validation
  - Loading states
  - Success indicators (green border, checkmark)
  - View/Remove buttons after upload

**Layout:**
```
┌─────────────────────────────────────────┐
│  Progress: 2 / 4 uploaded               │
│  [████████░░░░░░░░░░] 50%              │
└─────────────────────────────────────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐
│    1     │  │    2  ✓  │  │    3     │
│ Feb 15   │  │ Mar 15   │  │ Apr 15   │
│ ₹5,000   │  │ ₹5,000   │  │ ₹5,000   │
│ [Upload] │  │ [View][X]│  │ [Upload] │
└──────────┘  └──────────┘  └──────────┘

┌──────────┐
│    4  ✓  │
│ May 15   │
│ ₹5,000   │
│ [View][X]│
└──────────┘
```

### API Routes

**1. Save Plan** (`/api/agreements/[id]/save-plan`):
- POST endpoint
- Saves selected installment plan to agreement
- Initializes all installments with `proofUploaded: false`

**2. Upload Proof** (`/api/agreements/[id]/upload-installment-proof`):
- POST endpoint with multipart/form-data
- Accepts file and installment index
- Validates file type and size
- Saves file to `/public/uploads/installments/[agreementId]/`
- Updates agreement with proof URL and metadata
- Returns public URL for viewing

**3. Remove Proof** (`/api/agreements/[id]/remove-installment-proof`):
- POST endpoint
- Deletes file from filesystem
- Updates agreement to remove proof data
- Allows re-upload

## File Storage

**Location:** `/public/uploads/installments/[agreementId]/`

**Naming Convention:** `installment-[number]-[timestamp].[ext]`

**Example:**
- `installment-1-1738234567890.jpg`
- `installment-2-1738234598123.png`

## Validation

**File Upload:**
- Must be image file (image/*)
- Maximum size: 5MB
- Unique filename with timestamp

**Security:**
- Files stored in public directory (accessible via URL)
- Organized by agreement ID
- Timestamp prevents filename collisions

## User Experience Features

1. **Visual Feedback:**
   - Loading spinners during upload
   - Green borders and checkmarks for completed uploads
   - Progress bar showing overall completion
   - Toast notifications for success/error

2. **Grid Layout:**
   - Responsive: 1/2/3 columns based on screen size
   - Proper spacing between cards
   - Sequential numbering (Transaction 1, 2, 3...)
   - Clear visual hierarchy

3. **Flexibility:**
   - Upload in any order
   - Remove and re-upload proofs
   - View uploaded images in new tab
   - Return to agreement page anytime

4. **Completion State:**
   - Special card appears when all proofs uploaded
   - Success message with checkmark icon
   - "Back to Agreement" button

## Dynamic Behavior

- Works with any number of installments (2, 3, 4, 10, etc.)
- Adapts to selected plan (Aggressive, Balanced, or Flexible)
- Each plan can have different number of installments
- Grid automatically adjusts to number of items

## Integration Points

1. **AI Plan Generation:** Uses existing `generateInstallmentPlans` action
2. **Agreement System:** Extends existing agreement model
3. **File System:** Uses Node.js fs/promises for file operations
4. **Toast Notifications:** Uses existing toast hook
5. **Authentication:** Uses Firebase auth for user verification

## Future Enhancements (Not Implemented)

- Image preview before upload
- Crop/edit images
- Bulk upload multiple proofs
- Email notification to lender when all proofs uploaded
- Lender approval/rejection of individual proofs
- Payment verification status tracking

## Status
✅ **COMPLETE** - Full installment proof upload system with grid layout and proper spacing
