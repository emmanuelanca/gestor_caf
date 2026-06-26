DROP VIEW IF EXISTS compromiso_pendiente;
DROP VIEW IF EXISTS ingreso_display;
DROP VIEW IF EXISTS movimiento_display;

DROP TABLE IF EXISTS movimiento;
DROP TABLE IF EXISTS compromiso;
DROP TABLE IF EXISTS ingreso;
DROP TABLE IF EXISTS socio;
DROP TABLE IF EXISTS comprobante;
DROP TABLE IF EXISTS comprobante_item;
DROP TABLE IF EXISTS proveedor;
DROP TABLE IF EXISTS liga;
DROP TABLE IF EXISTS dependencia;
DROP TABLE IF EXISTS honorario;
DROP TABLE IF EXISTS servicio_legal;
DROP TABLE IF EXISTS servicio;
DROP TABLE IF EXISTS insumo;
DROP TABLE IF EXISTS personal_deportivo;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS puc;
DROP TABLE IF EXISTS socio_categoria;
DROP TABLE IF EXISTS afectacion;
DROP TABLE IF EXISTS cuenta_fondos;
DROP TABLE IF EXISTS entrada;
DROP TABLE IF EXISTS evento;

CREATE TABLE liga (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE dependencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE honorario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    concepto VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE servicio_legal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE servicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    observaciones VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE insumo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    unidad_medida VARCHAR(255) NOT NULL,
    en_venta TINYINT NOT NULL,
    observaciones VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE personal_deportivo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    concepto VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(255),
    subcategoria VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE socio_categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE afectacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destino VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE cuenta_fondos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    institucion VARCHAR(255) NOT NULL,
    moneda VARCHAR(255) NOT NULL,
    activa TINYINT NOT NULL,
    titular VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE entrada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    condiciones VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE evento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    condicion VARCHAR(255),
    observacion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE proveedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cuit VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE puc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    padre_id INT,
    subnivel INT UNSIGNED NOT NULL,
    codigo VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    CONSTRAINT fk_puc_padre_id FOREIGN KEY (padre_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE comprobante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(255) NOT NULL,
    numero VARCHAR(255) NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    proveedor_id INT NOT NULL,
    CONSTRAINT fk_comprobante_proveedor_id FOREIGN KEY (proveedor_id) REFERENCES proveedor(id)
) ENGINE=InnoDB;

CREATE TABLE comprobante_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comprobante_id INT NOT NULL,
    monto_unidad DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    puc_id INT NOT NULL,
    producto_id INT,
    insumo_id INT,
    personal_deportivo_id INT,
    servicio_id INT,
    servicio_legal_id INT,
    CONSTRAINT fk_comprobante_item_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobante(id) ON DELETE CASCADE,
    CONSTRAINT fk_comprobante_item_puc_id FOREIGN KEY (puc_id) REFERENCES puc(id),
    CONSTRAINT fk_comprobante_item_producto_id FOREIGN KEY (producto_id) REFERENCES producto(id),
    CONSTRAINT fk_comprobante_item_insumo_id FOREIGN KEY (insumo_id) REFERENCES insumo(id),
    CONSTRAINT fk_comprobante_item_personal_deportivo_id FOREIGN KEY (personal_deportivo_id) REFERENCES personal_deportivo(id),
    CONSTRAINT fk_comprobante_item_servicio_id FOREIGN KEY (servicio_id) REFERENCES servicio(id),
    CONSTRAINT fk_comprobante_item_servicio_legal_id FOREIGN KEY (servicio_legal_id) REFERENCES servicio_legal(id)
) ENGINE=InnoDB;

CREATE TABLE socio (
    id INT PRIMARY KEY,
    dni VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    sexo VARCHAR(255) NOT NULL,
    nacionalidad VARCHAR(255) NOT NULL,
    categoria_id INT NOT NULL,
    fecha_alta DATE NOT NULL,
    carnet TINYINT NOT NULL,
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
    CONSTRAINT fk_socio_categoria_id FOREIGN KEY (categoria_id) REFERENCES socio_categoria(id)
) ENGINE=InnoDB;

CREATE TABLE ingreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    cuenta_fondos_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    socio_id INT,
    afectacion_id INT,
    evento_id INT,
    entrada_id INT,
    producto_id INT,
    CONSTRAINT fk_ingreso_cuenta_fondos_id FOREIGN KEY (cuenta_fondos_id) REFERENCES cuenta_fondos(id),
    CONSTRAINT fk_ingreso_socio_id FOREIGN KEY (socio_id) REFERENCES socio(id),
    CONSTRAINT fk_ingreso_afectacion_id FOREIGN KEY (afectacion_id) REFERENCES afectacion(id),
    CONSTRAINT fk_ingreso_evento_id FOREIGN KEY (evento_id) REFERENCES evento(id),
    CONSTRAINT fk_ingreso_entrada_id FOREIGN KEY (entrada_id) REFERENCES entrada(id),
    CONSTRAINT fk_ingreso_producto_id FOREIGN KEY (producto_id) REFERENCES producto(id)
) ENGINE=InnoDB;

