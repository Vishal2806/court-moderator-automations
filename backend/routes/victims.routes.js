import express from "express";
import { getVictims, uploadVictim } from "../controllers/victims.controller.js";
const router = express.Router();
router.post("/upload", uploadVictim);
router.get("/getAll", getVictims);
export default router;