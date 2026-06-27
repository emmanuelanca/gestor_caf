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
DROP TABLE IF EXISTS movimiento;
DROP TABLE IF EXISTS personal_deportivo;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS proveedor;
DROP TABLE IF EXISTS puc;
DROP TABLE IF EXISTS servicio;
DROP TABLE IF EXISTS servicio_legal;
DROP TABLE IF EXISTS socio;
DROP TABLE IF EXISTS socio_categoria;

SET FOREIGN_KEY_CHECKS = 1;

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

CREATE TABLE socio (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    CONSTRAINT fk_socio_categoria FOREIGN KEY (categoria_id) REFERENCES socio_categoria(id)
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
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    CONSTRAINT fk_puc_padre FOREIGN KEY (padre_id) REFERENCES puc(id)
) ENGINE=InnoDB;

CREATE TABLE comprobante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(255) NOT NULL,
    numero VARCHAR(255) NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    proveedor_id INT NOT NULL,
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
    CONSTRAINT fk_comprobante_item_ingreso_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobante (id) ON DELETE CASCADE,
    CONSTRAINT fk_comprobante_item_ingreso_puc FOREIGN KEY (puc_id) REFERENCES puc (id),
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
    CONSTRAINT fk_comprobante_item_egreso_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobante (id) ON DELETE CASCADE,
    CONSTRAINT fk_comprobante_item_egreso_comprobante_item_compromiso FOREIGN KEY (comprobante_item_compromiso_id) REFERENCES comprobante_item_compromiso (id)
) ENGINE=InnoDB;


CREATE TABLE ingreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comprobante_id INT NOT NULL,
    cuenta_fondos_id INT NOT NULL,
    CONSTRAINT fk_ingreso_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobante (id),
    CONSTRAINT fk_ingreso_cuenta_fondos FOREIGN KEY (cuenta_fondos_id) REFERENCES cuenta_fondos (id)
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
    cuenta_fondos_id INT NOT NULL,
    CONSTRAINT fk_egreso_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobante (id) ON DELETE CASCADE,
    CONSTRAINT fk_egreso_cuenta_fondos FOREIGN KEY (cuenta_fondos_id) REFERENCES cuenta_fondos (id)
) ENGINE=InnoDB;

CREATE TABLE movimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ingreso_id INT,
    egreso_id INT,
    CONSTRAINT fk_movimiento_egreso FOREIGN KEY (egreso_id) REFERENCES egreso (id),
    CONSTRAINT fk_movimiento_ingreso FOREIGN KEY (ingreso_id) REFERENCES ingreso(id)
) ENGINE=InnoDB;
