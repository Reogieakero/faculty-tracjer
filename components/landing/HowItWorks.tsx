import styles from './HowItWorks.module.css';
import { UserCircle, QrCode, Bell, LayoutDashboard } from 'lucide-react';

const studentSteps = [
  {
    icon: <UserCircle size={24} />,
    title: 'Register Profile',
    desc: 'Create your account using your student ID and institutional email to join your specific academic program.',
  },
  {
    icon: <QrCode size={24} />,
    title: 'Generate QR Code',
    desc: 'Instantly generate your unique digital ID. Save it to your gallery or access it anytime within the app.',
  },
  {
    icon: <Bell size={24} />,
    title: 'Stay Notified',
    desc: 'Receive real-time announcements from your instructors and program chairs directly on your student feed.',
  },
  {
    icon: <LayoutDashboard size={24} />,
    title: 'Track Progress',
    desc: 'Monitor your own attendance percentage and view academic logs to ensure you stay on track for the semester.',
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.pill}>Student Guide</span>
          <h2 className={styles.title}>
            Join your program in<br />
            <span className={styles.accent}>just a few steps</span>
          </h2>
          <p className={styles.subtitle}>
            Simplified onboarding for Liberal Arts students. No more manual sign-in sheets.
          </p>
        </div>

        <div className={styles.steps}>
          {studentSteps.map((s, i) => (
            <div className={styles.step} key={i}>
              <div className={styles.connector}>
                <div className={styles.iconCircle}>{s.icon}</div>
                {i < studentSteps.length - 1 && <div className={styles.line} />}
              </div>
              <div className={styles.content}>
                <span className={styles.stepNum}>STEP 0{i + 1}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}