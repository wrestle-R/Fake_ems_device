// Cloudflare Worker for EMS Data Sending
// Deploy this to Cloudflare Workers

const API_URL = 'https://technode.co.in/TECHNODE_IOT/apis/ems_api.php';
const DEVICE_ID = 'TN-862360078628612';
const LOCATION = 'TECHNODE OFFICE';

// Time range: Oct 20, 2025 00:00 to Oct 26, 2025 23:59
const START_DATE = new Date('2025-10-20T00:00:00');
const END_DATE = new Date('2025-10-26T23:59:00');
const INTERVAL_MINUTES = 2;

// Realistic value generators
class ValueGenerator {
  constructor() {
    this.baseVoltage = {
      VRN: 230,
      VYN: 232,
      VBN: 228
    };
    this.workingHoursStart = 9;
    this.workingHoursEnd = 18;
  }

  isWorkingHours(date) {
    const hour = date.getHours();
    const day = date.getDay();
    return day >= 1 && day <= 6 && hour >= this.workingHoursStart && hour < this.workingHoursEnd;
  }

  random(min, max) {
    return Math.random() * (max - min) + min;
  }

  generateVoltage(baseValue, date) {
    const hourVariation = Math.sin(date.getHours() / 24 * Math.PI * 2) * 3;
    const randomVariation = this.random(-1.5, 1.5);
    return parseFloat((baseValue + hourVariation + randomVariation).toFixed(2));
  }

  generateCurrent(date) {
    if (this.isWorkingHours(date)) {
      return parseFloat(this.random(15, 45).toFixed(2));
    } else {
      return parseFloat(this.random(2, 12).toFixed(2));
    }
  }

  generatePower(voltage, current) {
    const power = (voltage * current) / 1000;
    return parseFloat(power.toFixed(2));
  }

  generatePowerFactor(date) {
    if (this.isWorkingHours(date)) {
      return parseFloat(this.random(0.88, 0.96).toFixed(2));
    } else {
      return parseFloat(this.random(0.85, 0.92).toFixed(2));
    }
  }

  generateFrequency() {
    return parseFloat(this.random(49.85, 50.35).toFixed(2));
  }

  generateSignal() {
    return Math.floor(this.random(70, 95));
  }

  generateCumulativeEnergy(deviceNum, timestamp) {
    const baseEnergy = deviceNum === 1 ? 1250.5 : 2100.8;
    const hoursElapsed = (timestamp - START_DATE) / (1000 * 60 * 60);
    const avgRate = deviceNum === 1 ? 8.5 : 12.3;
    const accumulated = avgRate * hoursElapsed;
    return parseFloat((baseEnergy + accumulated).toFixed(2));
  }

  generateDeviceData(deviceNum, timestamp) {
    const date = new Date(timestamp);
    
    const VRN = this.generateVoltage(this.baseVoltage.VRN, date);
    const VYN = this.generateVoltage(this.baseVoltage.VYN, date);
    const VBN = this.generateVoltage(this.baseVoltage.VBN, date);
    
    const VRY = parseFloat((VRN * Math.sqrt(3) + this.random(-2, 2)).toFixed(2));
    const VYB = parseFloat((VYN * Math.sqrt(3) + this.random(-2, 2)).toFixed(2));
    const VBR = parseFloat((VBN * Math.sqrt(3) + this.random(-2, 2)).toFixed(2));
    
    const IR = this.generateCurrent(date);
    const IY = this.generateCurrent(date) * this.random(0.95, 1.05);
    const IB = this.generateCurrent(date) * this.random(0.95, 1.05);
    
    const KW_R = this.generatePower(VRN, IR);
    const KW_Y = this.generatePower(VYN, IY);
    const KW_B = this.generatePower(VBN, IB);
    
    const PF_R = this.generatePowerFactor(date);
    const PF_Y = this.generatePowerFactor(date) * this.random(0.98, 1.02);
    const PF_B = this.generatePowerFactor(date) * this.random(0.98, 1.02);
    
    const Freq = this.generateFrequency();
    
    const Kwh = this.generateCumulativeEnergy(deviceNum, timestamp);
    const KvAh = parseFloat((Kwh * 1.1).toFixed(2));
    const KvArh = parseFloat((Kwh * 0.35).toFixed(2));
    
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

function generateTimestamps() {
  const timestamps = [];
  let currentTime = new Date(START_DATE);
  
  while (currentTime <= END_DATE) {
    timestamps.push(new Date(currentTime));
    currentTime = new Date(currentTime.getTime() + INTERVAL_MINUTES * 60 * 1000);
  }
  
  return timestamps;
}

function formatTimestamp(date) {
  return date.toISOString().slice(0, 19);
}

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
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    return {
      success: response.ok,
      timestamp: formatTimestamp(timestamp),
      response: data
    };
  } catch (error) {
    return {
      success: false,
      timestamp: formatTimestamp(timestamp),
      error: error.message
    };
  }
}

// Cloudflare Worker event handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    const url = new URL(request.url);
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        message: 'EMS Worker is running'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Send all data endpoint
    if (url.pathname === '/send-all' && request.method === 'POST') {
      const timestamps = generateTimestamps();
      const generator = new ValueGenerator();
      
      let successCount = 0;
      let failCount = 0;
      const results = [];
      
      console.log(`Starting to send ${timestamps.length} data points...`);
      
      // Process in batches to avoid timeout
      const batchSize = 50;
      for (let i = 0; i < timestamps.length; i += batchSize) {
        const batch = timestamps.slice(i, i + batchSize);
        const batchPromises = batch.map(timestamp => sendData(timestamp, generator));
        
        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(result => {
          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
          results.push(result);
        });
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return new Response(JSON.stringify({
        success: true,
        total: timestamps.length,
        successful: successCount,
        failed: failCount,
        successRate: (successCount / timestamps.length * 100).toFixed(2) + '%',
        sample: results.slice(0, 5) // Return first 5 results as sample
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Send single timestamp endpoint
    if (url.pathname === '/send-single' && request.method === 'POST') {
      const body = await request.json();
      const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();
      const generator = new ValueGenerator();
      
      const result = await sendData(timestamp, generator);
      
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};
