import './HeroPage.css'; // For the font import
import { Link } from 'react-router-dom';

export default function HeroPage() {
  return (
    <section className="landing-page">
      <div className="landing-content">
        <span className="landing-kicker">PaperMind</span>
        <h1>Research, without the busywork.</h1>
        <p>Search the web, synthesize reliable sources, and keep every report in one focused workspace.</p>
        <Link className="landing-cta" to="/chat">Start researching <span>→</span></Link>
      </div>
    </section>
  );
}
