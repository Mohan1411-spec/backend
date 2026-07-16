import { Router } from "express"
import {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Route()
router.use(verifyJWT)
//secure routes

router
.route("./")
.get(getAllVideos)
.post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]), publishVideo
)

router.
route("./:vidoeId")
.post(publishVideo)
.post(getVideoById)
.patch(upload.single("thumbnail"),updateVideo )
.delete(deleteVideo)

router.route("./video/publish/:videoid").patch(togglePublishStatus)


export default router