CREATE TABLE compromiso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    puc_id INT NOT NULL,
    fecha_devengamiento DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    comprobante_id INT,
    personal_deportivo_id INT,
    evento_id INT,
    insumo_id INT,
    producto_id INT,
    servicio_id INT,
    servicio_legal_id INT,
    honorario_id INT,
    dependencia_id INT,
    liga_id INT,
    CONSTRAINT fk_compromiso_puc_id FOREIGN KEY (puc_id) REFERENCES puc(id),
    CONSTRAINT fk_compromiso_comprobante_id FOREIGN KEY (comprobante_id) REFERENCES comprobante(id),
    CONSTRAINT fk_compromiso_personal_deportivo_id FOREIGN KEY (personal_deportivo_id) REFERENCES personal_deportivo(id),
    CONSTRAINT fk_compromiso_evento_id FOREIGN KEY (evento_id) REFERENCES evento(id),
    CONSTRAINT fk_compromiso_insumo_id FOREIGN KEY (insumo_id) REFERENCES insumo(id),
    CONSTRAINT fk_compromiso_producto_id FOREIGN KEY (producto_id) REFERENCES producto(id),
    CONSTRAINT fk_compromiso_servicio_id FOREIGN KEY (servicio_id) REFERENCES servicio(id),
    CONSTRAINT fk_compromiso_servicio_legal_id FOREIGN KEY (servicio_legal_id) REFERENCES servicio_legal(id),
    CONSTRAINT fk_compromiso_honorario_id FOREIGN KEY (honorario_id) REFERENCES honorario(id),
    CONSTRAINT fk_compromiso_dependencia_id FOREIGN KEY (dependencia_id) REFERENCES dependencia(id),
    CONSTRAINT fk_compromiso_liga_id FOREIGN KEY (liga_id) REFERENCES liga(id)
) ENGINE=InnoDB;

CREATE TABLE movimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    cuenta_fondos_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    compromiso_id INT,
    ingreso_id INT,
    comprobante_id INT,
    CONSTRAINT fk_movimiento_cuenta_fondos_id FOREIGN KEY (cuenta_fondos_id) REFERENCES cuenta_fondos(id),
    CONSTRAINT fk_movimiento_compromiso_id FOREIGN KEY (compromiso_id) REFERENCES compromiso(id),
    CONSTRAINT fk_movimiento_ingreso_id FOREIGN KEY (ingreso_id) REFERENCES ingreso(id),
    CONSTRAINT fk_movimiento_comprobante_id FOREIGN KEY (comprobante_id) REFERENCES comprobante(id)
) ENGINE=InnoDB;

CREATE VIEW ingreso_display AS
SELECT
    i.id,
    i.fecha,
    cf.nombre AS cuenta_fondos,
    i.monto,
    s.apellido AS socio_apellido,
    s.nombre AS socio_nombre,
    ai.destino AS afectacion,
    ee.categoria AS entrada_categoria,
    e.nombre AS evento_nombre,
    p.nombre AS producto_nombre
FROM ingreso i
INNER JOIN cuenta_fondos cf ON i.cuenta_fondos_id = cf.id
LEFT JOIN socio s ON i.socio_id = s.id
LEFT JOIN afectacion ai ON i.afectacion_id = ai.id
LEFT JOIN entrada ee ON i.entrada_id = ee.id
LEFT JOIN evento e ON i.evento_id = e.id
LEFT JOIN producto p ON i.producto_id = p.id;

CREATE VIEW movimiento_display AS
SELECT
    mf.fecha,
    cf.nombre AS cuenta_fondos_nombre,
    mf.monto,
    mf.compromiso_id,
    mf.ingreso_id,
    comp_mov.numero AS comprobante_numero,
    comp_compromiso.numero AS comprobante_referencia_numero,
    CASE 
        WHEN mf.compromiso_id IS NOT NULL THEN -1
        WHEN mf.ingreso_id IS NOT NULL THEN 1
        ELSE 1 
    END AS factor
FROM movimiento mf
INNER JOIN cuenta_fondos cf ON mf.cuenta_fondos_id = cf.id
LEFT JOIN compromiso c ON mf.compromiso_id = c.id
LEFT JOIN comprobante comp_compromiso ON c.comprobante_id = comp_compromiso.id
LEFT JOIN comprobante comp_mov ON mf.comprobante_id = comp_mov.id;

CREATE VIEW compromiso_pendiente AS
SELECT
    c.id,
    c.fecha_devengamiento,
    c.fecha_vencimiento,
    p.codigo AS puc_codigo,
    p.nombre AS puc_nombre,
    c.monto,
    comp.numero AS comprobante_numero,
    CASE 
        WHEN c.personal_deportivo_id IS NOT NULL THEN 'Personal Deportivo'
        WHEN c.evento_id             IS NOT NULL THEN 'Evento'
        WHEN c.insumo_id             IS NOT NULL THEN 'Insumo'
        WHEN c.producto_id           IS NOT NULL THEN 'Producto'
        WHEN c.servicio_id           IS NOT NULL THEN 'Servicio'
        WHEN c.servicio_legal_id     IS NOT NULL THEN 'Servicio Legal'
        WHEN c.honorario_id          IS NOT NULL THEN 'Honorario'
        WHEN c.dependencia_id        IS NOT NULL THEN 'Dependencia'
        WHEN c.liga_id               IS NOT NULL THEN 'Liga'
        ELSE 'Otros'
    END AS origen_tipo
FROM compromiso c
INNER JOIN puc p ON c.puc_id = p.id
LEFT JOIN comprobante comp ON c.comprobante_id = comp.id
WHERE c.id NOT IN (
    SELECT mf.compromiso_id 
    FROM movimiento mf 
    WHERE mf.compromiso_id IS NOT NULL
);

CREATE VIEW compromiso_resumen AS
SELECT
  c.id AS comprobante_id,
  c.numero AS comprobante_numero,
  c.fecha_emision AS fecha_devengamiento,
  c.fecha_vencimiento as fecha_vencimiento,
  (
    SELECT SUM(ci.monto_unidad * ci.cantidad)
    FROM comprobante_item ci
    WHERE ci.comprobante_id = c.id
  ) AS monto_total
FROM comprobante c;

