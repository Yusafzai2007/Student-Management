

import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const signupSchema = new mongoose.Schema(
  {
    username: {
        type: String,
        required: true,
      },
        email: {
        type: String,
        required: true,
        },
        password: {
        type: String,
        required: true,
        },
        role:{
          type:String
        }
  },
  { timestamps: true }
);


signupSchema.pre("save",async function(next) {
    if (!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10);
    next();
})

signupSchema.methods.ispasswordcorrect=async function(password) {
    return await bcrypt.compare(password,this.password)
}


signupSchema.methods.isaccesstoken= function () {
    return jwt.sign({
        _id:this._id,
        email:this.email,
        role:this.role
    },
           process.env.ACCESS_TOKEN_SECRET,
           {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
           }
)
}


signupSchema.methods.isrefreshtoken= function() {
  return  jwt.sign({
        _id:this._id
    },
       process.env.REFRESH_TOKEN_SECRET,
       {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
       }
)
}















export const singup = mongoose.model("signup", signupSchema);





















