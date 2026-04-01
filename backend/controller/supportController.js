import nodemailer from 'nodemailer';

export const sendSupportEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    console.log("📧 Support request from:", email);
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Please fill in all fields" 
      });
    }
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    await transporter.verify();
    console.log("✅ Email transporter verified");
    
    // Email to support team
    await transporter.sendMail({
      from: `"FreshFeast Support" <${process.env.EMAIL_USER}>`,
      to: "supportfreshfeast@gmail.com",
      subject: `Support Request: ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });
    
    // Auto-reply to user
    await transporter.sendMail({
      from: `"FreshFeast Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for contacting FreshFeast Support",
      html: `
        <h2>Hello ${name},</h2>
        <p>Thank you for reaching out to FreshFeast Support!</p>
        <p>We have received your message and will get back to you within 24 hours.</p>
        <p>Your message: "${message}"</p>
        <p>Need immediate help? Call us: <strong>0725 280 289</strong> or <strong>0737 146 958</strong></p>
        <br>
        <p>Best regards,<br>FreshFeast Team</p>
      `
    });
    
    console.log("✅ Support email sent to:", email);
    
    res.status(200).json({ 
      success: true, 
      message: "Message sent successfully! We'll get back to you within 24 hours." 
    });
    
  } catch (error) {
    console.error("❌ Support email error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send message. Please try again later." 
    });
  }
};