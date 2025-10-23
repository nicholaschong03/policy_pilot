import { Queue } from "bullmq";

export type IngestJob = {
    docId: string,
    title: string,
    type: string,
    path: string,
}

export const ingestQueue = new Queue<IngestJob>("kb-ingest", {
    connection: { url: process.env.REDIS_URL || "redis://localhost:6379" }
})