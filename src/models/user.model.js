import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            trim: true,
            minlength: [8, "eight length password required"]
        },
        avatar: {
            type: String, //cloudinary url
            required: true,
        },
        coverImage: {
            type: String, //cloudnery
        },
        refreshToken: {
            type: String
        },
    },
    {
        timestamps: true
    }
)
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.method.generateAccessToken = async function () {

    jwt.sign({
        _id: this.id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
        process.env.ACCESS_TOKEN_SECERET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.method.generateRefreshToken = async function () {

    jwt.sign({
        _id: this.id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
        process.env.REFRESH_TOKEN_SECERET,
        {
            expiresIn: process.env.REFRESH_TOKEN_SECERET
        }
        
    )


}

userSchema.method.generateRefreshToken = async function () {


}

export const User = mongoose.model("User", userSchema)