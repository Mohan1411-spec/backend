import mongoose, {schema} from "moongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
  
const videoSchema = new.schema(
    {
        videoFile:{
            type: String, //cloudinary url
            required: true,
        },
        thumbnail:{
            type: String, //cloudinary url
            required: true,
        },
        tittle:{
            type: String,
            required: true,
        },
        description:{
            type: string,
            required: true,
        },
        duration:{
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            detault:true,
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },
    {
        timeStamp: true,
    }
)

video.plugin(moongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema)