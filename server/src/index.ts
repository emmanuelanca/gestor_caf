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
    const { date, amount, fundAccount, puc, member, allocation, event, ticket, product } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'La fecha es obligatoria' });
    }
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'El monto es obligatorio y debe ser numérico' });
    }
    if (!fundAccount) {
      return res.status(400).json({ error: 'La cuenta de fondos es obligatoria' });
    }
    if (!puc) {
      return res.status(400).json({ error: 'La cuenta PUC es obligatoria' });
    }

    // Número autogenerado: no hay número de recibo físico en este flujo rápido.
    const numeroComprobante = `REC-${Date.now()}`;

    await db.withTransaction(async (conn) => {
      const comprobanteId = await db.rowCreateTx(conn, 'comprobante', {
        tipo: 'Recibo Ingreso',
        numero: numeroComprobante,
        fecha_emision: date,
        proveedor_id: null,
      });

      await db.rowCreateTx(conn, 'comprobante_item_ingreso', {
        comprobante_id: comprobanteId,
        puc_id: parseInt(puc),
        monto_unidad: parseFloat(amount),
        unidades: 1,
        afectacion_id: allocation ? parseInt(allocation) : null,
        socio_id: member ? parseInt(member) : null,
        evento_id: event ? parseInt(event) : null,
        entrada_id: ticket ? parseInt(ticket) : null,
        producto_id: product ? parseInt(product) : null,
      });

      await db.rowCreateTx(conn, 'ingreso', {
        comprobante_id: comprobanteId,
        cuenta_fondos_id: parseInt(fundAccount),
      });
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
    await db.sqlQuery(`DELETE FROM ingreso WHERE id = ${id}`); //   Remplazar por ISQL await db.rowDelete('ingreso', parseInt(id));
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

/*app.post('/api/commitment', async (req, res) => {
  try {
    const result = await db.rowCreate('compromiso', {
    });

    res.status(201).json({ success: true, data: result });

  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});*/

app.post('/api/commitment', async (req, res) => {
  try {
    const comprobanteId = parseInt(req.body.comprobanteId);
    const fechaDevengamiento = req.body.fechaDevengamiento || null;

    if (Number.isNaN(comprobanteId)) {
      return res.status(400).json({ error: 'comprobanteId inválido' });
    }

    await db.withTransaction(async (conn) => {
      const compRows: any[] = await db.queryTx(
        conn,
        'SELECT id, fecha_emision, anulado FROM comprobante WHERE id = ? LIMIT 1',
        [comprobanteId]
      );
      if (!compRows.length) {
        throw new Error('El comprobante no existe');
      }
      if (compRows[0].anulado === 1) {
        throw new Error('No se puede generar compromiso sobre un comprobante anulado');
      }

      const alreadyRows: any[] = await db.queryTx(
        conn,
        'SELECT id FROM compromiso WHERE comprobante_id = ? LIMIT 1',
        [comprobanteId]
      );
      if (alreadyRows.length) {
        throw new Error('Ese comprobante ya tiene compromiso generado');
      }

      const itemRows: any[] = await db.queryTx(
        conn,
        'SELECT id FROM comprobante_item_compromiso WHERE comprobante_id = ? LIMIT 1',
        [comprobanteId]
      );
      if (!itemRows.length) {
        throw new Error('No hay detalle cargado para generar el compromiso');
      }

      await db.rowCreateTx(conn, 'compromiso', {
        comprobante_id: comprobanteId,
        fecha_devengamiento: fechaDevengamiento || compRows[0].fecha_emision,
      });
    });

    res.status(201).json({ success: true });
  } catch (error: any) {
    if (error?.message) {
      return res.status(400).json({ error: error.message });
    }
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
    const result = await db.sqlQuery('SELECT * FROM compromiso_pendiente WHERE comprobante_id IN (SELECT id FROM comprobante WHERE anulado = 0) ORDER BY fecha_vencimiento DESC');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/pending-commitment', async (req, res) => {
  try {
    const { date, fundAccount, comprobanteId } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'La fecha es obligatoria' });
    }
    if (!fundAccount) {
      return res.status(400).json({ error: 'La cuenta de fondos es obligatoria' });
    }
    if (!comprobanteId) {
      return res.status(400).json({ error: 'El comprobante del compromiso es obligatorio' });
    }

    const numeroOrdenPago = `OP-${Date.now()}`;

    await db.withTransaction(async (conn) => {
      const originalRows = await db.queryTx(
        conn,
        'SELECT proveedor_id FROM comprobante WHERE id = ?',
        [parseInt(comprobanteId)]
      );

      if (!originalRows || originalRows.length === 0) {
        throw new Error('El comprobante del compromiso original no existe');
      }

      const proveedorId = originalRows[0].proveedor_id;

      const paymentComprobanteId = await db.rowCreateTx(conn, 'comprobante', {
        tipo: 'Orden de Pago',
        numero: numeroOrdenPago,
        fecha_emision: date,
        proveedor_id: proveedorId,
      });

      const itemRows = await db.queryTx(
        conn,
        'SELECT id FROM comprobante_item_compromiso WHERE comprobante_id = ?',
        [parseInt(comprobanteId)]
      );

      if (!itemRows || itemRows.length === 0) {
        throw new Error('El compromiso no tiene ítems asociados');
      }

      for (const item of itemRows) {
        await db.rowCreateTx(conn, 'comprobante_item_egreso', {
          comprobante_id: paymentComprobanteId,
          comprobante_item_compromiso_id: item.id,
        });
      }

      await db.rowCreateTx(conn, 'egreso', {
        comprobante_id: paymentComprobanteId,
        comprobante_compromiso_id: parseInt(comprobanteId),
        cuenta_fondos_id: parseInt(fundAccount),
      });
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// COMPROBANTES CABECERA
/*app.post('/api/voucher-head', async (req, res) => {
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
});*/

app.post('/api/voucher-head', async (req, res) => {
  try {
    const tipo = typeof req.body.type === 'string' ? req.body.type.trim() : '';
    const numero = typeof req.body.number === 'string' ? req.body.number.trim() : '';
    const fecha = typeof req.body.date === 'string' ? req.body.date.trim() : '';
    const proveedorId = req.body.provider ? parseInt(req.body.provider) : null;

    if (!tipo) return res.status(400).json({ error: 'El tipo es obligatorio' });
    if (!numero) return res.status(400).json({ error: 'El número es obligatorio' });
    if (!fecha) return res.status(400).json({ error: 'La fecha es obligatoria' });

    await db.rowCreate('comprobante', {
      tipo,
      numero,
      fecha_emision: fecha,
      fecha_vencimiento: null,
      proveedor_id: proveedorId,
      anulado: 0,
      anulado_at: null,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DETALLE COMPROBANTE (ITEMS COMPROMISO)
app.get('/api/voucher-head-summary', async (req, res) => {
  try {
    const result = await db.sqlQuery(`
      SELECT
        c.id,
        c.tipo,
        c.numero,
        c.fecha_emision,
        p.nombre AS proveedor_nombre,
        COALESCE(SUM(ci.monto_unidad * ci.unidades), 0.00) AS monto_total,
        CASE WHEN EXISTS (
          SELECT 1 FROM compromiso cm WHERE cm.comprobante_id = c.id
        ) THEN 1 ELSE 0 END AS tiene_compromiso,
        CASE WHEN EXISTS (
          SELECT 1 FROM egreso e WHERE e.comprobante_compromiso_id = c.id
        ) THEN 1 ELSE 0 END AS esta_pagado,
        c.anulado
      FROM comprobante c
      LEFT JOIN proveedor p ON p.id = c.proveedor_id
      LEFT JOIN comprobante_item_compromiso ci ON ci.comprobante_id = c.id
      WHERE c.proveedor_id IS NOT NULL
      GROUP BY c.id, c.tipo, c.numero, c.fecha_emision, p.nombre, c.anulado
      ORDER BY c.fecha_emision DESC, c.id DESC
    `);

    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/voucher-item-commitment/:comprobanteId', async (req, res) => {
  try {
    const comprobanteId = parseInt(req.params.comprobanteId);
    if (Number.isNaN(comprobanteId)) {
      return res.status(400).json({ error: 'ID de comprobante inválido' });
    }

    const result = await db.sqlQuery(`
      SELECT
        ci.id,
        ci.comprobante_id,
        ci.producto_id,
        pr.nombre AS producto_nombre,
        ci.puc_id,
        puc.nombre AS puc_nombre,
        ci.monto_unidad,
        ci.unidades,
        (ci.monto_unidad * ci.unidades) AS subtotal
      FROM comprobante_item_compromiso ci
      LEFT JOIN producto pr ON pr.id = ci.producto_id
      LEFT JOIN puc ON puc.id = ci.puc_id
      WHERE ci.comprobante_id = ${comprobanteId}
      ORDER BY ci.id ASC
    `);

    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/voucher-item-commitment', async (req, res) => {
  try {
    const comprobanteId = parseInt(req.body.comprobanteId);
    const productId = parseInt(req.body.productId);
    const quantity = parseInt(req.body.quantity);
    const unitAmount = parseFloat(req.body.unitAmount);

    if (Number.isNaN(comprobanteId)) return res.status(400).json({ error: 'comprobanteId inválido' });
    if (Number.isNaN(productId)) return res.status(400).json({ error: 'productId inválido' });
    if (Number.isNaN(quantity) || quantity <= 0) return res.status(400).json({ error: 'Cantidad inválida' });
    if (Number.isNaN(unitAmount) || unitAmount <= 0) return res.status(400).json({ error: 'Monto unitario inválido' });

    await db.withTransaction(async (conn) => {
      const headRows: any[] = await db.queryTx(
        conn,
        'SELECT id, anulado FROM comprobante WHERE id = ? LIMIT 1',
        [comprobanteId]
      );
      if (!headRows.length) throw new Error('La cabecera no existe');
      if (headRows[0].anulado === 1) throw new Error('La cabecera está anulada');

      const paidRows: any[] = await db.queryTx(
        conn,
        'SELECT 1 FROM egreso WHERE comprobante_compromiso_id = ? LIMIT 1',
        [comprobanteId]
      );
      if (paidRows.length) throw new Error('No se puede editar un comprobante ya pagado');

      const dupRows: any[] = await db.queryTx(
        conn,
        'SELECT id FROM comprobante_item_compromiso WHERE comprobante_id = ? AND producto_id = ? LIMIT 1',
        [comprobanteId, productId]
      );
      if (dupRows.length) throw new Error('Ese producto ya está cargado en la cabecera');

      const productRows: any[] = await db.queryTx(
        conn,
        'SELECT id, puc_compra_id, activo FROM producto WHERE id = ? LIMIT 1',
        [productId]
      );
      if (!productRows.length) throw new Error('Producto inexistente');
      if (productRows[0].activo !== 1) throw new Error('El producto está inactivo');

      await db.rowCreateTx(conn, 'comprobante_item_compromiso', {
        comprobante_id: comprobanteId,
        producto_id: productId,
        puc_id: productRows[0].puc_compra_id,
        monto_unidad: unitAmount,
        unidades: quantity,
      });
    });

    res.status(201).json({ success: true });
  } catch (error: any) {
    if (error?.message) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/voucher-item-commitment/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const quantity = parseInt(req.body.quantity);
    const unitAmount = parseFloat(req.body.unitAmount);

    if (Number.isNaN(itemId)) return res.status(400).json({ error: 'ID inválido' });
    if (Number.isNaN(quantity) || quantity <= 0) return res.status(400).json({ error: 'Cantidad inválida' });
    if (Number.isNaN(unitAmount) || unitAmount <= 0) return res.status(400).json({ error: 'Monto unitario inválido' });

    await db.withTransaction(async (conn) => {
      const rows: any[] = await db.queryTx(
        conn,
        'SELECT comprobante_id FROM comprobante_item_compromiso WHERE id = ? LIMIT 1',
        [itemId]
      );
      if (!rows.length) throw new Error('Ítem inexistente');

      const comprobanteId = rows[0].comprobante_id;

      const paidRows: any[] = await db.queryTx(
        conn,
        'SELECT 1 FROM egreso WHERE comprobante_compromiso_id = ? LIMIT 1',
        [comprobanteId]
      );
      if (paidRows.length) throw new Error('No se puede editar un comprobante ya pagado');

      await db.queryTx(
        conn,
        'UPDATE comprobante_item_compromiso SET monto_unidad = ?, unidades = ? WHERE id = ?',
        [unitAmount, quantity, itemId]
      );
    });

    res.json({ success: true });
  } catch (error: any) {
    if (error?.message) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/voucher-item-commitment/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    if (Number.isNaN(itemId)) return res.status(400).json({ error: 'ID inválido' });

    await db.withTransaction(async (conn) => {
      const rows: any[] = await db.queryTx(
        conn,
        'SELECT comprobante_id FROM comprobante_item_compromiso WHERE id = ? LIMIT 1',
        [itemId]
      );
      if (!rows.length) throw new Error('Ítem inexistente');

      const comprobanteId = rows[0].comprobante_id;

      const paidRows: any[] = await db.queryTx(
        conn,
        'SELECT 1 FROM egreso WHERE comprobante_compromiso_id = ? LIMIT 1',
        [comprobanteId]
      );
      if (paidRows.length) throw new Error('No se puede eliminar ítems de un comprobante pagado');

      await db.queryTx(conn, 'DELETE FROM comprobante_item_compromiso WHERE id = ?', [itemId]);
    });

    res.json({ success: true });
  } catch (error: any) {
    if (error?.message) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/voucher-head/:id/cancel', async (req, res) => {
  try {
    const comprobanteId = parseInt(req.params.id);
    if (Number.isNaN(comprobanteId)) {
      return res.status(400).json({ error: 'ID de comprobante inválido' });
    }

    const paidRows: any[] = await db.sqlQuery(`
      SELECT 1
      FROM egreso
      WHERE comprobante_compromiso_id = ${comprobanteId}
      LIMIT 1
    `);

    if (paidRows.length) {
      return res.status(409).json({ error: 'No se puede anular: el comprobante ya fue pagado' });
    }

    await db.rowEdit('comprobante', comprobanteId, {
      anulado: 1,
      anulado_at: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PROVEEDORES
app.get('/api/provider', async (req, res) => {
  try {
        const result = await db.sqlQuery('SELECT * FROM proveedor ORDER BY nombre ASC');
    res.json(result);
  } catch (error) {
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/provider', async (req, res) => {
  try {
    const nombre = typeof req.body.nombre === 'string' ? req.body.nombre.trim() : '';
    const cuit = typeof req.body.cuit === 'string' ? req.body.cuit.trim() : '';

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del proveedor es obligatorio' });
    }

    if (!cuit) {
      return res.status(400).json({ error: 'El CUIT del proveedor es obligatorio' });
    }

    if (!/^\d{2}-\d{8}-\d{1}$/.test(cuit)) {
      return res.status(400).json({ error: 'El CUIT debe tener el formato XX-XXXXXXXX-X' });
    }

    const id = await db.rowCreate('proveedor', {
      'nombre': nombre,
      'cuit': cuit,
      'activo': 1,
    });

    res.status(201).json({ success: true, id });
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un proveedor con ese CUIT' });
    }
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/provider/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const providerId = parseInt(id);
    if (Number.isNaN(providerId)) {
      return res.status(400).json({ error: 'ID de proveedor inválido' });
    }

    const changes: Record<string, any> = {};

    if (req.body.nombre !== undefined) {
      const nombre = String(req.body.nombre).trim();
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre del proveedor es obligatorio' });
      }
      changes['nombre'] = nombre;
    }

    if (req.body.cuit !== undefined) {
      const cuit = String(req.body.cuit).trim();
      if (!/^\d{2}-\d{8}-\d{1}$/.test(cuit)) {
        return res.status(400).json({ error: 'El CUIT debe tener el formato XX-XXXXXXXX-X' });
      }
      changes['cuit'] = cuit;
    }

    if (req.body.activo !== undefined) {
      changes['activo'] = req.body.activo ? 1 : 0;
    }

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ error: 'No hay cambios para aplicar' });
    }

    await db.rowEdit('proveedor', providerId, changes);

    res.json({ success: true });
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un proveedor con ese CUIT' });
    }
    console.error('Internal server error: ', error);
    res.status(500).json({ error: 'Internal server error' });
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
