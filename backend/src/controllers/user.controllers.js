import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/users.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user)
            throw new ApiError(404, "user not found")

        const refreshToken = await user.generateRefreshToken()

        const accessToken = await user.generateAccessToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access token and refresh token")
    }
}

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


    const user = await User.create({
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


const loginUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body
    // console.log(req.body);

    if (!(userName || email)) {
        throw new ApiError(400, "enter email or username")
    }
    if (!password) {
        throw new ApiError(400, "please enter password")
    }
    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "user not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid)
        throw new ApiError(401, "incorrect password")

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    // console.log(accessToken, refreshToken);

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "user loggeid successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken)
        throw new ApiError(401, "unnautorized request")
    try {

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)

        if (!user)
            throw new ApiError(400, "invalid refresh token")

        if (user?.refreshToken !== incomingRefreshToken)
            throw new ApiError(401, "refresh token is outdated")

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "access token refreshed")
            )


    } catch (error) {
        throw new ApiError(401, error?.message || "refresh token is invalid")
    }
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "user fetched successfully"
            )
        )
})


const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const user = await User.findById(req.user._id)

    if (!user)
        throw new ApiError(404, "user not found")

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")

    }

    // url = https://res.cloudinary.com/yooashu/image/upload/v1700000000/sample.jpg , sample is the publicId
    if (user.avatarImage) {
        const publicId = user.avatarImage.split("/").pop().split(".")[0]
        try {
            await deleteFromCloudinary(publicId)
        } catch (error) {
            console.log("error deleting old avatar")
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatarImage: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "Avatar image updated successfully")
        )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateUserAvatar
}