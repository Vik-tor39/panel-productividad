import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { integrationRouter } from './routes/integration.js';
import { statsRouter } from './routes/stats.js';

const app = express();

app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api', integrationRouter);
app.use('/api', statsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

app.listen(env.port, () => {
  console.log(`Panel de Productividad backend escuchando en :${env.port}`);
});
