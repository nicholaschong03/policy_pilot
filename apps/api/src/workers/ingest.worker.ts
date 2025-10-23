import { Worker } from "bullmq";
import axios from 'axios';
import { insertChunks, updateDocStatus } from "../repos/kb.repo";
import type { IngestJob } from "../queues/ingest.queue";
import dotenv from 'dotenv';

dotenv.config();

const connection = {
    url: process.env.REDIS_URL || "redis://localhost:6379"
}
const base = process.env.INGEST_SERVICE_URL || "http://localhost:8000";

console.log("Ingest worker booting...");

export const worker = new Worker<IngestJob>("kb-ingest", async (job) => {
    const { docId, title, type, path } = job.data;
    console.log(`Starting ingest job ${job.id} for docId=${docId}`);
    await updateDocStatus(docId, "processing");
    try {
        const { data } = await axios.post(`${base}/ingest`, { doc_id: docId, title, type, path }, { timeout: 60_000 });
        await insertChunks(docId, data.chunks);
        await updateDocStatus(docId, "ingested");
        console.log(`Ingest job ${job.id} completed for docId=${docId}`);
    } catch (error) {
        await updateDocStatus(docId, "failed", error instanceof Error ? error.message : "Unknown error");
        console.error(`Ingest job ${job.id} failed for docId=${docId}`, error);
        throw error;
    }
}, { connection });

worker.on("ready", () => console.log("Worker ready (queue=kb-ingest)"));
worker.on("error", (err) => console.error("Worker error", err));
worker.on("completed", (job) => console.log(`Job completed ${job.id} docId=${(job as any)?.data?.docId ?? "unknown"}`));
worker.on("failed", (job, err) => console.error(`Job failed ${job?.id} docId=${(job as any)?.data?.docId ?? "unknown"}`, err));