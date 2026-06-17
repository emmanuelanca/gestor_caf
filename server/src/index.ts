import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import * as db from './db';
import * as test from './test';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/income', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM ingresos_detallados ORDER BY fecha DESC');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/income', async (req, res) => {
  try {
    const result = await db.rowCreate('ingresos', {
      'fecha': req.body.date ? await db.calendarDateToId(req.body.date) : null,
      'cuenta_fondos': req.body.fundAccount ? parseFloat(req.body.fundAccount) : null,
      'monto': req.body.amount ? parseFloat(req.body.amount) : null,
      'socio': req.body.member ? parseInt(req.body.member) : null,
      'afectacion_ingreso': req.body.allocation ? parseInt(req.body.allocation) : null,
      'evento': req.body.event ? parseInt(req.body.event) : null,
      'entrada': req.body.ticket ? parseInt(req.body.ticket) : null,
      'producto': req.body.product ? parseInt(req.body.product) : null
    });

    res.status(201).json({ success: true, data: result });

  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/income/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.sqlQuery(`DELETE FROM ingresos WHERE id = ${id}`);
    res.json({ success: true, message: 'An income was deleted successfully' });
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/commitment', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM compromisos_detallados');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/commitment', async (req, res) => {
  try {
    const result = await db.rowCreate('compromisos', {
    });

    res.status(201).json({ success: true, data: result });

  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/commitment/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.sqlQuery(`DELETE FROM compromisos WHERE id = ${id}`);
    res.json({ success: true, message: 'An commitment was deleted successfully' });
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/member', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM socios');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/fund-account', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM cuentas_fondos');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/allocation', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM afectacion_ingresos');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/event', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM eventos');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/ticket', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM entradas');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/product', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM productos');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/fund-movement', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM movimientos_fondos_detallados');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/fund-movement', async (req, res) => {
  try {
    const result = await db.rowCreate('movimientos_fondos', {
    });

    res.status(201).json({ success: true, data: result });

  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/fund-movement/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.sqlQuery(`DELETE FROM movimientos_fondos WHERE id = ${id}`);
    res.json({ success: true, message: 'A fund movement was deleted successfully' });
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/voucher', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM comprobantes');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running...`);
});

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
}
