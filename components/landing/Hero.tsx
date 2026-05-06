import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <svg className={styles.constellationBg} viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <path className={styles.constelLine} d="M100,200 L300,150 L250,400 Z" fill="none" />
        <path className={styles.constelLine} d="M300,150 L550,200 L480,350 L250,400 Z" fill="none" opacity="0.5"/>
        <path className={styles.constelLine} d="M550,200 L800,100 L900,300 Z" fill="none"/>
        <path className={styles.constelLine} d="M800,100 L750,400 L480,350 L550,200 Z" fill="none" opacity="0.5" />
        <path className={styles.constelLine} d="M250,400 L480,350 L600,600 L350,700 Z" fill="none"/>
        <path className={styles.constelLine} d="M750,400 L900,300 L950,600 L600,600 Z" fill="none" opacity="0.7"/>
        <path className={styles.constelLine} d="M350,700 L600,600 L800,850 L500,950 Z" fill="none" opacity="0.4"/>
        <path className={styles.constelLine} d="M100,200 L50,500 L250,400 Z" fill="none" opacity="0.6"/>

        <circle className={styles.constelNode} cx="100" cy="200" r="3" filter="url(#glow)" />
        <circle className={styles.constelNode} cx="300" cy="150" r="3" />
        <circle className={styles.constelNode} cx="550" cy="200" r="4" filter="url(#glow)"/>
        <circle className={styles.constelNode} cx="800" cy="100" r="3" />
        <circle className={styles.constelNode} cx="250" cy="400" r="4" filter="url(#glow)"/>
        <circle className={styles.constelNode} cx="480" cy="350" r="3" />
        <circle className={styles.constelNode} cx="750" cy="400" r="3" filter="url(#glow)"/>
        <circle className={styles.constelNode} cx="900" cy="300" r="3" />
        <circle className={styles.constelNode} cx="350" cy="700" r="4" filter="url(#glow)"/>
        <circle className={styles.constelNode} cx="600" cy="600" r="3" />
        <circle className={styles.constelNode} cx="950" cy="600" r="3" />
        <circle className={styles.constelNode} cx="50" cy="500" r="2" />
        <circle className={styles.constelNode} cx="800" cy="850" r="3" />
        <circle className={styles.constelNode} cx="500" cy="950" r="3" filter="url(#glow)"/>
      </svg>

      <div className={styles.heroContainer}>
        <div className={styles.leftPanel}>
          <h1 className={styles.heading}>
            your LIBERALIS
            <span className={styles.headingAccent}>tracker online</span>
          </h1>

          <p className={styles.subheading}>
            The streamlined platform for faculty to track attendance,
            send announcements, and manage academic programs efficiently.
          </p>
        </div>

        <div className={styles.rightPanel}>
          <img
            src="/hero-right.jfif"
            alt="Dashboard preview"
            className={styles.heroImage}
          />
          <p className={styles.visionText}>Vision</p>
        </div>
      </div>
    </section>
  );
}