'use client';

import { useState, useRef } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { User, Mail, Hash, BookOpen, Shield, Camera, QrCode as QrIcon, AlertCircle, X, Edit3, Check, RotateCcw, Download } from 'lucide-react';
import { useStudentSettings } from './hooks/useStudentSettings';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { student, loading, saveName, uploadAvatar, showSuccess, setStudent } = useStudentSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) return null;

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadAvatar(e.target.files[0]);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-pass');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${student?.student_id || 'student'}_pass.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleGenerateQR = async () => {
    setValidationError(null);

    if (!student?.student_id || !student?.full_name || !student?.program) {
      setValidationError("Please ensure your Student ID, Full Name, and Program are set before generating.");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        id: user.id,
        email: user.email,
        full_name: student.full_name,
        student_id: student.student_id,
        program: student.program,
        avatar_url: student.avatar_url,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('students').upsert(payload);
      if (error) throw error;

      setQrValue(JSON.stringify({
        sid: student.student_id,
        fn: student.full_name,
        pg: student.program,
        ts: new Date().toISOString()
      }));

      setShowQR(true);
    } catch (err: any) {
      setValidationError(err.message || "Sync failed. Check database connection.");
    }
  };

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className={styles.wrapper}>
        <header className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Account Settings</h1>
            <p className={styles.pageSubtitle}>Manage your university profile and digital identity.</p>
          </div>
          <button className={styles.generateBtn} onClick={handleGenerateQR}>
            <QrIcon size={18} />
            GENERATE PASS
          </button>
        </header>

        {validationError && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{validationError}</span>
          </div>
        )}

        <div className={styles.bentoGrid}>
          <div className={`${styles.card} ${styles.large}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}><User size={18} /></div>
              <span className={styles.label}>Identity</span>
              <div className={styles.cardActionsTopRight}>
                {!isEditing ? (
                  <button
                    onClick={() => { setTempName(student?.full_name || ''); setIsEditing(true); }}
                    className={styles.iconActionBtn}
                  >
                    <Edit3 size={16} />
                  </button>
                ) : (
                  <div className={styles.actionGroup}>
                    <button
                      onClick={async () => { await saveName(tempName); setIsEditing(false); }}
                      className={styles.saveIconBtn}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className={styles.cancelIconBtn}
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.profileContentVertical}>
              <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
                {student?.avatar_url ? (
                  <img src={student.avatar_url} alt="Profile" className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarPlaceholder}><User size={32} /></div>
                )}
                <div className={styles.avatarOverlay}><Camera size={16} color="white" /></div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
              </div>

              <div className={styles.identityTextCenter}>
                {isEditing ? (
                  <input
                    className={styles.editInputCenter}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <h2 className={styles.userName}>{student?.full_name || 'Loading...'}</h2>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div className={styles.statusBadge}>Active Student</div>
                  {showSuccess && <span className={styles.confirmationMsg}>Changes saved</span>}
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.medium}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}><BookOpen size={18} /></div>
              <span className={styles.label}>Academic Program</span>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <p className={styles.value}>{student?.program?.toUpperCase() || 'Not Assigned'}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Davao Oriental State University</p>
            </div>
          </div>

          <div className={`${styles.card} ${styles.small}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}><Hash size={18} /></div>
              <span className={styles.label}>Student ID</span>
            </div>
            <p className={styles.value}>{student?.student_id || '---'}</p>
          </div>

          <div className={`${styles.card} ${styles.small}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}><Mail size={18} /></div>
              <span className={styles.label}>Email Address</span>
            </div>
            <p className={styles.value} style={{ fontSize: '0.85rem' }}>{student?.email || '---'}</p>
          </div>

          <div className={`${styles.card} ${styles.small}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}><Shield size={18} /></div>
              <span className={styles.label}>Account Security</span>
            </div>
            <p className={styles.value} style={{ fontSize: '0.85rem' }}>Verified</p>
          </div>
        </div>

        {showQR && qrValue && (
          <div className={styles.modalOverlay} onClick={() => setShowQR(false)}>
            <div className={styles.qrCard} onClick={e => e.stopPropagation()}>
              <div className={styles.qrHeader}>
                <h3 className={styles.qrTitle}>Digital Pass</h3>
                <button onClick={() => setShowQR(false)} className={styles.closeIconBtn}><X size={20} /></button>
              </div>
              <div className={styles.qrPlaceholder}>
                <QRCodeSVG
                  id="qr-pass"
                  value={qrValue}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className={styles.qrProfileSection}>
                <img src={student?.avatar_url} className={styles.qrAvatarSmall} alt="" />
                <div>
                  <p className={styles.qrName}>{student?.full_name}</p>
                  <p className={styles.qrId}>{student?.student_id}</p>
                </div>
              </div>
              <button className={styles.downloadBtn} onClick={downloadQRCode}>
                <Download size={16} />
                DOWNLOAD PASS
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}