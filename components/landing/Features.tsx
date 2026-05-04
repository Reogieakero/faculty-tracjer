import styles from './Features.module.css';
import { 
  QrCode, 
  BellRing, 
  BarChart3, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

const features = [
  {
    icon: <QrCode size={24} />,
    title: 'QR-Based Scanning',
    desc: 'Speed up the process with unique student QR codes. Quick scans provide instant, contact-free attendance verification for large classes.',
  },
  {
    icon: <BellRing size={24} />,
    title: 'Posting Announcements',
    desc: 'Broadcast critical updates to entire programs or specific classes instantly. Keep every student informed with a centralized feed.',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Analytics Visualization',
    desc: 'Transform raw data into actionable insights. Visualize attendance trends and engagement through intuitive, clean dashboards.',
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'RBAC Role Management',
    desc: 'Secure access control with Role-Based Access. Ensure faculty and administrators only access what they are authorized to.',
  },
  {
    icon: <FileText size={24} />,
    title: 'Automated Reporting',
    desc: 'Generate comprehensive attendance summaries in one click. Export to PDF for easy submission to your department.',
  }
];

export default function Features() {
  return (
    <section className={styles.features} id="features">
      {/* Background Constellation */}
      <svg className={styles.constellationBg} viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <path className={styles.constelLine} d="M100,200 L300,150 L250,400 Z" fill="none" />
        <path className={styles.constelLine} d="M550,200 L800,100 L900,300 Z" fill="none"/>
        <path className={styles.constelLine} d="M250,400 L480,350 L600,600 L350,700 Z" fill="none"/>
        <path className={styles.constelLine} d="M750,400 L900,300 L950,600 L600,600 Z" fill="none" opacity="0.7"/>
        <path className={styles.constelLine} d="M100,200 L50,500 L250,400 Z" fill="none" opacity="0.6"/>
        <circle className={styles.constelNode} cx="100" cy="200" r="3" />
        <circle className={styles.constelNode} cx="550" cy="200" r="4" />
        <circle className={styles.constelNode} cx="250" cy="400" r="4" />
        <circle className={styles.constelNode} cx="750" cy="400" r="3" />
        <circle className={styles.constelNode} cx="350" cy="700" r="4" />
        <circle className={styles.constelNode} cx="950" cy="600" r="3" />
      </svg>

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.pill}>Core Capabilities</span>
          <h2 className={styles.title}>
            Powerful tools, <br />
            <span className={styles.accent}>simplified for you</span>
          </h2>
          <p className={styles.subtitle}>
            Essential features for modern academic management without the unnecessary complexity.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((f, i) => (
            <div className={styles.card} key={i}>
              <div className={styles.iconWrap}>{f.icon}</div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}