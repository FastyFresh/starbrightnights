import { Layout } from "@/components/Layout";

export default function Privacy() {
  return (
    <div className="dark-theme">
      <Layout navBadges={<span className="badge">Privacy</span>}>
        <div className="card page">
          <div className="card-inner">
            <h1 className="h1">Privacy</h1>
            <p className="sub">This site is a simple hub page. We do not ask you to create an account here.</p>
            <p className="sub">We may collect basic aggregated analytics from hosting providers (e.g., page views) to keep the site working and understand traffic at a high level.</p>
            <p className="sub">External links (Telegram / dFans) have their own privacy policies and terms.</p>
            <hr className="hr" />
            <p style={{ margin: 0 }} className="sub">Questions? Contact the owner via the social account you came from.</p>
          </div>
        </div>
      </Layout>
    </div>
  );
}
