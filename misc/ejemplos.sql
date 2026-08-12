-- ============================================================================
-- SCRIPT DE PRUEBA: CASOS PARA COMPARAR CAJA VS. DEVENGADO
-- ============================================================================

-- 1. Cuentas del PUC (Plan Único de Cuentas)
INSERT INTO puc (padre_id, subnivel, nombre, descripcion) VALUES (NULL, '1', 'Ingresos Operativos', 'Cuentas de Ingresos');
SET @puc_ingresos = LAST_INSERT_ID();

INSERT INTO puc (padre_id, subnivel, nombre, descripcion) VALUES (NULL, '2', 'Egresos Operativos', 'Cuentas de Gastos');
SET @puc_egresos = LAST_INSERT_ID();

-- Subcuentas
INSERT INTO puc (padre_id, subnivel, nombre, descripcion) VALUES (@puc_ingresos, '1', 'Cuotas Sociales', 'Ingresos por socios');
SET @puc_cuotas = LAST_INSERT_ID();

INSERT INTO puc (padre_id, subnivel, nombre, descripcion) VALUES (@puc_ingresos, '2', 'Alquiler de Instalaciones', 'Ingresos por eventos/canchas');
SET @puc_alquileres = LAST_INSERT_ID();

INSERT INTO puc (padre_id, subnivel, nombre, descripcion) VALUES (@puc_egresos, '1', 'Servicios Básicos', 'Luz, agua, gas');
SET @puc_servicios = LAST_INSERT_ID();

INSERT INTO puc (padre_id, subnivel, nombre, descripcion) VALUES (@puc_egresos, '2', 'Mantenimiento y Reparaciones', 'Reparación de instalaciones');
SET @puc_mantenimiento = LAST_INSERT_ID();


-- 2. Entidades Auxiliares (Cuentas, Proveedores, Socios)
INSERT INTO cuenta_fondos (nombre, tipo, institucion, moneda, activa, titular) 
VALUES ('Caja Central', 'Efectivo', 'Tesorería', 'ARS', 1, 'Club');
SET @cta_caja = LAST_INSERT_ID();

INSERT INTO cuenta_fondos (nombre, tipo, institucion, moneda, activa, titular) 
VALUES ('Banco Nación - Cta Cte', 'Banco', 'Banco Nación', 'ARS', 1, 'Club');
SET @cta_banco = LAST_INSERT_ID();

INSERT INTO proveedor (nombre, cuit) 
VALUES ('EDDENOR S.A.', '30-65432109-8');
SET @prov_edenor = LAST_INSERT_ID();

INSERT INTO proveedor (nombre, cuit) 
VALUES ('Pinturas y Servicios SRL', '30-99887766-5');
SET @prov_pinturas = LAST_INSERT_ID();

INSERT INTO socio_categoria (nombre, descripcion) VALUES ('Activo', 'Socio con acceso total');
SET @cat_socio = LAST_INSERT_ID();

INSERT INTO socio (dni, apellido, nombre, sexo, nacionalidad, categoria_id, fecha_alta) 
VALUES ('35123456', 'Pérez', 'Juan', 'M', 'Argentina', @cat_socio, '2024-01-01');
SET @socio_juan = LAST_INSERT_ID();


-- ----------------------------------------------------------------------------
-- ESCENARIO A: INGRESO DIRECTO (Cobro de Cuota en Efectivo)
-- Total Devengado = $10.000 | Total Caja = $10.000
-- ----------------------------------------------------------------------------
INSERT INTO comprobante (tipo, numero, fecha_emision) 
VALUES ('Recibo Ingreso', 'REC-0001-00000001', '2024-03-01');
SET @comp_ingreso = LAST_INSERT_ID();

INSERT INTO comprobante_item_ingreso (comprobante_id, puc_id, monto_unidad, unidades, socio_id) 
VALUES (@comp_ingreso, @puc_cuotas, 10000.00, 1, @socio_juan);

INSERT INTO ingreso (comprobante_id, cuenta_fondos_id) 
VALUES (@comp_ingreso, @cta_caja);


-- ----------------------------------------------------------------------------
-- ESCENARIO B: DEUDA SIN PAGAR (Factura de EDENOR de $45.000)
-- Impacta en Devengado (-$45.000), pero NO en Caja ($0 abonados aún)
-- ----------------------------------------------------------------------------
INSERT INTO comprobante (tipo, numero, fecha_emision, fecha_vencimiento, proveedor_id) 
VALUES ('Factura A', 'FC-0002-00088888', '2024-03-05', '2024-03-20', @prov_edenor);
SET @comp_factura_edenor = LAST_INSERT_ID();

INSERT INTO comprobante_item_compromiso (comprobante_id, puc_id, monto_unidad, unidades) 
VALUES (@comp_factura_edenor, @puc_servicios, 45000.00, 1);

INSERT INTO compromiso (comprobante_id, fecha_devengamiento) 
VALUES (@comp_factura_edenor, '2024-03-05');


-- ----------------------------------------------------------------------------
-- ESCENARIO C: PAGO PARCIAL (Mantenimiento de $30.000, pagado $15.000)
-- Impacta en Devengado por el total (-$30.000)
-- Impacta en Caja/Banco solo por la mitad pagada (-$15.000)
-- ----------------------------------------------------------------------------
-- 1. Se genera la factura del proveedor por $30.000
INSERT INTO comprobante (tipo, numero, fecha_emision, proveedor_id) 
VALUES ('Factura C', 'FC-0001-00000123', '2024-03-10', @prov_pinturas);
SET @comp_factura_mantenimiento = LAST_INSERT_ID();

INSERT INTO comprobante_item_compromiso (comprobante_id, puc_id, monto_unidad, unidades) 
VALUES (@comp_factura_mantenimiento, @puc_mantenimiento, 30000.00, 1);
SET @item_compromiso_mantenimiento = LAST_INSERT_ID();

INSERT INTO compromiso (comprobante_id, fecha_devengamiento) 
VALUES (@comp_factura_mantenimiento, '2024-03-10');

-- 2. Se realiza un pago parcial de $15.000 desde el Banco
INSERT INTO comprobante (tipo, numero, fecha_emision, proveedor_id) 
VALUES ('Orden de Pago', 'OP-0001-00000001', '2024-03-12', @prov_pinturas);
SET @comp_pago_parcial = LAST_INSERT_ID();

INSERT INTO comprobante_item_egreso (comprobante_id, comprobante_item_compromiso_id) 
VALUES (@comp_pago_parcial, @item_compromiso_mantenimiento);

INSERT INTO egreso (comprobante_id, comprobante_compromiso_id, cuenta_fondos_id) 
VALUES (@comp_pago_parcial, @comp_factura_mantenimiento, @cta_banco);


-- ============================================================================
-- CONSULTA DE VERIFICACIÓN COMPARATIVA
-- ============================================================================

SELECT 
    d.codigo AS codigo_puc,
    d.puc_cuenta AS cuenta,
    COALESCE(m.balance_consolidado, 0.00) AS balance_caja_efectivo,
    COALESCE(d.balance_consolidado, 0.00) AS balance_devengado_real,
    (COALESCE(d.balance_consolidado, 0.00) - COALESCE(m.balance_consolidado, 0.00)) AS pasivo_pendiente
FROM puc_balance_devengado_consolidado d
LEFT JOIN puc_balance_movimiento_consolidado m ON d.puc_id = m.puc_id
ORDER BY d.codigo;
