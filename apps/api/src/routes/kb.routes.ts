import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { deleteDocument, getDocument, listDocuments, uploadDocuments } from "../controllers/kb.controller";
import { getKbStorageDir } from "../services/kb.service";

const router = Router();

// Configure multer disk storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = getKbStorageDir();
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const base = path.basename(file.originalname);
        cb(null, `${timestamp}-${base}`);
    },
});

const upload = multer({ storage });

router.get("/files", listDocuments);
router.post("/upload", upload.array("files", 20), uploadDocuments);
router.delete("/files/:filename", deleteDocument);
router.get("/files/:filename", getDocument);

export default router;


