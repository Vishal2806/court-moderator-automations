import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import pool from "./config/db.js";

//import routes
import advocateRoutes from "./routes/advocates.routes.js";
import victimRoutes from "./routes/victims.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PORT = process.env.PORT || 5000;


// Test Route
app.get("/test-db", async (req, res) => {

  try {

    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Database Connected Successfully",
      time: result.rows[0]
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }

});

// app.use('/api/advocates', advocateRoutes);
// app.use('/api/victims', victimRoutes);
app.use('/advocates', advocateRoutes);
app.use('/victims', victimRoutes);

app.listen(PORT, () => {
   console.log(`Server running at http://localhost:${PORT}`);

});