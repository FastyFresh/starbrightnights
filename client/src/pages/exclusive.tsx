import { Layout } from "@/components/Layout";
import { Lock, ArrowRight, ExternalLink } from "lucide-react";

export default function Exclusive() {
  return (
    <div className="dark-theme">
      <Layout navBadges={<span className="badge">Private</span>}>
        <div className="card page">
          <div className="card-inner" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '16px', 
            background: 'var(--bg)', 
            borderRadius: '50%', 
            marginBottom: '24px',
            color: 'var(--accent)'
          }}>
            <Lock size={32} />
          </div>
          
          <h1 className="h1" style={{ fontSize: '36px', color: 'var(--accent)' }}>My Private Space</h1>
          <p className="sub" style={{ margin: '0 auto 32px', maxWidth: '400px' }}>
            You’re one step away. Tap below to continue to the official verified page.
          </p>
          
          <div className="cta-row" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {/* Primary CTA */}
            <button
              className="btn btn-primary"
              style={{ padding: '16px 32px', fontSize: '18px', width: '100%', maxWidth: '320px' }}
              onClick={() => window.open("https://dfans.co/starbrightnight", "_blank", "noopener,noreferrer")}
            >
              Continue to Site <ArrowRight size={20} />
            </button>
            
            {/* Micro-conversion copy */}
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
              Takes about 5 seconds →
            </div>

            {/* Compliance copy */}
            <div style={{ fontSize: '12px', color: 'var(--muted)', opacity: 0.8, marginTop: '12px' }}>
              By continuing, you confirm you are 18 or older.
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
             <button
              className="btn btn-ghost"
              style={{ fontSize: '14px', padding: '10px 20px', border: 'none' }}
              onClick={() => window.open("https://t.me/StarbrightMonroeBot", "_blank", "noopener,noreferrer")}
            >
              Get updates on Telegram <ExternalLink size={14} />
            </button>
          </div>

          <hr className="hr" style={{ maxWidth: '200px', margin: '32px auto' }} />
          
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.6 }}>
            Secure link • No auto-redirects
          </p>
        </div>
      </div>
    </Layout>
  </div>
  );
}
