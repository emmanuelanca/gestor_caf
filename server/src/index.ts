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
    const ingresos = await db.getRows('ingresos_detallados');
    res.json(ingresos);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/ingresos', async (req, res) => {
  try {
    const resultado = await db.rowCreate('ingresos', {
      'fecha': 1,
      'cuenta_fondos': req.body.cuentaFondos ? parseFloat(req.body.cuentaFondos) : null,
      'monto': req.body.monto ? parseFloat(req.body.monto) : null,
      'socio': req.body.socio ? parseInt(req.body.socio) : null,
      'afectacion_ingreso': req.body.afectacion ? parseInt(req.body.afectacion) : null,
      'evento': req.body.evento ? parseInt(req.body.monto) : null,
      'entrada': req.body.entrada ? parseInt(req.body.entrada) : null,
      'producto': req.body.producto ? parseInt(req.body.producto) : null
    });

    res.status(201).json({ success: true, data: resultado });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
}
