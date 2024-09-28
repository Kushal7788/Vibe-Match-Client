import React, { useState, useEffect } from "react";
import { signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./LandingPage.css";

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
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState(null);
  const [proofStatus, setProofStatus] = useState(null);

  console.log({ message });

  const navigate = useNavigate();

  // if user get user data from backend
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setUserData(data?.user || null);
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      console.error("Error signing in with Google", error);
    });
  };

  const handleSignOut = () => {
    signOut(auth).catch((error) => {
      console.error("Error signing out", error);
    });
  };

  const extractTitles = (proofData, service) => {
    if (service === "netflix") {
      if (Array.isArray(proofData) && proofData.length > 0) {
        const publicData = proofData[0].publicData;
        if (publicData && Array.isArray(publicData.titles)) {
          return publicData.titles;
        }
      }
    } else if (service === "prime") {
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
    setMessage(null);
    setProofStatus(null);
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

      if (service === "netflix") {
        providerId = "f043fdac-1b4e-4c2f-83da-50d8e63a3ce3";
      } else if (service === "prime") {
        providerId = "bf90309d-2f8f-40f6-9983-5425cca38c4e";
      } else {
        throw new Error("Invalid service selected");
      }

      await reclaimClient.buildProofRequest(providerId, true, "V2Linking");
      reclaimClient.setRedirectUrl(window.location.href);
      reclaimClient.setSignature(
        await reclaimClient.generateSignature(APP_SECRET)
      );

      const { requestUrl, statusUrl } =
        await reclaimClient.createVerificationRequest();

      setQrCodeUrl(requestUrl);

      await reclaimClient.startSession({
        onSuccessCallback: async (proof) => {
          setMessage(
            `You have successfully shared ${
              service === "netflix" ? "Netflix" : "Prime"
            } watch history!`
          );
          setProofStatus("success");
          // toast.success("Verification successful!");
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
                  email: user?.email || null,
                }),
              }
            );

            if (!response.ok) {
              throw new Error("Failed to send proof data to the server");
            }

            setQrCodeUrl(null);
            // alert("Proof data and titles sent successfully");

            console.log("Proof data and titles sent successfully");
          } catch (error) {
            console.error("Error sending proof data:", error);
          } finally {
            fetchUserData();
          }
        },

        onFailureCallback: (error) => {
          setProofStatus("error");
          console.error("Verification failed", error);
          toast.error("Verification failed. Please try again.");
          setQrCodeUrl(null);
          fetchUserData();
        },
      });
    } catch (error) {
      console.error("Error in getVerificationReq:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateLeaderboard = () => {
    navigate(`/leaderboard/${user.uid}`);
  };

  const copyLinkToClipboard = () => {
    const url = `${window.location.href}matching/${
      user.uid
    }?fromUsername=${encodeURIComponent(user.displayName)}`;
    navigator.clipboard.writeText(url);
    // add styles to toast
    toast.error(
      "Link Copied to Clipboard, share with your friends or on socials to see their vibe score with you",
      {
        icon: false,
        className: "toast-message",
      }
    );
  };

  const openRequestUrl = () => {
    window.open(qrCodeUrl, "_blank");
  };

  const renderContent = () => {
    if (selectedService) {
      return (
        <div className="qr-code-container">
          <h2
            className="verification-headline"
            style={{ lineHeight: "1.4", marginBottom: "1rem" }}
          >
            {proofStatus === null
              ? `Link your ${selectedService} data`
              : proofStatus === "success"
              ? "Verification successful!"
              : "Verification failed. Please try again."}
          </h2>
          {isLoading ? (
            <div className="loading-scanner"></div>
          ) : (
            qrCodeUrl && (
              <>
                <div
                  className="qr-code-wrapper"
                  style={{
                    backgroundColor: "white",
                    padding: "10px",
                  }}
                >
                  <QRCode value={qrCodeUrl} size={256} />
                </div>
                <button
                  onClick={openRequestUrl}
                  className="reclaim-button netflix external-open-button"
                >
                  Link
                </button>
              </>
            )
          )}
          <p>
            {isLoading ? (
              "Tuning into your vibe..."
            ) : message ? (
              message
            ) : (
              <>
                <span className="for-desktop">
                  Scan this QR code to share your watch history
                </span>
                <span className="for-mobile">
                  Click on the above button to share your watch history
                </span>
              </>
            )}
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
            Share your Netflix or Prime watch history to match your vibe
          </span>
        </h2>
        <div className="reclaim-buttons">
          <button
            className="reclaim-button netflix"
            onClick={() => getVerificationReq("netflix")}
          >
            Netflix
          </button>
          <button
            className="reclaim-button amazon-prime"
            onClick={() => getVerificationReq("prime")}
          >
            Prime
          </button>
        </div>
        <br />
        <div className="reclaim-buttons">
          <button
            className="leaderboard-button tooltip"
            onClick={navigateLeaderboard}
            disabled={
              !(
                userData?.verificationSubmitted?.netflix ||
                userData?.verificationSubmitted?.prime
              )
            }
            style={{ lineHeight: "1.4" }}
          >
            {!(
              userData?.verificationSubmitted?.netflix ||
              userData?.verificationSubmitted?.prime
            ) && (
              <span class="tooltiptext">
                Submit your data to unlock the leaderboard
              </span>
            )}
            Leaderboard
          </button>
          <button
            className="leaderboard-button tooltip"
            onClick={copyLinkToClipboard}
            style={{ lineHeight: "1.4" }}
            disabled={
              !(
                userData?.verificationSubmitted?.netflix ||
                userData?.verificationSubmitted?.prime
              )
            }
          >
            {!(
              userData?.verificationSubmitted?.netflix ||
              userData?.verificationSubmitted?.prime
            ) && (
              <span class="tooltiptext">
                Submit Netflix or Prime data to check your vibe
              </span>
            )}
            Vibe Check with a Friend
          </button>
        </div>
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

  const handleNavigateHome = () => {
    setSelectedService(null);
    setQrCodeUrl(null);
    setMessage(null);
    navigate("/");
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
        {!user && (
          <div className="animated-background">
            <div className="pulse-circle"></div>
            <div className="pulse-circle"></div>
            <div className="pulse-circle"></div>
          </div>
        )}
        {user && <div className="crazy-background">{createParticles(20)}</div>}
        <div className={getContentStyle()}>
          <h1
            className={`logo pixel-art ${user ? "logged-in" : ""}`}
            onClick={handleNavigateHome}
            style={{ cursor: "pointer" }}
          >
            VIBE MATCH
          </h1>
          {user ? (
            <div className="logged-in-content">{renderContent()}</div>
          ) : (
            <>
              <h2 className="subheadline pixel-art">
                Securely share your Netflix and Prime watch history <br />
                to find friends with matching tastes
              </h2>
              <button
                className="login-button pixel-art"
                onClick={signInWithGoogle}
              >
                <GoogleLogo />
                <span>Login</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VibeMatcher;
