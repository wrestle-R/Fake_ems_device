# EMS Data Sender

This project contains two scripts to populate historical EMS device data:

## 🚀 Quick Start

### Option 1: Node.js Express Server (Recommended)

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Run the script:**
   ```bash
   npm start
   ```

### Option 2: Cloudflare Worker

1. **Deploy to Cloudflare Workers:**
   ```bash
   cd serverless
   npx wrangler deploy ems-worker.js
   ```

2. **Trigger data sending:**
   ```bash
   curl -X POST https://your-worker.workers.dev/send-all
   ```

## 📊 What It Does

- **Device ID:** `TN-862360078628612`
- **Time Range:** October 20, 2025 00:00 to October 26, 2025 23:59
- **Interval:** Every 2 minutes
- **Total Data Points:** ~5,040 readings (10,080 device records for 2 meters)

## 🔧 Features

### Realistic Data Generation:
- **Voltages:** Phase voltages (VRN, VYN, VBN) around 230V with daily variations
- **Line Voltages:** Calculated as √3 × phase voltage
- **Currents:** 
  - Working hours (9 AM - 6 PM): 15-45A
  - Outside hours: 2-12A
- **Power:** Calculated from voltage × current
- **Power Factor:** 0.85-0.96 (better during working hours)
- **Frequency:** 49.85-50.35 Hz (realistic grid frequency)
- **Energy (kWh):** Cumulative, increases over time realistically

### Two Meters:
- **MFM-1:** Lower consumption (avg 8.5 kW)
- **MFM-2:** Higher consumption (avg 12.3 kW)

## 📈 Data Pattern Logic

The script generates realistic electrical data with:

1. **Daily Cycles:** Voltage variations follow a sine wave pattern throughout the day
2. **Working Hours Detection:** Higher loads Monday-Saturday, 9 AM - 6 PM
3. **Random Variations:** Small random fluctuations to simulate real-world conditions
4. **Cumulative Energy:** kWh values increase over time based on power consumption
5. **Phase Balance:** Three-phase currents slightly different but balanced
6. **Reactive Energy:** KvArh and KvAh calculated proportionally

## 🎯 Expected Results

After running, you'll have:
- ~5,040 timestamps
- ~10,080 device readings (2 meters × 5,040 times)
- Complete historical data from Oct 20-26, 2025
- Realistic electrical parameters for dashboard visualization

## 📝 API Endpoint

**POST** `https://technode.co.in/TECHNODE_IOT/apis/ems_api.php`

Sample payload structure:
```json
{
  "ID": "TN-862360078628612",
  "Status": "Online",
  "Signal": 85,
  "Location": "TECHNODE OFFICE",
  "data": {
    "1": {
      "name": "MFM-1",
      "VRN": 231.45,
      "VYN": 233.12,
      ...
    },
    "2": {
      "name": "MFM-2",
      ...
    }
  },
  "TS": "2025-10-20T09:30:00",
  "DT": "EMS"
}
```

## ⚡ Performance

- **Node.js script:** ~4-8 minutes (with 50ms delay between requests)
- **Progress updates:** Every 100 records
- **Success tracking:** Real-time success/failure counting

## 🛠️ Troubleshooting

If data doesn't appear:
1. Check API endpoint is accessible
2. Verify device ID matches database
3. Check server logs for errors
4. Ensure database tables exist (ems_units, ems_devices, device_metrics)

## 📌 Notes

- Script includes small delays to avoid overwhelming the server
- All values are realistic and follow electrical engineering principles
- Energy values are cumulative and increase monotonically
- Data follows typical industrial consumption patterns
