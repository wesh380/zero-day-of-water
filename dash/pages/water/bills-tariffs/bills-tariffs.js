import Header from '../../../components/Header.js';
import Footer from '../../../components/Footer.js';
import Card from '../../../components/Card.js';

export default function BillsTariffs() {
  return (
    <>
      <Header title="قبوض و تعرفه‌ها" />
      <main className="water-dashboard-grid">
        <Card variant="primary" size="full">
          <h2>محاسبه‌گر قبض و تعرفه آب</h2>
          <p>محاسبه هزینه مصرف آب بر اساس تعرفه‌های جاری</p>
        </Card>

        <Card variant="primary" size="medium">
          <h3>تعرفه مصرف خانگی</h3>
          <ul>
            <li>پله اول (۰-۵ متر مکعب): ۱,۰۰۰ تومان</li>
            <li>پله دوم (۵-۱۰ متر مکعب): ۲,۰۰۰ تومان</li>
            <li>پله سوم (۱۰+ متر مکعب): ۳,۵۰۰ تومان</li>
          </ul>
        </Card>

        <Card variant="primary" size="medium">
          <h3>تعرفه مصرف تجاری</h3>
          <ul>
            <li>پله اول: ۲,۵۰۰ تومان</li>
            <li>پله دوم: ۴,۰۰۰ تومان</li>
            <li>پله سوم: ۶,۰۰۰ تومان</li>
          </ul>
        </Card>

        <Card variant="future" size="small">
          <h4>میانگین قبض</h4>
          <p>۴۵,۰۰۰ تومان</p>
        </Card>

        <Card variant="future" size="small">
          <h4>تخفیف صرفه‌جویی</h4>
          <p>تا ۲۰٪</p>
        </Card>

        <Card variant="alert" size="small">
          <h4>جریمه اضافه مصرف</h4>
          <p>۵۰٪</p>
        </Card>

        <Card variant="primary" size="small">
          <h4>روش پرداخت</h4>
          <p>آنلاین/حضوری</p>
        </Card>
      </main>
      <Footer />
    </>
  );
}
