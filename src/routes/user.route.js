import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middleweares/multer.middlewear.js";
import { verifyJWT } from "../middleweares/auth.middlewear.js";

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

router.route("/login").post(loginUser)

// secure route
router.route("/logout").post(verifyJWT, logoutUser)

export default router;
