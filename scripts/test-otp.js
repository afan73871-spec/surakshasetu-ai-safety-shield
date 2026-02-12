
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://igfjslukekjsyswgqyww.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZmpzbHVrZWtqc3lzd2dxeXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMDUyOTMsImV4cCI6MjA4NDU4MTI5M30.rixXVzNXcoS5BHmNoyshL0ROhIpDqwT6beAQyYItCek';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEmail() {
    console.log("Testing Supabase Email Connection (ESM)...");
    const randomEmail = `test_${Date.now()}@example.com`;

    try {
        const { data, error } = await supabase.auth.signInWithOtp({
            email: randomEmail,
            options: {
                shouldCreateUser: true
            }
        });

        if (error) {
            console.error("❌ Test Failed:", error.message);
            console.error("Status Code:", error.status);
        } else {
            console.log("✅ Test Successful: OTP Sent (Status 200)");
            console.log(`Sent to: ${randomEmail}`);
        }
    } catch (err) {
        console.error("❌ Unexpected Error:", err);
    }
}

testEmail();
