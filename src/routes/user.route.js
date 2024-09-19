import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleweares/multer.middlewear.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "profilePic", // use field name in frontend profilePic not avatar.
      maxCount: 1,
    },
    {
      name: "coverPic",
      maxCount: 1,
    },
  ]),
  registerUser
);

export default router;
