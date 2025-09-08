import { useEffect } from 'react';

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
        style={{ height: '16px', verticalAlign: 'middle', marginLeft: '6px' }}
      />
      کلیه حقوق مادی و معنوی این سایت متعلق به خانه هم‌افزایی انرژی و آب استان خراسان رضوی است.
      <br />
      طراحی و تولید: خانه هم‌افزایی انرژی و آب خراسان رضوی
    </footer>
  );
}
