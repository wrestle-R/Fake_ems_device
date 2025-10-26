const axios = require('axios');

// Configuration
const API_URL = 'https://technode.co.in/TECHNODE_IOT/apis/ems_api.php';
const DEVICE_ID = 'TN-862360078628612';
const LOCATION = 'TECHNODE OFFICE';

// Time range: Oct 20, 2025 00:00 to Oct 26, 2025 23:59
const START_DATE = new Date('2025-10-01T00:00:00');
const END_DATE = new Date('2025-10-26T23:59:00');
const INTERVAL_MINUTES = 2; // Send data every 2 minutes

// Realistic value generators with daily variation patterns
class ValueGenerator {
  constructor() {
    // Base values for voltages (with slight variations throughout the day)
    this.baseVoltage = {
      VRN: 230,
      VYN: 232,
      VBN: 228
    };
    
    // Working hours: 9 AM to 6 PM have higher load
    this.workingHoursStart = 9;
    this.workingHoursEnd = 18;
  }

  // Check if time is during working hours
  isWorkingHours(date) {
    const hour = date.getHours();
    const day = date.getDay();
    // Monday to Saturday (0 = Sunday, 6 = Saturday)
    return day >= 1 && day <= 6 && hour >= this.workingHoursStart && hour < this.workingHoursEnd;
  }

  // Generate random variation
  random(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Generate voltage with small variations
  generateVoltage(baseValue, date) {
    const hourVariation = Math.sin(date.getHours() / 24 * Math.PI * 2) * 3; // +/- 3V daily cycle
    const randomVariation = this.random(-1.5, 1.5);
    return parseFloat((baseValue + hourVariation + randomVariation).toFixed(2));
  }

  // Generate line voltage (√3 times phase voltage)
  generateLineVoltage(phaseVoltages) {
    const avg = (phaseVoltages.VRN + phaseVoltages.VYN + phaseVoltages.VBN) / 3;
    const lineVoltage = avg * Math.sqrt(3);
    return parseFloat(lineVoltage.toFixed(2));
  }

  // Generate current based on time of day (higher during working hours)
  generateCurrent(date) {
    if (this.isWorkingHours(date)) {
      return parseFloat(this.random(15, 45).toFixed(2)); // Higher current during working hours
    } else {
      return parseFloat(this.random(2, 12).toFixed(2)); // Lower current outside working hours
    }
  }

  // Generate power (kW) based on voltage and current
  generatePower(voltage, current) {
    const power = (voltage * current) / 1000; // Convert to kW
    return parseFloat(power.toFixed(2));
  }

  // Generate power factor (typically between 0.85 and 0.99)
  generatePowerFactor(date) {
    if (this.isWorkingHours(date)) {
      return parseFloat(this.random(0.88, 0.96).toFixed(2)); // Better PF during working hours
    } else {
      return parseFloat(this.random(0.85, 0.92).toFixed(2));
    }
  }

  // Generate frequency (should be close to 50 Hz)
  generateFrequency() {
    return parseFloat(this.random(49.85, 50.35).toFixed(2));
  }

  // Generate signal strength (70-95)
  generateSignal() {
    return Math.floor(this.random(70, 95));
  }

  // Generate cumulative energy (kWh) - increases over time
  generateCumulativeEnergy(deviceNum, timestamp) {
    // Base energy at start of period
    const baseEnergy = deviceNum === 1 ? 1250.5 : 2100.8;
    
    // Calculate hours elapsed since start
    const hoursElapsed = (timestamp - START_DATE) / (1000 * 60 * 60);
    
    // Average consumption rate (kW) - higher for device 2
    const avgRate = deviceNum === 1 ? 8.5 : 12.3;
    
    // Add accumulated energy
    const accumulated = avgRate * hoursElapsed;
    
    return parseFloat((baseEnergy + accumulated).toFixed(2));
  }

  // Generate device data for a specific timestamp
  generateDeviceData(deviceNum, timestamp) {
    const date = new Date(timestamp);
    
    // Phase voltages
    const VRN = this.generateVoltage(this.baseVoltage.VRN, date);
    const VYN = this.generateVoltage(this.baseVoltage.VYN, date);
    const VBN = this.generateVoltage(this.baseVoltage.VBN, date);
    
    // Line voltages (√3 times phase voltage with slight variations)
    const VRY = parseFloat((VRN * Math.sqrt(3) + this.random(-2, 2)).toFixed(2));
    const VYB = parseFloat((VYN * Math.sqrt(3) + this.random(-2, 2)).toFixed(2));
    const VBR = parseFloat((VBN * Math.sqrt(3) + this.random(-2, 2)).toFixed(2));
    
    // Currents (slightly different for each phase)
    const IR = this.generateCurrent(date);
    const IY = this.generateCurrent(date) * this.random(0.95, 1.05);
    const IB = this.generateCurrent(date) * this.random(0.95, 1.05);
    
    // Power for each phase
    const KW_R = this.generatePower(VRN, IR);
    const KW_Y = this.generatePower(VYN, IY);
    const KW_B = this.generatePower(VBN, IB);
    
    // Power factors
    const PF_R = this.generatePowerFactor(date);
    const PF_Y = this.generatePowerFactor(date) * this.random(0.98, 1.02);
    const PF_B = this.generatePowerFactor(date) * this.random(0.98, 1.02);
    
    // Frequency
    const Freq = this.generateFrequency();
    
    // Cumulative energy
    const Kwh = this.generateCumulativeEnergy(deviceNum, timestamp);
    const KvAh = parseFloat((Kwh * 1.1).toFixed(2)); // Apparent energy slightly higher
    const KvArh = parseFloat((Kwh * 0.35).toFixed(2)); // Reactive energy
    
    return {
      name: `MFM-${deviceNum}`,
      VRN: parseFloat(VRN.toFixed(2)),
      VYN: parseFloat(VYN.toFixed(2)),
      VBN: parseFloat(VBN.toFixed(2)),
      VRY: parseFloat(VRY.toFixed(2)),
      VYB: parseFloat(VYB.toFixed(2)),
      VBR: parseFloat(VBR.toFixed(2)),
      IR: parseFloat(IR.toFixed(2)),
      IY: parseFloat(IY.toFixed(2)),
      IB: parseFloat(IB.toFixed(2)),
      "KW-R": parseFloat(KW_R.toFixed(2)),
      "KW-Y": parseFloat(KW_Y.toFixed(2)),
      "KW-B": parseFloat(KW_B.toFixed(2)),
      "PF-R": parseFloat(PF_R.toFixed(2)),
      "PF-Y": parseFloat(PF_Y.toFixed(2)),
      "PF-B": parseFloat(PF_B.toFixed(2)),
      Freq: Freq,
      Kwh: Kwh,
      KvAh: KvAh,
      KvArh: KvArh
    };
  }
}

// Generate all timestamps
function generateTimestamps() {
  const timestamps = [];
  let currentTime = new Date(START_DATE);
  
  while (currentTime <= END_DATE) {
    timestamps.push(new Date(currentTime));
    currentTime = new Date(currentTime.getTime() + INTERVAL_MINUTES * 60 * 1000);
  }
  
  return timestamps;
}

// Format timestamp for API
function formatTimestamp(date) {
  return date.toISOString().slice(0, 19); // Format: 2025-10-20T12:30:00
}

// Send data to API
async function sendData(timestamp, generator) {
  const payload = {
    ID: DEVICE_ID,
    Status: "Online",
    Signal: generator.generateSignal(),
    Location: LOCATION,
    data: {
      "1": generator.generateDeviceData(1, timestamp),
      "2": generator.generateDeviceData(2, timestamp)
    },
    TS: formatTimestamp(timestamp),
    DT: "EMS"
  };

  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      timestamp: formatTimestamp(timestamp),
      response: response.data
    };
  } catch (error) {
    return {
      success: false,
      timestamp: formatTimestamp(timestamp),
      error: error.response ? error.response.data : error.message
    };
  }
}

