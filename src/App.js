import React from "react";
import VibeMatcher from "./LandingPage";
import Leaderboard from "./Leaderboard";
import MatchingScreen from "./MatchingScreen";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<VibeMatcher />} />
        <Route path="/leaderboard/:uid" element={<Leaderboard />} />
        <Route path="/matching/:fromUid" element={<MatchingScreen />} />
      </Routes>
    </div>
  );
}

export default App;
