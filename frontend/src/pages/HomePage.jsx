import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="dashboard-page">
      <section className="hero-card">
        <div>
          <h1>Manage Court Hearing Records</h1>
          <p>
            Add and review advocate and victim hearing details in one user-friendly dashboard.
            Use the navigation links to switch between advocate and victim forms, then see the latest records below.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Advocate Form</h2>
          <p>
            Submit new advocate hearing records with case details, court hall, counsel information and remarks.
          </p>
          <Link className="btn-link" to="/advocate">
            Go to Advocate
          </Link>
        </article>

        <article className="dashboard-card">
          <h2>Victim Form</h2>
          <p>
            Add victim hearing records quickly and keep track of the latest entries directly from the UI.
          </p>
          <Link className="btn-link" to="/victim">
            Go to Victim
          </Link>
        </article>
      </section>
    </div>
  );
};

export default HomePage;
