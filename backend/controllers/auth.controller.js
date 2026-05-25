import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : "court-auth-secret");
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "8h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production.");
}

export const login = async (req, res) => {
  const username = req.body.username?.trim();
  const { password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "Username and password are required",
    });
  }

  try {
    const userResult = await pool.query(
      "SELECT id, username, password, role FROM users WHERE username = $1",
      [username]
    );

    const user = userResult.rows[0];

    const passwordMatches =
      user?.password && (await bcrypt.compare(password, user.password));

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    const authUser = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: authUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Unable to login. Please try again later.",
    });
  }
};

export const logout = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};
