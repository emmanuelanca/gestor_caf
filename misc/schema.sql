SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS afectacion;
DROP TABLE IF EXISTS comprobante;
DROP TABLE IF EXISTS comprobante_item_compromiso;
DROP TABLE IF EXISTS comprobante_item_egreso;
DROP TABLE IF EXISTS comprobante_item_ingreso;
DROP TABLE IF EXISTS compromiso;
DROP TABLE IF EXISTS cuenta_fondos;
DROP TABLE IF EXISTS dependencia;
DROP TABLE IF EXISTS egreso;
DROP TABLE IF EXISTS entrada;
DROP TABLE IF EXISTS evento;
DROP TABLE IF EXISTS honorario;
DROP TABLE IF EXISTS ingreso;
DROP TABLE IF EXISTS insumo;
DROP TABLE IF EXISTS liga;
DROP TABLE IF EXISTS personal_deportivo;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS proveedor;
DROP TABLE IF EXISTS puc;
DROP TABLE IF EXISTS servicio;
DROP TABLE IF EXISTS servicio_legal;
DROP TABLE IF EXISTS socio;
DROP TABLE IF EXISTS socio_categoria;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE puc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    padre_id INT,
    subnivel VARCHAR(50) NOT NULL,
    codigo VARCHAR(255),
    depth INT UNSIGNED DEFAULT 1,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    activo TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_puc_padre FOREIGN KEY (padre_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE liga (
    id INT AUTO_INCREMENT PRIMARY KEY,
    concepto VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    periodicidad VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    puc_id INT NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_liga_puc FOREIGN KEY (puc_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE dependencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    puc_id INT NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_dependencia_puc FOREIGN KEY (puc_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE honorario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    concepto VARCHAR(255) NOT NULL,
    puc_id INT NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_honorario_puc FOREIGN KEY (puc_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE servicio_legal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    puc_id INT NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_servicio_legal_puc FOREIGN KEY (puc_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE servicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    observaciones VARCHAR(255),
    puc_id INT NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_servicio_puc FOREIGN KEY (puc_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE insumo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    unidad_medida VARCHAR(255) NOT NULL,
    observaciones VARCHAR(255),
    puc_id INT NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_insumo_puc FOREIGN KEY (puc_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(255),
    subcategoria VARCHAR(255),
    puc_venta_id INT NOT NULL,
    puc_compra_id INT NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_producto_puc_venta FOREIGN KEY (puc_venta_id) REFERENCES puc(id),
    CONSTRAINT fk_producto_puc_compra FOREIGN KEY (puc_compra_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE personal_deportivo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    concepto VARCHAR(255) NOT NULL,
    puc_id INT NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_personal_deportivo_puc FOREIGN KEY (puc_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE socio_categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    activo TINYINT NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE socio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    sexo VARCHAR(255) NOT NULL,
    nacionalidad VARCHAR(255) NOT NULL,
    categoria_id INT NOT NULL,
    fecha_alta DATE NOT NULL,
    carnet TINYINT NOT NULL DEFAULT 1,
    estado_civil VARCHAR(255),
    fecha_baja DATE,
    fecha_nacimiento DATE,
    telefono VARCHAR(255),
    email VARCHAR(255),
    distrito VARCHAR(255),
    localidad VARCHAR(255),
    calle VARCHAR(255),
    altura VARCHAR(255),
    dom_cobro VARCHAR(255),
    numero_sorteo VARCHAR(255),
    activo TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_socio_categoria FOREIGN KEY (categoria_id) REFERENCES socio_categoria(id)
) ENGINE=InnoDB;

CREATE TABLE afectacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destino VARCHAR(255) NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE cuenta_fondos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    institucion VARCHAR(255) NOT NULL,
    moneda VARCHAR(255) NOT NULL,
    activa TINYINT NOT NULL,
    titular VARCHAR(255) NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE entrada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    condiciones VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    puc_id INT NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_entrada_puc FOREIGN KEY (puc_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE evento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    condicion VARCHAR(255),
    observacion VARCHAR(255),
    puc_id INT NOT NULL,
    CONSTRAINT fk_evento_puc FOREIGN KEY (puc_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE proveedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cuit VARCHAR(255) NOT NULL UNIQUE,
    activo TINYINT NOT NULL DEFAULT 1
) ENGINE=InnoDB;

DELIMITER $$

CREATE TRIGGER tg_puc_insert_tree_props
BEFORE INSERT ON puc
FOR EACH ROW
BEGIN
    DECLARE parent_depth INT;
    DECLARE parent_code VARCHAR(255);

    IF NEW.padre_id IS NULL THEN
        SET NEW.depth = 1;
        SET NEW.codigo = NEW.subnivel;
    ELSE
        SELECT depth, codigo INTO parent_depth, parent_code 
        FROM puc 
        WHERE id = NEW.padre_id;
        
        SET NEW.depth = IFNULL(parent_depth, 0) + 1;
        SET NEW.codigo = CONCAT(IFNULL(parent_code, ''), '.', NEW.subnivel);
    END IF;
END$$

DELIMITER ;

CREATE TABLE comprobante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(255) NOT NULL,
    numero VARCHAR(255) NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    proveedor_id INT,
    CONSTRAINT fk_comprobante_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor(id)
) ENGINE=InnoDB;

CREATE TABLE comprobante_item_compromiso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comprobante_id INT NOT NULL,
    puc_id INT NOT NULL,
    monto_unidad DECIMAL(10,2) NOT NULL,
    unidades INT NOT NULL,
    dependencia_id INT,
    evento_id INT,
    honorario_id INT,
    insumo_id INT,
    liga_id INT,
    personal_deportivo_id INT,
    producto_id INT,
    servicio_id INT,
    servicio_legal_id INT,
    CONSTRAINT fk_comprobante_item_compromiso_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobante(id) ON DELETE CASCADE,
    CONSTRAINT fk_comprobante_item_compromiso_puc FOREIGN KEY (puc_id) REFERENCES puc(id),
    CONSTRAINT fk_comprobante_item_compromiso_dependencia FOREIGN KEY (dependencia_id) REFERENCES dependencia(id),
    CONSTRAINT fk_comprobante_item_compromiso_evento FOREIGN KEY (evento_id) REFERENCES evento(id),
    CONSTRAINT fk_comprobante_item_compromiso_honorario FOREIGN KEY (honorario_id) REFERENCES honorario(id),
    CONSTRAINT fk_comprobante_item_compromiso_insumo FOREIGN KEY (insumo_id) REFERENCES insumo(id),
    CONSTRAINT fk_comprobante_item_compromiso_liga FOREIGN KEY (liga_id) REFERENCES liga(id),
    CONSTRAINT fk_comprobante_item_compromiso_personal_deportivo FOREIGN KEY (personal_deportivo_id) REFERENCES personal_deportivo(id),
    CONSTRAINT fk_comprobante_item_compromiso_producto FOREIGN KEY (producto_id) REFERENCES producto(id),
    CONSTRAINT fk_comprobante_item_compromiso_servicio FOREIGN KEY (servicio_id) REFERENCES servicio(id),
    CONSTRAINT fk_comprobante_item_compromiso_servicio_legal FOREIGN KEY (servicio_legal_id) REFERENCES servicio_legal(id)
) ENGINE=InnoDB;

CREATE TABLE comprobante_item_ingreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comprobante_id INT NOT NULL,
    puc_id INT NOT NULL,
    monto_unidad DECIMAL(10,2) NOT NULL,
    unidades INT NOT NULL,
    afectacion_id INT,
    socio_id INT,
    evento_id INT,
    entrada_id INT,
    producto_id INT,
    CONSTRAINT fk_comprobante_item_ingreso_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobante(id) ON DELETE CASCADE,
    CONSTRAINT fk_comprobante_item_ingreso_puc FOREIGN KEY (puc_id) REFERENCES puc(id),
    CONSTRAINT fk_comprobante_item_ingreso_socio FOREIGN KEY (socio_id) REFERENCES socio(id),
    CONSTRAINT fk_comprobante_item_ingreso_afectacion FOREIGN KEY (afectacion_id) REFERENCES afectacion(id),
    CONSTRAINT fk_comprobante_item_ingreso_evento FOREIGN KEY (evento_id) REFERENCES evento(id),
    CONSTRAINT fk_comprobante_item_ingreso_entrada FOREIGN KEY (entrada_id) REFERENCES entrada(id),
    CONSTRAINT fk_comprobante_item_ingreso_producto FOREIGN KEY (producto_id) REFERENCES producto(id)
) ENGINE=InnoDB;

CREATE TABLE comprobante_item_egreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comprobante_id INT NOT NULL,
    comprobante_item_compromiso_id INT NOT NULL,
    CONSTRAINT fk_comprobante_item_egreso_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobante(id) ON DELETE CASCADE,
    CONSTRAINT fk_comprobante_item_egreso_comprobante_item_compromiso FOREIGN KEY (comprobante_item_compromiso_id) REFERENCES comprobante_item_compromiso(id)
) ENGINE=InnoDB;

CREATE TABLE ingreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comprobante_id INT NOT NULL,
    cuenta_fondos_id INT NOT NULL,
    CONSTRAINT fk_ingreso_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobante(id),
    CONSTRAINT fk_ingreso_cuenta_fondos FOREIGN KEY (cuenta_fondos_id) REFERENCES cuenta_fondos(id)
) ENGINE=InnoDB;

CREATE TABLE compromiso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comprobante_id INT NOT NULL,
    fecha_devengamiento DATE NOT NULL,
    CONSTRAINT fk_compromiso_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobante(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE egreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comprobante_id INT NOT NULL,
    comprobante_compromiso_id INT NOT NULL,
    cuenta_fondos_id INT NOT NULL,
    CONSTRAINT fk_egreso_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobante(id) ON DELETE CASCADE,
    CONSTRAINT fk_egreso_comprobante_compromiso FOREIGN KEY (comprobante_compromiso_id) REFERENCES comprobante(id) ON DELETE CASCADE,
    CONSTRAINT fk_egreso_cuenta_fondos FOREIGN KEY (cuenta_fondos_id) REFERENCES cuenta_fondos(id)
) ENGINE=InnoDB;

-- ============================================================================
-- VISTAS DETALLADAS
-- ============================================================================

CREATE OR REPLACE VIEW compromiso_resumen AS
SELECT
    c.id AS compromiso_id,
    c.fecha_devengamiento,
    comp.id AS comprobante_id,
    comp.tipo AS comprobante_tipo,
    comp.numero AS comprobante_numero,
    comp.fecha_vencimiento,
    p.nombre AS proveedor_nombre,
    p.cuit AS proveedor_cuit,
    COALESCE(items.monto_total, 0.00) AS monto
FROM compromiso c
INNER JOIN comprobante comp
    ON c.comprobante_id = comp.id
INNER JOIN proveedor p
    ON comp.proveedor_id = p.id
LEFT JOIN (
    SELECT
        comprobante_id,
        SUM(monto_unidad * unidades) AS monto_total
    FROM comprobante_item_compromiso
    GROUP BY comprobante_id
) items ON comp.id = items.comprobante_id;

CREATE OR REPLACE VIEW compromiso_detallado AS
SELECT
    item.comprobante_id AS comprobante_id,
    item.id AS item_id,
    item.puc_id AS puc_id,
    p.cuit AS comprobante_cuit,
    item.monto_unidad,
    item.unidades,
    (item.monto_unidad * item.unidades) AS subtotal,
    puc.nombre AS puc_cuenta,
    dep.nombre AS dependencia_nombre,
    ev.nombre AS evento_nombre,
    hon.concepto AS honorario_concepto,
    ins.nombre AS insumo_nombre,
    lg.concepto AS liga_nombre,
    per.concepto AS personal_deportivo_concepto,
    prod.nombre AS producto_nombre,
    srv.descripcion AS servicio_descripcion,
    srv_leg.descripcion AS servicio_legal_descripcion
FROM comprobante_item_compromiso item
INNER JOIN comprobante comp
    ON item.comprobante_id = comp.id
INNER JOIN proveedor p
    ON comp.proveedor_id = p.id
INNER JOIN puc 
    ON item.puc_id = puc.id
LEFT JOIN dependencia dep 
    ON item.dependencia_id = dep.id
LEFT JOIN evento ev 
    ON item.evento_id = ev.id
LEFT JOIN honorario hon 
    ON item.honorario_id = hon.id
LEFT JOIN insumo ins 
    ON item.insumo_id = ins.id
LEFT JOIN liga lg
    ON item.liga_id = lg.id
LEFT JOIN personal_deportivo per 
    ON item.personal_deportivo_id = per.id
LEFT JOIN producto prod 
    ON item.producto_id = prod.id
LEFT JOIN servicio srv 
    ON item.servicio_id = srv.id
LEFT JOIN servicio_legal srv_leg 
    ON item.servicio_legal_id = srv_leg.id
ORDER BY item.comprobante_id ASC, item.id ASC;

CREATE OR REPLACE VIEW ingreso_detallado AS
SELECT 
    item.comprobante_id AS comprobante_id,
    item.id AS item_id,
    item.puc_id AS puc_id,
    item.monto_unidad,
    item.unidades,
    (item.monto_unidad * item.unidades) AS subtotal,
    puc.nombre AS puc_cuenta,
    afec.destino AS afectacion_destino,
    CONCAT(s.apellido, ', ', s.nombre) AS socio_apellido_nombre,
    s.dni AS socio_dni,
    ev.nombre AS evento_nombre,
    ent.descripcion AS entrada_descripcion,
    prod.nombre AS producto_nombre
FROM comprobante_item_ingreso item
INNER JOIN puc 
    ON item.puc_id = puc.id
LEFT JOIN afectacion afec 
    ON item.afectacion_id = afec.id
LEFT JOIN socio s 
    ON item.socio_id = s.id
LEFT JOIN evento ev 
    ON item.evento_id = ev.id
LEFT JOIN entrada ent 
    ON item.entrada_id = ent.id
LEFT JOIN producto prod 
    ON item.producto_id = prod.id
ORDER BY item.comprobante_id ASC, item.id ASC;

CREATE OR REPLACE VIEW egreso_detallado AS
SELECT
    e.id AS egreso_id,
    comp_egr.id AS comprobante_egreso_id,
    comp_egr.tipo AS comprobante_egreso_tipo,
    comp_egr.numero AS comprobante_egreso_numero,
    comp_egr.fecha_emision AS fecha_pago,
    cf.nombre AS cuenta_fondos_nombre,
    item_egr.id AS item_egreso_id,
    item_com.puc_id AS puc_id,
    p.nombre AS proveedor_nombre,
    p.cuit AS proveedor_cuit,
    item_com.monto_unidad,
    item_com.unidades,
    (item_com.monto_unidad * item_com.unidades) AS subtotal,
    puc.nombre AS puc_cuenta,
    dep.nombre AS dependencia_nombre,
    ev.nombre AS evento_nombre,
    hon.concepto AS honorario_concepto,
    ins.nombre AS insumo_nombre,
    lg.concepto AS liga_nombre,
    per.concepto AS personal_deportivo_concepto,
    prod.nombre AS producto_nombre,
    srv.descripcion AS servicio_descripcion,
    srv_leg.descripcion AS servicio_legal_descripcion
FROM egreso e
INNER JOIN comprobante comp_egr
    ON e.comprobante_id = comp_egr.id
INNER JOIN cuenta_fondos cf
    ON e.cuenta_fondos_id = cf.id
LEFT JOIN comprobante_item_egreso item_egr
    ON comp_egr.id = item_egr.comprobante_id
LEFT JOIN comprobante_item_compromiso item_com
    ON item_egr.comprobante_item_compromiso_id = item_com.id
LEFT JOIN comprobante comp_com
    ON item_com.comprobante_id = comp_com.id
LEFT JOIN proveedor p
    ON comp_com.proveedor_id = p.id
LEFT JOIN puc 
    ON item_com.puc_id = puc.id
LEFT JOIN dependencia dep 
    ON item_com.dependencia_id = dep.id
LEFT JOIN evento ev 
    ON item_com.evento_id = ev.id
LEFT JOIN honorario hon 
    ON item_com.honorario_id = hon.id
LEFT JOIN insumo ins 
    ON item_com.insumo_id = ins.id
LEFT JOIN liga lg
    ON item_com.liga_id = lg.id
LEFT JOIN personal_deportivo per 
    ON item_com.personal_deportivo_id = per.id
LEFT JOIN producto prod 
    ON item_com.producto_id = prod.id
LEFT JOIN servicio srv 
    ON item_com.servicio_id = srv.id
LEFT JOIN servicio_legal srv_leg 
    ON item_com.servicio_legal_id = srv_leg.id
ORDER BY comp_egr.id ASC, item_egr.id ASC;

-- Vista para Movimientos Efectivos (Caja / Tesorería)
CREATE OR REPLACE VIEW movimiento_detallado AS
SELECT 
    'ingreso' AS tipo_movimiento,
    1 AS factor,
    id.comprobante_id,
    c_ing.numero AS comprobante_numero,
    id.item_id,
    id.puc_id,
    id.monto_unidad,
    id.unidades,
    id.subtotal,
    id.puc_cuenta,
    id.afectacion_destino,
    id.socio_apellido_nombre,
    id.socio_dni,
    id.evento_nombre,
    id.entrada_descripcion,
    id.producto_nombre,
    NULL AS dependencia_nombre,
    NULL AS honorario_concepto,
    NULL AS insumo_nombre,
    NULL AS liga_nombre,
    NULL AS personal_deportivo_concepto,
    NULL AS servicio_descripcion,
    NULL AS servicio_legal_descripcion,
    NULL AS proveedor_nombre,
    NULL AS proveedor_cuit,
    NULL AS cuenta_fondos_nombre,
    NULL AS fecha_pago
FROM ingreso_detallado id
INNER JOIN comprobante c_ing 
    ON id.comprobante_id = c_ing.id

UNION ALL

SELECT 
    'egreso' AS tipo_movimiento,
    -1 AS factor,
    comprobante_egreso_id AS comprobante_id,
    comprobante_egreso_numero AS comprobante_numero,
    item_egreso_id AS item_id,
    puc_id,
    monto_unidad,
    unidades,
    subtotal,
    puc_cuenta,
    NULL AS afectacion_destino,
    NULL AS socio_apellido_nombre,
    NULL AS socio_dni,
    evento_nombre,
    NULL AS entrada_descripcion,
    producto_nombre,
    dependencia_nombre,
    honorario_concepto,
    insumo_nombre,
    liga_nombre,
    personal_deportivo_concepto,
    servicio_descripcion,
    servicio_legal_descripcion,
    proveedor_nombre,
    proveedor_cuit,
    cuenta_fondos_nombre,
    fecha_pago
FROM egreso_detallado;

-- Vista para Devengado (Ingresos + Compromisos Asumidos)
CREATE OR REPLACE VIEW devengado_detallado AS
SELECT 
    'ingreso' AS tipo_movimiento,
    1 AS factor,
    id.comprobante_id,
    c_ing.numero AS comprobante_numero,
    id.item_id,
    id.puc_id,
    id.monto_unidad,
    id.unidades,
    id.subtotal,
    id.puc_cuenta,
    id.afectacion_destino,
    id.socio_apellido_nombre,
    id.socio_dni,
    id.evento_nombre,
    id.entrada_descripcion,
    id.producto_nombre,
    NULL AS dependencia_nombre,
    NULL AS honorario_concepto,
    NULL AS insumo_nombre,
    NULL AS liga_nombre,
    NULL AS personal_deportivo_concepto,
    NULL AS servicio_descripcion,
    NULL AS servicio_legal_descripcion,
    NULL AS proveedor_nombre,
    NULL AS proveedor_cuit
FROM ingreso_detallado id
INNER JOIN comprobante c_ing 
    ON id.comprobante_id = c_ing.id

UNION ALL

SELECT 
    'compromiso' AS tipo_movimiento,
    -1 AS factor,
    cd.comprobante_id,
    comp.numero AS comprobante_numero,
    cd.item_id,
    cd.puc_id,
    cd.monto_unidad,
    cd.unidades,
    cd.subtotal,
    cd.puc_cuenta,
    NULL AS afectacion_destino,
    NULL AS socio_apellido_nombre,
    NULL AS socio_dni,
    cd.evento_nombre,
    NULL AS entrada_descripcion,
    cd.producto_nombre,
    cd.dependencia_nombre,
    cd.honorario_concepto,
    cd.insumo_nombre,
    cd.liga_nombre,
    cd.personal_deportivo_concepto,
    cd.servicio_descripcion,
    cd.servicio_legal_descripcion,
    p.nombre AS proveedor_nombre,
    p.cuit AS proveedor_cuit
FROM compromiso_detallado cd
INNER JOIN comprobante comp 
    ON cd.comprobante_id = comp.id
LEFT JOIN proveedor p 
    ON comp.proveedor_id = p.id;

CREATE OR REPLACE VIEW ingreso_resumen AS
SELECT 
    i.id AS ingreso_id,
    i.comprobante_id AS comprobante_id,
    comp.fecha_emision AS fecha,
    cf.nombre AS cuenta_fondos_nombre,
    COALESCE(items.monto_total, 0.00) AS monto
FROM ingreso i
INNER JOIN comprobante comp
    ON i.comprobante_id = comp.id
INNER JOIN cuenta_fondos cf 
    ON i.cuenta_fondos_id = cf.id
LEFT JOIN (
    SELECT 
        comprobante_id, 
        SUM(monto_unidad * unidades) AS monto_total
    FROM comprobante_item_ingreso
    GROUP BY comprobante_id
) items ON i.comprobante_id = items.comprobante_id;

CREATE OR REPLACE VIEW egreso_resumen AS
SELECT
    e.id AS egreso_id,
    comp_egr.id AS comprobante_id,
    comp_egr.tipo AS comprobante_tipo,
    comp_egr.numero AS comprobante_numero,
    comp_egr.fecha_emision AS fecha_pago,
    cf.nombre AS cuenta_fondos_nombre,
    p.nombre AS proveedor_nombre,
    p.cuit AS proveedor_cuit,
    COALESCE(items.monto_total, 0.00) AS monto
FROM egreso e
INNER JOIN comprobante comp_egr
    ON e.comprobante_id = comp_egr.id
INNER JOIN cuenta_fondos cf 
    ON e.cuenta_fondos_id = cf.id
LEFT JOIN comprobante comp_com
    ON e.comprobante_compromiso_id = comp_com.id
LEFT JOIN proveedor p
    ON comp_com.proveedor_id = p.id
LEFT JOIN (
    SELECT 
        item_egr.comprobante_id, 
        SUM(item_com.monto_unidad * item_com.unidades) AS monto_total
    FROM comprobante_item_egreso item_egr
    INNER JOIN comprobante_item_compromiso item_com
        ON item_egr.comprobante_item_compromiso_id = item_com.id
    GROUP BY item_egr.comprobante_id
) items ON comp_egr.id = items.comprobante_id;

CREATE OR REPLACE VIEW compromiso_pendiente AS
SELECT *
FROM compromiso_resumen cr
WHERE NOT EXISTS (
    SELECT 1 
    FROM egreso e 
    WHERE e.comprobante_compromiso_id = cr.comprobante_id
);

-- ============================================================================
-- VISTAS DE BALANCE PUC: MOVIMIENTOS (Caja / Tesorería)
-- ============================================================================

CREATE OR REPLACE VIEW puc_balance_movimiento_directo AS
SELECT 
    p.id AS puc_id,
    p.padre_id,
    p.subnivel,
    p.codigo,
    p.depth,
    p.nombre AS puc_cuenta,
    p.descripcion AS puc_descripcion,
    COALESCE(SUM(m.factor * m.subtotal), 0.00) AS balance
FROM puc p
LEFT JOIN movimiento_detallado m 
    ON p.id = m.puc_id
GROUP BY 
    p.id, 
    p.padre_id, 
    p.subnivel, 
    p.codigo,
    p.depth,
    p.nombre, 
    p.descripcion;

CREATE OR REPLACE VIEW puc_balance_movimiento_consolidado AS
WITH RECURSIVE puc_directo AS (
    SELECT 
        p.id AS puc_id,
        p.padre_id,
        p.subnivel,
        p.codigo,
        p.depth,
        p.nombre,
        p.descripcion,
        COALESCE(SUM(m.factor * m.subtotal), 0.00) AS balance_directo
    FROM puc p
    LEFT JOIN movimiento_detallado m ON p.id = m.puc_id
    GROUP BY p.id, p.padre_id, p.subnivel, p.codigo, p.depth, p.nombre, p.descripcion
),
puc_jerarquia AS (
    SELECT 
        id AS ancestor_id,
        id AS puc_id
    FROM puc
    
    UNION ALL
    
    SELECT 
        p.padre_id AS ancestor_id,
        h.puc_id
    FROM puc_jerarquia h
    INNER JOIN puc p ON h.ancestor_id = p.id
    WHERE p.padre_id IS NOT NULL
)
SELECT 
    d.puc_id,
    d.padre_id,
    d.subnivel,
    d.codigo,
    d.depth,
    d.nombre AS puc_cuenta,
    d.descripcion AS puc_descripcion,
    d.balance_directo,
    COALESCE(SUM(orig.balance_directo), 0.00) AS balance_consolidado
FROM puc_directo d
LEFT JOIN puc_jerarquia j ON d.puc_id = j.ancestor_id
LEFT JOIN puc_directo orig ON j.puc_id = orig.puc_id
GROUP BY 
    d.puc_id,
    d.padre_id,
    d.subnivel,
    d.codigo,
    d.depth,
    d.nombre,
    d.descripcion,
    d.balance_directo;

-- ============================================================================
-- VISTAS DE BALANCE PUC: DEVENGADO (Pérdidas y Ganancias / Estado de Resultados)
-- ============================================================================

CREATE OR REPLACE VIEW puc_balance_devengado_directo AS
SELECT 
    p.id AS puc_id,
    p.padre_id,
    p.subnivel,
    p.codigo,
    p.depth,
    p.nombre AS puc_cuenta,
    p.descripcion AS puc_descripcion,
    COALESCE(SUM(d.factor * d.subtotal), 0.00) AS balance
FROM puc p
LEFT JOIN devengado_detallado d 
    ON p.id = d.puc_id
GROUP BY 
    p.id, 
    p.padre_id, 
    p.subnivel, 
    p.codigo,
    p.depth,
    p.nombre, 
    p.descripcion;

CREATE OR REPLACE VIEW puc_balance_devengado_consolidado AS
WITH RECURSIVE puc_directo AS (
    SELECT 
        p.id AS puc_id,
        p.padre_id,
        p.subnivel,
        p.codigo,
        p.depth,
        p.nombre,
        p.descripcion,
        COALESCE(SUM(d.factor * d.subtotal), 0.00) AS balance_directo
    FROM puc p
    LEFT JOIN devengado_detallado d ON p.id = d.puc_id
    GROUP BY p.id, p.padre_id, p.subnivel, p.codigo, p.depth, p.nombre, p.descripcion
),
puc_jerarquia AS (
    SELECT 
        id AS ancestor_id,
        id AS puc_id
    FROM puc
    
    UNION ALL
    
    SELECT 
        p.padre_id AS ancestor_id,
        h.puc_id
    FROM puc_jerarquia h
    INNER JOIN puc p ON h.ancestor_id = p.id
    WHERE p.padre_id IS NOT NULL
)
SELECT 
    d.puc_id,
    d.padre_id,
    d.subnivel,
    d.codigo,
    d.depth,
    d.nombre AS puc_cuenta,
    d.descripcion AS puc_descripcion,
    d.balance_directo,
    COALESCE(SUM(orig.balance_directo), 0.00) AS balance_consolidado
FROM puc_directo d
LEFT JOIN puc_jerarquia j ON d.puc_id = j.ancestor_id
LEFT JOIN puc_directo orig ON j.puc_id = orig.puc_id
GROUP BY 
    d.puc_id,
    d.padre_id,
    d.subnivel,
    d.codigo,
    d.depth,
    d.nombre,
    d.descripcion,
    d.balance_directo;
