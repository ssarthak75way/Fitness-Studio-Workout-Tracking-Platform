# Full Application Testing Guide

This document outlines step-by-step procedures to thoroughly test every core feature and business rule implemented in the application using the consolidated Master Seeder.

## **Prerequisites: Master Seeder Setup**
Before proceeding with any tests, wipe the database and generate exact data scenarios tailor-made for these test cases by running the Master Seeder from the `server` directory:

```bash
cd server
npx tsx src/scripts/master-seeder.ts
```

### **Universal Test Credentials**
* **Password for all accounts:** `password123`
* **Admin / Owner:** `admin@studio.com`
* **Instructor (Near Expiry):** `alex@studio.com`
* **Member (Corporate Logic):** `member1@example.com`
* **Member (Cross-Location Check-In):** `member2@example.com`
* **Member (Plateaued Bench Press):** `member5@example.com`

---

## 1. Impersonation (Admin Feature)
**Concept**: Admins can log in as a member to troubleshoot without needing their password. Actions are logged and notified.
**Testing Steps**:
1. Login with a `STUDIO_ADMIN` account.
2. Navigate to the Admin Dashboard / User Management page.
3. Select a member and click "Impersonate".
4. Navigate through the app—notice the UI indicates you are impersonating. Book a class.
5. Stop impersonating.
6. **Result**: The member receives an email/notification that an admin accessed their account. Check the DB `AuditLog` collection to see the distinct `impersonatorId` attached to the booking action.

## 2. Instructor Double-Booking & Cancellation Coverage
**Concept**: Studio A schedules must not conflict with Studio B. If a class is cancelled, the system checks for coverage.
**Testing Steps**:
1. Create a class at "Studio East" for Instructor X at 10:00 AM.
2. Attempt to create a class at "Studio West" for Instructor X at 10:30 AM (overlapping).
3. **Result**: The system strictly rejects the second booking with a cross-studio conflict error.
4. Schedule Instructor Y for a class at 2:00 PM. Cancel Instructor Y's class.
5. **Result**: The system automatically prompts/notifies available instructors (who are free at 2:00 PM) to cover the newly orphaned class.

## 3. Late Cancellation Penalties & Atomic Waitlists
**Concept**: Cancelling within 2 hours burns a credit. If the waitlist immediately fills the slot, the penalty is waived.
**Testing Steps**:
1. Create a class starting in 1 hour with a capacity of 1.
2. Member A books it. Member B joins the waitlist.
3. Member A cancels. 
4. **Result**: Member B is atomically promoted to `CONFIRMED`. Member A's credit is **refunded** (penalty waived because the slot was filled).
5. Repeat without Member B on the waitlist.
6. **Result**: Member A's credit is permanently deducted (penalty enforced).

## 4. Workout Plateau Detection
**Concept**: Flag stalling exercises across 4 consecutive sessions and suggest deloads.
**Testing Steps**:
1. Login as a Member. Log a workout including "Bench Press" at 100 lbs for 10 reps.
2. Log 3 more sessions on different days with the *exact same weight and reps* for Bench Press.
3. View the Progress/Analytics tab.
4. **Result**: The system flags a "Plateau Detected for Bench Press" and suggests varying the rep range or switching to "Dumbbell Press".

## 5. Body Metrics (Lossless Conversion)
**Concept**: Switch between Imperial and Metric without floating point drift rounding errors.
**Testing Steps**:
1. Set profile to `Imperial`. Log weight as 200 lbs.
2. Switch profile to `Metric`.
3. **Result**: The UI precisely displays 90.7 kg.
4. Switch back to `Imperial`.
5. **Result**: The UI rigorously displays exactly 200 lbs without turning into 199.99 lbs, proving the canonical metric DB storage works losslessly.

## 6. Certification Expiry Enforcement
**Concept**: Automatically remove uncertified instructors and warn 30 days prior.
**Testing Steps**:
1. Login as `alex@studio.com` (Instructor).
2. Look at the Instructor Dashboard / Schedule.
3. **Result**: A 30-day warning notification is immediately triggered in their dashboard, because the seeder set their expiry exactly 15 days out.
4. From the database, manually set Alex's `certificationExpiryDate` to yesterday.
5. As Admin, attempt to schedule a new class for Alex.
6. **Result**: The schedule request is categorically blocked.

