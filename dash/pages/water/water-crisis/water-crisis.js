import Header from '../../../components/Header.js';
import Footer from '../../../components/Footer.js';
import Card from '../../../components/Card.js';

export default function WaterCrisis() {
  return (
    <>
      <Header title="بحران آب" />
      <main className="water-dashboard-grid">
        <Card variant="alert" size="full">
          <h2>وضعیت بحرانی منابع آب</h2>
          <p>اطلاعات بحران آب و هشدارهای مهم در این بخش نمایش داده می‌شود.</p>
        </Card>

        <Card variant="primary" size="medium">
          <h3>آمار مصرف آب</h3>
          <p>نمایش آمار و اطلاعات مصرف آب</p>
        </Card>

        <Card variant="primary" size="medium">
          <h3>منابع آبی موجود</h3>
          <p>وضعیت منابع آبی در دسترس</p>
        </Card>

        <Card variant="future" size="small">
          <h4>پیش‌بینی بارش</h4>
          <p>۲۰ میلی‌متر</p>
        </Card>

        <Card variant="future" size="small">
          <h4>میزان ذخیره سد</h4>
          <p>۶۵٪</p>
        </Card>

        <Card variant="future" size="small">
          <h4>کیفیت آب</h4>
          <p>مطلوب</p>
        </Card>

        <Card variant="future" size="small">
          <h4>روند مصرف</h4>
          <p>نزولی</p>
        </Card>
      </main>
      <Footer />
    </>
  );
}
