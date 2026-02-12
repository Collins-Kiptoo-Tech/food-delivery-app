// routes/mpesaRoute.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// ===========================================
// ENVIRONMENT CONFIGURATION
// ===========================================
const isProduction = process.env.MPESA_ENVIRONMENT === 'live';
const baseURL = isProduction 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

console.log('=================================');
console.log(`🌍 M-Pesa Environment: ${isProduction ? 'PRODUCTION' : 'SANDBOX'}`);
console.log(`📡 API Base URL: ${baseURL}`);
console.log(`📱 Test Number: ${!isProduction ? '254708374149 (PIN: 1234)' : 'REAL PHONES'}`);
console.log('=================================');

// ===========================================
// 1. GET ACCESS TOKEN FROM SAFARICOM
// ===========================================
const getAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(
      `${baseURL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    console.log('✅ Access token generated successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Failed to get access token:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error('Failed to authenticate with Safaricom. Check your Consumer Key/Secret.');
  }
};

// ===========================================
// 2. STK PUSH - SENDS PROMPT TO PHONE
// ===========================================
router.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;
    
    console.log('📱 STK Push Request:', { 
      phone, 
      amount, 
      orderId,
      environment: isProduction ? 'PRODUCTION' : 'SANDBOX'
    });

    // ---------- VALIDATION ----------
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    if (!amount || amount < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid amount is required (minimum 1 KES)' 
      });
    }

    // ---------- FORMAT PHONE NUMBER ----------
    let formattedPhone = phone.toString().trim();
    
    // Remove any non-digit characters
    formattedPhone = formattedPhone.replace(/\D/g, '');
    
    // Handle different formats
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('7')) {
      formattedPhone = '254' + formattedPhone;
    }
    
    // Ensure it's 12 digits and starts with 254
    if (!formattedPhone.startsWith('254') || formattedPhone.length !== 12) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone must be 12 digits starting with 254 (e.g., 254708374149)' 
      });
    }

    // Sandbox warning for non-test numbers
    if (!isProduction && formattedPhone !== '254708374149') {
      console.warn(`⚠️  Warning: Sandbox mode only sends prompts to 254708374149. You entered: ${formattedPhone}`);
    }

    // ---------- GENERATE TIMESTAMP ----------
    const date = new Date();
    const timestamp = 
      date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2);

    // ---------- GENERATE PASSWORD ----------
    const password = Buffer.from(
      process.env.MPESA_BUSINESS_SHORTCODE + 
      process.env.MPESA_PASSKEY + 
      timestamp
    ).toString('base64');

    // ---------- GET ACCESS TOKEN ----------
    const token = await getAccessToken();

    // ---------- PREPARE STK PUSH PAYLOAD ----------
    const stkPushPayload = {
      BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.floor(amount),
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_BUSINESS_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: orderId || `ORDER-${Date.now().toString().slice(-6)}`,
      TransactionDesc: 'Food Delivery Payment'
    };

    console.log('📤 Sending STK Push to Safaricom...');

    // ---------- SEND TO SAFARICOM ----------
    const response = await axios.post(
      `${baseURL}/mpesa/stkpush/v1/processrequest`,
      stkPushPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    console.log('✅ Safaricom Response:', response.data);

    // ---------- CHECK RESPONSE ----------
    if (response.data.ResponseCode === '0') {
      // Success! Prompt is being sent to phone
      const message = !isProduction && formattedPhone !== '254708374149'
        ? '⚠️ Sandbox: Prompt will ONLY go to 254708374149. Use that number for testing.'
        : response.data.CustomerMessage || 'Please check your phone and enter PIN';

      res.json({
        success: true,
        checkoutRequestID: response.data.CheckoutRequestID,
        merchantRequestID: response.data.MerchantRequestID,
        customerMessage: message,
        responseDescription: response.data.ResponseDescription,
        environment: isProduction ? 'production' : 'sandbox'
      });
    } else {
      // Safaricom returned an error
      res.status(400).json({
        success: false,
        message: response.data.ResponseDescription || 'STK push failed',
        errorCode: response.data.ResponseCode,
        environment: isProduction ? 'production' : 'sandbox'
      });
    }

  } catch (error) {
    console.error('❌ STK Push Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Detailed error for debugging
    res.status(500).json({
      success: false,
      message: 'Failed to initiate M-Pesa payment',
      error: error.response?.data?.errorMessage || error.message,
      details: error.response?.data || null,
      environment: isProduction ? 'production' : 'sandbox'
    });
  }
});

// ===========================================
// 3. CALLBACK - WHERE SAFARICOM SENDS RESULT
// ===========================================
router.post('/callback', (req, res) => {
  console.log('📞 M-Pesa Callback Received:');
  console.log(JSON.stringify(req.body, null, 2));
  
  const callbackData = req.body;
  
  if (callbackData.Body?.stkCallback) {
    const { 
      ResultCode, 
      ResultDesc, 
      CheckoutRequestID,
      CallbackMetadata 
    } = callbackData.Body.stkCallback;
    
    if (ResultCode === 0) {
      // PAYMENT SUCCESSFUL - Extract transaction details
      const metadata = {};
      if (CallbackMetadata?.Item) {
        CallbackMetadata.Item.forEach(item => {
          metadata[item.Name] = item.Value;
        });
      }
      
      console.log('💰 PAYMENT SUCCESSFUL:', {
        amount: metadata.Amount,
        receipt: metadata.MpesaReceiptNumber,
        phone: metadata.PhoneNumber,
        date: metadata.TransactionDate,
        checkoutRequestID: CheckoutRequestID
      });
      
      // TODO: Update your database - payment is complete!
      
    } else {
      // PAYMENT FAILED
      const errorMessages = {
        '1032': '❌ User canceled the request',
        '1': '❌ Insufficient balance',
        '2001': '❌ Invalid PIN',
        '1037': '❌ Phone offline or SIM issue',
        '1019': '❌ Transaction expired'
      };
      
      console.log(errorMessages[ResultCode] || `❌ Payment Failed: ${ResultDesc}`);
    }
  }
  
  // IMPORTANT: Always respond with success to Safaricom
  res.json({ 
    ResultCode: 0, 
    ResultDesc: 'Success' 
  });
});

// ===========================================
// 4. CHECK PAYMENT STATUS
// ===========================================
router.get('/status/:checkoutRequestID', (req, res) => {
  const { checkoutRequestID } = req.params;
  
  // In production, query your database
  // For now, return pending status
  res.json({
    status: 'pending',
    checkoutRequestID,
    message: 'Payment is being processed',
    environment: isProduction ? 'production' : 'sandbox'
  });
});

// ===========================================
// 5. TEST ENDPOINT - VERIFY SETUP
// ===========================================
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ M-Pesa route is configured and working!',
    environment: isProduction ? 'PRODUCTION' : 'SANDBOX',
    configuration: {
      hasConsumerKey: !!process.env.MPESA_CONSUMER_KEY,
      hasConsumerSecret: !!process.env.MPESA_CONSUMER_SECRET,
      hasShortCode: !!process.env.MPESA_BUSINESS_SHORTCODE,
      hasPasskey: !!process.env.MPESA_PASSKEY,
      hasCallbackUrl: !!process.env.MPESA_CALLBACK_URL,
      shortCode: process.env.MPESA_BUSINESS_SHORTCODE,
      callbackUrl: process.env.MPESA_CALLBACK_URL,
      baseURL: baseURL
    },
    sandbox: !isProduction ? {
      testNumber: '254708374149',
      testPIN: '1234',
      warning: 'Only 254708374149 receives prompts in sandbox mode'
    } : undefined,
    production: isProduction ? {
      warning: 'LIVE MODE - REAL MONEY! Ensure correct PayBill/Till number'
    } : undefined
  });
});

export default router;