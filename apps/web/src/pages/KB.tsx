import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, File, FileText, FileSpreadsheet, Eye, Trash2, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

interface Document {
  id: string;
  title: string;
  type: "PDF" | "MD" | "TXT" | "XLSX";
  uploadDate: string;
  status: "Uploaded" | "Processing" | "Ingested";
  size: string;
}

const KnowledgeBase = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const navigate = useNavigate();

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Immediately add files to UI with "Processing" status
    const newDocs: Document[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${file.name}`,
      title: file.name,
      type: getFileType(file.name),
      uploadDate: new Date().toISOString().split('T')[0],
      status: "Processing",
      size: formatFileSize(file.size)
    }));
    setDocuments(prev => [...newDocs, ...prev]);

    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    try {
      await axios.post(`${API}/kb/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({ title: `Uploaded ${files.length} file(s)`, description: "Processing..." });
      // Refresh to get the actual server state
      await loadDocuments();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message || "Try again" });
      // Remove the optimistic updates on error
      setDocuments(prev => prev.filter(doc => !newDocs.some(newDoc => newDoc.id === doc.id)));
    }
  };

  const getFileType = (filename: string): "PDF" | "MD" | "TXT" | "XLSX" => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'PDF';
      case 'md': case 'markdown': return 'MD';
      case 'xlsx': case 'xls': return 'XLSX';
      default: return 'TXT';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const loadDocuments = async () => {
    try {
      const { data } = await axios.get<{ files: { id: string; title: string; type: Document["type"] | "OTHER"; uploadDate: string; size: number }[] }>(
        `${API}/kb/files`
      );
      const mapped: Document[] = data.files.map((f) => ({
        id: f.id,
        title: f.title,
        type: f.type === "OTHER" ? getFileType(f.title) : (f.type as Document["type"]),
        uploadDate: f.uploadDate,
        status: "Processing",
        size: formatFileSize(f.size),
      }));
      setDocuments(mapped);
    } catch (e: any) {
      toast({ title: "Failed to load documents", description: e?.message || "" });
    }
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <File className="w-4 h-4 text-red-400" />;
      case 'MD': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'XLSX': return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Ingested") {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Ingested
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
        <Clock className="w-3 h-3 mr-1" />
        Uploaded
      </Badge>
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API}/kb/files/${encodeURIComponent(id)}`);
      await loadDocuments();
      toast({ title: "Document deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "" });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 btn-glass"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Knowledge Base Manager
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage support documents for AI-powered assistance.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Upload Documents</h2>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${dragOver
            ? "border-primary bg-primary/5 glow-primary"
            : "border-border hover:border-primary/50"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Drag and drop files here
          </h3>
          <p className="text-muted-foreground mb-4">
            or click to browse files
          </p>

          <input
            type="file"
            multiple
            accept=".pdf,.md,.txt,.xlsx,.xls"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
            ref={fileInputRef}
          />
          <Button
            variant="outline"
            className="btn-glass cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>

          <p className="text-xs text-muted-foreground mt-3">
            Supported formats: PDF, Markdown, TXT, Excel
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Uploaded Documents</h2>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="glass-card p-4 flex items-center justify-between hover:bg-glass/60 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(doc.type)}
                <div>
                  <h3 className="font-medium text-foreground">{doc.title}</h3>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.uploadDate}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {getStatusBadge(doc.status)}

                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-primary/10 text-primary"
                    onClick={() => window.open(`${API}/kb/files/${encodeURIComponent(doc.id)}`, "_blank")}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;