// Main execution
async function main() {
  console.log('='.repeat(70));
  console.log('EMS Data Sender - Historical Data Population');
  console.log('='.repeat(70));
  console.log(`Device ID: ${DEVICE_ID}`);
  console.log(`Time Range: ${START_DATE.toISOString()} to ${END_DATE.toISOString()}`);
  console.log(`Interval: Every ${INTERVAL_MINUTES} minutes`);
  console.log('='.repeat(70));
  
  const timestamps = generateTimestamps();
  console.log(`\nTotal data points to send: ${timestamps.length} (${timestamps.length * 2} device readings)`);
  console.log('\nStarting data transmission...\n');
  
  const generator = new ValueGenerator();
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < timestamps.length; i++) {
    const timestamp = timestamps[i];
    const result = await sendData(timestamp, generator);
    
    if (result.success) {
      successCount++;
      console.log(`✓ [${i + 1}/${timestamps.length}] ${result.timestamp} - SUCCESS`);
    } else {
      failCount++;
      console.log(`✗ [${i + 1}/${timestamps.length}] ${result.timestamp} - FAILED: ${JSON.stringify(result.error)}`);
    }
    
    // Add small delay to avoid overwhelming the server (50ms between requests)
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Progress update every 100 records
    if ((i + 1) % 100 === 0) {
      console.log(`\n--- Progress: ${i + 1}/${timestamps.length} (${((i + 1) / timestamps.length * 100).toFixed(1)}%) ---`);
      console.log(`Success: ${successCount} | Failed: ${failCount}\n`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('DATA TRANSMISSION COMPLETE');
  console.log('='.repeat(70));
  console.log(`Total Sent: ${timestamps.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Success Rate: ${(successCount / timestamps.length * 100).toFixed(2)}%`);
  console.log('='.repeat(70));
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { ValueGenerator, generateTimestamps, sendData };
