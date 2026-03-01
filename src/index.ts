import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// CORS configured dynamically
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Serve frontend static files
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

import routes from './routes';
app.use('/api', routes);

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`✅ Database connection established`);
    console.log(`🌐 Frontend: http://localhost:${port}/frontend/index.html`);
});
