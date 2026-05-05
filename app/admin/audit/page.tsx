'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  FileText, Search, Download, 
  Eye, FileUp, MoreVertical, 
  Calendar, X, UploadCloud
} from 'lucide-react';
import AdminTabBar from '../components/AdminTabBar';
import styles from './audit.module.css';

export default function AuditPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchAuditFiles = async () => {
    const { data, error } = await supabase
      .from('audit_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setFiles(data || []);
  };

  useEffect(() => {
    fetchAuditFiles();
  }, [supabase]);

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(filePath);

    if (error) {
      console.error('Download error:', error);
      return;
    }

    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePreview = async (filePath: string) => {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    setCurrentPdfUrl(data.publicUrl);
    setIsPreviewOpen(true);
  };

  const handlePostAudit = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const filePath = `audit_reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('audit_documents')
        .insert({
          title: selectedFile.name,
          description: description,
          file_path: filePath,
          file_size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
          uploaded_by: 'Authorized Admin'
        });

      if (!dbError) {
        await fetchAuditFiles();
        closeModal();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setDescription('');
  };

  const filteredFiles = files.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>System Audit Trail</h1>
          <p className={styles.subtitle}>Institutional records and transparency logs</p>
        </div>
        
        <div className={styles.topActions}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Filter documents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className={styles.mainContentGrid}>
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Document Management</h3>
            <button className={styles.filterBtn} onClick={() => setIsModalOpen(true)}>
              <FileUp size={16} />
              <span>Post Audit PDF</span>
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Date Published</th>
                  <th>Size</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.iconBox}><FileText size={18} /></div>
                        <div>
                          <p className={styles.docTitleText}>{file.title}</p>
                          {file.description && <p className={styles.docDescText}>{file.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.docMeta}>
                        <Calendar size={14} />
                        {new Date(file.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td><span className={styles.sizeText}>{file.file_size}</span></td>
                    <td>
                      <div className={styles.rowActions}>
                        <div className={styles.actionBtn} onClick={() => handlePreview(file.file_path)}>
                          <Eye size={18} />
                        </div>
                        <div className={styles.actionBtn} onClick={() => handleDownload(file.file_path, file.title)}>
                          <Download size={18} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Upload Audit Report</h2>
              <button onClick={closeModal} className={styles.closeBtn}><X size={20} /></button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Audit Description</label>
                <textarea 
                  className={styles.textarea} 
                  placeholder="Enter a brief summary of this audit file..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className={styles.uploadArea}>
                <input 
                  type="file" 
                  id="pdf-upload" 
                  accept=".pdf" 
                  hidden 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="pdf-upload" className={styles.fileLabel}>
                  <UploadCloud size={32} />
                  {selectedFile ? (
                    <span className={styles.selectedFileName}>{selectedFile.name}</span>
                  ) : (
                    <span>Click to select PDF or drag and drop</span>
                  )}
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button 
                className={styles.submitBtn} 
                onClick={handlePostAudit}
                disabled={uploading || !selectedFile}
              >
                {uploading ? 'Processing...' : 'Upload and Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {isPreviewOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsPreviewOpen(false)}>
          <div className={styles.previewContainer} onClick={(e) => e.stopPropagation()}>
             <div className={styles.previewHeader}>
                <span className={styles.modalTitle}>Document Preview</span>
                <button onClick={() => setIsPreviewOpen(false)} className={styles.closeBtn}><X size={20} /></button>
             </div>
             <iframe 
                src={currentPdfUrl || ''} 
                className={styles.pdfFrame}
                title="PDF Preview"
             />
          </div>
        </div>
      )}

      <AdminTabBar />
    </div>
  );
}