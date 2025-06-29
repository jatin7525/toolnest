import genkitRoutes from './genkit.route';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Genkit API' });
});

router.use('/api/generate', genkitRoutes);

export default router;
