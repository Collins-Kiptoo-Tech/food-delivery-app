import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send order confirmation email
export const sendOrderConfirmation = async (order, userEmail) => {
  try {
    if (!userEmail) {
      console.log('❌ No user email provided');
      return false;
    }

    const transporter = createTransporter();
    
    // Format order items for email
    const orderItems = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">KES ${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">KES ${item.price * item.quantity}</td>
      </tr>
    `).join('');

    const deliveryFee = 250;
    const subtotal = order.amount - deliveryFee;
    const codFee = order.paymentMethod === 'cash' ? 50 : 0;

    const mailOptions = {
      from: `"FreshFeast" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🍽️ Order Confirmed! - #${order.orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b, #f97316); color: white; padding: 30px; text-align: center; border-radius: 20px 20px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0; opacity: 0.9; }
            .content { background: white; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
            .order-details { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; }
            .order-details h3 { margin-top: 0; color: #f59e0b; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background: #f59e0b; color: white; padding: 12px; text-align: left; font-weight: 600; }
            .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 15px; text-align: right; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eef2f6; color: #94a3b8; font-size: 12px; }
            .status-badge { display: inline-block; background: #22c55e; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; margin-top: 20px; font-weight: bold; }
            .button:hover { background: #f97316; }
            .info-box { background: #fef3c7; padding: 15px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .info-box p { margin: 0; color: #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ FreshFeast</h1>
              <p>Order Confirmed!</p>
            </div>
            
            <div class="content">
              <h2>Hello ${order.address?.firstName || 'Valued Customer'}! 👋</h2>
              <p>Thank you for ordering from <strong>FreshFeast</strong>. Your order has been confirmed and our chefs are preparing your delicious meal!</p>
              
              <div class="order-details">
                <h3>📋 Order Details</h3>
                <p><strong>Order ID:</strong> <span style="color: #f59e0b;">#${order.orderId}</span></p>
                <p><strong>Order Date:</strong> ${new Date(order.orderDate || Date.now()).toLocaleString()}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod === 'paypal' ? '💳 PayPal' : '💰 Cash on Delivery'}</p>
                <p><strong>Payment Status:</strong> <span class="status-badge">${order.paymentStatus === 'paid' ? 'Paid ✓' : 'Pending - Pay on Delivery'}</span></p>
                <p><strong>Estimated Delivery:</strong> 🚚 30-45 minutes</p>
              </div>
              
              <h3>🛒 Your Order</h3>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItems}
                </tbody>
              </table>
              
              <div style="text-align: right;">
                <p style="margin: 5px 0;"><strong>Subtotal:</strong> KES ${subtotal}</p>
                <p style="margin: 5px 0;"><strong>Delivery Fee:</strong> KES ${deliveryFee}</p>
                ${codFee > 0 ? `<p style="margin: 5px 0;"><strong>COD Fee:</strong> KES ${codFee}</p>` : ''}
                <div class="total-row">
                  <strong>Total Amount:</strong> KES ${order.amount}
                </div>
              </div>
              
              <h3>📍 Delivery Address</h3>
              <p style="background: #f8fafc; padding: 15px; border-radius: 12px;">
                <strong>${order.address?.firstName} ${order.address?.lastName}</strong><br>
                ${order.address?.street}<br>
                ${order.address?.city}, ${order.address?.state} ${order.address?.zipcode}<br>
                ${order.address?.country}<br>
                📞 ${order.address?.phone}
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order/${order.orderId}" class="button">
                  🚚 Track Your Order
                </a>
              </div>
              
              <div class="info-box">
                <p>✨ <strong>Need help?</strong> Contact us at supportfreshfeast@gmail.com or call 0725 280 289</p>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2024 FreshFeast - Delicious food delivered to your door</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${userEmail}`);
    console.log('📧 Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};