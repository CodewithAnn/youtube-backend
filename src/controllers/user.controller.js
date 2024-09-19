import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudnaryService.js";
import send from "express/lib/response.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user's information
  const { username, fullName, email, password } = req.body;
  // data validation
  if (!username || !fullName || !email || !password) {
    //   return res.status(400).json({ message: "All fields are required" });
    throw new ApiError(400, "All fields are required");
  }

  // validate use already exits
  const exitedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (exitedUser) {
    throw new ApiError(400, "User already exists");
  }

  // check for avatar and coverImage
  const avatarLocalpath = req.files?.profilePic[0]?.path;
  const coverImageLocalpath = req.files?.coverPic[0]?.path;

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar files is require");
  }

  const uploadAvatar = await uploadOnCloudinary(avatarLocalpath);
  const uploadCoverImage = await uploadOnCloudinary(coverImageLocalpath);

  if (!uploadAvatar) {
    throw new ApiError(400, "Avatar files is require");
  }

  const user = await User.create({
    fullName,
    avatar: uploadAvatar.url,
    coverImage: uploadCoverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refreshToken
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  

  console.log("username :", username);
  console.log("fullName :", fullName);
  console.log("password :", password);

  return res.status(200).json(
    new ApiResponse(
      201,
      createdUser,
      "User registered successfully"
    )
  )
});

export { registerUser };
