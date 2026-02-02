# Upload Screenshot Debug Guide

## Changes Made to Fix Upload Issues

### 1. Added Mongoose `markModified()` Call
**Problem**: Mongoose doesn't automatically detect changes to nested objects
**Solution**: Explicitly mark the field as modified before saving

```typescript
agreement.selectedInstallmentPlan.installments[installmentIndex].proofUploaded = true;
agreement.selectedInstallmentPlan.installments[installmentIndex].proofUrl = proofUrl;
agreement.selectedInstallmentPlan.installments[installmentIndex].proofFileName = file.name;
agreement.selectedInstallmentPlan.installments[installmentIndex].uploadedAt = new Date();

// CRITICAL: Mark as modified for Mongoose
agreement.markModified('selectedInstallmentPlan');

await agreement.save();
```

### 2. Enhanced Logging Throughout
Added detailed console logs at every step:

**Save Plan API** (`/api/agreements/[id]/save-plan`):
- Agreement ID
- Plan name and index
- Number of installments
- Success/failure messages

**Upload Proof API** (`/api/agreements/[id]/upload-installment-proof`):
- Agreement ID
- File details (name, size, type)
- Installment index
- Directory creation
- File write operations
- Database save operations

### 3. Better Error Handling
- Try-catch around file write operations
- Detailed error messages
- Validation at each step

## How to Debug Upload Issues

### Step 1: Check Browser Console
Open browser DevTools (F12) and look for:
- Network tab → Check the upload request
- Console tab → Look for error messages

### Step 2: Check Server Terminal
Look for these log messages in order:

```
=== Save Installment Plan Request ===
Agreement ID: [id]
Plan: Balanced Approach Index: 1 Installments: 3
Installment plan saved successfully: Balanced Approach with 3 installments

=== Upload Installment Proof Request ===
Agreement ID: [id]
File: screenshot.png Size: 123456 Type: image/png
Installment Index: 0
Agreement has plan with 3 installments
Uploading proof for installment index: 0
File converted to buffer, size: 123456 bytes
Upload directory: C:\...\public\uploads\installments\[id]
Directory created/verified
Writing file to: C:\...\public\uploads\installments\[id]\installment-1-1234567890.png
File written successfully
Public URL: /uploads/installments/[id]/installment-1-1234567890.png
Proof uploaded and saved successfully for installment 1
```

### Step 3: Common Errors and Solutions

#### Error: "No installment plan selected"
**Cause**: Plan wasn't saved to database before upload attempt
**Solution**: 
- Check that save-plan API was called successfully
- Look for "Installment plan saved successfully" in logs
- Verify 500ms delay completed

#### Error: "Invalid installment index"
**Cause**: Index out of bounds or wrong index sent
**Solution**:
- Check installment index in logs
- Verify it's 0, 1, 2 (not 1, 2, 3)
- Check installments array length

#### Error: "Failed to write file"
**Cause**: File system permissions or path issues
**Solution**:
- Check if `public/uploads/installments/` directory exists
- Verify write permissions
- Check disk space

#### Error: 400 Bad Request
**Cause**: Various validation failures
**Solution**:
- Check server logs for specific error message
- Verify file is actually selected
- Check file type and size

### Step 4: Verify File Upload

After successful upload, check:

1. **File System**: 
   - Navigate to `public/uploads/installments/[agreementId]/`
   - Verify file exists with correct name

2. **Database**:
   - Check agreement document
   - Verify `selectedInstallmentPlan.installments[X].proofUploaded = true`
   - Verify `proofUrl` is set

3. **UI**:
   - Card should turn green
   - Checkmark should appear
   - "View" and "Remove" buttons should show

## Testing Checklist

- [ ] Select installment plan → Check "Plan saved successfully" in logs
- [ ] Click "Upload Screenshot" → File picker opens
- [ ] Select image file → Check file details in logs
- [ ] Upload starts → Check "Writing file to" in logs
- [ ] Upload completes → Check "Proof uploaded and saved successfully" in logs
- [ ] UI updates → Green border, checkmark appears
- [ ] File exists → Check `public/uploads/installments/[id]/` folder
- [ ] Database updated → Check agreement document
- [ ] Can view image → Click "View" button opens image
- [ ] Can remove → Click "X" button removes proof

## Expected Console Output (Success)

```
Browser Console:
Loading plan from sessionStorage and saving to database
Saving plan to database: Balanced Approach
Plan saved successfully to database
Uploading file for installment 1 : screenshot.png
Upload successful: {message: "Proof uploaded successfully", proofUrl: "/uploads/...", fileName: "screenshot.png"}

Server Terminal:
=== Save Installment Plan Request ===
Agreement ID: 697b99d6b4e0278b232bb275
Plan: Balanced Approach Index: 1 Installments: 3
Installment plan saved successfully: Balanced Approach with 3 installments
POST /api/agreements/697b99d6b4e0278b232bb275/save-plan 200 in 53ms

=== Upload Installment Proof Request ===
Agreement ID: 697b99d6b4e0278b232bb275
File: screenshot.png Size: 245678 Type: image/png
Installment Index: 0
Agreement has plan with 3 installments
File converted to buffer, size: 245678 bytes
Directory created/verified
File written successfully
Proof uploaded and saved successfully for installment 1
POST /api/agreements/697b99d6b4e0278b232bb275/upload-installment-proof 200 in 89ms
```

## If Still Not Working

1. **Restart the development server** - Sometimes Next.js needs a restart
2. **Clear browser cache** - Old code might be cached
3. **Check file permissions** - Ensure write access to public folder
4. **Try different image** - Test with a small PNG file
5. **Check MongoDB connection** - Verify database is accessible

## Status
✅ All fixes applied - Upload should now work with detailed logging for debugging
