import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { useParams } from "react-router-dom";
import "./Leaderboard.css";

const Leaderboard = () => {
  const [similarUsers, setSimilarUsers] = useState([]);

  const { uid } = useParams();

  console.log({ uid });

  useEffect(() => {
    // Fetch leaderboard data
    const fetchData = async () => {
      try {
        const similarUsersResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/similar-users/${uid}/100`
        );
        if (!similarUsersResponse.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }
        const similarUsersData = await similarUsersResponse.json();
        setSimilarUsers(similarUsersData.users);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [uid]);

  const SignOutIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17L21 12L16 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const handleSignOut = () => {
    auth.signOut().catch((error) => {
      console.error("Error signing out", error);
    });
  };

  const handleGetMatched = () => {
    // redirect to the home page
    window.location.href = "/";
  };

  const createParticles = (count) => {
    return Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className="particle"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ));
  };

  return (
    <div className="leaderboard-container">
      <div className="crazy-background">{createParticles(20)}</div>
      {/* {user && (
        <div className="user-info">
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="user-avatar"
          />
          <span className="user-name">{user.displayName}</span>
          <button className="signout-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      )} */}
      <div className="vibe-match-logo logo pixel-art logged-in">VIBE MATCH</div>
      <h1 className="leaderboard-title">Leaderboard</h1>
      <div className="leaderboard-content">
        <div className="similar-users-container">
          <h3 className="similar-users-title">Your Vibe Matches</h3>
          <ul className="similar-users-list">
            {similarUsers.map((user, index) => (
              <li key={index} className="similar-user-item">
                <span className="similar-user-rank">{index + 1}</span>
                <span className="similar-user-email">{user.email}</span>
                <span className="similar-user-score">
                  {(user.similarity * 100).toFixed(2)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="match-button-container">
        <button onClick={handleGetMatched} className="match-button">
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
