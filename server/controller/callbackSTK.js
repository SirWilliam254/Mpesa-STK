// controller/callback.js
const express = require('express');
const router = express.Router();

router.post('/callback', (req, res) => {
  const callbackData = req.body;

  // Log the callback data for debugging purposes
  console.log('Callback data:', JSON.stringify(callbackData, null, 2));

  // Check the ResultCode to determine if the transaction was successful
  if (callbackData.Body.stkCallback.ResultCode === 0) {
    // Transaction was successful
    const transactionDetails = {
      MerchantRequestID: callbackData.Body.stkCallback.MerchantRequestID,
      CheckoutRequestID: callbackData.Body.stkCallback.CheckoutRequestID,
      Amount: callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'Amount').Value,
      MpesaReceiptNumber: callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber').Value,
      TransactionDate: callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'TransactionDate').Value,
      PhoneNumber: callbackData.Body.stkCallback.CallbackMetadata.Item.find(item => item.Name === 'PhoneNumber').Value,
    };

    // Handle successful transaction (e.g., save to database, update order status)
    console.log('Transaction successful:', transactionDetails);

    // Respond to Safaricom to acknowledge receipt of the callback
    res.status(200).json({ message: 'Callback received successfully' });
  } else {
    // Transaction failed or was cancelled
    const resultCode = callbackData.Body.stkCallback.ResultCode;
    const resultDesc = callbackData.Body.stkCallback.ResultDesc;

    console.log(`Transaction failed or was cancelled. ResultCode: ${resultCode}, ResultDesc: ${resultDesc}`);

    // Handle failed or cancelled transaction (e.g., notify user, log for review)
    res.status(200).json({ message: 'Callback received successfully' });
  }
});

module.exports = router;
