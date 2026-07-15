import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiError } from "../utils/apiErrors.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "created by",
        sortType = "asc",
        userId
    } = req.query
    //TODO: get all videos based on query, sort, pagination

    const match = {
        isPublished = true
    }

    if (query) {
        match.$or[
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }
    if (userId) {
        match.userId = new mongoose.Types.ObjectId(userId)
    }

    const aggregate = Video.aggregate([
        { $match: match },

        {
            $lookup: {
                from: "users",
                localfield: "userId",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            video: 1,
                            name: 1
                        }
                    }
                ]
            }
        }
    ])

    // Validate query parameters (page, limit, sort values).

    //validate page
    if (isNaN(page) || page < 1) {
        throw new apiError(400, "Page must in positive number!!")
    }

    //Validate page limit

    if (isNaN(limit) || limit < 1) {
        throw new apiError(400, "page limit must me in positive number")
    }

    //validate sort type 

    const allowedSortType = ["asc"]

    if (!allowedSortType) {
        throw new apiError(400, "Invalid sort type")
    }

    //validate sort by

    const allowedSortBy = ["created by"]

    if (!allowedSortBy) {
        throw new apiError(400, "invalid sort by")
    }

    //  Create a filter object for searching videos.

    //filter by owner

    const filter = {}

    if (userId) {
        filter.owner = userId;
    }



    //Create a sort object based on sortBy and sortType.

    const sortOption = {}

    if (sortBy) {
        sortOption[sortBy] = sortType === "asc" ? 1 : -1
    }
    else {
        sortOption.createdAt = -1
    }

    // Calculate pagination (skip = (page - 1) * limit).

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(page, 10)

    //calculate document to skip

    const skip = (pageNumber - 1) * limitNumber

    //Fetch videos from the database with filter, sort, skip, and limit

    const video = await Video.find({ filter })
        .populate("owner", "username, fullname, avatar")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber);

    //count total videos

    const totalVideos = await Video.countDocument(filter)
    const totalPages = Math.ceil(totalVideos / limitNumber);

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                video,
                totalVideos,
                currentpage,
                totalPages,
                limitNumber
            )
        )

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO:
    // 1. Validate title and description.

    // 2. Check if video file exists in req.files.

    // 3. Get video file path from req.files.

    // 4. Upload video file to Cloudinary.

    // 5. Get uploaded video URL and public_id from Cloudinary response.

    // 6. Create video document in database with:
    //    - title
    //    - description
    //    - video URL
    //    - duration
    //    - owner (logged-in user)

    // 7. Save video document.

    // 8. Check if video was created successfully.

    // 9. Return created video response.

    //validate title ad discritpion 

    if (!title || !description) {
        throw new apiError(400, "check title and description")
    }
    //upload video in cloudinary
    const videoLocalPath = req.file?.video?.[0]?.path

    console.log(req.body)
    console.log("req.file:", req.file)

    if (!videosLocalPath) {
        throw new apiError(400, "local path of video file is not exixt ")
    }

    const videoUpload = await uploadOnCloudinary(videoLocalPath)

    if (!videoUpload) {
        throw new apiError(400, "video upload is failed")
    }

    const videoUrl = videoUpload.url;
    const publicId = videoUpload.public_id;
    const duration = videoUpload.duration;
    //create document for video object in db
    const video = await Video.create({
        title,
        description,
        video: videoUpload.url,
        duration: videoUpload.duration,
        owner: req.user._id
    })

    if (!video) {
        throw new apiError(400, " something went wrong while creating video")
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                "video published successfully "
            )
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // TODO 1: Validate the videoId (check if it's a valid MongoDB ObjectId)

    // TODO 2: Find the video in the database using the videoId

    // TODO 3: If the video doesn't exist, throw an appropriate error

    // TODO 4: Return the video with a success response    

    if (!videoId) {
        throw new apiError(400, "Enter a valid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(400, "video not found")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200,
                video,
                "video find successfully"
            )
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // TODO 1: Validate the videoId

    // TODO 2: Get the title and description from the request body

    // TODO 3: Get the thumbnail path from req.file (if a new thumbnail is uploaded)

    // TODO 4: Find the video by videoId

    // TODO 5: If the video doesn't exist, throw an error

    // TODO 6: Check if the logged-in user is the owner of the video

    // TODO 7: If a new thumbnail is uploaded, upload it to Cloudinary

    // TODO 8: Update the title, description, and thumbnail fields

    // TODO 9: Save the updated video

    // TODO 10: Return the updated video with a success response

    if (mongoose.Type.ObjectId.isValid(videoId)) {
        throw new apiError(400, "video not found")
    }

    const { title, description } = req.body

    const thumbnailLocalPath = req.file?.path;

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(400, "video is not exist")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new apiError(400, "Owner is not login")
    }

    let = thumbnail;

    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    }

    if (title) video.title = title;
    if (description) video.description = description;
    if (thumbnail) video.thumbnail = thumbnailLocalPath.url;

    await video.save({validateBeforeSave: flase});

    return res
    .status(200)
    .json(
        new apiResponse(
            200, 
            video,
            "Video is updated is successfully"
        )
    )



})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // TODO 1: Validate the videoId

    // TODO 2: Find the video by videoId

    // TODO 3: If the video doesn't exist, throw an error

    // TODO 4: Check if the logged-in user is the owner of the video

    // TODO 5: Delete the video thumbnail from Cloudinary (optional but recommended)

    // TODO 6: Delete the video file from Cloudinary (optional but recommended)

    // TODO 7: Delete the video document from MongoDB

    // TODO 8: Return a success response

    if (mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "video not found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(400, "video is not found")
    }

    if(video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "owner is not logged in")
    }

    const video = await Video.findByIdAndDelete(videoId)
    
    if(!video) {
        throw new apiError (400, "video is not delete successfully")
    }

    return res 
    .status(200)
    .json(
        new apiResponse(
            200,
            video,
            "video is not deleted"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}


