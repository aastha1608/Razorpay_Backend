const express=require('express');
const Razorpay=require('razorpay');

const app=express();

require('dotenv').config();
const PORT=process.env.PORT;

const cors=require("cors");

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

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

app.listen(PORT,()=>{
    console.log("Server started on PORT 3000");
})