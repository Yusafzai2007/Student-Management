import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentimg: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "singup",
      required: true,
    },
  },
  { timestamps: true }
);
export const student = mongoose.model("student", studentSchema);
