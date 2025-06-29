import express from 'express';
import { geminiChat, geminiImage } from '../controller/genkit.controller';

const router = express.Router();

router.post('/chat', geminiChat);
router.post('/image', geminiImage);

export default router;
