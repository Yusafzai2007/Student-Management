

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
app.use(cors({
    origin: process.env.Cors_ORIGN || "http://localhost:4200",
    credentials: true,
}));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());



// import route

import addstuden from "./routes/student.route.js"

app.use("/createuser",addstuden)












export {app}




















