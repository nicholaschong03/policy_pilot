import fs from "fs";
import path from "path";
import { KnowledgeBaseFileMeta } from "../types/kb";


const KB_STORAGE_DIR = path.resolve(process.cwd(), "data/kb");

function ensureStorageDir(): void {
    if (!fs.existsSync(KB_STORAGE_DIR)) {
        fs.mkdirSync(KB_STORAGE_DIR, { recursive: true });
    }
}

ensureStorageDir();

export function getKbStorageDir(): string {
    return KB_STORAGE_DIR;
}

function mapExtToType(filename: string): KnowledgeBaseFileMeta["type"] {
    const ext = path.extname(filename).replace(".", "").toLowerCase();
    switch (ext) {
        case "pdf":
            return "PDF";
        case "md":
        case "markdown":
            return "MD";
        case "xlsx":
        case "xls":
            return "XLSX";
        case "txt":
            return "TXT";
        default:
            return "OTHER";
    }
}

export async function listKnowledgeBaseFiles(): Promise<KnowledgeBaseFileMeta[]> {
    ensureStorageDir();
    const fileNames = await fs.promises.readdir(KB_STORAGE_DIR);
    const stats = await Promise.all(
        fileNames.map(async (name) => {
            const full = path.join(KB_STORAGE_DIR, name);
            const stat = await fs.promises.stat(full);
            return { name, stat };
        })
    );

    return stats
        .filter(({ stat }) => stat.isFile())
        .map(({ name, stat }) => ({
            id: name,
            title: name,
            type: mapExtToType(name),
            uploadDate: new Date(stat.mtimeMs).toISOString().split("T")[0],
            size: stat.size,
        }));
}

export async function deleteKnowledgeBaseFile(filename: string): Promise<void> {
    const filePath = path.join(KB_STORAGE_DIR, filename);
    await fs.promises.unlink(filePath);
}


