import React from "react";
import VibeMatcher from "./LandingPage";
import Leaderboard from "./Leaderboard";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<VibeMatcher />} />
        <Route path="/leaderboard/:uid" element={<Leaderboard />} />
      </Routes>
    </div>
  );
}

export default App;
