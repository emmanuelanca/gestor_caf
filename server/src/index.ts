import * as db from './db';
import { fileURLToPath } from 'url';

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
}