## 7. Prorated Memberships (Mid-Cycle)
**Concept**: Switch from Monthly to Annual and pay only the difference.
**Testing Steps**:
1. As a member, purchase a $99 Monthly Unlimited plan on Day 1.
2. Fast forward 15 days into the membership.
3. Upgrade to the $999 Annual Plan.
4. **Result**: The system evaluates 15 days of unused Monthly value (~$49.50) and subtracts it from $999. The checkout dynamically charges ~$949.50.

## 8. GPS Check-In Fraud Prevention
**Concept**: Cannot check in >500m away, nor outside the -15 min to +30 min window without staff.
**Testing Steps**:
1. Book a class starting tomorrow. 
2. Attempt to check in now via QR.
3. **Result**: Blocked (Outside designated time window).
4. Wait until 10 minutes before class. Override your browser/device GPS to mimic being 2 miles away from the studio.
5. Attempt check-in.
6. **Result**: Blocked (Location anomaly > 500m). Staff must manually use the "Override Check-in" button on the Admin panel to force it.

## 9. Periodization Templates
**Concept**: 12-week programs auto-cycling hypertrophy -> strength -> peaking.
**Testing Steps**:
1. Enroll in the "12-Week Powerbuilder" template.
2. Complete weeks 1-4 (Hypertrophy phase).
3. **Result**: Upon entering week 5, the app automatically drops the prescribed rep ranges (from 10-12 to 4-6) and increases the suggested working weights based on the 1RM calculated during week 4.

## 10. Progress Analytics & Statistical Goal Prediction
**Concept**: Project when a user will hit a target via regression.
**Testing Steps**:
1. Navigate to the Advanced Analytics page. Select "Squat" and enter a Goal Weight of 300 lbs.
2. Ensure you have at least 5 logged sessions spanning a month.
3. **Result**: The chart renders a "Rate of Progression" trendline and outputs a text prediction: "Expected to reach 300 lbs in approx. 4 weeks (Confidence: ± 8 days)".

## 11. Notification Quiet Hours
**Concept**: Suppress non-critical pings during sleep.
**Testing Steps**:
1. In Profile Settings, turn on Quiet Hours for "Promotions" from 10:00 PM to 8:00 AM (your local timezone).
2. Through the Admin portal, trigger a mass Promotional blast at 11:30 PM.
3. **Result**: The notification is successfully suppressed for your account.

## 12. Tamper-Resistant Ratings
**Concept**: 48h lock, attendee strictly enforced, trimmed statistical mean.
**Testing Steps**:
1. Attempt to rate a class you did not book. -> **Result**: Blocked.
2. Attend a class (get checked in). Wait 3 days. Attempt to rate it. -> **Result**: Blocked (Outside 48h window).
3. Attend a class, check in, and rate it 5-stars immediately after.
4. Have 10 other users rate the class mostly 4s, but one user rates it 1-star.
5. **Result**: Look at the class rating. The Trimmed Mean will discard the 1-star (bottom outlier) and your 5-star (top outlier), displaying a highly accurate 4.0 mean score alongside a visual 5-block histogram.

## 13. Cross-Location Financial Reconciliation
**Concept**: Studio East owes Studio West if someone crosses borders.
**Testing Steps**:
1. Login as Admin (`admin@studio.com`). 
2. The seeder has already injected a `ReconciliationLog` mimicking `member2@example.com` (Home Studio: East) checking into a class at Studio West.
3. Navigate to the `/studios/:id/reconciliation` endpoint or Dashboard view for **Studio East**.
4. **Result**: Studio East's "Payables" dynamically shows $30 owed to Studio West for the cross-attendance.

## 14. Corporate Wellness Programs
**Concept**: Strict zero-rollover monthly caps.
**Testing Steps**:
1. Login as `member1@example.com` (Mapped to Acme Corp with a rigid cap of 5).
2. Ensure you look at your credits—they should momentarily show 5.
3. The seeder set this member's `billingCycleRenewalDate` to *yesterday*.
4. Attempt to Book a Class.
5. **Result**: `BookingService` dynamically intercepts the action ("lazy-evaluation"). Instead of carrying over unused credits, it aggressively hard-resets their total precisely back to 5, advances their renewal date to next month, and allows the booking. 

