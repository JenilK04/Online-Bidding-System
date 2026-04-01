import express from 'express';
import multer from 'multer'; // 1. Import Multer
const router = express.Router();

import { register, login, uploadVerificationDoc } from '../controller/auth.js';
import { verifyToken } from '../middleware/jwt.js';

// 2. Configure Multer to use Memory Storage (Required for Base64 conversion)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit to protect MongoDB
});

router.post('/register', register);
router.post('/login', login);

// 3. Add 'upload.single("verificationDoc")' here
// The string "verificationDoc" MUST match what you use in frontend: formData.append("verificationDoc", file)
router.post(
  "/verify-documents", 
  verifyToken, 
  upload.single("verificationDoc"), 
  uploadVerificationDoc
);

export default router;