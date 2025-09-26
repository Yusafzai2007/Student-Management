import { asynchandler } from "../utils/asynchandler.js";
import { singup } from "../models/singup.model.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { student } from "../models/student.model.js";
import { uploadimg } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
// import mongoose from "mongoose";

const generateaccesstoken = async (userId) => {
  try {
    const user = await singup.findById(userId);
    const isaccesstoken = await user.isaccesstoken();
    const isrefreshtoken = await user.isrefreshtoken();
    return { isaccesstoken, isrefreshtoken };
  } catch (error) {
    throw new ApiError(500, "something went wrong access token");
  }
};

const singupdata = asynchandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "singup filed is requireds");
  }

  const existemail = await singup.findOne({ email });

  if (existemail) {
    throw new ApiError(409, "email is already exist");
  }

  const user = await singup.create({
    username,
    email,
    password,
    role: "user",
  });

  const loggedinyser = await singup
    .findById(user._id)
    .select("-password -updatedAt -createdAt");

  if (!loggedinyser) {
    throw new ApiError(500, "server error ");
  }

  res
    .status(200)
    .json(new ApiResponse(200, loggedinyser, "user create successfully"));
});

const getUsers = asynchandler(async (req, res) => {
  const user = await singup.find();
  if (!user) {
    throw new ApiError(400, "users not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { user: user }, "user fetch successfully"));
});

const loggedinuser = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "login all field all required");
  }

  const existemail = await singup.findOne({ email });

  if (!existemail) {
    throw new ApiError(400, "User not exist");
  }

  const validpassword = await existemail.ispasswordcorrect(password);

  if (!validpassword) {
    throw new ApiError(400, "password wrong");
  }

  const { isaccesstoken, isrefreshtoken } = await generateaccesstoken(
    existemail._id
  );
  console.log("isaccesstoken", isaccesstoken);
  console.log("isrefreshtoken", isrefreshtoken);

  const loggedinuser = await singup.findById(existemail._id);
  const option = {
    httpOnly: true,
    secure: false,
  };

  res
    .status(200)
    .cookie("isaccesstoken", isaccesstoken, (option.httpOnly = false))
    .cookie("isrefreshtoken", isrefreshtoken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedinuser,
          isaccesstoken: isaccesstoken,
        },
        "user loggedin successfully"
      )
    );
});

const loggedout = asynchandler(async (req, res) => {
  await singup.findByIdAndUpdate(req.user._id);

  const option = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("isaccesstoken", option)
    .clearCookie("isrefreshtoken", option)
    .json(new ApiResponse(200, {}, "loggedout successfully"));
});

const createStudent = asynchandler(async (req, res) => {
  const { name, email, course, age, city } = req.body;

  if (!name || !email || !course || !age || !city) {
    throw new ApiError(400, "All fields are required");
  }

  const existdata = await student.findOne({
    $and: [{ createdBy: req.user._id }, { $or: [{ name }, { email }] }],
  });

  if (existdata) {
    throw new ApiError(400, "This data already exists");
  }

  // pehle student data save karo (image bina)
  const user = await student.create({
    name,
    email,
    course,
    age,
    city,
    studentimg: null, // abhi null rakho
    createdBy: req.user._id, // yahan save karna important hai
  });

  // turant response bhej do
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "Student data created successfully (image uploading...)"
      )
    );

  // ab background me image upload karo
  const localimg = req.files?.studentimg?.[0]?.path;
  if (localimg) {
    try {
      const uploadimages = await uploadimg(localimg);
      if (uploadimages) {
        await student.findByIdAndUpdate(user._id, {
          studentimg: uploadimages.url,
        });
        console.log("Image uploaded and student updated");
      }
    } catch (error) {
      console.log("Image upload failed:", error.message);
    }
  }
});

const getMyStudents = asynchandler(async (req, res) => {
  const students = await student.find({ createdBy: req.user._id });

  res
    .status(200)
    .json(new ApiResponse(200, students, "Your students fetched successfully"));
});

const updatestudent = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, course, age, city } = req.body;

  if (!name || !email || !course || !age || !city) {
    throw new ApiError(400, "All fields are required");
  }

  let studentData;

  if (req.user.role === "admin") {
    // 👉 Admin kisi bhi student ko edit kar sakta hai
    studentData = await student.findById(id);
  } else {
    // 👉 Normal user sirf apne students edit kar sakta hai
    studentData = await student.findOne({
      _id: id,
      createdBy: req.user._id,
    });
  }

  if (!studentData) {
    res.json(new ApiError(404, "Student not found or not authorized"))
  }

  // Data update karo
  studentData.name = name;
  studentData.email = email;
  studentData.course = course;
  studentData.age = age;
  studentData.city = city;

  await studentData.save();

  res
    .status(200)
    .json(new ApiResponse(200, studentData, "Student updated successfully"));
});

///////////////////   admin /////////////////////////////

const deleteUser = asynchandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to delete users");
  }

  const { id } = req.params;

  const userdelete = await singup.findByIdAndDelete(id);

  if (!userdelete) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, userdelete, "User deleted successfully"));
});

const deletestudent = asynchandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to delete users");
  }

  const { id } = req.params;

  const userdelete = await student.findByIdAndDelete(id);

  if (!userdelete) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, userdelete, "User deleted successfully"));
});

const adminstudent = asynchandler(async (req, res) => {
  const admindata = await student.find();
  const userdata = await singup.find();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { admindata: admindata, users: userdata },
        "Your students fetched successfully"
      )
    );
});

const refrehtoken = asynchandler(async (req, res) => {
  const incomingrefrehtoken =
    req.cookies.isrefreshtoken || req.body.isrefreshtoken;

  if (!incomingrefrehtoken) {
    throw new ApiError(401, "unauthorized request");
  }

  let decodetoken;
  try {
    decodetoken = jwt.verify(
      incomingrefrehtoken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await singup.findById(decodetoken._id).select("-password");
  if (!user) {
    throw new ApiError(401, "unauthorized request data");
  }

  const option = {
    httpOnly: true,
    secure: false, // local testing me false rakho
  };

  // sirf naya access token generate karo
  const isaccesstoken = user.isaccesstoken();

  return res.status(200).cookie("isaccesstoken", isaccesstoken, option).json(
    new ApiResponse(
      200,
      { isaccesstoken, user }, // 👈 user ka data bhi send kar diya
      "Access token refreshed successfully"
    )
  );
});

export {
  singupdata,
  loggedinuser,
  getUsers,
  loggedout,
  createStudent,
  getMyStudents,
  updatestudent,
  deleteUser,
  adminstudent,
  deletestudent,
  refrehtoken,
};
