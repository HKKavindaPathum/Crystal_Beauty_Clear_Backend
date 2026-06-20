import mongoose from "mongoose"

const OTPSchema = mongoose.Schema({
    email : {
        required : true,
        type : String
    },
    otp : {
        required : true,
        type : Number
    }
})

const OTP = mongoose.model("OTP",OTPSchema)
export default OTP;