import * as dotenv  from 'dotenv';
import * as mariadb from 'mariadb';

dotenv.config();

const pool = mariadb.createPool({
    host:            process.env.DB_HOST     ?? 'localhost',
    user:            process.env.DB_USER     ?? 'root',
    password:        process.env.DB_PASSWORD ?? '',
    database:        process.env.DB_NAME     ?? 'my_db',
    connectionLimit: 5
});

export async function puc_get_hierarchy(id: number): Promise<string> {
    let currentId: number | null = id;
    const hierarchy: number[] = [];

    while (currentId !== null) {
        const rows: string = await pool.query(
            'SELECT id_padre, subnivel FROM puc WHERE id = ?',
            [currentId]
        );

        if (rows.length === 0) break;

        const { id_padre, subnivel } = rows[0];
        hierarchy.unshift(subnivel);
        currentId = id_padre;
    }

    return hierarchy.join('.');
}

export async function puc_get_id(hierarchy: string): Promise<number | null> {
    const levels = hierarchy.split('.');
    let currentParentId: number | null = null;
    let finalId: number | null = null;

    for (const subnivel of levels) {
        const rows = await pool.query(
            'SELECT id FROM puc WHERE subnivel = ? AND (id_padre = ? OR (id_padre IS NULL AND ? IS NULL))',
            [parseInt(subnivel), currentParentId, currentParentId]
        ) as { id: number }[];

        if (rows.length === 0) return null;

        finalId = rows[0].id;
        currentParentId = finalId;
    }

    return finalId;
}