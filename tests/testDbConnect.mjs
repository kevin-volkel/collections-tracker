import "dotenv/config";
import dbConnect from "../lib/dbConnect.mjs";

(async () => {
  try {
    await dbConnect();
    console.log("MongoDB connected successfully!");
    process.exit(0);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
})();