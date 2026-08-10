import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

// Assets
import heroImage from "@/assets/hero-image.png";
import blackKneeling from "@/assets/starbright-black-kneeling.png";
import blackBikini from "@/assets/starbright-blackbikini.png";
import redBikini from "@/assets/starbright-redbikini.png";
import pinkStanding from "@/assets/starbright-red-lace-selfie.png";
import corsetFront from "@/assets/starbright-corset-front.png";
import corsetBack from "@/assets/starbright-corset-back.png";
import sailor from "@/assets/starbright-morning-selfie.png";
import pedicure from "@/assets/starbright-pedicure.png";
import closeup from "@/assets/starbright-closeup.png";
import smile from "@/assets/starbright-micro-bikini.png";

export default function Home() {
  const dfansLink = "https://t.me/StarbrightMonroe";

  return (
    <div className="dark-landing">
      <div className="dark-container">
        {/* Main CTA Image */}
        <a href={dfansLink} target="_blank" rel="noopener noreferrer" className="cta-image-block" data-testid="link-main-cta">
          <img src={pinkStanding} alt="Exclusive content" className="cta-image" />
          <div className="cta-overlay-middle">
            <span className="cta-text-hero">...hey, i'm Starbright 🌟</span>
            <span className="cta-text-multi">i'm 20 going to school in LA</span>
            <span className="cta-text-multi">i model sometimes 📸</span>
            <span className="cta-text-multi">barista by day ☕ dancer by night 💃</span>
            <span className="cta-button-text">click anywhere to connect with me on Telegram</span>
            <svg className="telegram-icon" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
        </a>

        {/* Full Width Pink Photo */}
        <a href={dfansLink} target="_blank" rel="noopener noreferrer" className="cta-image-block" data-testid="link-grid-1">
          <img src={smile} alt="Starbright" className="cta-image" />
          <div className="cta-overlay">
            <span className="cta-text">my safe public "post" 😇</span>
          </div>
        </a>

        {/* Full Width CTA */}
        <a href={dfansLink} target="_blank" rel="noopener noreferrer" className="cta-image-block" data-testid="link-cta-2">
          <img src={pedicure} alt="Exclusive access" className="cta-image" />
          <div className="cta-overlay">
            <span className="cta-text">showing off my pedicure</span>
          </div>
        </a>

        {/* Red Bed Photo */}
        <a href={dfansLink} target="_blank" rel="noopener noreferrer" className="cta-image-block" data-testid="link-red-bed">
          <img src={sailor} alt="Starbright" className="cta-image" />
          <div className="cta-overlay">
            <span className="cta-text">Mornings</span>
          </div>
        </a>

        {/* Final CTA Button */}
        <div className="final-cta-section">
          <a 
            href={dfansLink}
            className="cta-button-large" 
            target="_blank"
            rel="noopener noreferrer"
            data-testid="button-dfans-main"
          >
            all of me 💋 <ArrowRight size={20} />
          </a>
          <p className="final-microcopy-bright">this is also where I DM</p>
        </div>
        
        <footer className="dark-footer">
          © {new Date().getFullYear()} Starbright Night • 18+ | <Link href="/privacy">Privacy</Link> | <Link href="/terms">Terms</Link>
        </footer>
      </div>
    </div>
  );
}
