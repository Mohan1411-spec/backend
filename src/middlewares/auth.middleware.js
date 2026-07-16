import { apiError } from "../utils/apiErrors.js"
import { asyncHandler } from "../utils/asyncHandlers.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyJWT = asyncHandler(async (req, _, next) => {

    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer", "")


console.log("Cookies:", req.cookies);
console.log("Authorization:", req.header("Authorization"));
console.log("Token:", token);

        if (!token) {
            throw new apiError(401, "Unauthorized request")
        }
        console.log("token:", token);
        console.log("typeof token:", typeof token);
        console.log("cookies:", req.cookies);
        console.log("authorization:", req.header("Authorization"));
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"

        )

        if (!user) {
            throw new apiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401, error?.message ||
            "Invalid Access Token")
    }

})