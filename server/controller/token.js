const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

Key = process.env.KEY; 
Secret = process.env.SECRET;

// Get access Token for the stk push-----------------------------------------------------------------------------
const createToken = async (req, res, next) => {
  try {
    const response = await axios({
      method: 'get',
      url: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${Key}:${Secret}`).toString('base64')
      }
    });
    // console.log("success", response.data);
    token = response.data.access_token;
    // res.json(response.data);
    next();
  } catch (error) {
    console.log("error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Stk Push---------------------------------------------------------------------------------------------------------
    const stkPush = async (req, res) => {
        const shortCode = 174379;
        const phone = req.body.phone.substring(1);
        console.log(shortCode, phone);
        const amount = req.body.amount;
        const passkey = process.env.PASSKEY;
        const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
      
        const date = new Date();
        const timestamp =
          date.getFullYear() +
          ("0" + (date.getMonth() + 1)).slice(-2) +
          ("0" + date.getDate()).slice(-2) +
          ("0" + date.getHours()).slice(-2) +
          ("0" + date.getMinutes()).slice(-2) +
          ("0" + date.getSeconds()).slice(-2);
        const password = new Buffer.from(shortCode + passkey + timestamp).toString(
          "base64"
        );
        const data = {
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: `254${phone}`,
          PartyB: 174379,
          PhoneNumber: `254${phone}`,
          CallBackURL: "https://mydomain.com/path",
          AccountReference: "Mpesa Test",
          TransactionDesc: "Testing stk push",
        };
      
        await axios
          .post(url, data, {
            headers: {
              authorization: `Bearer ${token}`,
            },
          })
          .then((data) => {
            console.log(data.data);
            res.status(200).json(data.data);
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json(err.message);
          });
      };
      
module.exports = { createToken, stkPush };
