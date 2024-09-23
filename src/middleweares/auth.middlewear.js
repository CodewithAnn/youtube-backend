import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
export const verifyJWT = asyncHandler(async (req, res, next) => {
    // verify jwt token
    try {
        // check for the token 
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        console.log("Token:", token);

        if (!token) {
            throw new ApiError(
                401,
                "You are not authorized to access this resource. Please log in."
            )
        }



        // validate token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // find user 
        const user = await User.findById(decoded?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid access token. Please log in again.")
        }

        // pass the user to req
        req.user = user
        next()

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Token expired")
        }
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})