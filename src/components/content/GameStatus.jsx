// GameStatus.jsx
import React from "react";

const GameStatus = ({ status, date, isLive }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
      date
    );
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    }).format(date);
    return (
      <>
        <strong>{day}</strong>, {formattedDate}
      </>
    );
  };

  return (
    <div className="game-status">
      <p className="small-text-status">{status}</p>
      <p className="small-text-date">{formatDate(date)}</p>
      {isLive && <p className="live-status">LIVE</p>}
    </div>
  );
};

export default GameStatus;
