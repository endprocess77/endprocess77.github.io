'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header-glass">
      <div className="nav-container">
        <Link href="/" className="logo-link">
          <span className="gradient-text">CricCeleb</span>
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
            href="/teams" 
            className={`nav-item ${pathname?.startsWith('/teams') || pathname?.startsWith('/team/') ? 'nav-item-active' : ''}`}
          >
            Teams
          </Link>
        </nav>
      </div>
    </header>
  );
}
