const axios = require('axios');
const assert = require('assert');

const API_BASE = 'http://localhost:8082/api/auth';
const MAILHOG_API = 'http://localhost:8025/api/v2';
const TEST_EMAIL = `test_${Date.now()}@trustagro.com`;
const ADMIN_EMAIL = 'admin@trustagro.com';
const ADMIN_PASS = 'Admin@1234';

async function getLatestOTP(email) {
    // Wait for email to arrive
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const res = await axios.get(`${MAILHOG_API}/messages`);
    const messages = res.data.items;
    
    for (const msg of messages) {
        if (msg.To[0].Mailbox + '@' + msg.To[0].Domain === email) {
            const body = msg.Content.Body;
            const match = body.match(/<div[^>]*code[^>]*>(\d{6})<\/div>/);
            if (match) return match[1];
        }
    }
    throw new Error('OTP not found in Mailhog');
}

async function runTests() {
    console.log('--- STARTING OTP SCENARIO TESTS ---');
    
    try {
        // 1. Happy Signup
        console.log('\\n1. Testing Happy Signup...');
        await axios.post(`${API_BASE}/signup/otp`, {
            email: TEST_EMAIL,
            password: 'Password123!',
            fullName: 'Test User'
        });
        console.log('  Signup OTP Sent.');
        
        const signupOtp = await getLatestOTP(TEST_EMAIL);
        console.log(`  Extracted Signup OTP: ${signupOtp}`);
        
        await axios.post(`${API_BASE}/signup/verify`, {
            email: TEST_EMAIL,
            otpCode: signupOtp
        });
        console.log('  ✅ Happy Signup verified successfully.');

        // 2. Happy Login + 3. Wrong OTP + 5. Resend OTP
        console.log('\\n2. Testing Login flow with Wrong OTP and Resend...');
        await axios.post(`${API_BASE}/login/otp`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASS
        });
        console.log('  Login OTP Sent.');
        
        const loginOtp1 = await getLatestOTP(ADMIN_EMAIL);
        console.log(`  Extracted Login OTP: ${loginOtp1}`);
        
        // 3. Wrong OTP
        try {
            await axios.post(`${API_BASE}/login/verify`, {
                email: ADMIN_EMAIL,
                otpCode: '000000'
            });
            throw new Error('Should have failed with wrong OTP');
        } catch (error) {
            console.log(`  ✅ Wrong OTP properly rejected: ${error.response.data.message || error.response.data.error}`);
        }
        
        // 5. Resend OTP (Old invalidated)
        console.log('  Resending Login OTP...');
        await axios.post(`${API_BASE}/login/otp`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASS
        });
        
        const loginOtp2 = await getLatestOTP(ADMIN_EMAIL);
        console.log(`  Extracted New Login OTP: ${loginOtp2}`);
        
        // Try old OTP
        try {
            await axios.post(`${API_BASE}/login/verify`, {
                email: ADMIN_EMAIL,
                otpCode: loginOtp1
            });
            throw new Error('Should have failed with old OTP');
        } catch (error) {
            console.log(`  ✅ Old OTP properly invalidated: ${error.response.data.message || error.response.data.error}`);
        }
        
        // Verify new OTP
        const loginRes = await axios.post(`${API_BASE}/login/verify`, {
            email: ADMIN_EMAIL,
            otpCode: loginOtp2
        });
        
        assert(loginRes.data.data.token, 'Token should be returned');
        console.log('  ✅ Resent OTP verified successfully. JWT Token received.');

        console.log('\\n--- ALL AUTOMATED TESTS PASSED ---');
        
    } catch (e) {
        console.error('Test Failed!', e.response ? e.response.data : e.message);
        process.exit(1);
    }
}

runTests();
