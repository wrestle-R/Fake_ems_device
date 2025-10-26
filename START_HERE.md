# 🚀 QUICK START GUIDE - RUN THIS NOW!

## Steps to Populate Your EMS Data:

### 1️⃣ Open PowerShell/Terminal in the `server` folder

### 2️⃣ Install dependencies:
```powershell
npm install
```

### 3️⃣ Run the script:
```powershell
node ems-data-sender.js
```

### 4️⃣ Wait for completion (approximately 4-8 minutes)

You'll see progress updates like:
```
✓ [1/5040] 2025-10-20T00:00:00 - SUCCESS
✓ [2/5040] 2025-10-20T00:02:00 - SUCCESS
...
--- Progress: 100/5040 (2.0%) ---
Success: 100 | Failed: 0
```

## ✅ What You'll Get:

- **5,040 data points** sent to your API
- **Data range:** Oct 20, 2025 00:00 → Oct 26, 2025 23:59
- **Interval:** Every 2 minutes
- **Two meters:** MFM-1 and MFM-2 with realistic values
- **Device ID:** TN-862360078628612

## 🎯 Expected Completion:

Tomorrow morning you'll wake up to a fully populated dashboard with:
- ✅ Voltage readings (VRN, VYN, VBN, VRY, VYB, VBR)
- ✅ Current readings (IR, IY, IB) - realistic working hours pattern
- ✅ Power consumption (KW-R, KW-Y, KW-B)
- ✅ Power factor (PF-R, PF-Y, PF-B)
- ✅ Frequency (around 50 Hz)
- ✅ Cumulative energy (Kwh, KvAh, KvArh)

## 🔍 Verify Your Data:

After running, check your database:
```sql
-- Count total records
SELECT COUNT(*) FROM device_metrics;
-- Should show ~10,080 records (2 devices × 5,040 timestamps)

-- Check date range
SELECT MIN(timestamp), MAX(timestamp) FROM device_metrics;
-- Should show: 2025-10-20 00:00:00 to 2025-10-26 23:59:00

-- View sample data
SELECT * FROM device_metrics ORDER BY timestamp DESC LIMIT 10;
```

## ⚠️ Important:

- Make sure your API endpoint is accessible: https://technode.co.in/TECHNODE_IOT/apis/ems_api.php
- The script sends data with a 50ms delay between requests to avoid server overload
- If it fails, check the error messages and ensure your database is set up correctly

---

**Just run `npm install` then `node ems-data-sender.js` and you're done! 🎉**
