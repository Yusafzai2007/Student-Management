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
  refrehtoken
} from "../controllers/user.constroller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtverify, checkadmin } from "../middlewares/auth.middleware.js";
const route = Router();
// http://localhost:4000/createuser/singupdata
route.post("/singup", singupdata);
route.post("/login", loggedinuser);
route.get("/signup", getUsers);
route.get("/getaddstudent", jwtverify, getMyStudents);

route.post("/editstudent/:id", jwtverify, updatestudent);

route.post(
  "/createStudent",
  jwtverify,
  upload.fields([{ name: "studentimg", count: 1 }]),
  createStudent
);

route.route("/logout").post(jwtverify, loggedout);

route.route("/admin").get(jwtverify, checkadmin, adminstudent);

route.delete("/deleteUser/:id", jwtverify, deleteUser);
route.delete("/deletestudent/:id", jwtverify, deletestudent);

route.post("/refrehtoken",refrehtoken)

export default route;
