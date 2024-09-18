import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleweares/multer.middlewear.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "profilePic",
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
