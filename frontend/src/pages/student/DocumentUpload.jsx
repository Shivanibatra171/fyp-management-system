import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  UploadCloud,
  File,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  FileText,
  Clock,
  Trash2,
} from 'lucide-react';

const DocumentUpload = () => {
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [milestoneKey, setMilestoneKey] = useState('proposal_doc');
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/documents');
      if (res.data?.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      toast.error('Failed to load uploaded documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file format (PDF or DOCX)
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      const validExts = ['.pdf', '.docx', '.doc'];
      const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

      if (!validTypes.includes(selectedFile.type) && !validExts.includes(fileExt)) {
        toast.error('Invalid file format. Only PDF and DOCX files are allowed.');
        e.target.value = null;
        setFile(null);
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds the maximum limit of 10MB.');
        e.target.value = null;
        setFile(null);
        return;
      }

      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.warning('Please select a PDF or DOCX file to upload.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      // Crucial: Must be 'file' matching uploadDocument.single('file')
      formData.append('file', file);
      formData.append('title', title.trim() || file.name);
      formData.append('milestoneKey', milestoneKey);

      const res = await api.post('/student/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        toast.success('Deliverable uploaded successfully!');
        setTitle('');
        setFile(null);
        // Reset file input element
        const fileInput = document.getElementById('file-upload-input');
        if (fileInput) fileInput.value = '';
        fetchDocuments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382115] flex items-center gap-3">
          <UploadCloud className="w-7 h-7 text-[#b5743d]" />
          Upload Deliverables
        </h1>
        <p className="text-[#7a6455] text-sm mt-1">
          Submit official project documents for supervisor evaluation and grading (PDF or DOCX format, up to 10MB).
        </p>
      </div>

      {/* Upload Card */}
      <form onSubmit={handleUploadSubmit} className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Document Title */}
          <div>
            <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
              Document Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Software Requirements Specification (SRS) v1.0"
              className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d] transition"
              required
            />
          </div>

          {/* Milestone Key Selection */}
          <div>
            <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
              Milestone Category *
            </label>
            <select
              value={milestoneKey}
              onChange={(e) => setMilestoneKey(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d] transition"
            >
              <option value="proposal_doc">Proposal Document / Slides</option>
              <option value="srs">Software Requirements Specification (SRS)</option>
              <option value="mid_evaluation">Mid-Term Evaluation Report</option>
              <option value="final_defense">Final Defense Slides & Codebase</option>
              <option value="final_thesis">Final Thesis Document</option>
            </select>
          </div>
        </div>

        {/* File Drag & Drop / Input */}
        <div>
          <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
            File Attachment (PDF or DOCX only) *
          </label>
          <div className="border-2 border-dashed border-[#ece1d5] rounded-2xl p-6 sm:p-8 text-center bg-[#faf6f0] hover:bg-[#f7efe6] transition cursor-pointer relative">
            <input
              id="file-upload-input"
              type="file"
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              required={!file}
            />
            <div className="space-y-2 pointer-events-none">
              <UploadCloud className="w-10 h-10 text-[#b5743d] mx-auto" />
              {file ? (
                <div>
                  <div className="font-bold text-sm text-[#382115]">{file.name}</div>
                  <div className="text-xs text-[#8c7a6b]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-sm text-[#382115]">
                    Click or drag file here to attach
                  </div>
                  <div className="text-xs text-[#8c7a6b] mt-0.5">
                    Supports .PDF and .DOCX files up to 10MB
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#382115] hover:bg-[#2b1810] text-[#f7efe6] font-bold text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading Deliverable...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-[#C98A53]" />
                <span>Submit Deliverable</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Uploaded Documents History */}
      <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-extrabold text-[#382115] text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#b5743d]" />
          <span>My Uploaded Deliverables</span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#b5743d]" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 bg-[#faf6f0] rounded-2xl border border-dashed border-[#ece1d5] text-xs text-[#8c7a6b]">
            No documents uploaded yet. Upload your first milestone deliverable above.
          </div>
        ) : (
          <div className="divide-y divide-[#ece1d5]">
            {documents.map((doc) => (
              <div key={doc._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#faf6f0] border border-[#ece1d5] text-[#8c4e24] shrink-0 mt-0.5">
                    <File className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#382115]">
                      {doc.title || doc.originalFileName}
                    </h4>
                    <div className="text-xs text-[#7a6455] flex flex-wrap gap-2 mt-0.5">
                      <span className="font-semibold uppercase tracking-wider text-[10px] bg-[#f7efe6] text-[#8c4e24] px-2 py-0.5 rounded-md">
                        {doc.milestoneKey.replace('_', ' ')}
                      </span>
                      <span>• {(doc.fileSize / 1024).toFixed(1)} KB</span>
                      <span>• {new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={`/api/student/documents/${doc._id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#faf6f0] hover:bg-[#f7efe6] border border-[#ece1d5] text-xs font-bold text-[#382115] transition"
                  >
                    <Download className="w-3.5 h-3.5 text-[#b5743d]" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default DocumentUpload;
