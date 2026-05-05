'use client';

import { useState, useRef, useCallback } from 'react';
import { ImagePlus, X, Upload, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  value: string | null;           // current public URL
  onChange: (url: string | null) => void;
}

const BUCKET = 'event-images';

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [dragging,   setDragging]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const ext  = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }, [supabase, onChange]);

  const handleFile = (file: File | undefined) => { if (file) upload(file); };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const remove = () => onChange(null);

  // ── Preview state ──
  if (value) {
    return (
      <div className={styles.preview}>
        <img src={value} alt="Event banner" className={styles.previewImg} />
        <button type="button" className={styles.removeBtn} onClick={remove}>
          <X size={14} />
        </button>
        <span className={styles.previewLabel}>Event Banner</span>
      </div>
    );
  }

  // ── Upload zone ──
  return (
    <div
      className={`${styles.zone} ${dragging ? styles.zoneDragging : ''} ${uploading ? styles.zoneUploading : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !uploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className={styles.zoneInner}>
        {uploading ? (
          <>
            <Loader2 size={28} className={styles.spinner} />
            <p className={styles.zoneText}>Uploading...</p>
          </>
        ) : (
          <>
            <div className={styles.iconWrap}>
              {dragging ? <Upload size={24} /> : <ImagePlus size={24} />}
            </div>
            <p className={styles.zoneText}>
              {dragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
            </p>
            <p className={styles.zoneHint}>PNG, JPG, WEBP · Max 5 MB</p>
          </>
        )}
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}