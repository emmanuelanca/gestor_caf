import * as db from './db';

export async function createDimensionDummies(): Promise<void> {
  const nItems = 20;

  db.calendarCreateYear(2026)

  for (let i: number = 1; i <= nItems; i++) {
    db.rowCreate('afectacion_ingresos', {
      'destino': `Afectación${i}`
    })
  }

  for (let i: number = 1; i <= nItems; i++) {
    db.rowCreate('cuentas_fondos', {
      'nombre': `Dummy${i}`,
      'tipo': `Tipo${i}`,
      'institucion': `Institucion${i}`,
      'moneda': `Moneda${i}`,
      'activa': Math.random() < 0.5,
      'titular': `Titular${i}`
    })
  }

  for (let i: number = 1; i <= nItems; i++) {
    db.rowCreate('dependencias', {
      'nombre': `Dependencia${i}`,
      'tipo': `Tipo${i}`,
      'descripcion': `Aquí se describe la dependencia ${i}`
    })
  }

  for (let i: number = 1; i <= nItems; i++) {
    db.rowCreate('entradas', {
      'categoria': `Categoría${i}`,
      'tipo': `Tipo${i}`,
      'condiciones': `Condiciones${i}`,
      'descripcion': `Aquí se describe la entrada ${i}`
    })
  }

  for (let i: number = 1; i <= nItems; i++) {
    db.rowCreate('eventos', {
      'fecha': i,
      'nombre': `Nombre${i}`,
      'tipo': `Tipo${i}`,
      'condicion': `Condición${i}`,
      'observacion': `Aquí se observa el evento ${i}`
    })
  }

  for (let i: number = 1; i <= nItems; i++) {
    db.rowCreate('honorarios', {
      'concepto': `Honorarios${i}`,
    })
  }

  for (let i: number = 1; i <= nItems; i++) {
    db.rowCreate('insumos', {
      'nombre': `Insumo${i}`,
      'tipo': `Tipo${i}`,
      'unidad_medida': `Unidad${i}`,
      'en_venta': Math.random() < 0.5,
      'observaciones': `Aquí se observa el insumo ${i}`
    })
  }

  for (let i: number = 1; i <= nItems; i++) {
    db.rowCreate('ligas', {
      'nombre': `Liga${i}`
    })
  }

  for (let i: number = 1; i <= nItems; i++) {
    db.rowCreate('personal_deportivo', {
      'concepto': `Personal${i}`
    })
  }

  for (let i: number = 1; i <= nItems; i++) {
    db.rowCreate('productos', {
      'nombre': `Producto${i}`,
      'categoria': `Categoría${i}`,
      'subcategoria': `Subcategoría${i}`
    })
  }

  for (let i: number = 1; i <= nItems; i++) {
    db.rowCreate('servicios', {
      'descripcion': `Aquí se describe el servicio ${i}`,
      'observaciones': `Aquí se observa el servicio ${i}`
    })
  }

  for (let i: number = 1; i <= nItems; i++) {
    db.rowCreate('socios_categorias', {
      'nombre': `CategoríaDeSocio${i}`,
      'descripcion': `Aquí se describe la categoría ${i} de socio`,
    })
  }
}

