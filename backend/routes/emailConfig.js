// routes/emailConfig.js
import express from 'express';
import { testEmailService } from '../utils/emailService.js';

const router = express.Router();

router.get('/check-config', (req, res) => {
  const config = {
    SMTP_HOST: process.env.SMTP_HOST ? '✅ Set' : '❌ Not set',
    SMTP_USER: process.env.SMTP_USER ? '✅ Set' : '❌ Not set',
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '✅ Set' : '❌ Not set',
  };
  
  res.json({
    success: true,
    config,
    instructions: 'Ensure all fields are marked with ✅'
  });
});

router.post('/test-connection', async (req, res) => {
  try {
    const result = await testEmailService();
    res.json({
      success: true,
      message: 'Email service is working!',
      messageId: result.messageId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email service test failed',
      error: error.message
    });
  }
});

export default router;
router.get('/email/config', checkEmailConfig);