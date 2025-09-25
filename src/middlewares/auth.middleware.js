import { asynchandler } from "../utils/asynchandler.js";
import { singup } from "../models/singup.model.js";
import { ApiError } from "../utils/apierror.js";
import jwt from "jsonwebtoken";
const jwtverify = asynchandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.isaccesstoken ||
      req.header("Authorization")?.replace("Bearer ", " ");
    if (!token) {
      throw new ApiError(401, "unauthorizes request");
    }

    const decodetoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await singup
      .findById(decodetoken?._id)
      .select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid acces token");
  }
});

const checkadmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(400, "you are not admin");
  }

  next();
};

export { jwtverify, checkadmin };
