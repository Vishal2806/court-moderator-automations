import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="home-header">
        <div className="home-emblem">⚖</div>
        <h1>Court Hearing Records</h1>
        <p className="home-sub">
          Central registry for advocate and victim hearing records.
          Select a section below to add or review entries.
        </p>
      </div>

      <div className="home-cards">
        <div className="home-card">
          <div className="card-icon">📋</div>
          <h2>Advocate Records</h2>
          <p>
            Submit and review advocate hearing entries — case number, court hall,
            counsel details, and supporting documents.
          </p>
          <Link className="card-btn" to="/advocate">Open Advocate Register →</Link>
        </div>

        <div className="home-card">
          <div className="card-icon">📁</div>
          <h2>Victim Records</h2>
          <p>
            Submit and review victim hearing entries — party name, court hall,
            counsel details, and supporting documents.
          </p>
          <Link className="card-btn" to="/victim">Open Victim Register →</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
