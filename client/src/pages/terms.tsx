import { Layout } from "@/components/Layout";

export default function Terms() {
  return (
    <div className="dark-theme">
      <Layout navBadges={<span className="badge">Terms</span>}>
        <div className="card page">
          <div className="card-inner">
            <h1 className="h1">Terms</h1>
            <p className="sub">By using this site, you agree to access it for personal use only.</p>
            <p className="sub">This site provides outbound links. We are not responsible for third-party services, content, or availability.</p>
            <p className="sub">18+ only. If you are not of legal age in your jurisdiction, please exit.</p>
            <hr className="hr" />
            <p style={{ margin: 0 }} className="sub">These terms may be updated without notice.</p>
          </div>
        </div>
      </Layout>
    </div>
  );
}
