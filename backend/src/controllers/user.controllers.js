import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {

    const { userName, email, fullName, password } = req.body


    if (
        [userName, email, fullName, password].some((field) =>
            field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "all fields are required")
    }


    const existedUser = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (existedUser) {
        throw new ApiError(409, "user already exist")
    }




    const avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar image is required")
    }
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // console.log(avatarLocalPath);
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // console.log(avatar);

    if (!avatar) {
        throw new ApiError(500, "failed to upload avatar")
    }


    const user =await User.create({
        userName,
        email,
        password,
        fullName,
        avatarImage: avatar.url,
        coverImage: coverImage?.url || ""
    })
    // console.log(user);

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    // console.log(createdUser);

    if (!createdUser) {
        throw new ApiError(500, "failed to register user")
    }

    res.status(201).json(
        new ApiResponse(201, createdUser, "user registerd successfully")
    )

})

export { registerUser }