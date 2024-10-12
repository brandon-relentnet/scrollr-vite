// TickerBlock.jsx
import React from "react";
import TeamLogo from "./TeamLogo";
import ScoreRow from "./ScoreRow";
import GameStatus from "./GameStatus";

const TickerBlock = ({ content }) => {
  const handleClick = () => {
    if (content.href) {
      window.open(content.href, "_blank");
    } else {
      console.log("No valid link provided for this block.");
    }
  };

  return (
    <div className="ticker-block" onClick={handleClick}>
      <div className="ticker-block-wrapper">
        <TeamLogo src={content.awayTeamLogo} alt="Away Team Logo" />
        <div className="block-info">
          <ScoreRow
            awayScore={content.points.split(" - ")[0]}
            homeScore={content.points.split(" - ")[1]}
            awayTeamWon={content.awayTeamWon}
            homeTeamWon={content.homeTeamWon}
          />
          <GameStatus
            status={content.status}
            date={content.date}
            isLive={content.isLive}
          />
        </div>
        <TeamLogo src={content.homeTeamLogo} alt="Home Team Logo" />
      </div>
    </div>
  );
};

export default TickerBlock;
