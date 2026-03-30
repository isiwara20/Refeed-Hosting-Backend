import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";

// Load .env from src/config
dotenv.config({ path: "./src/config/.env" });

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});
