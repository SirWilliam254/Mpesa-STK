// Mpesa stk push
import express from "express";
const app = express();
import { createServer } from "http";
import bodyParser from "body-parser";
import axios from "axios"; // Import 'axios' instead of 'request'
import cors from "cors";

import { config } from 'dotenv';

config();

const Key = process.env.KEY;
const Secret = process.env.SECRET;
const ShortCode = process.env.PAYBILL_SHORTCODE;  // Ensure you use the Paybill shortcode here
const passkey = process.env.PASSKEY;
const BASE_URL = process.env.BASE_URL;


const port = 5000;
const { json: __json } = bodyParser;
const { urlencoded } = bodyParser;
const hostname = "localhost";
app.use(__json());
app.use(urlencoded({ extended: false }));
app.use(cors());
// app.use('/', apiRouter);

const server = createServer(app);

app.use(cors());
// ACCESS TOKEN FUNCTION - Updated to use 'axios'
async function getAccessToken() {
    const consumer_key = Key; // REPLACE IT WITH YOUR CONSUMER KEY
    const consumer_secret = Secret; // REPLACE IT WITH YOUR CONSUMER SECRET
    const url =
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const auth =
        "Basic " +
        new Buffer.from(consumer_key + ":" + consumer_secret).toString("base64");

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: auth,
            },
        });

        const dataresponse = response.data;
        const accessToken = dataresponse.access_token;
        console.log("got access token...");
        return accessToken;
    } catch (error) {
        throw error;
    }
}

app.get("/", (req, res) => {
    res.send("Test in Soft Holdings...");
    const date = new Date();
    const timestamp =
        date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);

    console.log(timestamp);
});


//ACCESS TOKEN ROUTE
app.get("/access_token", (req, res) => {
    getAccessToken()
        .then((accessToken) => {
            res.send("Your access token is " + accessToken);
        })
        .catch(console.log);
});

//MPESA STK PUSH ROUTE
app.get("/stkpush", async (req, res) => {
    await getAccessToken()
        .then(async (accessToken) => {
            const url =
                "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
            const auth = "Bearer " + accessToken;
            const date = new Date();
            const timestamp =
                date.getFullYear() +
                ("0" + (date.getMonth() + 1)).slice(-2) +
                ("0" + date.getDate()).slice(-2) +
                ("0" + date.getHours()).slice(-2) +
                ("0" + date.getMinutes()).slice(-2) +
                ("0" + date.getSeconds()).slice(-2);
            const password = new Buffer.from(
                "174379" +
                passkey +
                timestamp
            ).toString("base64");

            console.log("posting stk...");

            await axios.post(
                url,
                {
                    BusinessShortCode: "174379",
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: "1",
                    PartyA: "254726423178", //phone number to receive the stk push
                    PartyB: "174379",
                    PhoneNumber: "254726423178",
                    CallBackURL: "https://acc4-41-209-60-106.ngrok-free.app/callback",
                    AccountReference: "R100",
                    TransactionDesc: "Mpesa Daraja API stk push test",
                },
                {
                    headers: {
                        Authorization: auth,
                    },
                }
            )
                .then((response) => {
                    res.send("Request is successful done. Please enter mpesa pin to complete the transaction");
                    console.log("response data", response.data);
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).send("Request failed");
                });
        })
        .catch(console.log);
});

//STK PUSH CALLBACK ROUTE
app.post("/callback", (req, res) => {
    console.log("stk push callback...");
    const callbackData = req.body;
    console.log(callbackData.Body.stkCallback.callbackMetadata);


    // write into database...
    // Amount
    // TransactionCode
    // TransactionDate
    // PhoneNumber

});

// REGISTER URL FOR C2B
app.get("/registerurl", (req, resp) => {
    getAccessToken()
        .then((accessToken) => {
            const url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
            const auth = "Bearer " + accessToken;
            post(
                url,
                {
                    ShortCode: "174379",
                    ResponseType: "Complete",
                    ConfirmationURL: "https://acc4-41-209-60-106.ngrok-free.app/confirmation",
                    ValidationURL: "https://acc4-41-209-60-106.ngrok-free.app/validation",
                },
                {
                    headers: {
                        Authorization: auth,
                    },
                }
            )
                .then((response) => {
                    resp.status(200).json(response.data);
                })
                .catch((error) => {
                    console.log(error);
                    resp.status(500).send("Request failed");
                });
        })
        .catch(console.log);
});

app.get("/confirmation", (req, res) => {
    console.log("All transaction will be sent to this URL");
    console.log(req.body);
});

app.get("/validation", (req, resp) => {
    console.log("Validating payment");
    console.log(req.body);
});

// B2C ROUTE OR AUTO WITHDRAWAL
app.get("/b2curlrequest", (req, res) => {
    getAccessToken()
        .then((accessToken) => {
            const securityCredential =
                "N3Lx/hisedzPLxhDMDx80IcioaSO7eaFuMC52Uts4ixvQ/Fhg5LFVWJ3FhamKur/bmbFDHiUJ2KwqVeOlSClDK4nCbRIfrqJ+jQZsWqrXcMd0o3B2ehRIBxExNL9rqouKUKuYyKtTEEKggWPgg81oPhxQ8qTSDMROLoDhiVCKR6y77lnHZ0NU83KRU4xNPy0hRcGsITxzRWPz3Ag+qu/j7SVQ0s3FM5KqHdN2UnqJjX7c0rHhGZGsNuqqQFnoHrshp34ac/u/bWmrApUwL3sdP7rOrb0nWasP7wRSCP6mAmWAJ43qWeeocqrz68TlPDIlkPYAT5d9QlHJbHHKsa1NA==";
            const url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";
            const auth = "Bearer " + accessToken;
            post(
                url,
                {
                    InitiatorName: "testapi",
                    SecurityCredential: securityCredential,
                    CommandID: "PromotionPayment",
                    Amount: "1",
                    PartyA: "600996",
                    PartyB: "",//phone number to receive the stk push
                    Remarks: "Withdrawal",
                    QueueTimeOutURL: "https://mydomain.com/b2c/queue",
                    ResultURL: "https://mydomain.com/b2c/result",
                    Occasion: "Withdrawal",
                },
                {
                    headers: {
                        Authorization: auth,
                    },
                }
            )
                .then((response) => {
                    res.status(200).json(response.data);
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).send("Request failed");
                });
        })
        .catch(console.log);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});