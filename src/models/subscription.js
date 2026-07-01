import mongoose from "mongoose"
import moongoose, { schema } from "mongoose"

const subscriptionSchema = new schema ({
    subscriber: {
        type: schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: schema.Types.ObjectId,
        ref: "User"
    }

})

export const subscription = mongoose.model("Subscription", subscriptionSchema)