# Quick Start Guide - QR Attendance System

## Getting Started

### 1. Start the Frontend
```bash
cd frontend
npm install  # Only first time
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite shows)

## How to Use the System

### Step 1: Create an Event ✅
1. Click the **"Event QR"** tab at the top
2. Type your event name (e.g., "Annual Conference 2025")
3. Click **"Generate Event QR"** button
4. A QR code will appear - you can download it
5. Share this QR with attendees or scan it to register

### Step 2: Register Attendees ✅
1. Click the **"Register"** tab
2. Fill in attendee details:
   - **Name** (required)
   - **Email** (required)
   - **Faculty** (required) - Choose from: BBA, BCA, CSIT, BITM, BSC, BBS, BA, BSW
   - **Roll Number** (required)
   - **Contact Number** (required) - Must start with 98
   - **Address** (required)
   - **Semester/Year** - Depends on faculty
3. Click **"Register"** button
4. A QR code will be generated for the attendee
5. Attendee appears in the attendees list with "registered" status

### Step 3: Scan for Attendance ✅
1. Click the **"Scanner"** tab
2. If no event is created, you'll see a warning - go back and create one
3. Click **"Start Scanner"** button
4. Your camera will activate
5. Point it at attendee's QR code to scan
6. **For Testing Without Camera:**
   - Click **"Scan Valid QR"** to simulate successful scan
   - Click **"Scan WiFi QR"** to test invalid QR detection
7. When scanned successfully:
   - User status changes to "present"
   - Timestamp is recorded
   - Success message appears

### Step 4: View Attendees ✅
1. Click the **"Attendees"** tab
2. See all registered and scanned users
3. **Export as CSV:**
   - Click "Export CSV" button
   - File downloads with all attendance data
   - Columns: Name, Email, Phone, Student ID, Roll No, Faculty, Semester, Status, Scanned At

### Step 5: Manage Data ✅
- **Clear All:** Removes event and all attendees (with confirmation)
- **Data Persistence:** All data saves automatically to browser storage
- Refresh the page - your event and attendee data stays!

## Workflow Example

### Scenario: Conference Registration

**Morning - Setup:**
```
1. Event QR tab → Create "TechConf 2025" event
2. Print or display the event QR code at registration desk
```

**Throughout Day - Registration:**
```
1. Attendee approaches registration
2. Staff uses Register tab to enter attendee details
3. Generate QR code for that attendee
4. Print QR code or send digitally
```

**Checking In - Scanning:**
```
1. Attendee shows up with their QR code
2. Use Scanner tab to scan the QR
3. System marks attendance with timestamp
4. Attendee can proceed
```

**End of Day - Report:**
```
1. Go to Attendees tab
2. Export CSV
3. Send to management/HR
4. Done!
```

## Tips & Tricks

### ✅ For Event Setup
- Use a clear, concise event name
- Download the event QR code and print it for physical display
- QR code remains the same even after page refresh

### ✅ For Registration
- All required fields must be filled
- Phone number must be 10 digits starting with 98 (Nepal format)
- Roll number should be in capital letters
- Each registered user gets a unique QR code

### ✅ For Scanning
- Ensure good lighting when using camera
- QR code should be clearly visible
- Demo buttons work without camera for testing
- You can scan the same person multiple times - it updates their record

### ✅ For Data Management
- All data is stored locally in your browser
- Clear browser data will delete everything
- Export CSV before clearing for backup
- Data persists across sessions/refreshes

## Common Issues & Solutions

### ❌ "No Active Event" Error
**Solution:** Go to Event QR tab and create an event first

### ❌ Camera Not Working
**Solution:** 
- Check browser permissions
- Allow camera access when prompted
- Use demo buttons instead (Scan Valid QR)

### ❌ QR Code Not Generating
**Solution:**
- Check internet connection (QR generation uses online API)
- Try again in a few moments
- Use the demo buttons for testing

### ❌ Invalid QR Code Error
**Solution:**
- Ensure it's a user QR code (not event QR)
- QR code must be from registered attendee
- Check if QR code image is clear and not damaged

### ❌ Data Disappeared After Refresh
**Solution:**
- Check if browser storage was cleared
- Try exporting CSV before clearing data
- Data should persist - if not, it may be a browser issue

## Keyboard Shortcuts

- **Tab Navigation:** Click any tab directly
- **Demo Scanning:** No keyboard shortcuts - use buttons

## Browser Compatibility

- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Requires camera permission for full functionality

## Accessibility

- All buttons have clear labels
- Form fields have helpful descriptions
- Error messages are clear and actionable
- Color-coded status indicators (Green = success, Red = error)

## Privacy & Security

- All data stored locally in browser
- No data sent to external servers except QR generation API
- Each QR code has a unique signature
- Clear all data button available for privacy

## Advanced Features

### Data Export
The CSV export includes:
- Name, Email, Phone, Student ID, Roll Number
- Faculty, Semester/Year, Status
- Timestamp of when user was scanned

### Event Tracking
Statistics shown at top:
- Present Today: Count of scanned attendees
- Registered: Count of registered users
- Total Attendees: All users
- Event Status: Active/No Event

### localStorage Management
Data keys:
- `currentEvent`: Event details
- `eventAttendees`: All attendee records

## Troubleshooting

### Check System Status
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Check for any error messages
4. Application tab → Storage → Local Storage shows your data

### Reset Everything
If the app is acting weird:
1. Click "Clear All" button with confirmation
2. Refresh the page
3. Start fresh

## Contact & Support

For issues or questions:
- Check the error messages in the app
- Check browser console (F12)
- Ensure all required fields are filled
- Try the demo buttons to test functionality

## Version Info

- Version: 1.0
- Last Updated: 2025
- Technology: React + Vite + Tailwind CSS

---

**Ready to go!** Start with creating an event and registering your first attendee. 🎉
