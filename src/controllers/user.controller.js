import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudnaryService.js";
import send from "express/lib/response.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import res from "express/lib/response.js";

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
  console.log(req.files)
  // check for avatar and coverImage
  const avatarLocalpath = req.files?.profilePic[0]?.path;
  // const coverImageLocalpath = req.files?.coverPic[0]?.path;

  // let check for is coverPic is empty?
  let coverImageLocalpath;
  if (req.files.coverPic && req.files.coverPic[0]) {
    coverImageLocalpath = req.files.coverPic[0]?.path;
  } else {
    coverImageLocalpath = "";
  }


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

// method to generate access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    // find user
    const user = await User.findById(userId);
    // generate access and refresh token
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    console.log("AccessToken:", accessToken, "RefreshToken:", refreshToken);
    // save refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "Somthing wrong with generating access and refresh tokens")
  }

}

// login user
const loginUser = asyncHandler(async (req, res) => {

  // get user from req.body
  const { username, email, password } = req.body

  // data validation
  if (!(username || email)) {
    throw new ApiError(400, "Username or Email is required");
  }

  // find user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email }]

  })

  console.log(user);

  // check if user exists
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }
  // check password
  const isPasswordMatched = await user.checkPassword(password)

  if (!password) {
    throw new ApiError(401, "Invalid credentials");
  }

  // call generate access and refresh token 
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  console.log("AccessToken:", accessToken, "RefreshToken:", refreshToken);


  const logedInUser = await User.findById(user._id).select("-password -refreshToken")
  console.log(logedInUser);
  //   const logedInUser = user.toObject();
  // delete logedInUser.password;
  // delete logedInUser.refreshToken;



  const options = {
    httpOnly: true,
    secure: true
  }
  // cookies 

  return res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
      200,
      { user: logedInUser, accessToken, refreshToken },
      "Login successfully"
    ))
});



// logout user
const logoutUser = asyncHandler(async (req, res) => {

  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { accessToken: undefined },

    },
    { new: true },


  )

  const options = {
    httpOnly: true,
    secure: true
  }

  res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "user log out "))
})

export { registerUser, loginUser, logoutUser };
