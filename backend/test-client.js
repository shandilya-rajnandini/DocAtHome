const http = require('http');

// Function to make HTTP requests
function makeRequest(path, method = 'POST', data = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: JSON.parse(data || '{}')
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function testRateLimiting() {
  console.log('🧪 Testing Rate Limiting Implementation...\n');
  
  try {
    // Test 1: Login Rate Limiting (should allow 5 requests)
    console.log('📊 Test 1: Login Rate Limiting (Max 5 requests per 15 minutes)');
    for (let i = 1; i <= 7; i++) {
      try {
        const response = await makeRequest('/test/login', 'POST');
        if (response.statusCode === 200) {
          console.log(`✅ Request ${i}: SUCCESS (${response.statusCode})`);
        } else if (response.statusCode === 429) {
          console.log(`🚫 Request ${i}: RATE LIMITED (${response.statusCode}) - ${response.body.error}`);
        }
      } catch (error) {
        console.log(`❌ Request ${i}: ERROR - ${error.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Test 2: Auth Rate Limiting (Max 10 requests per 15 minutes)');
    for (let i = 1; i <= 12; i++) {
      try {
        const response = await makeRequest('/test/auth', 'POST');
        if (response.statusCode === 200) {
          console.log(`✅ Request ${i}: SUCCESS (${response.statusCode})`);
        } else if (response.statusCode === 429) {
          console.log(`🚫 Request ${i}: RATE LIMITED (${response.statusCode}) - ${response.body.error}`);
        }
      } catch (error) {
        console.log(`❌ Request ${i}: ERROR - ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait a moment then run tests
setTimeout(testRateLimiting, 2000);
