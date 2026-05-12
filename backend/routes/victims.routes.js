import express from "express";
import multer from "multer";
import path from "path";
import { getVictims, uploadVictim, bulkUploadVictims } from "../controllers/victims.controller.js";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});
const upload = multer({ storage });
const bulkUpload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("uploaded_file"), uploadVictim);
router.post("/bulk-upload", bulkUpload.single("file"), bulkUploadVictims);
router.get("/getAll", getVictims);
export default router;