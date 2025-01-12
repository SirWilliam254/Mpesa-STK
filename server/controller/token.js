// import axios, { post } from 'axios';
// import { config } from 'dotenv';

// config();

// Key = process.env.KEY; 
// Secret = process.env.SECRET;
// ShortCode = process.env.SHORTCODE;

// // Get access Token for the stk push-----------------------------------------------------------------------------
// const createToken = async (req, res, next) => {
//   try {
//     const response = await axios({
//       method: 'get',
//       url: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
//       headers: {
//         'Authorization': 'Basic ' + Buffer.from(`${Key}:${Secret}`).toString('base64')
//       }
//     });
//     console.log("success", response.data);
//     token = response.data.access_token;
//     res.json(response.data);
//     next();
//   } catch (error) {
//     console.log("error:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// // Stk Push---------------------------------------------------------------------------------------------------------
//     const stkPush = async (req, res) => {
//         const shortCode = ShortCode;
//         const phone = req.body.phone.substring(1);
//         console.log(shortCode, phone);
//         const amount = req.body.amount;
//         const passkey = process.env.PASSKEY;
//         const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
      
//         const date = new Date();
//         const timestamp =
//           date.getFullYear() +
//           ("0" + (date.getMonth() + 1)).slice(-2) +
//           ("0" + date.getDate()).slice(-2) +
//           ("0" + date.getHours()).slice(-2) +
//           ("0" + date.getMinutes()).slice(-2) +
//           ("0" + date.getSeconds()).slice(-2);
//         const password = new Buffer.from(shortCode + passkey + timestamp).toString(
//           "base64"
//         );
//         const data = {
//           BusinessShortCode: shortCode,
//           Password: password,
//           Timestamp: timestamp,
//           TransactionType: "CustomerBuyGoodsOnline",
//           Amount: amount,
//           PartyA: `254${phone}`,
//           PartyB: ShortCode,
//           PhoneNumber: `254${phone}`,
//           CallBackURL: "https://acc4-41-209-60-106.ngrok-free.app/callback",
//           AccountReference: "Mpesa Test",
//           TransactionDesc: "Testing stk push",
//         };
      
//         await post(url, data, {
//             headers: {
//               authorization: `Bearer ${token}`,
//             },
//           })
//           .then((data) => {
//             console.log(data.data);
//             res.status(200).json(data.data);
//           })
//           .catch((err) => {
//             console.log(err);
//             res.status(400).json(err.message);
//           });
//       };
      
// export default { createToken, stkPush };





import axios from 'axios';
import { config } from 'dotenv';

config();

const Key = process.env.KEY; 
const Secret = process.env.SECRET;
const ShortCode = process.env.PAYBILL_SHORTCODE;  // Ensure you use the Paybill shortcode here
const passkey = process.env.PASSKEY;

// Get access Token for the STK push
const createToken = async (req, res, next) => {
  try {
    const response = await axios({
      method: 'get',
      url: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${Key}:${Secret}`).toString('base64')
      }
    });
    console.log("success", response.data);
    const token = response.data.access_token;
    req.token = token;  // Pass the token to the next middleware
    next();
  } catch (error) {
    console.log("error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// STK Push
const stkPush = async (req, res) => {
  const shortCode = ShortCode; 
  const phone = req.body.phone.substring(1);  // Removing leading '0' from the phone number
  const amount = req.body.amount;
  
  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
  const token = req.token;  // Using token passed from the middleware

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);

  const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");
  
  const data = {
    BusinessShortCode: shortCode,  // Paybill shortcode
    Password: password,
    Timestamp: timestamp,
    TransactionType: "PayBill",  // Use 'PayBill' for Paybill transactions
    Amount: amount,
    PartyA: `254${phone}`,  // PartyA is the phone number
    PartyB: shortCode,  // Paybill short code
    PhoneNumber: `254${phone}`,  // Phone number of the customer
    CallBackURL: "https://acc4-41-209-60-106.ngrok-free.app/callback",  // Change this to your actual callback URL
    AccountReference: "Mpesa Test",  // This can be a reference for the payment
    TransactionDesc: "Testing Paybill STK push",  // Description of the transaction
  };

  try {
    const response = await post(url, data, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    res.status(200).json(response.data);
  } catch (err) {
    console.log(err);
    res.status(400).json(err.message);
  }
};

export { createToken, stkPush };
