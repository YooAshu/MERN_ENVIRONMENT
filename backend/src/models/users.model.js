import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,  //this will remove leading and trailing white spaces from username
            index: true,  // this will create index based on userName
            // default : "ashu"   this will give default value ashu to userName
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            index:true
        },
        password: {
            type: String,
            required: [true, "password is required"],
        },
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        avatarImage: {
            type: String,
            required: true
        },
        coverImage: {
            type: String,
        },
        refreshToken: {
            type: String
        },
    },
    {
        timestamps: true
    }
)

// this mongoose middleware will run just before saving a document
// we use this to rypt password before saving in db
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next()
    this.password = bcrypt.hash(this.password, 10)
    next()

})

// comparung crypted password with entered password
// will be used while logon to verify password
userSchema.method.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// function t create refresh token 

userSchema.method.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


// function t create refresh token 

userSchema.method.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            userName: this.userName,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)