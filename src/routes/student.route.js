import { Router } from "express";
import {
  singupdata,
  getUsers,
  loggedinuser,
  createStudent,
  getMyStudents,
  updatestudent,
  loggedout,
  adminstudent,
  deleteUser,
  deletestudent,
} from "../controllers/user.constroller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtverify, checkadmin } from "../middlewares/auth.middleware.js";
const route = Router();
// http://localhost:4000/createuser/singupdata
route.post("/singup", singupdata);
// http://localhost:4000/createuser/login
route.post("/login", loggedinuser);
// http://localhost:4000/createuser/signup
route.get("/signup", getUsers);
// http://localhost:4000/createuser/getaddstudent
route.get("/getaddstudent", jwtverify, getMyStudents);

// // http://localhost:4000/createuser/editstudent
route.post("/editstudent/:id", jwtverify, updatestudent);

// // http://localhost:4000/createuser/student
route.post(
  "/createStudent",
  jwtverify,
  upload.fields([{ name: "studentimg", count: 1 }]),
  createStudent
);

// http://localhost:4000/createuser/logout
route.route("/logout").post(jwtverify, loggedout);

// // http://localhost:4000/createuser/logout
// route.route("/logout").post(jwtverify, logoutuser);

// // http://localhost:4000/createuser/admin
route.route("/admin").get(jwtverify, checkadmin, adminstudent);

route.delete("/deleteUser/:id", jwtverify, deleteUser);
route.delete("/deletestudent/:id", jwtverify, deletestudent);

// // http://localhost:4000/createuser/deleteUser
// route.delete("/deleteUser/:id", deleteUser);

export default route;
