-- 1. Plan Único de Cuentas (PUC)
INSERT INTO puc (id, padre_id, subnivel, nombre, descripcion) VALUES
(1, NULL, 1, 'Ingresos', 'Cuentas de ingresos generales'),
(2, NULL, 1, 'Egresos', 'Cuentas de egresos generales'),
(11, 1, 2, 'Cuotas Sociales', 'Ingresos por asociados'),
(12, 1, 2, 'Eventos y Entradas', 'Ingresos por venta de tickets'),
(21, 2, 2, 'Gastos de Personal', 'Honorarios y personal deportivo'),
(22, 2, 2, 'Mantenimiento y Servicios', 'Servicios básicos e insumos');

-- 2. Cuentas de Fondos (Tesorería)
INSERT INTO cuenta_fondos (id, nombre, tipo, institucion, moneda, activa, titular) VALUES
(1, 'Caja Chica Central', 'Efectivo', 'Club Deportivo', 'ARS', 1, 'Tesorero General'),
(2, 'Banco Galicia Corriente', 'Banco', 'Banco Galicia', 'ARS', 1, 'Club Deportivo Asociación');

-- 3. Categorías de Socios y Socios
INSERT INTO socio_categoria (id, nombre, descripcion) VALUES 
(1, 'Activo Pleno', 'Acceso total a las instalaciones');

INSERT INTO socio (id, dni, apellido, nombre, sexo, nacionalidad, categoria_id, fecha_alta, carnet) VALUES
(1, '40123456', 'Pérez', 'Juan', 'M', 'Argentina', 1, '2025-01-15', 1);

-- 4. Proveedores
INSERT INTO proveedor (id, nombre, cuit) VALUES
(1, 'Distribuidora Deportiva S.A.', '30-11111111-9'),
(2, 'Edesur S.A.', '30-22222222-9');

-- 5. Entidades Operativas (Eventos, Insumos, Servicios)
INSERT INTO evento (id, fecha, nombre, tipo) VALUES 
(1, '2026-07-10', 'Torneo de Invierno - Fecha 1', 'Deportivo');

INSERT INTO entrada (id, categoria, tipo, condiciones, descripcion) VALUES 
(1, 'General', 'Física', 'No reembolsable', 'Entrada general torneo');

INSERT INTO servicio (id, descripcion) VALUES 
(1, 'Suministro Eléctrico Mes Junio');

INSERT INTO personal_deportivo (id, concepto) VALUES 
(1, 'Arbitraje Profesional');


-- === INGRESO 1: Pago de Cuota Social ===
-- 1. Creamos el comprobante (Recibo de cobro)
INSERT INTO comprobante (id, tipo, numero, fecha_emision, proveedor_id) VALUES
(1, 'Recibo Cobro', 'R-0001-00000001', '2026-06-01', NULL);

-- 2. Desglosamos el ítem del ingreso (Imputado a Cuotas Sociales: PUC 11)
INSERT INTO comprobante_item_ingreso (comprobante_id, puc_id, monto_unidad, unidades, socio_id) VALUES
(1, 11, 5000.00, 1, 1);

-- 3. Registramos la entrada física de dinero a la Caja Chica
INSERT INTO ingreso (comprobante_id, cuenta_fondos_id) VALUES
(1, 1);


-- === INGRESO 2: Venta de Entradas para Evento ===
-- 1. Creamos el comprobante (Liquidación de boletería)
INSERT INTO comprobante (id, tipo, numero, fecha_emision, proveedor_id) VALUES
(2, 'Liquidación Ticket', 'T-0001-00000099', '2026-06-25', NULL);

-- 2. Desglosamos el ítem (100 entradas a $1500 c/u, Imputado a Eventos y Entradas: PUC 12)
INSERT INTO comprobante_item_ingreso (comprobante_id, puc_id, monto_unidad, unidades, evento_id, entrada_id) VALUES
(2, 12, 1500.00, 100, 1, 1);

-- 3. El dinero se deposita directamente en el Banco
INSERT INTO ingreso (comprobante_id, cuenta_fondos_id) VALUES
(2, 2);


-- === EGRESO 1: Pago de Factura de Luz ===
-- 1. Se recibe la Factura del Proveedor (Edesur)
INSERT INTO comprobante (id, tipo, numero, fecha_emision, fecha_vencimiento, proveedor_id) VALUES
(3, 'Factura A', 'F-0005-00432111', '2026-06-10', '2026-06-30', 2);

-- 2. Se detalla el gasto (Imputado a Mantenimiento y Servicios: PUC 22)
INSERT INTO comprobante_item_compromiso (id, comprobante_id, puc_id, monto_unidad, unidades, servicio_id) VALUES
(1, 3, 22, 45000.00, 1, 1);

-- 3. Se genera el Compromiso (Instancia contable del devengamiento)
INSERT INTO compromiso (comprobante_id, fecha_devengamiento) VALUES
(3, '2026-06-10');

-- 4. Se efectúa el Pago: Creamos la Orden de Pago (Comprobante de Egreso)
INSERT INTO comprobante (id, tipo, numero, fecha_emision, proveedor_id) VALUES
(4, 'Orden de Pago', 'OP-0001-00000512', '2026-06-27', 2);

-- 5. Vinculamos el comprobante de egreso con el ítem del compromiso que estamos cancelando
INSERT INTO comprobante_item_egreso (comprobante_id, comprobante_item_compromiso_id) VALUES
(4, 1);

-- 6. Registramos la salida real del dinero desde la cuenta del Banco Galicia
INSERT INTO egreso (comprobante_id, comprobante_compromiso_id, cuenta_fondos_id) VALUES
(4, 3, 2);


-- === EGRESO 2: Pago de Personal Deportivo (Árbitros) ===
-- 1. El sindicato de árbitros presenta la factura/recibo por el torneo
INSERT INTO comprobante (id, tipo, numero, fecha_emision, proveedor_id) VALUES
(5, 'Factura B', 'F-0001-00000222', '2026-06-26', 1);

-- 2. Detalle del gasto (Imputado a Gastos de Personal: PUC 21)
INSERT INTO comprobante_item_compromiso (id, comprobante_id, puc_id, monto_unidad, unidades, personal_deportivo_id, evento_id) VALUES
(2, 5, 21, 12000.00, 3, 1, 1); -- 3 árbitros a $12000 c/u

-- 3. Se genera el Compromiso
INSERT INTO compromiso (comprobante_id, fecha_devengamiento) VALUES
(5, '2026-06-26');

-- 4. Se paga en Efectivo: Creamos el Recibo de Salida de Caja Chica
INSERT INTO comprobante (id, tipo, numero, fecha_emision, proveedor_id) VALUES
(6, 'Recibo Egreso', 'RE-0001-00000123', '2026-06-27', 1);

-- 5. Vinculamos el ítem
INSERT INTO comprobante_item_egreso (comprobante_id, comprobante_item_compromiso_id) VALUES
(6, 2);

-- 6. Registramos la salida de la Caja Chica (cuenta_fondos_id = 1)
INSERT INTO egreso (comprobante_id, comprobante_compromiso_id, cuenta_fondos_id) VALUES
(6, 5, 1);
