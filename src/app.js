import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  express.json({
    limit: "16kb",
    // extended: true
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  express.urlencoded({
    limit: "16kb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());
// route
import userRoute from "./routes/user.route.js";

app.use("/api/v1/users", userRoute);

export { app };
