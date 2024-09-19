// import { vr as cloudinary } from "cloudinary";
import cloudinary from "cloudinary";

import fs from "fs";
import { resourceLimits } from "worker_threads";
import 'dotenv/config'
// Cloudinary configuration

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilepath) => {
  try {
    if (!localFilepath) return null;
    const result = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto",
    });

    console.log(result);
    console.log(result.url);

    return result;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error("Error uploading to cloudinary: ", error);
    return null;
  }
};

export default uploadOnCloudinary;
