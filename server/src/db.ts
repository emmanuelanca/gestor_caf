import * as dotenv from 'dotenv';
import * as mariadb from 'mariadb';

const RESTRICTED_TABLES: string[] = ['ingresos', 'compromisos'];

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'my_db',
  connectionLimit: 5
});

export async function dimension_create(
  dimension: string,
  args: Record<string, any>
): Promise<void> {
  if (RESTRICTED_TABLES.includes(dimension.toLowerCase())) {
    throw new Error(`La operación no está permitida para la tabla restringida: ${dimension}`);
  }

  const columns = Object.keys(args).join(', ');
  const placeholders = Object.keys(args).map(() => '?').join(', ');
  const values = Object.values(args);

  const query = `INSERT INTO ${dimension} (${columns}) VALUES (${placeholders})`;

  await pool.query(query, values);

  console.log(`Registro creado con éxito en la dimensión: ${dimension}`);
}

export async function dimension_edit(
  dimension: string,
  id: number,
  args: Record<string, any>
): Promise<void> {
  if (RESTRICTED_TABLES.includes(dimension.toLowerCase())) {
    throw new Error(`La operación no está permitida para la tabla restringida: ${dimension}`);
  }

  const assignments = Object.keys(args).map((key) => `${key} = ?`).join(', ');
  const values = [...Object.values(args), id];

  const query = `UPDATE ${dimension} SET ${assignments} WHERE id = ?`;

  await pool.query(query, values);

  console.log(`Registro ${id} actualizado con éxito en la dimensión: ${dimension}`);
}

export async function dimension_delete(
  dimension: string,
  id: number
): Promise<void> {
  if (RESTRICTED_TABLES.includes(dimension.toLowerCase())) {
    throw new Error(`La operación no está permitida para la tabla restringida: ${dimension}`);
  }

  const query = `DELETE FROM ${dimension} WHERE id = ?`;

  await pool.query(query, [id]);

  console.log(`Registro ${id} eliminado con éxito de la dimensión: ${dimension}`);
}

export async function puc_get_hierarchy(id: number): Promise<string> {
  let currentId: number | null = id;
  const hierarchy: number[] = [];

  while (currentId !== null) {
    const rows: string = await pool.query(
      'SELECT padre, subnivel FROM puc WHERE id = ?',
      [currentId]
    );

    if (rows.length === 0) break;

    const { padre, subnivel } = rows[0];
    hierarchy.unshift(subnivel);
    currentId = padre;
  }

  return hierarchy.join('.');
}

export async function puc_create(
  padre: number,
  subnivel: number,
  args: Record<string, any>
): Promise<void> {
  const codigo = `${await puc_get_hierarchy(padre)}.${subnivel}`
  await dimension_create("puc", {
    ...args,
    padre: padre,
    subnivel: subnivel,
    codigo: codigo
  })
}
