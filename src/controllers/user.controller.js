import { asyncHandler } from "../utils/asyncHandlers.js"
import { apiError } from "../utils/apiErrors.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"


const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId)
        const generateAccessToken = user.generateAccessToken()
        const generateRefreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new error(500, "something went wrong while generating access and refresh token ")
    }
}

const registerUser = asyncHandler(async (req, res, next) => {
    //user detail from frontend
    //user is not exist alredy
    //valitaion means the user leave blank data
    //check img of avaatar
    //upload them on cloudinary, avater
    //create user object - create db in entry
    //rem pass and refress token from res
    //check for user cretaion
    //return res

    const { fullname, email, username, password } = req.body
    console.log("email", email);

    if (
        [fullname, email, username, password].some((field) => {
            field?.trim() === "";
        })
    ) {
        throw new apiError(400, "all fields required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    console.log("existedUser =", existedUser);

    if (existedUser) {
        throw new apiError(409, "user with email is already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    console.log(req.body);

    console.log("req.files:", req.files);
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "avatar")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apiError(400, "avatar is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        email,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )

    if (!createdUser) {
        throw new apiError(500, "user not created")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "user registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    //check user detail from frontend
    //check password
    //access and refresh token generate
    //user id in correct format
    //find user
    //secd cookie
    //send response

    const { email, username, password } = req.body

    if (!!username || !!email) {
        throw new apiError(400, " username or email is required ")
    }

    const User = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!User) {
        throw new apiError(404, "user is not register")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new apiError(404, "password is incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    await user.findById(user._id).select(
        "-password -refreshTOken"
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {

    await user.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
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
        .clearCookie("accessTOken", options)
        .clearCookie("refreshTOken", options)
        .json(new apiResponse(200, {}, "User logget Out "))
})

const setNewPassword = asyncHandler(async (res, req) => {
    const { oldPassword, newPassword, confPassword } = req.body

    if (newPassword === confPassword) {
        throw new apiError(400, "password not match")
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiError(400, "password does not match")

        user.password = newPassword
        await user.save({ validateBeforeSave: false })

        return res
            .status(200)
            .json(200, {}, "password is changed successfully")
    }
})

const getCurrentUser = asyncHandler(async (res, req) => {
    return res
        .status(200)
        .json(400, req.user, "current user fetch successfully")

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email, username } = req.body

    if (!fullname || !email || !username) {
        throw new apiError(400, "this field is required ")

    }

    User.findByIdAndUpdate(req
        .user?._id,
        {
            $set: {
                fullname,
                email,
                username
            }
        },
        { new: true }

    ).select("-password")

    return res
        .status(200)
        .json(new apiResponse(200, user, "account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw apiError(400,"avatar file is miising")
    }

    const avatar = await uploadOnCloudinary
    {avatarLocalPath}
     
    if (!avatar) {
        throw new apiError(400, "error whie uploading")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar = avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse( 200, "Avatar image is uploaded ")
    ) 
})

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw apiError(400,"avatar file is miising")
    }

    const avatar = await uploadOnCloudinary
    {coverImageLocalPath}
     
    if (!avatar) {
        throw new apiError(400, "error whie uploading")
    }

     const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar = avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse( 200, "Cover image is uploaded ")
    ) 
})

const userProfileDetails = asyncHandler(async(req, res) =>{

    const { username} = req.params

    if( !username ) {
        throw new apiError(400, "username is required")
    }

     const user = await User.aggregate([
        {
            $match: username
        },
        {
            $lookup: {
    
                    from : "subscriptions",
                    localfield: "._id",
                    foreignField: "channel",
                    as: "subscribers"

            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "._id",
                foreignField: "subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                }
            },

            channelssubscribedCount:{
                $size: "$subscribedTo"
            },

            isSubscribed:{
                $cond: {
                    if:{
                        $in: [req.user?._id, "$subscribers.subscriber"]
                    }
                }
            }

        },
    ])

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "User profile details fetched successfully")
    )

})


export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    setNewPassword,
    updateAccountDetails,
    updateUserAvatar,
    userProfileDetails
}
