// Add to userController.js or create new route
export async function checkEmailConfig(req, res) {
  try {
    const config = {
      SMTP_USER: process.env.SMTP_USER ? '✅ Configured' : '❌ Not configured',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '✅ Configured' : '❌ Not configured',
      SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com (default)',
      SMTP_PORT: process.env.SMTP_PORT || '587 (default)',
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Event Registration (default)',
      NODE_ENV: process.env.NODE_ENV || 'development'
    };
    
    res.status(200).json({
      success: true,
      message: 'Email configuration status',
      config,
      isConfigured: !!process.env.SMTP_USER && !!process.env.SMTP_PASSWORD,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking email configuration'
    });
  }
}

// Add route in your routes file:
// router.get('/email/config', checkEmailConfig);