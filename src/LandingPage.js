import React, { useState } from "react";
import "./LandingPage.css";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  TwitterAuthProvider,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";

const GoogleLogo = () => (
  <svg
    width="18"
    height="18"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

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

const VibeMatcher = () => {
  const [user] = useAuthState(auth);
  const [reclaimData, setReclaimData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      console.error("Error signing in with Google", error);
    });

    // get google auth token
  };

  const signInWithTwitter = () => {
    const provider = new TwitterAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      console.error("Error signing in with Twitter", error);
    });
  };

  const handleSignOut = () => {
    signOut(auth).catch((error) => {
      console.error("Error signing out", error);
    });
  };

  // create a method to get titles from the proof object

  // Add this new function to extract titles
  const extractTitles = (proofData, service) => {
    if (service === "Netflix") {
      if (Array.isArray(proofData) && proofData.length > 0) {
        const publicData = proofData[0].publicData;
        if (publicData && Array.isArray(publicData.titles)) {
          return publicData.titles;
        }
      }
    } else if (service === "Amazon Prime") {
      if (Array.isArray(proofData) && proofData.length > 0) {
        const publicData = proofData[0].publicData;
        if (publicData && publicData.wigetsData) {
          const watchHistoryWidget = publicData.wigetsData.find(
            (widget) => widget.widgetType === "watch-history"
          );
          if (
            watchHistoryWidget &&
            watchHistoryWidget.content &&
            watchHistoryWidget.content.content
          ) {
            const titles = watchHistoryWidget.content.content.titles
              .flatMap((dateGroup) => dateGroup.titles)
              .map((title) => title.title.text);
            return titles;
          }
        }
      }
    }
    return [];
  };

  const getVerificationReq = async (service) => {
    // get auth token
    const token = await auth.currentUser.getIdToken();
    setSelectedService(service);
    setIsLoading(true);
    const APP_ID = process.env.REACT_APP_RECLAIM_APP_ID;
    const APP_SECRET = process.env.REACT_APP_RECLAIM_APP_SECRET;

    if (!APP_ID || !APP_SECRET) {
      console.error("Reclaim APP_ID or APP_SECRET is not set");
      return;
    }

    try {
      const reclaimClient = new Reclaim.ProofRequest(APP_ID);
      let providerId;

      if (service === "Netflix") {
        providerId = "f043fdac-1b4e-4c2f-83da-50d8e63a3ce3";
      } else if (service === "Amazon Prime") {
        providerId = "bf90309d-2f8f-40f6-9983-5425cca38c4e";
      } else {
        throw new Error("Invalid service selected");
      }

      await reclaimClient.buildProofRequest(providerId, false, "V2Linking");

      reclaimClient.setSignature(
        await reclaimClient.generateSignature(APP_SECRET)
      );

      const { requestUrl, statusUrl } =
        await reclaimClient.createVerificationRequest();

      setQrCodeUrl(requestUrl);

      await reclaimClient.startSession({
        onSuccessCallback: async (proof) => {
          setReclaimData("Verification successful!");
          setQrCodeUrl(null);

          // Extract titles from the proof
          const titles = extractTitles(proof, service);

          // Send proof data to the backend
          try {
            // get google auth token
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(
              `${process.env.REACT_APP_BACKEND_URL}/api/data`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
                body: JSON.stringify({
                  titles: titles,
                  serviceType: service,
                  displayName:
                    user?.reloadUserInfo?.screenName ||
                    user?.displayName ||
                    null,
                }),
              }
            );

            if (!response.ok) {
              throw new Error("Failed to send proof data to the server");
            }

            console.log("Proof data and titles sent successfully");
          } catch (error) {
            console.error("Error sending proof data:", error);
          }
        },
        onFailureCallback: (error) => {
          console.error("Verification failed", error);
          setReclaimData("Verification failed. Please try again.");
          setQrCodeUrl(null);
        },
      });
    } catch (error) {
      console.error("Error in getVerificationReq:", error);
      setReclaimData("An error occurred. Please try again.");
      setSelectedService(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (selectedService) {
      return (
        <div className="qr-code-container">
          <h2 className="verification-headline">
            Link your {selectedService} data
          </h2>
          {isLoading ? (
            <div className="loading-scanner"></div>
          ) : (
            qrCodeUrl && (
              <div
                className="qr-code-wrapper"
                style={{
                  backgroundColor: "white",
                  padding: "10px",
                }}
              >
                <QRCode value={qrCodeUrl} size={256} />
              </div>
            )
          )}
          <p>
            {isLoading
              ? "Tuning into your vibe..."
              : "Scan this QR code to share your watch history"}
          </p>
          <button
            className="back-button"
            onClick={() => {
              setSelectedService(null);
              setQrCodeUrl(null);
            }}
          >
            Back
          </button>
        </div>
      );
    }

    return (
      <>
        <h2 className="hype-headline">
          <span className="hype-headline-content">
            Vibe with your Tribe! &nbsp;&nbsp;&nbsp;&nbsp; Find Your Rhythm!
            &nbsp;&nbsp;&nbsp;&nbsp; Connect and Groove!
            &nbsp;&nbsp;&nbsp;&nbsp; Vibe with your Tribe!
            &nbsp;&nbsp;&nbsp;&nbsp; Find Your Rhythm! &nbsp;&nbsp;&nbsp;&nbsp;
            Connect and Groove! &nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        </h2>
        <div className="reclaim-buttons">
          <button
            className="reclaim-button netflix"
            onClick={() => getVerificationReq("Netflix")}
          >
            Netflix
          </button>
          <button
            className="reclaim-button amazon-prime"
            onClick={() => getVerificationReq("Amazon Prime")}
          >
            Amazon Prime
          </button>
        </div>
        {reclaimData && <p className="reclaim-data">{reclaimData}</p>}
        <button
          className="leaderboard-button"
          onClick={() => {
            navigate(`/leaderboard/${user.uid}`);
          }}
        >
          Leaderboard
        </button>
      </>
    );
  };

  const getContentStyle = () => {
    let style = "content";
    if (user) {
      style += " logged-in";
    }
    if (qrCodeUrl) {
      style += " qr-visible";
    }
    return style;
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
    <div className="vibe-matcher">
      {user && (
        <div className="user-info">
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
        {!user && (
          <div className="animated-background">
            <div className="pulse-circle"></div>
            <div className="pulse-circle"></div>
            <div className="pulse-circle"></div>
          </div>
        )}
        {user && <div className="crazy-background">{createParticles(20)}</div>}
        <div className={getContentStyle()}>
          <h1 className={`logo pixel-art ${user ? "logged-in" : ""}`}>
            VIBE MATCH
          </h1>
          {user ? (
            <div className="logged-in-content">{renderContent()}</div>
          ) : (
            <button
              className="login-button pixel-art"
              onClick={signInWithTwitter}
            >
              <TwitterLogo />
              <span>Get Started</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VibeMatcher;
