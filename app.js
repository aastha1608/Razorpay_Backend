const express=require('express');
const Razorpay=require('razorpay');

const app=express();

require('dotenv').config();
const PORT=process.env.PORT;

const Payment = require('./models/Payment');

const cors=require("cors");
const crypto=require("crypto");

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

const dbConnect=require('./config/database.js');
dbConnect();

app.get('/',(req,res)=>{
    res.send("App Started");
})

app.post('/order',async(req,res)=>{
    try    
    {
        const razorpay=new Razorpay({
            key_id:process.env.RAZORPAY_KEY_ID,
            key_secret:process.env.RAZORPAY_KEY_SECRET,
        });
        const options=req.body;
        const order=await razorpay.orders.create(options);
        if(!order){
            return res.status(500).send("Error");
        }
        res.json(order);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send("Error");
    }
});

app.post('/order/validate',async(req,res)=>{
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;
    try
    {
        const sha=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET);
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest=sha.digest("hex");
        if(digest===razorpay_signature)
        {
            const payment=new Payment({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            });
            await payment.save();
            return res.json({
                msg:"Payment Successfully",
                orderId:razorpay_order_id,
                paymentId:razorpay_payment_id,
            });
        }
    }
    catch(error)
    {
        res.status(500).json({msg:"Internal Server Error"});
    }
});

app.listen(PORT,()=>{
    console.log("Server started on PORT 3000");
})