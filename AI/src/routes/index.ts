import genkitRoutes from './genkit.route';
import { Router } from 'express';
import dotenv from "dotenv";
import { verifyToken } from "../middleware/auth";

dotenv.config();

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Genkit API' });
});

router.get("/protected", verifyToken, (req, res) => {
    res.json({ message: "Welcome to the secure zone!" });
});

router.use('/api/generate', verifyToken, genkitRoutes);

export default router;
