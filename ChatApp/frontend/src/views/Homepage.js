import React from 'react';
import '../styles/style.css';
import chatGif from '../images/chat.gif'; // Replace with your actual path to the GIF

function Homepage() {
  return (
    <div className="homepage-container" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="row w-100 justify-content-center">
          <div className="col-md-8 text-center p-5">
            {/* GIF animation */}
            <img
              src={chatGif}
              alt="Chat Animation"
              className="chat-gif animated-gif mb-4"
              style={{ maxWidth: '300px' }}
            />

            <h1 className="display-6 text-dark">Welcome to our chat application BM</h1>
            <p className="lead mb-4 text-dark">
              Break language barriers and stay productive, all in one chat – BM is your intelligent partner for smart communication and daily planning.
            </p>
            <a className="btn btn-orange btn-custom" href="/login" role="button">
              Get Started »
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container text-center">
        <p style={{ fontSize: "0.8rem", color: "#333" }}>BM©2025-2026</p>
      </footer>
    </div>
  );
}

export default Homepage;