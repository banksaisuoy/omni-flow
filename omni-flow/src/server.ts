import express from 'express';
import inferRouter from './api/routes/infer';

const app = express();

app.use(express.json());

app.use('/v1/infer', inferRouter);

export default app;