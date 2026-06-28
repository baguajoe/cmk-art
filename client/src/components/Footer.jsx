// Simple shared footer. The year is computed at render time.
export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <p>© {year} CMK Art — Carmen Kershaw. All rights reserved.</p>
    </footer>
  )
}
