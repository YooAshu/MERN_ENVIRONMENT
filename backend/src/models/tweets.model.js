import mongoose from 'mongoose'

const tweetsSchema = mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content:{
            type:String,
            required:true
        },
    },
    {
        timestamps: true
    }
)

export const Tweet = mongoose.model("Tweet", tweetsSchema)