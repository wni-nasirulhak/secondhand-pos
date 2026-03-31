// Test Script for v2.0
const http = require('http');

function testAPI(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: body ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(body))
      } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing E-commerce Live Scraper v2.0...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Core API
  console.log('📋 Test Group 1: Core API');
  try {
    const tests = [
      { name: 'GET /api/platforms', path: '/api/platforms' },
      { name: 'GET /api/status', path: '/api/status' },
      { name: 'GET /api/comments', path: '/api/comments' }
    ];

    for (const test of tests) {
      try {
        const result = await testAPI('GET', test.path);
        if (result.status === 200) {
          console.log(`  ✅ ${test.name}`);
          passed++;
        } else {
          console.log(`  ❌ ${test.name} (Status: ${result.status})`);
          failed++;
        }
      } catch (error) {
        console.log(`  ❌ ${test.name} (Error: ${error.message})`);
        failed++;
      }
    }
  } catch (error) {
    console.log(`  ❌ Group error: ${error.message}`);
  }

  // Test 2: Webhooks API
  console.log('\n📋 Test Group 2: Webhooks API');
  try {
    const result1 = await testAPI('GET', '/api/webhooks');
    if (result1.status === 200) {
      console.log('  ✅ GET /api/webhooks');
      passed++;
    } else {
      console.log('  ❌ GET /api/webhooks');
      failed++;
    }

    const testWebhook = {
      platform: 'discord',
      url: 'https://discord.com/api/webhooks/test',
      enabled: true
    };
    const result2 = await testAPI('POST', '/api/webhooks', testWebhook);
    if (result2.status === 200) {
      console.log('  ✅ POST /api/webhooks');
      passed++;
    } else {
      console.log('  ❌ POST /api/webhooks');
      failed++;
    }
  } catch (error) {
    console.log(`  ❌ Webhooks error: ${error.message}`);
    failed++;
  }

  // Test 3: Users API
  console.log('\n📋 Test Group 3: Users API');
  try {
    const tests = [
      { name: 'GET /api/users/all', path: '/api/users/all' },
      { name: 'GET /api/users/blacklist', path: '/api/users/blacklist' },
      { name: 'GET /api/users/whitelist', path: '/api/users/whitelist' },
      { name: 'GET /api/users/viplist', path: '/api/users/viplist' }
    ];

    for (const test of tests) {
      try {
        const result = await testAPI('GET', test.path);
        if (result.status === 200) {
          console.log(`  ✅ ${test.name}`);
          passed++;
        } else {
          console.log(`  ❌ ${test.name}`);
          failed++;
        }
      } catch (error) {
        console.log(`  ❌ ${test.name} (${error.message})`);
        failed++;
      }
    }
  } catch (error) {
    console.log(`  ❌ Users error: ${error.message}`);
  }

  // Test 4: Stats API
  console.log('\n📋 Test Group 4: Stats API');
  try {
    const result = await testAPI('GET', '/api/stats');
    if (result.status === 200) {
      console.log('  ✅ GET /api/stats');
      passed++;
    } else {
      console.log('  ❌ GET /api/stats');
      failed++;
    }
  } catch (error) {
    console.log(`  ❌ Stats error: ${error.message}`);
    failed++;
  }

  // Test 5: Helper Endpoints
  console.log('\n📋 Test Group 5: Helper Endpoints');
  try {
    const tests = [
      { name: 'GET /api/find-chrome-path', path: '/api/find-chrome-path' },
      { name: 'GET /api/check-cookies', path: '/api/check-cookies' }
    ];

    for (const test of tests) {
      try {
        const result = await testAPI('GET', test.path);
        if (result.status === 200) {
          console.log(`  ✅ ${test.name}`);
          passed++;
        } else {
          console.log(`  ❌ ${test.name}`);
          failed++;
        }
      } catch (error) {
        console.log(`  ❌ ${test.name} (${error.message})`);
        failed++;
      }
    }
  } catch (error) {
    console.log(`  ❌ Helpers error: ${error.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! System is ready!');
  } else {
    console.log('\n⚠️  Some tests failed. Check errors above.');
  }

  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});
