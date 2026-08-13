import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import * as db from './db';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// INGRESOS

app.get('/api/income', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM ingreso_resumen ORDER BY fecha DESC');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/income', async (req, res) => {
  try {
    const income = await db.rowCreate('ingreso', {
      'fecha': req.body.date ? await db.calendarDateToId(req.body.date) : null,
      'cuenta_fondos': req.body.fundAccount ? parseFloat(req.body.fundAccount) : null,
      'monto': req.body.amount ? parseFloat(req.body.amount) : null,
      'socio': req.body.member ? parseInt(req.body.member) : null,
      'afectacion_ingreso': req.body.allocation ? parseInt(req.body.allocation) : null,
      'evento': req.body.event ? parseInt(req.body.event) : null,
      'entrada': req.body.ticket ? parseInt(req.body.ticket) : null,
      'producto': req.body.product ? parseInt(req.body.product) : null
    });

    await db.rowCreate('movimientos_fondos', {
      'fecha': req.body.date ? await db.calendarDateToId(req.body.date) : null,
      'cuenta_fondos': req.body.fundAccount ? parseFloat(req.body.fundAccount) : null,
      'monto': req.body.amount ? parseFloat(req.body.amount) : null,
      'ingreso': income,
    });

    res.status(201).json({ success: true });

  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/income/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.sqlQuery(`DELETE FROM ingreso WHERE id = ${id}`);
    res.json({ success: true, message: 'An income was deleted successfully' });
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/commitment', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM compromiso_detallado');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/commitment', async (req, res) => {
  try {
    const result = await db.rowCreate('compromiso', {
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
    await db.sqlQuery(`DELETE FROM compromiso WHERE id = ${id}`);
    res.json({ success: true, message: 'An commitment was deleted successfully' });
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/member', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM socio');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/fund-account', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM cuenta_fondos');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/allocation', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM afectacion');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/event', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM evento');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/ticket', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM entrada');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/product', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM producto');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/product', async (req, res) => {
  try {
    const result = await db.rowCreate('producto', {
      'nombre': req.body.name ? req.body.name.trim() : null,
      'categoria': req.body.category ? req.body.category.trim() : null,
      'subcategoria': req.body.subcategory ? req.body.subcategory.trim() : null,
      'puc_venta_id': req.body.pucSaleId ? parseInt(req.body.pucSaleId) : null,
      'puc_compra_id': req.body.pucPurchaseId ? parseInt(req.body.pucPurchaseId) : null,
      'activo': req.body.active !== undefined ? parseInt(req.body.active) : 1,
    });

    res.status(201).json({ success: true, id: result });
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/product/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.sqlQuery(`
      UPDATE producto 
      SET 
        nombre = ${req.body.name ? `'${req.body.name.trim()}'` : 'NULL'},
        categoria = ${req.body.category ? `'${req.body.category.trim()}'` : 'NULL'},
        subcategoria = ${req.body.subcategory ? `'${req.body.subcategory.trim()}'` : 'NULL'},
        puc_venta_id = ${req.body.pucSaleId ? parseInt(req.body.pucSaleId) : 'NULL'},
        puc_compra_id = ${req.body.pucPurchaseId ? parseInt(req.body.pucPurchaseId) : 'NULL'},
        activo = ${req.body.active !== undefined ? parseInt(req.body.active) : 'activo'}
      WHERE id = ${parseInt(id)}
    `);

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/fund-movement', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM movimiento_detallado ORDER BY fecha_pago DESC');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/fund-movement', async (req, res) => {
  try {
    const result = await db.rowCreate('movimientos_fondos', {
      'fecha': req.body.date ? await db.calendarDateToId(req.body.date) : null,
      'cuenta_fondos': req.body.fundAccount,
      'monto': req.body.amount,
      'compromiso': req.body.commitment,
      'ingreso': req.body.income,
      'comprobante': req.body.voucher,
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
    const result = await db.sqlQuery('SELECT * FROM comprobante');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/pending-commitment', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM compromiso_pendiente ORDER BY fecha_vencimiento DESC');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/pending-commitment', async (req, res) => {
  try {
    await db.rowCreate('movimientos_fondos', {
      'fecha': req.body.date ? await db.calendarDateToId(req.body.date) : null,
      'cuenta_fondos': req.body.fundAccount ? parseInt(req.body.fundAccount) : null,
      'monto': req.body.amount ? parseInt(req.body.amount) : null,
      'compromiso': req.body.commitment,
    });

    res.status(201).json({ success: true });

  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// COMPROBANTES CABECERA
app.post('/api/voucher-head', async (req, res) => {
  try {
    await db.rowCreate('comprobantes_cabecera', {
      'tipo': req.body.type,
      'fecha': req.body.date ? await db.calendarDateToId(req.body.date) : null,
      'numero': req.body.number,
      'proveedor': req.body.provider ? parseInt(req.body.provider) : null,
    });

    res.status(201).json({ success: true });

  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/provider', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM proveedor');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUC
app.get('/api/puc-balance', async (req, res) => {
  try {
    // Whitelist explícito: nunca se interpola el query param directamente en el SQL.
    const tipo = req.query.tipo === 'movimiento' ? 'movimiento' : 'devengado';

    const view = tipo === 'movimiento'
      ? 'puc_balance_movimiento_consolidado'
      : 'puc_balance_devengado_consolidado';

    const result = await db.sqlQuery(`SELECT * FROM ${view} ORDER BY codigo ASC`);
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/puc', async (req, res) => {
  try {
    const result = await db.sqlQuery('SELECT * FROM puc ORDER BY codigo ASC');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/puc', async (req, res) => {
  try {
    const { padre_id, subnivel, nombre, descripcion } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'PUC name is mandatory' });
    }

    if (!subnivel || subnivel.toString().trim() === '') {
      return res.status(400).json({ error: 'PUC sublevel is mandatory' });
    }

    if (padre_id !== null && padre_id !== undefined && padre_id !== '') {
      const padreExists = await db.sqlQuery(`SELECT id FROM puc WHERE id = ${parseInt(padre_id)}`);
      if (!padreExists || padreExists.length === 0) {
        return res.status(400).json({ error: 'El PUC padre no existe' });
      }
    }

    const result = await db.rowCreate('puc', {
      'padre_id': padre_id && padre_id !== '' ? parseInt(padre_id) : null,
      'subnivel': subnivel.toString().trim(),
      'nombre': nombre.trim(),
      'descripcion': descripcion ? descripcion.trim() : null,
    });

    res.status(201).json({ success: true, id: result });
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// INICIAR SERVIDOR

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running...`);
});

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
}
