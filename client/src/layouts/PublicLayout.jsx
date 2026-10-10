import { Navbar } from '../components/Navbar.jsx';
import { Footer } from '../components/Footer.jsx';

export function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
