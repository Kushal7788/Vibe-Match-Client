import React, { useState, useEffect } from "react";
import { signInWithPopup, signOut, TwitterAuthProvider } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useParams } from "react-router-dom";
import { auth } from "./firebase";
import "./LandingPage.css";
import "./MatchingScreen.css";

const TwitterLogo = () => (
  <svg
    width="18"
    height="18"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 248 204"
  >
    <path
      fill="#1DA1F2"
      d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z"
    />
  </svg>
);
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

const MatchingScreen = () => {
  const [user] = useAuthState(auth);
  const { fromUid } = useParams();
  const fromUsername = new URLSearchParams(window.location.search).get(
    "fromUsername"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [vibePercentage, setVibePercentage] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && fromUid && fromUsername) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const vibeResponse = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/similarity/${fromUid}/${user.uid}`,
            {
              headers: {
                Authorization: `Bearer ${user.accessToken}`,
              },
            }
          );

          const similariltyData = await vibeResponse.json();

          if (!vibeResponse.ok) {
            throw new Error(
              similariltyData.message || "Failed to fetch vibe data"
            );
          }
          console.log({ similariltyData }, "...");
          setVibePercentage(similariltyData.similarity);
        } catch (error) {
          console.error("Error fetching data:", error);
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

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

  const getContentStyle = () => {
    let style = "content";
    if (user) {
      style += " logged-in";
    }
    return style;
  };

  const handleSignOut = () => {
    signOut(auth).catch((error) => {
      console.error("Error signing out", error);
    });
  };

  const signInWithTwitter = () => {
    const provider = new TwitterAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      console.error("Error signing in with Twitter", error);
    });
  };

  return (
    <div className="vibe-matcher">
      {user && (
        <div className="user-info matching-signout">
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="user-avatar"
          />
          <span className="user-name">
            {user?.reloadUserInfo?.screenName || user.displayName}
          </span>
          <button
            className="signout-icon"
            onClick={handleSignOut}
            title="Sign Out"
          >
            <SignOutIcon />
          </button>
        </div>
      )}
      <div className="hero-container">
        <div className="crazy-background">{createParticles(20)}</div>
        <div className={getContentStyle()}>
          <h1 className={`logo pixel-art ${user ? "logged-in" : ""}`}>
            VIBE MATCH
          </h1>

          <div className="qr-code-container match-container">
            {isLoading ? (
              <div className="loading-scanner">
                <div className="loading-scanner-text">
                  <span className="loading-scanner-text-letter">L</span>
                  <span className="loading-scanner-text-letter">O</span>
                  <span className="loading-scanner-text-letter">A</span>
                  <span className="loading-scanner-text-letter">D</span>
                  <span className="loading-scanner-text-letter">I</span>
                  <span className="loading-scanner-text-letter">N</span>
                  <span className="loading-scanner-text-letter">G</span>
                </div>
              </div>
            ) : (
              <>
                {!user && (
                  <h2 className="verification-headline matching-headline">
                    Login to Check Your Vibe With {fromUsername}
                  </h2>
                )}
                {user && vibePercentage > 0 && (
                  <div className="vibe-percentage-container">
                    <h2 className="verification-headline matching-headline">
                      Your vibe percentage with {fromUsername} is{" "}
                      {(vibePercentage * 100).toFixed(2)}%
                    </h2>
                  </div>
                )}
                {error && (
                  <div className="error-message-container">
                    <h2 className="verification-headline matching-headline">
                      Ooops...
                      <br />
                    </h2>
                    <p>{error}</p>
                  </div>
                )}
                {isLoading && <div className="loading-scanner"></div>}
                {!user && (
                  <button
                    className="login-button pixel-art"
                    onClick={signInWithTwitter}
                  >
                    <TwitterLogo />
                    <span>Login</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingScreen;
