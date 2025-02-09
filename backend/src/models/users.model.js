import mongoose from "mongoose"

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
            lowecase: true
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
            required:true
        },
        coverImage:{
            type:true,
        },
        refreshToken: {
            type: String
        },
    },
    {
        timestamps:true
    }
)

export const User = mongoose.model("User", userSchema)