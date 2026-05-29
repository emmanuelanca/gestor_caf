DROP VIEW IF EXISTS vista_eventos;
DROP TABLE IF EXISTS movimientos_fondos;
DROP TABLE IF EXISTS compromisos;
DROP TABLE IF EXISTS ingresos;
DROP TABLE IF EXISTS eventos;
DROP TABLE IF EXISTS entradas;
DROP TABLE IF EXISTS cuentas_fondos;
DROP TABLE IF EXISTS fechas;
DROP TABLE IF EXISTS socios;
DROP TABLE IF EXISTS afectacion_ingresos;
DROP TABLE IF EXISTS socios_categorias;
DROP TABLE IF EXISTS puc;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS comprobantes;
DROP TABLE IF EXISTS personal_deportivo;
DROP TABLE IF EXISTS insumos;
DROP TABLE IF EXISTS servicios;
DROP TABLE IF EXISTS servicios_legales;
DROP TABLE IF EXISTS honorarios;
DROP TABLE IF EXISTS dependencias;
DROP TABLE IF EXISTS ligas;

CREATE TABLE ligas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE dependencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE honorarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    concepto VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE servicios_legales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    observaciones VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE insumos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(50) NOT NULL,
    en_venta TINYINT NOT NULL,
    observaciones VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE personal_deportivo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    concepto VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE comprobantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero BIGINT NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    fecha_emision DATE NOT NULL,
    referencia INT,
    CONSTRAINT fk_comprobantes_referencia FOREIGN KEY (referencia) REFERENCES comprobantes(id)
) ENGINE=InnoDB;

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(100),
    subcategoria VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE puc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    padre INT,
    subnivel INT UNSIGNED NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    CONSTRAINT fk_puc_padre FOREIGN KEY (padre) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE socios_categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE afectacion_ingresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destino VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE fechas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    anio INT UNSIGNED NOT NULL,
    mes TINYINT NOT NULL,
    mes_nombre VARCHAR(20) NOT NULL,
    dia TINYINT NOT NULL,
    dia_semana TINYINT NOT NULL,
    dia_nombre VARCHAR(20) NOT NULL,
    trimestre TINYINT NOT NULL,
    anio_mes VARCHAR(7) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE cuentas_fondos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    institucion VARCHAR(100) NOT NULL,
    moneda VARCHAR(50) NOT NULL,
    activa TINYINT NOT NULL,
    titular VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE entradas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    condiciones VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE socios (
    id INT PRIMARY KEY,
    dni VARCHAR(20) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    sexo VARCHAR(20) NOT NULL,
    nacionalidad VARCHAR(100) NOT NULL,
    categoria INT NOT NULL,
    fecha_alta DATE NOT NULL,
    carnet TINYINT NOT NULL,
    estado_civil VARCHAR(20),
    fecha_baja DATE,
    fecha_nacimiento DATE,
    telefono VARCHAR(50),
    email VARCHAR(100),
    distrito VARCHAR(100),
    localidad VARCHAR(100),
    calle VARCHAR(100),
    altura VARCHAR(20),
    dom_cobro VARCHAR(255),
    numero_sorteo VARCHAR(50),
    CONSTRAINT fk_socios_categorias FOREIGN KEY (categoria) REFERENCES socios_categorias(id)
) ENGINE=InnoDB;

CREATE TABLE eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    condicion VARCHAR(255),
    observacion VARCHAR(255),
    CONSTRAINT fk_eventos_fechas FOREIGN KEY (fecha) REFERENCES fechas(id)
) ENGINE=InnoDB;

CREATE TABLE ingresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha INT NOT NULL,
    cuenta_fondos INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    socio INT,
    afectacion_ingreso INT,
    evento INT,
    entrada INT,
    producto INT,
    CONSTRAINT fk_ingresos_fechas FOREIGN KEY (fecha) REFERENCES fechas(id),
    CONSTRAINT fk_ingresos_cuentas_fondos FOREIGN KEY (cuenta_fondos) REFERENCES cuentas_fondos(id),
    CONSTRAINT fk_ingresos_socios FOREIGN KEY (socio) REFERENCES socios(id),
    CONSTRAINT fk_ingresos_afectacion FOREIGN KEY (afectacion_ingreso) REFERENCES afectacion_ingresos(id),
    CONSTRAINT fk_ingresos_eventos FOREIGN KEY (evento) REFERENCES eventos(id),
    CONSTRAINT fk_ingresos_entradas FOREIGN KEY (entrada) REFERENCES entradas(id),
    CONSTRAINT fk_ingresos_productos FOREIGN KEY (producto) REFERENCES productos(id)
) ENGINE=InnoDB;

