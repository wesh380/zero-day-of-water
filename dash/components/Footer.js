import { useEffect } from 'react';
import '../../docs/assets/inline-migration.css';

export default function Footer() {
  useEffect(() => {
    document.body.classList.add('body-mb');
    return () => document.body.classList.remove('body-mb');
  }, []);
  return (
    <footer
      dir="rtl"
      className="footer-fixed"
    >
      <img
        src="/assets/IRAN-FLAG.png"
        alt="Iran flag"
        className="img-flag"
      />
      کلیه حقوق مادی و معنوی این سایت متعلق به خانه هم‌افزایی انرژی و آب استان خراسان رضوی است.
      <br />
      طراحی و تولید: خانه هم‌افزایی انرژی و آب خراسان رضوی
    </footer>
  );
}
