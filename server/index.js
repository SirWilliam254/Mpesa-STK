// import Libraries..........................................
const express = require("express");
const cors = require("cors");
const app = express();

//import routes...............................................
const TokenRoute = require("./routes/token");
const callbackRouter = require("./controller/callbackSTK");


// Use libraries..............................................
app.use(express.json());
app.use(cors());


// Use Routes................................................
app.use("/token", TokenRoute);
app.use("/callback", callbackRouter);


//---------------------------------------------------------------------------------------------------App Running...
app.get('/', (req, res) => {
    res.send('Construction in progress...');
});

app.listen(5000, () => {
    console.log('server running on port 5000');
});