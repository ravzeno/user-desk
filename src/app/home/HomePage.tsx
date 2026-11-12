export function HomePage() {
  return (
    <section className="welcome-page" aria-labelledby="welcome-title">
      <div className="welcome-content">
        <h1 id="welcome-title">ยินดีต้อนรับสู่ User Desk</h1>
        <p>เลือกเมนูด้านข้างเพื่อเริ่มต้นใช้งาน</p>
        <img src="/images/husky-programmer.svg" alt="" className="welcome-mascot" />
      </div>
    </section>
  );
}
