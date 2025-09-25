import mongoose from "mongoose";

import { DB_NAME } from "../constant.js";

const connectdb = async () => {
  try {
    const response = await mongoose.connect(
      `${process.env.MONGO_URL}/${DB_NAME}`
    );
    console.log("Database connected successfully", response.connection.host);
  } catch (error) {
    console.log("Error while connecting to database", error.message);
  }
};



export default connectdb;