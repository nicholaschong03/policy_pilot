import { Worker } from "bullmq";
import axios from 'axios';
import { insertChunks, updateDocStatus } from "../repos/kb.repo";

const connection = {
    url: process.env.REDIS_URL || "redis://localhost:6379"
}
const base = process.env.INGEST_SERVICE_URL || "http://localhost:8000";

export const worker = new Worker("kb:ingest", async (job) => {
    const { docId, title, type, path } = job.data;
    await updateDocStatus(docId, "processing");
    try {
        const { data } = await axios.post(`${base}/ingest`, { doc_id: docId, title, type, path }, { timeout: 60_000 });
        await insertChunks(docId, data.chunks);
        await updateDocStatus(docId, "ingested");
    } catch (error) {
        await updateDocStatus(docId, "failed", error instanceof Error ? error.message : "Unknown error");
        throw error;
    }
}, { connection });