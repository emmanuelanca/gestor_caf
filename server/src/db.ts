import * as dotenv from 'dotenv';
import * as mariadb from 'mariadb';

dotenv.config();

interface CalendarRow {
  id: number;
  date: string;
  year: number;
  month: number;
  monthName: string;
  day: number;
  dayOfWeek: number;
  dayName: string;
  quarter: number;
  yearMonth: string;
}

const pool = mariadb.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'my_db',
  connectionLimit: 5
});

async function sqlQuery(query: string) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(query);
    return rows;
  } catch (error) {
    console.error("Error en getRows: ", error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

export async function getRows(table: string) {
  return await sqlQuery(`SELECT * FROM ${table}`)
}

export async function calendarDateToId(date: string | Date): Promise<number | null> {
  let formattedDate;

  if (date instanceof Date) {
    formattedDate = date.toISOString().split('T')[0];
  } else {
    formattedDate = date;
  }

  const rows = await sqlQuery(`SELECT id FROM fechas WHERE fecha = '${formattedDate}' LIMIT 1`) as CalendarRow[];

  if (rows && rows.length > 0) {
    return rows[0].id;
  }

  return null;
}

export function calendarCreateYear(targetYear: number): void {
  let currentDate = new Date(Date.UTC(targetYear, 0, 1));
  const endDate = new Date(Date.UTC(targetYear, 11, 31));

  const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', timeZone: 'UTC' });
  const dayFormatter = new Intl.DateTimeFormat('es-ES', { weekday: 'long', timeZone: 'UTC' });

  while (currentDate <= endDate) {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth() + 1;
    const day = currentDate.getUTCDate();

    const quarter = Math.ceil(month / 3);
    const monthString = month < 10 ? `0${month}` : `${month}`;
    const dayString = day < 10 ? `0${day}` : `${day}`;

    const dateString = `${year}-${monthString}-${dayString}`;
    const yearMonth = `${year}-${monthString}`;

    rowCreate('fechas', {
      'fecha': dateString,
      'anio': year,
      'mes': month,
      'mes_nombre': monthFormatter.format(currentDate),
      'dia': day,
      'dia_semana': currentDate.getUTCDay(),
      'dia_nombre': dayFormatter.format(currentDate),
      'trimestre': quarter,
      'anio_mes': yearMonth
    });

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
}

export async function rowCreate(
  dimension: string,
  args: Record<string, any>
): Promise<void> {
  const columns = Object.keys(args).join(', ');
  const placeholders = Object.keys(args).map(() => '?').join(', ');
  const values = Object.values(args);

  const query = `INSERT INTO ${dimension} (${columns}) VALUES (${placeholders})`;

  await pool.query(query, values);

  console.log(`Registro creado con éxito en la dimensión: ${dimension}`);
}

export async function rowEdit(
  dimension: string,
  id: number,
  args: Record<string, any>
): Promise<void> {
  const assignments = Object.keys(args).map((key) => `${key} = ?`).join(', ');
  const values = [...Object.values(args), id];

  const query = `UPDATE ${dimension} SET ${assignments} WHERE id = ?`;

  await pool.query(query, values);

  console.log(`Registro ${id} actualizado con éxito en la dimensión: ${dimension}`);
}

export async function rowDelete(
  dimension: string,
  id: number
): Promise<void> {
  const query = `DELETE FROM ${dimension} WHERE id = ?`;

  await pool.query(query, [id]);

  console.log(`Registro ${id} eliminado con éxito de la dimensión: ${dimension}`);
}

export async function pucGetHierarchy(id: number): Promise<string> {
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

export async function pucCreate(
  padre: number,
  subnivel: number,
  args: Record<string, any>
): Promise<void> {
  const codigo = `${await pucGetHierarchy(padre)}.${subnivel}`
  await rowCreate("puc", {
    ...args,
    padre: padre,
    subnivel: subnivel,
    codigo: codigo
  })
}
