/**
 * Backend Connection Verification Utility
 * 
 * Run this in browser console or import in your app to verify backend connection
 */

export const verifyBackendConnection = async () => {
  const backendUrl = import.meta.env.VITE_API_URL || 'https://bada-builder-backend.onrender.com/api';
  
  console.log('🔍 Backend Connection Verification');
  console.log('=====================================');
  console.log('Backend URL:', backendUrl);
  console.log('Frontend URL:', window.location.origin);
  console.log('');

  const results = {
    backendUrl,
    frontendUrl: window.location.origin,
    tests: [],
    allPassed: true
  };

  // Test 1: Check if backend is reachable
  console.log('📡 Test 1: Backend Availability');
  try {
    const response = await fetch(`${backendUrl}/properties`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend is reachable');
      console.log('   Status:', response.status);
      console.log('   Response:', data);
      results.tests.push({ name: 'Backend Availability', passed: true, status: response.status });
    } else {
      console.log('⚠️ Backend responded with error');
      console.log('   Status:', response.status);
      results.tests.push({ name: 'Backend Availability', passed: false, status: response.status });
      results.allPassed = false;
    }
  } catch (error) {
    console.error('❌ Backend is not reachable');
    console.error('   Error:', error.message);
    results.tests.push({ name: 'Backend Availability', passed: false, error: error.message });
    results.allPassed = false;
  }
  console.log('');

  // Test 2: Check CORS
  console.log('🌐 Test 2: CORS Configuration');
  try {
    const response = await fetch(`${backendUrl}/properties`, {
      method: 'GET',
      headers: {
        'Origin': window.location.origin
      }
    });
    
    const corsHeader = response.headers.get('access-control-allow-origin');
    if (corsHeader) {
      console.log('✅ CORS is configured');
      console.log('   Allowed Origin:', corsHeader);
      results.tests.push({ name: 'CORS Configuration', passed: true, allowedOrigin: corsHeader });
    } else {
      console.log('⚠️ CORS header not found (might still work)');
      results.tests.push({ name: 'CORS Configuration', passed: true, note: 'Header not found but request succeeded' });
    }
  } catch (error) {
    console.error('❌ CORS test failed');
    console.error('   Error:', error.message);
    results.tests.push({ name: 'CORS Configuration', passed: false, error: error.message });
    results.allPassed = false;
  }
  console.log('');

  // Test 3: Check API endpoints structure
  console.log('🔌 Test 3: API Endpoints');
  const endpoints = [
    '/properties',
    '/auth/login',
    '/subscriptions/plans'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'GET'
      });
      const status = response.status;
      const isOk = status >= 200 && status < 400;
      
      if (isOk || status === 401 || status === 404) {
        // 401/404 are expected for protected/missing endpoints
        console.log(`✅ ${endpoint}: ${status}`);
        results.tests.push({ name: `Endpoint ${endpoint}`, passed: true, status });
      } else {
        console.log(`⚠️ ${endpoint}: ${status}`);
        results.tests.push({ name: `Endpoint ${endpoint}`, passed: false, status });
        results.allPassed = false;
      }
    } catch (error) {
      console.error(`❌ ${endpoint}: ${error.message}`);
      results.tests.push({ name: `Endpoint ${endpoint}`, passed: false, error: error.message });
      results.allPassed = false;
    }
  }
  console.log('');

  // Test 4: Check environment variable
  console.log('⚙️ Test 4: Environment Configuration');
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    console.log('✅ VITE_API_URL is set:', envUrl);
    results.tests.push({ name: 'Environment Variable', passed: true, value: envUrl });
  } else {
    console.log('ℹ️ Using default backend URL');
    results.tests.push({ name: 'Environment Variable', passed: true, note: 'Using default' });
  }
  console.log('');

  // Summary
  console.log('📊 Summary');
  console.log('=====================================');
  const passedTests = results.tests.filter(t => t.passed).length;
  const totalTests = results.tests.length;
  console.log(`Tests Passed: ${passedTests}/${totalTests}`);
  
  if (results.allPassed) {
    console.log('✅ All tests passed! Backend connection is working.');
  } else {
    console.log('⚠️ Some tests failed. Check the errors above.');
  }
  console.log('');

  return results;
};

// Auto-run in development mode (optional)
if (import.meta.env.DEV) {
  // Uncomment the line below to auto-run verification on page load in development
  // verifyBackendConnection();
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  window.verifyBackendConnection = verifyBackendConnection;
}
