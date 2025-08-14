// Test email service directly
const { testEmailService } = require('./lib/services/emailService');

async function test() {
  console.log('Testing email service...');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
  
  try {
    const result = await testEmailService();
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
