import Header from '../../../components/Header.js';
import Footer from '../../../components/Footer.js';
import Card from '../../../components/Card.js';

export default function FuturePrediction() {
  return (
    <>
      <Header title="پیش‌بینی آینده" />
      <main className="water-dashboard-grid">
        <Card variant="future" size="large">
          <h2>پیش‌بینی وضعیت منابع آب</h2>
          <p>تحلیل و پیش‌بینی روندهای آینده منابع آبی بر اساس داده‌های موجود</p>
        </Card>

        <Card variant="future" size="medium">
          <h3>پیش‌بینی بارندگی سال آینده</h3>
          <p>روند بارندگی و تخمین میزان بارش</p>
        </Card>

        <Card variant="future" size="medium">
          <h3>تحلیل روند مصرف</h3>
          <p>پیش‌بینی الگوهای مصرف آب در آینده</p>
        </Card>

        <Card variant="primary" size="small">
          <h4>دقت مدل</h4>
          <p>۸۵٪</p>
        </Card>

        <Card variant="primary" size="small">
          <h4>بازه زمانی</h4>
          <p>۱۲ ماه</p>
        </Card>

        <Card variant="primary" size="small">
          <h4>آخرین بروزرسانی</h4>
          <p>امروز</p>
        </Card>

        <Card variant="primary" size="small">
          <h4>منبع داده</h4>
          <p>سازمان هواشناسی</p>
        </Card>
      </main>
      <Footer />
    </>
  );
}
