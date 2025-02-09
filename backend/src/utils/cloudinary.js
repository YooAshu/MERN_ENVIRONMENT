import { v2 as cloudinary } from "cloudinary"
import { log } from "console"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// function to upload files on cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(
            localFilePath,
            { resource_type: "auto" }
        )
        // file has uploaded on cloudinary
        console.log("file uploaded on cloudinary", response.url);
        // remove file from loacal path
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {

        fs.unlinkSync(localFilePath)
        console.log("failed to upload on cloudinary", error.message);
        return null

    }
}

export { uploadOnCloudinary }