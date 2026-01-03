// utils/emailService.js - UPDATED VERSION
import nodemailer from 'nodemailer';

// Store transporter instance
let transporter = null;
let transporterInitialized = false;

// Check if email is properly configured
const isEmailConfigured = () => {
    // Check for both existence and non-empty strings
    return process.env.SMTP_USER &&
        process.env.SMTP_USER.trim() !== '' &&
        process.env.SMTP_PASSWORD &&
        process.env.SMTP_PASSWORD.trim() !== '';
};

// Create a mock transporter for development
const createMockTransporter = () => {
    console.log('📧 Using mock email transporter (emails will be logged to console)');
    return {
        sendMail: async (mailOptions) => {
            console.log('📧 Mock Email Details:');
            console.log('To:', mailOptions.to);
            console.log('Subject:', mailOptions.subject);
            console.log('Email content would be sent');

            // Simulate delay like real email
            await new Promise(resolve => setTimeout(resolve, 100));

            return Promise.resolve({
                messageId: 'mock-message-id',
                response: 'Mock email sent successfully',
                accepted: [mailOptions.to]
            });
        },
        verify: (callback) => {
            callback(null, true);
        }
    };
};

// Create real transporter
const createRealTransporter = () => {
    console.log('📧 Creating real email transporter');
    console.log('Using SMTP_USER:', process.env.SMTP_USER);

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        },
        debug: process.env.NODE_ENV === 'development', // Enable debug logging
        logger: process.env.NODE_ENV === 'development' // Enable logger
    });
};

// Get transporter (lazy initialization)
// Initialize transporter
const initializeTransporter = () => {
    if (transporterInitialized) return transporter;

    console.log('\n📧 Initializing email transporter...');
    console.log('Environment check:');
    console.log('- SMTP_USER exists:', !!process.env.SMTP_USER);
    console.log('- SMTP_PASSWORD exists:', !!process.env.SMTP_PASSWORD);
    console.log('- NODE_ENV:', process.env.NODE_ENV);

    if (isEmailConfigured()) {
        console.log('✅ Email credentials found in environment');
        try {
            transporter = createRealTransporter();

            // Verify connection
            transporter.verify((error, success) => {
                if (error) {
                    console.error('❌ SMTP Connection Error:', error.message);
                    console.log('⚠️ Falling back to mock email service');
                    transporter = createMockTransporter();
                } else {
                    console.log('✅ SMTP Server is ready to send real emails!');
                }
            });
        } catch (error) {
            console.error('❌ Error creating transporter:', error.message);
            transporter = createMockTransporter();
        }
    } else {
        console.warn('⚠️ SMTP credentials not found in environment');
        console.log('Using mock email service');
        console.log('To enable real emails, ensure SMTP_USER and SMTP_PASSWORD are in .env');
        transporter = createMockTransporter();
    }
    transporterInitialized = true;
    return transporter;
};

// Get transporter
const getTransporter = () => {
    if (!transporterInitialized) {
        return initializeTransporter();
    }
    return transporter;
};


