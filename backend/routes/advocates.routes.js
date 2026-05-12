import express from "express";
import { getAdvocates, uploadAdvocate } from "../controllers/advocates.controller.js";
const router = express.Router();
router.post("/upload", uploadAdvocate);
router.get("/getAll", getAdvocates);


export default router;