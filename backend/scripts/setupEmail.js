// scripts/setupEmail.js
import 'dotenv/config';
import { testEmailService } from '../utils/emailService.js';

console.log('📧 Email Configuration Setup\n');

// Check environment variables
const envVars = {
  'SMTP_USER': process.env.SMTP_USER,
  'SMTP_PASSWORD': process.env.SMTP_PASSWORD,
  'SMTP_HOST': process.env.SMTP_HOST || 'smtp.gmail.com',
  'SMTP_PORT': process.env.SMTP_PORT || '587'
};

console.log('Current Configuration:');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`${key}: ${value ? '✅ ' + value : '❌ Not set'}`);
});

console.log('\nTesting email service...');

const testEmail = process.env.SMTP_USER;
if (!testEmail) {
  console.error('\n❌ Please set SMTP_USER in your .env file first!');
  console.log('\nExample .env file:');
  console.log(`
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_FROM_NAME="Event Registration"
  `);
  process.exit(1);
}

testEmailService(testEmail)
  .then(result => {
    console.log('\n✅ Email setup completed successfully!');
    console.log('You can now use the registration system.');
  })
  .catch(error => {
    console.error('\n❌ Email setup failed.');
    console.log('\n📋 For Gmail setup:');
    console.log('1. Go to: https://myaccount.google.com/');
    console.log('2. Enable 2-Step Verification');
    console.log('3. Generate App Password: https://myaccount.google.com/apppasswords');
    console.log('4. Select "Mail" and "Other (Custom name)"');
    console.log('5. Name it "NodeJS App" and generate');
    console.log('6. Use the 16-character password as SMTP_PASSWORD');
    process.exit(1);
  });