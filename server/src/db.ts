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

export async function sqlQuery(query: string) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(query);
    return rows;
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
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
    return rows[0]!.id;
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
  table: string,
  args: Record<string, any>
): Promise<number> {
  const columns = Object.keys(args).join(', ');
  const placeholders = Object.keys(args).map(() => '?').join(', ');
  const values = Object.values(args);
  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

  const rows = await pool.query(query, values);

  console.log(`Row created in ${table}`);

  return rows.insertId;
}

export async function rowEdit(
  table: string,
  id: number,
  args: Record<string, any>
): Promise<void> {
  const assignments = Object.keys(args).map((key) => `${key} = ?`).join(', ');
  const values = [...Object.values(args), id];

  const query = `UPDATE ${table} SET ${assignments} WHERE id = ?`;

  await pool.query(query, values);

  console.log(`Row edited in ${table}: id ${id}`);
}

export async function rowDelete(
  table: string,
  id: number
): Promise<void> {
  const query = `DELETE FROM ${table} WHERE id = ?`;

  await pool.query(query, [id]);

  console.log(`Row deleted in ${table}: id ${id}`);
}

export async function pucGetHierarchy(id: number): Promise<string> {
  let currentId: number | null = id;
  const hierarchy: string[] = [];

  while (currentId !== null) {
    const rows = await pool.query(
      'SELECT padre_id, subnivel FROM puc WHERE id = ?',
      [currentId]
    ) as Array<{
      padre_id: number | null;
      subnivel: string;
    }>;

    if (rows.length === 0) break;

    const row = rows[0]!;

    hierarchy.unshift(row.subnivel);
    currentId = row.padre_id;
  }

  return hierarchy.join('.');
}

export async function pucCreate(
  parent: number | null,
  sublevel: string,
  args: Record<string, any>
): Promise<number> {
  const result = await rowCreate('puc', {
    ...args,
    padre_id: parent,
    subnivel: sublevel
  });

  return result;
}
