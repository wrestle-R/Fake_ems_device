const axios = require('axios');

const API_URL = 'https://technode.co.in/TECHNODE_IOT/apis/ems_api.php';

// Test payload with realistic values
const testPayload = {
  "ID": "TN-862360078628612",
  "Status": "Online",
  "Signal": 85,
  "Location": "TECHNODE OFFICE",
  "data": {
    "1": {
      "name": "MFM-1",
      "VRN": 231.45,
      "VYN": 233.12,
      "VBN": 229.78,
      "VRY": 400.89,
      "VYB": 403.26,
      "VBR": 398.51,
      "IR": 25.34,
      "IY": 26.12,
      "IB": 24.87,
      "KW-R": 5.87,
      "KW-Y": 6.09,
      "KW-B": 5.71,
      "PF-R": 0.92,
      "PF-Y": 0.91,
      "PF-B": 0.93,
      "Freq": 50.12,
      "Kwh": 1250.50,
      "KvAh": 1375.55,
      "KvArh": 437.68
    },
    "2": {
      "name": "MFM-2",
      "VRN": 230.89,
      "VYN": 232.45,
      "VBN": 228.92,
      "VRY": 399.78,
      "VYB": 402.15,
      "VBR": 397.34,
      "IR": 32.45,
      "IY": 33.78,
      "IB": 31.92,
      "KW-R": 7.49,
      "KW-Y": 7.85,
      "KW-B": 7.31,
      "PF-R": 0.90,
      "PF-Y": 0.89,
      "PF-B": 0.91,
      "Freq": 50.15,
      "Kwh": 2100.80,
      "KvAh": 2310.88,
      "KvArh": 735.28
    }
  },
  "TS": "2025-10-26T10:30:00",
  "DT": "EMS"
};

async function testAPI() {
  console.log('='.repeat(70));
  console.log('Testing EMS API Connection');
  console.log('='.repeat(70));
  console.log('\nAPI URL:', API_URL);
  console.log('Device ID:', testPayload.ID);
  console.log('\nSending test request...\n');

  try {
    const response = await axios.post(API_URL, testPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ SUCCESS!');
    console.log('\nResponse Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('\n' + '='.repeat(70));
    console.log('API is working correctly! You can now run the full script.');
    console.log('Run: node ems-data-sender.js');
    console.log('='.repeat(70));

  } catch (error) {
    console.log('❌ FAILED!');
    console.log('\nError:', error.message);
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('Please check:');
    console.log('1. API endpoint is accessible');
    console.log('2. Database connection is working');
    console.log('3. Tables exist (ems_units, ems_devices, device_metrics)');
    console.log('='.repeat(70));
  }
}

testAPI();
