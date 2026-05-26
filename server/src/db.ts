import * as dotenv from 'dotenv';
import * as mariadb from 'mariadb';

const RESTRICTED_TABLES: string[] = ['ingresos', 'compromisos'];

dotenv.config();

interface CalendarEntry {
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

    dimensionCreate('fechas', {
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

export async function dimensionCreate(
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

export async function dimensionEdit(
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

export async function dimensionDelete(
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
  await dimensionCreate("puc", {
    ...args,
    padre: padre,
    subnivel: subnivel,
    codigo: codigo
  })
}
