import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const statusToText = {
  PENDING: "Waiting for verification",
  VERIFIED: "Verification successful",
  REJECTED: "Verification failed",
};

const StatusPage = () => {
  const { sessionId } = useParams();
  const [sessionStatus, setSessionStatus] = useState(null);

  // https://api.reclaimprotocol.org/api/sdk/session/0acad5c6-70b4-437d-b4be-a82b299ca17b

  useEffect(() => {
    fetchSessionStatus();
  }, [sessionId]);

  const fetchSessionStatus = async () => {
    const res = await fetch(
      `https://api.reclaimprotocol.org/api/sdk/session/${sessionId}`
    );
    const data = await res.json();
    setSessionStatus(data);
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
      <div className="top-bar">{/* <img src={logo} alt="logo" /> */}</div>
      <div className="hero-container">
        <div className="crazy-background">{createParticles(20)}</div>
        <div className={"content"}>
          <h1
            style={{ cursor: "pointer" }}
            className={`logo pixel-art`}
            // onClick={goToHomePage}
          >
            VIBE MATCH
          </h1>
          <div className="qr-code-container status-page-main">
            <h2
              className="verification-headline matching-headline"
              style={{ margin: 0 }}
            >
              {statusToText[sessionStatus?.session?.status] ?? "Unknown"}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
