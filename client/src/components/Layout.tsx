import { Link } from "wouter";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  navBadges?: ReactNode;
  isHome?: boolean;
}

export function Layout({ children, navBadges, isHome }: LayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container">
      <div className="nav">
        {isHome ? (
          <div className="brand">
            Starbright Night <span className="badge">Official</span>
          </div>
        ) : (
          <Link href="/" className="brand">
            Starbright Night
          </Link>
        )}
        {navBadges}
      </div>

      {children}

      <div className="footer">
        <div>© {currentYear} Starbright Night • 18+</div>
        <div>
          <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link>
        </div>
      </div>
    </div>
  );
}
