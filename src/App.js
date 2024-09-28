import React from "react";
import VibeMatcher from "./LandingPage";
import Leaderboard from "./Leaderboard";
import MatchingScreen from "./MatchingScreen";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="App">
      <ToastContainer
        position="top-center"
        hideProgressBar={false}
        autoClose={5000}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<VibeMatcher />} />
        <Route path="/leaderboard/:uid" element={<Leaderboard />} />
        <Route path="/matching/:fromUid" element={<MatchingScreen />} />
      </Routes>
    </div>
  );
}

export default App;
