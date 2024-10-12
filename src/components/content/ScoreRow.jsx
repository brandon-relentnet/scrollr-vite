// ScoreRow.jsx
import React from "react";

const ScoreRow = ({ awayScore, homeScore, awayTeamWon, homeTeamWon }) => (
  <div className="score-row">
    <span className={`team-score ${awayTeamWon ? "winner" : "loser"}`}>
      {awayScore}
    </span>
    <span className="dash">-</span>
    <span className={`team-score ${homeTeamWon ? "winner" : "loser"}`}>
      {homeScore}
    </span>
  </div>
);

export default ScoreRow;
