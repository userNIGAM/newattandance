// scripts/testEmail.js
import 'dotenv/config';
import { testEmailService } from '../utils/emailService.js';

const args = process.argv.slice(2);
const testEmail = args[0] || process.env.SMTP_USER;

console.log('📧 Testing Email Service\n');
console.log(`Sending test email to: ${testEmail}\n`);

testEmailService(testEmail)
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed!');
    process.exit(1);
  });