---
*End of Testing Guide.*





# Logs

```bash
    5way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test1.ts && npx tsx test1.ts                       
    --- TEST 1: Admin Impersonation & Audit Logging ---
    Logging in as Admin: admin@studio.com
    Impersonating Member: member1@example.com (ID: 6998355ed7ce80abe50b4a42)
    Using impersonation token to fetch profile...
    Verifying Audit Log creation...
    Found Logs count: 17
    - Action: GET /profile, Path: /profile
    - Action: GET /, Path: /
    - Action: GET /, Path: /
    - Action: GET /, Path: /
    - Action: GET /, Path: /
    - Action: GET /my-bookings, Path: /my-bookings
    - Action: GET /my-bookings, Path: /my-bookings
    - Action: POST /, Path: /
    - Action: POST /stop-impersonation, Path: /stop-impersonation
    - Action: POST /stop-impersonation, Path: /stop-impersonation
    - Action: POST /stop-impersonation, Path: /stop-impersonation
    - Action: POST /stop-impersonation, Path: /stop-impersonation
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    SUCCESS: Audit Log entry found for impersonated action.
    Verifying Notification to Member...
    SUCCESS: Notification sent to member about impersonation.
    --- TEST 1: Admin Impersonation & Audit Logging ---
    Logging in as Admin: admin@studio.com
    Impersonating Member: member1@example.com (ID: 6998355ed7ce80abe50b4a42)
    Using impersonation token to fetch profile...
    Verifying Audit Log creation...
    Found Logs count: 18
    - Action: GET /profile, Path: /profile
    - Action: GET /, Path: /
    - Action: GET /, Path: /
    - Action: GET /, Path: /
    - Action: GET /, Path: /
    - Action: GET /my-bookings, Path: /my-bookings
    - Action: GET /my-bookings, Path: /my-bookings
    - Action: POST /, Path: /
    - Action: POST /stop-impersonation, Path: /stop-impersonation
    - Action: POST /stop-impersonation, Path: /stop-impersonation
    - Action: POST /stop-impersonation, Path: /stop-impersonation
    - Action: POST /stop-impersonation, Path: /stop-impersonation
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    SUCCESS: Audit Log entry found for impersonated action.
    Verifying Notification to Member...
    SUCCESS: Notification sent to member about impersonation.
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test1.ts                                           
    --- TEST 1: Admin Impersonation & Audit Logging ---
    Logging in as Admin: admin@studio.com
    Impersonating Member: member1@example.com (ID: 6998355ed7ce80abe50b4a42)
    Using impersonation token to fetch profile...
    Verifying Audit Log creation...
    Found Logs count: 19
    - Action: GET /profile, Path: /profile
    - Action: GET /, Path: /
    - Action: GET /, Path: /
    - Action: GET /, Path: /
    - Action: GET /, Path: /
    - Action: GET /my-bookings, Path: /my-bookings
    - Action: GET /my-bookings, Path: /my-bookings
    - Action: POST /, Path: /
    - Action: POST /stop-impersonation, Path: /stop-impersonation
    - Action: POST /stop-impersonation, Path: /stop-impersonation
    - Action: POST /stop-impersonation, Path: /stop-impersonation
    - Action: POST /stop-impersonation, Path: /stop-impersonation
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    - Action: GET /profile, Path: /profile
    SUCCESS: Audit Log entry found for impersonated action.
    Verifying Notification to Member...
    SUCCESS: Notification sent to member about impersonation.
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test2.ts                                           
    --- TEST 2: Double Booking & Coverage ---
    Creating Class 1 at East...
    TEST 2 ERROR: {
    status: 'fail',
    error: {
        statusCode: 403,
        status: 'fail',
        isOperational: true,
        level: 'error',
        service: 'fitness-platform-api',
        timestamp: '2026-02-20 16:58:32'
    },
    message: 'Instructor certifications have expired. They cannot be scheduled until renewed.',
    stack: 'Error: Instructor certifications have expired. They cannot be scheduled until renewed.\n' +
        '    at Object.createClass (/Users/75way-mac-48/Desktop/75Way S/F Stack Ass3/server/src/modules/classes/class.service.ts:20:17)\n' +
        '    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n' +
        '    at async createClassHandler (/Users/75way-mac-48/Desktop/75Way S/F Stack Ass3/server/src/modules/classes/class.controller.ts:13:26)'
    }
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test3.ts
    --- TEST 3: Late Cancel & Waitlist ---
    Creating Class with Capacity 1 starting in 1 hr...
    Member A books..
    Member B joins waitlist..
    Member A credits before cancel: 8
    Member A late cancels (should waive penalty because B is promoted)...
    Member A credits after cancel: 9
    SUCCESS: Credit refunded (waived)
    Member B final status: CONFIRMED
    === SCENARIO 2: No Waitlist - Strict Penalty ===
    Member A books..
    Member A credits before cancel #2: 8
    Member A credits after cancel #2 (Should permanently lose credit): 8
    SUCCESS: Credit permanently deducted (strict penalty enforced)
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test4.ts
    --- TEST 4: Workout Plateau Detection ---
    Logged Session 1: Bench Press 100 lbs x 10
    Logged Session 2: Bench Press 100 lbs x 10
    Logged Session 3: Bench Press 100 lbs x 10
    Logged Session 4: Bench Press 100 lbs x 10
    Fetching Plateaus...
    SUCCESS: Plateau detected!
    {
    groupName: 'Horizontal Push',
    status: 'PLATEAU',
    lastExercises: [ 'Bench Press' ],
    maxWeightTrend: [ 100, 100, 100, 100 ],
    suggestion: 'Try Incline Press or a deload week'
    }
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test5.ts
    --- TEST 5: Body Metrics (Lossless Conversion) ---
    User inputs: 200 lbs
    Stored in DB canonically as (kg): 90.7185
    Displayed as Metric (kg): 90.7 kg
    Converted back to Imperial (precision): 200.0001
    Displayed as Imperial (lbs): 200 lbs
    SUCCESS: Lossless Conversion verified! Exactly 200 returned.
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test6.ts
    --- TEST 6: Certification Expiry ---
    Checking notifications for 30-day warning...
    NOTE: Expiry warning logic might be executed in a cron job or scheduled task, checking manual route...
    Set expiry to yesterday. Admin attempting to schedule class...
    SUCCESS: System blocked scheduling! Reason: Instructor certifications have expired. They cannot be scheduled until renewed.
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test7.ts
    --- TEST 7: Workout Templates & Periodization ---
    Initiating Periodization Program...
    SUCCESS: Program initiated. ID: 6998457673f53c166e060f59 Start Date: 2026-02-20T11:28:54.192Z
    Fetching Workout Templates...
    Using template: Bench Mastery (699840b9bcd4a587dcace7b8)
    Fetching Suggested Weights...
    Phase: HYPERTROPHY
    Week: 1
    Bench Press original: 100, Prescribed: 100
    SUCCESS: Periodization prescription verified!
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test8.ts
    --- TEST 8: Notification Quiet Hours ---
    Setting quiet hours for user: member1@example.com
    Current UTC Hour: 11
    Setting Quiet Hours: 10:00 to 12:00 (UTC)
    Attempting to send CLASS_REMINDER during quiet hours...
    🔇 Notification suppressed for user 6998355ed7ce80abe50b4a42 due to quiet hours (CLASS_REMINDER).
    SUCCESS: Notification suppressed during quiet hours.
    Updating Quiet Hours to 13:00 to 15:00 (UTC) to test loud period...
    Attempting to send CLASS_REMINDER outside quiet hours...
    📱 Notification sent to user 6998355ed7ce80abe50b4a42: This should be delivered
    SUCCESS: Notification delivered outside quiet hours.
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test9.ts
    --- TEST 9: Advanced Analytics & Predictions ---
    Cleaning up old logs for "Regression Deadlift"...
    Logging 4 incremental workouts for "Regression Deadlift"...
    Fetching Advanced Analytics for "Regression Deadlift" with target 135kg...
    Gain per Week: 35
    R-Squared (Fit): 1
    Days to Goal: 4
    Predicted Date: 2026-02-24T11:29:00.272Z
    Is Decelerating: false
    SUCCESS: Predictions calculated correctly.
    Verdict: Reaching 135kg in ~4 days.
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test10.ts
    --- TEST 10: Prorated Membership Changes ---
    Cleaning up existing memberships for user...
    Creating a 15-day-old Monthly membership...
    Requesting upgrade to ANNUAL plan...
    Calculated Prorated Amount: 952.8
    SUCCESS: Proration logic verified (~952.8 reached).
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test11.ts
    --- TEST 11: Tamper-Resistant Ratings ---
    Creating a past class...
    Attempting to rate without attendance...
    SUCCESS: Blocked rating without attendance. Reason: You can only rate classes you have attended.
    Creating confirmed booking for attendance...
    Attempting to rate with attendance...
    SUCCESS: Rating accepted with attendance.
    Verifying Trimmed Mean logic...
    Trimmed Mean (Calculated): 5.0
    Distribution: { '1': 1, '2': 0, '3': 0, '4': 0, '5': 9 }
    SUCCESS: Trimmed Mean successfully ignored outliers (1.0 stars).
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test12.ts
    ^[[A^[[A--- TEST 12: Cross-Location Financial Reconciliation ---
    Setting up Home and Host Studios...
    Assigning Home Studio to member...
    Creating class at Host Location...
    Creating confirmed booking...
    Performing manual check-in at Host Location...
    Verifying Reconciliation Log...
    SUCCESS: Reconciliation Log created.
    Amount recorded: 35
    SUCCESS: Reconciliation amount and host studio verified.
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test13.ts
    Cleaning up instructor schedule and renewing certifications...
    --- TEST 13: Corporate Wellness Programs ---
    Setting up Corporate Account...
    Creating corporate membership with expired renewal date...
    Creating a future class via API...
    Class created via API: 6998458d73f53c166e060fa3
    Booking class via API (Member Token)...
    SUCCESS: Booking created.
    Credits Remaining: 1
    SUCCESS: Corporate credits lazy reset and deduction verified.
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % npx tsx test14.ts && npx tsx test14.ts && npx tsx test14.ts
    --- TEST 14: GPS Check-In Fraud Prevention ---
    Creating class within time window...
    Attempting check-in from far location (expected failure)...
    SUCCESS: Blocked far check-in. Reason: Location anomaly detected: You are 157249m away. Staff authorization required.
    Creating class OUTSIDE time window...
    Attempting check-in outside time window (expected failure)...
    SUCCESS: Blocked early check-in. Reason: Check-in mission failed: You are outside the designated time window (-15m/+30m).
    Attempting valid check-in (In window, correct location)...
    SUCCESS: Valid check-in accepted.
    --- TEST 14: GPS Check-In Fraud Prevention ---
    Creating class within time window...
    Attempting check-in from far location (expected failure)...
    SUCCESS: Blocked far check-in. Reason: Location anomaly detected: You are 157249m away. Staff authorization required.
    Creating class OUTSIDE time window...
    Attempting check-in outside time window (expected failure)...
    SUCCESS: Blocked early check-in. Reason: Check-in mission failed: You are outside the designated time window (-15m/+30m).
    Attempting valid check-in (In window, correct location)...
    SUCCESS: Valid check-in accepted.
    --- TEST 14: GPS Check-In Fraud Prevention ---
    Creating class within time window...
    Attempting check-in from far location (expected failure)...
    SUCCESS: Blocked far check-in. Reason: Location anomaly detected: You are 157249m away. Staff authorization required.
    Creating class OUTSIDE time window...
    Attempting check-in outside time window (expected failure)...
    SUCCESS: Blocked early check-in. Reason: Check-in mission failed: You are outside the designated time window (-15m/+30m).
    Attempting valid check-in (In window, correct location)...
    SUCCESS: Valid check-in accepted.
    75way-mac-48@75WAY-Mac-48s-Mac-mini scripts % 

```