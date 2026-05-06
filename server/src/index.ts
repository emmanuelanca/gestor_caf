import * as db from './db'; 
import { fileURLToPath } from 'url';

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
    console.log(await db.puc_get_hierarchy(3));
    console.log(await db.puc_get_id('1.1'));
}