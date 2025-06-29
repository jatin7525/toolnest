import express from 'express';
import cors from 'cors';
import routes from './routes';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const staticPath = path.join(__dirname, 'public');

app.use('/public', express.static(staticPath));

app.use('/', routes);

const port = Number(process.env.AI_PORT) || Number(process.argv[2]) || 3000;
const host = process.env.AI_HOST || process.argv[4] || "0.0.0.0";

app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
});
