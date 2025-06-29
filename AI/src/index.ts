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

app.listen(5000, () => {
    console.log('🟢 Express server running on http://localhost:5000');
});
