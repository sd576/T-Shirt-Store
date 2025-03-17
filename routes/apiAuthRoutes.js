import express from 'express';
import { apiLoginUser } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', apiLoginUser);

export default router;