CREATE TABLE compromisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    puc INT NOT NULL,
    fecha_devengamiento INT NOT NULL,
    fecha_vencimiento INT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    comprobante INT,
    personal_deportivo INT,
    evento INT,
    insumo INT,
    producto INT,
    servicio INT,
    servicio_legal INT,
    honorarios INT,
    dependencia INT,
    liga INT,
    CONSTRAINT fk_compromisos_puc FOREIGN KEY (puc) REFERENCES puc(id),
    CONSTRAINT fk_compromisos_f_devengamiento FOREIGN KEY (fecha_devengamiento) REFERENCES fechas(id),
    CONSTRAINT fk_compromisos_f_vencimiento FOREIGN KEY (fecha_vencimiento) REFERENCES fechas(id),
    CONSTRAINT fk_compromisos_comprobante FOREIGN KEY (comprobante) REFERENCES comprobantes(id),
    CONSTRAINT fk_compromisos_p_deportivo FOREIGN KEY (personal_deportivo) REFERENCES personal_deportivo(id),
    CONSTRAINT fk_compromisos_evento FOREIGN KEY (evento) REFERENCES eventos(id),
    CONSTRAINT fk_compromisos_insumo FOREIGN KEY (insumo) REFERENCES insumos(id),
    CONSTRAINT fk_compromisos_producto FOREIGN KEY (producto) REFERENCES productos(id),
    CONSTRAINT fk_compromisos_servicio FOREIGN KEY (servicio) REFERENCES servicios(id),
    CONSTRAINT fk_compromisos_s_legal FOREIGN KEY (servicio_legal) REFERENCES servicios_legales(id),
    CONSTRAINT fk_compromisos_honorarios FOREIGN KEY (honorarios) REFERENCES honorarios(id),
    CONSTRAINT fk_compromisos_dependencia FOREIGN KEY (dependencia) REFERENCES dependencias(id),
    CONSTRAINT fk_compromisos_liga FOREIGN KEY (liga) REFERENCES ligas(id)
) ENGINE=InnoDB;

CREATE TABLE movimientos_fondos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha INT NOT NULL,
    cuenta_fondos INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    compromiso INT,
    ingreso INT,
    comprobante INT,
    CONSTRAINT fk_movimientos_fechas FOREIGN KEY (fecha) REFERENCES fechas(id),
    CONSTRAINT fk_movimientos_cuentas FOREIGN KEY (cuenta_fondos) REFERENCES cuentas_fondos(id),
    CONSTRAINT fk_movimientos_compromiso FOREIGN KEY (compromiso) REFERENCES compromisos(id),
    CONSTRAINT fk_movimientos_ingreso FOREIGN KEY (ingreso) REFERENCES ingresos(id),
    CONSTRAINT fk_movimientos_comprobante FOREIGN KEY (comprobante) REFERENCES comprobantes(id)
) ENGINE=InnoDB;

CREATE VIEW ingresos_detallados AS
SELECT
	i.id,
	f.fecha,
	cf.nombre AS cuenta_fondos,
	i.monto,
	s.apellido AS socio_apellido,
	s.nombre AS socio_nombre,
	ai.destino AS afectacion_ingreso,
	ee.categoria AS entrada_categoria,
	e.nombre AS evento_nombre,
	p.nombre AS producto_nombre
FROM ingresos i
INNER JOIN fechas f ON i.fecha = f.id
INNER JOIN cuentas_fondos cf ON i.cuenta_fondos = cf.id
INNER JOIN socios s ON i.socio = s.id
INNER JOIN afectacion_ingresos ai ON i.afectacion_ingreso = ai.id
INNER JOIN entradas ee ON i.entrada = ee.id
INNER JOIN eventos e ON i.evento = e.id
INNER JOIN productos p ON i.producto = p.id;
