// GameStatus.jsx
import React from "react";

const GameStatus = ({ status, date, isLive, currentPeriod }) => {
  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
      dateObj
    );
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    }).format(dateObj);
    return (
      <>
        <strong>{day}</strong>, {formattedDate}
      </>
    );
  };

  return (
    <div className="game-status">
      {isLive ? (
        <>
          <p className="live-status">
            LIVE {currentPeriod && ` - ${currentPeriod}`}
          </p>
        </>
      ) : (
        <>
          <p className="small-text-status">{status}</p>
          <p className="small-text-date">{formatDate(date)}</p>
        </>
      )}
    </div>
  );
};

export default GameStatus;
