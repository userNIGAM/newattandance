import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const connectWithRetry = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB Connected Successfully");
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
      console.log("Retrying in 5 seconds...");
      setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    }
  };

  connectWithRetry();
};

// Handle disconnections after initial connection
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected! Attempting to reconnect...");
  connectDB();
});

export default connectDB;
