import Header from '../../../components/Header.js';
import Footer from '../../../components/Footer.js';
import Card from '../../../components/Card.js';

export default function DamMonitoring() {
  return (
    <>
      <Header title="پایش سدها" />
      <main className="water-dashboard-grid">
        <Card variant="primary" size="large">
          <h2>وضعیت کلی سدهای کشور</h2>
          <p>مانیتورینگ و نظارت بر وضعیت سدهای مهم</p>
        </Card>

        <Card variant="primary" size="medium">
          <h3>سد کرج</h3>
          <p>میزان ذخیره: ۷۲٪</p>
          <p>ورودی: ۱۵ متر مکعب بر ثانیه</p>
        </Card>

        <Card variant="primary" size="medium">
          <h3>سد امیرکبیر</h3>
          <p>میزان ذخیره: ۶۸٪</p>
          <p>ورودی: ۱۲ متر مکعب بر ثانیه</p>
        </Card>

        <Card variant="future" size="small">
          <h4>تعداد سدها</h4>
          <p>۱۸۳ سد</p>
        </Card>

        <Card variant="future" size="small">
          <h4>ظرفیت کل</h4>
          <p>۵۰ میلیارد m³</p>
        </Card>

        <Card variant="alert" size="small">
          <h4>سدهای بحرانی</h4>
          <p>۵ سد</p>
        </Card>

        <Card variant="primary" size="small">
          <h4>میانگین ذخیره</h4>
          <p>۶۵٪</p>
        </Card>
      </main>
      <Footer />
    </>
  );
}
