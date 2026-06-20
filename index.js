import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routes/productRouter.js';
import userRouter from './routes/userRouter.js';
import jwt from "jsonwebtoken";
import orderRouter from './routes/orderRoute.js';
import reviewRouter from "./routes/reviewRoutes.js";
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors({}));

//middeware
app.use(bodyParser.json())

app.use(
    (req,res,next)=>{
        const tokenString = req.header("Authorization")
        if(tokenString != null){
            const token = tokenString.replace("Bearer ", "")

            jwt.verify(token, process.env.JWT_KEY,
                (err,decoded)=>{
                    if(decoded != null){
                        req.user = decoded
                        next()
                    }else{
                        res.status(403).json({
                            message : "Invalid token"
                        })
                    }
                }
            )
        }else{
            next()
        }
    }
)

//databse connnect
mongoose.connect(process.env.MONGODB_URL)
.then(
    ()=>{
        console.log("Connected to the database")
    }
).catch(
    ()=>{
        console.log("Database connection failed")
    }
)

app.use("/api/products" , productRouter)
app.use("/api/users" , userRouter)
app.use("/api/orders", orderRouter)
app.use("/api/reviews", reviewRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT,
    ()=>{
        console.log(`Server is running on port ${PORT}`);
    }
)