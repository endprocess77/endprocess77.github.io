'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header-glass">
      <div className="nav-container">
        <Link href="/" className="logo-link">
          <span className="gradient-text">FeCric</span>
          <span className="logo-dot"></span>
        </Link>
        <nav className="nav-links">
          <Link 
            href="/" 
            className={`nav-item ${pathname === '/' ? 'nav-item-active' : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/roster" 
            className={`nav-item ${pathname === '/roster' ? 'nav-item-active' : ''}`}
          >
            Roster
          </Link>
          <Link 
            href="/match" 
            className={`nav-item ${pathname === '/match' ? 'nav-item-active' : ''}`}
          >
            Match Draft
          </Link>
        </nav>
      </div>
    </header>
  );
}
