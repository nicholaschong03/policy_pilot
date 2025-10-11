export interface KnowledgeBaseFileMeta {
    id: string;
    title: string;
    type: "PDF" | "MD" | "TXT" | "XLSX" | "OTHER";
    uploadDate: string;
    size: number;
}