// Email template function (simplified version)
const getEmailTemplate = (user, qrCodeBase64) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Registration Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; background: white; }
        .qr-code { text-align: center; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .info-box { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Registration Confirmed!</h1>
          <p>Event 2024 - College Fest</p>
        </div>
        
        <div class="content">
          <h2>Hello ${user.name},</h2>
          <p>Your registration for <strong>Event 2024</strong> has been successfully completed.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #2563eb;">Registration Details:</h3>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Roll Number:</strong> ${user.rollno}</p>
            <p><strong>Faculty:</strong> ${user.faculty}</p>
            ${user.semester ? `<p><strong>Semester:</strong> ${user.semester}</p>` : ''}
            ${user.year ? `<p><strong>Year:</strong> ${user.year}</p>` : ''}
            <p><strong>Registration ID:</strong> <code>${user.registrationId}</code></p>
          </div>
          
          <div class="qr-code">
            <h3 style="color: #2563eb;">Your Event QR Code</h3>
            <img src="${qrCodeBase64}" alt="QR Code" style="max-width: 200px; height: auto; border: 1px solid #ddd; padding: 10px; background: white;">
            <p style="margin-top: 10px;"><small>Present this QR code at the event for entry and attendance tracking</small></p>
            <p><strong>⚠️ IMPORTANT:</strong> Keep this QR code secure. Do not share it with others.</p>
          </div>
          
          <div style="background: #fff8e1; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #d97706;">📋 Event Instructions:</h3>
            <ul style="margin-bottom: 0;">
              <li>Bring this QR code (digital or printout) to the event venue</li>
              <li>Show the QR code at the registration desk for scanning</li>
              <li>Your attendance will be marked when the QR code is scanned</li>
              <li>This QR code is unique to you and cannot be transferred</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Event 2024 - College Fest</strong></p>
          <p>📍 Event Venue: College Ground, Kathmandu</p>
          <p>📅 Date: December 25-27, 2024</p>
          <p>⏰ Time: 10:00 AM - 6:00 PM</p>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Function to send registration confirmation email
export const sendRegistrationEmail = async (userData, qrCodeBase64) => {
    console.log('DEBUG: SMTP_USER exists?', !!process.env.SMTP_USER);
    console.log('DEBUG: SMTP_PASSWORD exists?', !!process.env.SMTP_PASSWORD);
    try {
        const emailTemplate = getEmailTemplate(userData, qrCodeBase64);
        const currentTransporter = getTransporter();

        const mailOptions = {
            from: {
                name: process.env.EMAIL_FROM_NAME || 'Event 2024 Registration',
                address: process.env.SMTP_USER || 'noreply@example.com'
            },
            to: userData.email,
            subject: '🎉 Registration Confirmed - Event 2024',
            html: emailTemplate,
            // Optional: Attach QR code as image file
            attachments: [
                {
                    filename: `QR_Code_${userData.registrationId}.png`,
                    content: qrCodeBase64.split(',')[1], // Remove data:image/png;base64, prefix
                    encoding: 'base64',
                    cid: 'qrcode'
                }
            ]
        };
        console.log(`📧 Attempting to send email to ${userData.email}...`);
        const info = await currentTransporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${userData.email}: ${info.messageId}`);

        // If using mock transporter, show preview URL
        if (info.messageId && info.messageId.startsWith('mock-')) {
            console.log(`📧 Mock email logged for ${userData.email}`);
            console.log('To send real emails, ensure SMTP credentials are properly configured.');
        } else {
            console.log(`✅ REAL email sent to ${userData.email}: ${info.messageId}`);
            console.log('Check the recipient\'s inbox (including spam folder).');
        }

        return { success: true, messageId: info.messageId, info };

    } catch (error) {
        console.error('❌ Email sending error:', error.message);
        throw error;
        // Try sending a simpler email if HTML fails
        //         try {
        //             const simpleMailOptions = {
        //                 from: process.env.SMTP_USER || 'noreply@event.com',
        //                 to: userData.email,
        //                 subject: 'Registration Confirmed - Event 2024',
        //                 text: `Hello ${userData.name},

        // Your registration for Event 2024 has been confirmed.

        // REGISTRATION DETAILS:
        // - Name: ${userData.name}
        // - Roll No: ${userData.rollno}
        // - Faculty: ${userData.faculty}
        // - Registration ID: ${userData.registrationId}
        // ${userData.semester ? `- Semester: ${userData.semester}` : ''}
        // ${userData.year ? `- Year: ${userData.year}` : ''}

        // IMPORTANT:
        // 1. Your QR code is attached to this email
        // 2. Bring it to the event for entry
        // 3. Do not share your QR code with others

        // Event Details:
        // 📍 Venue: College Ground, Kathmandu
        // 📅 Date: December 25-27, 2024
        // ⏰ Time: 10:00 AM - 6:00 PM

        // Thank you for registering!`
        //             };

        //             const currentTransporter = getTransporter();
        //             const simpleInfo = await currentTransporter.sendMail(simpleMailOptions);
        //             console.log(`📧 Simple text email sent to ${userData.email}`);
        //             return { success: true, messageId: simpleInfo.messageId, info: simpleInfo, simplified: true };
        //         } catch (simpleError) {
        //             console.error('❌ Simple email also failed:', simpleError.message);
        //             throw error;
        //         }
             }
    };

    // Test email configuration
    export const testEmailService = async (testEmail) => {
        console.log('🔧 Testing email configuration...');
        console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Not set');
        console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✅ Set' : '❌ Not set');

        const currentTransporter = getTransporter();

        try {
            const mailOptions = {
                from: process.env.SMTP_USER || 'test@example.com',
                to: testEmail || process.env.SMTP_USER,
                subject: 'Test Email - Event Registration System',
                text: 'This is a test email to verify your SMTP configuration is working correctly.',
                html: '<h1>Test Email</h1><p>Your email configuration is working correctly!</p><p>You can now send registration emails with QR codes.</p>'
            };

            const info = await currentTransporter.sendMail(mailOptions);
            console.log('✅ Test email sent successfully:', info.messageId);

            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Test email failed:', error.message);
            throw error;
        }
    };