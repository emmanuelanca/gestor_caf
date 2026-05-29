import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import * as db from './db';
import * as test from './test';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/ingresos', async (req, res) => {
  try {
    const ingresos = await db.getIngresos();
    res.json(ingresos);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
}
