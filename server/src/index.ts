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
      'fecha': req.body.fecha ? await db.calendarDateToId(req.body.fecha) : null,
      'cuenta_fondos': req.body.cuentaFondos ? parseFloat(req.body.cuentaFondos) : null,
      'monto': req.body.monto ? parseFloat(req.body.monto) : null,
      'socio': req.body.socio ? parseInt(req.body.socio) : null,
      'afectacion_ingreso': req.body.afectacion ? parseInt(req.body.afectacion) : null,
      'evento': req.body.evento ? parseInt(req.body.evento) : null,
      'entrada': req.body.entrada ? parseInt(req.body.entrada) : null,
      'producto': req.body.producto ? parseInt(req.body.producto) : null
    });

    res.status(201).json({ success: true, data: resultado });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/socios', async (req, res) => {
  try {
    const socios = await db.getRows('socios');
    res.json(socios);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/cuentas-fondos', async (req, res) => {
  try {
    const cuentasFondos = await db.getRows('cuentas_fondos');
    res.json(cuentasFondos);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/afectacion-ingresos', async (req, res) => {
  try {
    const afectacionIngresos = await db.getRows('afectacion_ingresos');
    res.json(afectacionIngresos);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/eventos', async (req, res) => {
  try {
    const eventos = await db.getRows('eventos');
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/entradas', async (req, res) => {
  try {
    const entradas = await db.getRows('entradas');
    res.json(entradas);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/productos', async (req, res) => {
  try {
    const productos = await db.getRows('productos');
    res.json(productos);
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
