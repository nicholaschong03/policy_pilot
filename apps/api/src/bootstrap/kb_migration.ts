import fs from 'fs';
import path from 'path';
import { getDbPool } from '../repos/db';

export async function runKbMigration(): Promise<void> {
    const pool = getDbPool();
    const kbPath = path.resolve(__dirname, '../../migrations/001_kb.sql');
    const kbSql = await fs.promises.readFile(kbPath, 'utf8');
    await pool.query(kbSql);

    const ticketsPath = path.resolve(__dirname, '../../migrations/002_tickets.sql');
    const ticketsSql = await fs.promises.readFile(ticketsPath, 'utf8');
    await pool.query(ticketsSql);

    const catPath = path.resolve(__dirname, '../../migrations/003_ticket_category.sql');
    const catSql = await fs.promises.readFile(catPath, 'utf8');
    await pool.query(catSql);

    const riskPath = path.resolve(__dirname, '../../migrations/004_tickets_riskflags.sql');
    const riskSql = await fs.promises.readFile(riskPath, 'utf8');
    await pool.query(riskSql);

    const dropMultiCatPath = path.resolve(__dirname, '../../migrations/006_drop_predicted_categories.sql');
    const dropMultiCatSql = await fs.promises.readFile(dropMultiCatPath, 'utf8');
    await pool.query(dropMultiCatSql);

    const appSettingsPath = path.resolve(__dirname, '../../migrations/007_app_settings.sql');
    const appSettingsSql = await fs.promises.readFile(appSettingsPath, 'utf8');
    await pool.query(appSettingsSql);

    // Optional: add first_response_text column (idempotent)
    const firstRespPath = path.resolve(__dirname, '../../migrations/008_first_response_text.sql');
    try {
        const firstRespSql = await fs.promises.readFile(firstRespPath, 'utf8');
        await pool.query(firstRespSql);
    } catch {
        // ignore if file missing
    }
}