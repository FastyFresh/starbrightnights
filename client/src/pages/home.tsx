import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "../lib/analytics";

// Assets
import heroImage from "@/assets/hero-image.png";
import blackKneeling from "@/assets/starbright-black-kneeling.png";
import blackBikini from "@/assets/starbright-blackbikini.png";
import redBikini from "@/assets/starbright-redbikini.png";
import yellowBikini from "@/assets/starbright-yellowbikini.png";
import pinkStanding from "@/assets/starbright-pink-standing.png";
import redShorts from "@/assets/starbright-redshorts.png";
import corsetFront from "@/assets/starbright-corset-front.png";
import corsetBack from "@/assets/starbright-corset-back.png";
import sailor from "@/assets/starbright-sailor.png";
import redBed from "@/assets/starbright-red-bed.png";
import closeup from "@/assets/starbright-closeup.png";
import penthouseFront from "@/assets/starbright-penthouse-front.png";
import penthouseBack from "@/assets/starbright-penthouse-back.png";
import smile from "@/assets/starbright-smile.png";

export default function Home() {
  const telegramLink = "https://t.me/StarbrightMonroe";

  const trackOutbound = (label: string) => {
    trackEvent("outbound_click", "telegram", label);
  };

  return (
    <div className="dark-landing">
      <div className="dark-container">
        {/* Main CTA Image */}
        <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="cta-image-block" data-testid="link-main-cta" onClick={() => trackOutbound("hero_image")}>
          <img src={smile} alt="Exclusive content" className="cta-image" />
          <div className="cta-overlay-middle">
            <span className="cta-text-hero">...hey, i'm Starbright 🌟</span>
            <span className="cta-text-multi">i'm 19 going to school in LA</span>
            <span className="cta-text-multi">i model sometimes 📸</span>
            <span className="cta-text-multi">barista by day ☕ dancer by night 💃</span>
            <span className="cta-button-text">click anywhere to connect with me on Telegram</span>
            <svg className="telegram-icon" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
        </a>

        {/* Full Width Pink Photo */}
        <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="cta-image-block" data-testid="link-grid-1" onClick={() => trackOutbound("pink_standing")}>
          <img src={pinkStanding} alt="Starbright" className="cta-image" />
          <div className="cta-overlay">
            <span className="cta-text">my safe public "post" 😇</span>
          </div>
        </a>

        {/* Full Width CTA */}
        <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="cta-image-block" data-testid="link-cta-2" onClick={() => trackOutbound("sailor")}>
          <img src={sailor} alt="Exclusive access" className="cta-image" />
          <div className="cta-overlay-top">
            <span className="cta-text">i can get goth sometimes lol</span>
          </div>
          <div className="cta-overlay">
            <span className="cta-text">just posted something new 🤭</span>
          </div>
        </a>

        {/* Red Bed Photo */}
        <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="cta-image-block" data-testid="link-red-bed" onClick={() => trackOutbound("red_bed")}>
          <img src={redBed} alt="Starbright" className="cta-image" />
          <div className="cta-overlay">
            <span className="cta-text">hotels...yum 🛏️</span>
          </div>
        </a>

        {/* Two Column Grid */}
        <div className="photo-grid-2col">
          <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="grid-item" data-testid="link-grid-5" onClick={() => trackOutbound("yellow_bikini")}>
            <img src={yellowBikini} alt="Starbright" />
            <div className="cta-overlay">
              <span className="cta-text">showing off my favorite yellow two-piece 💛</span>
            </div>
          </a>
          <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="grid-item" data-testid="link-grid-6" onClick={() => trackOutbound("red_shorts")}>
            <img src={redShorts} alt="Starbright" />
            <div className="cta-overlay">
              <span className="cta-text">day lounging playing with my braids</span>
            </div>
          </a>
        </div>

        {/* Penthouse Grid */}
        <div className="photo-grid-2col">
          <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="grid-item" data-testid="link-grid-7" onClick={() => trackOutbound("penthouse_front")}>
            <img src={penthouseFront} alt="Starbright" />
            <div className="cta-overlay">
              <span className="cta-text">being a house pet 🐱</span>
            </div>
          </a>
          <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="grid-item" data-testid="link-grid-8" onClick={() => trackOutbound("penthouse_back")}>
            <img src={penthouseBack} alt="Starbright" />
            <div className="cta-overlay">
              <span className="cta-text">...still being a house pet 🐱</span>
            </div>
          </a>
        </div>

        {/* Final CTA Button */}
        <div className="final-cta-section">
          <a 
            href={telegramLink}
            className="cta-button-large" 
            target="_blank"
            rel="noopener noreferrer"
            data-testid="button-dfans-main"
            onClick={() => trackOutbound("cta_button_all_of_me")}
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
