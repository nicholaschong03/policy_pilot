import fs from 'fs';
import path from 'path';
import { getDbPool} from '../repos/db';

export async function runKbMigration(): Promise<void> {
    const pool = getDbPool();
    const filepath = path.resolve(__dirname, '../../migrations/001_kb.sql');
    const sql = await fs.promises.readFile(filepath, 'utf8');
    await pool.query(sql);
}