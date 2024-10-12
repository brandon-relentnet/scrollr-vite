import React, { forwardRef } from "react";
import "../css/styles.css";

const TickerBlock = forwardRef(({ content }, ref) => {
  // Function to format the date as (Day), mm/dd/yy with bold day
  const formatDate = (dateString) => {
    const date = new Date(dateString); // Parse the date string into a Date object

    const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
      date
    ); // e.g., Mon, Tue, Wed
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    }).format(date); // e.g., mm/dd/yy

    // Return JSX with bold day and the rest of the date as normal
    return (
      <>
        <strong>{day}</strong>, {formattedDate}
      </>
    );
  };

  const handleClick = () => {
    if (content.href) {
      window.open(content.href, "_blank"); // Open the link in a new tab
    } else {
      console.log("No valid link provided for this block.");
    }
  };

  return (
    <div className="ticker-block">
      <div className="ticker-block-wrapper" ref={ref} onClick={handleClick}>
        {/* Logos on left and right, block-info in the middle */}
        <img
          src={content.awayTeamLogo}
          alt="Away Team Logo"
          className="team-logo"
        />

        <div className="block-info">
          <div className="score-row">
            <span
              className={`team-score ${
                content.awayTeamWon ? "winner" : "loser"
              }`}
            >
              {content.points.split(" - ")[0]}
            </span>
            <span className="dash">-</span>
            <span
              className={`team-score ${
                content.homeTeamWon ? "winner" : "loser"
              }`}
            >
              {content.points.split(" - ")[1]}
            </span>
          </div>
          <p className="small-text-status">{content.status}</p>
          {/* Use formatDate to display the date in (Day), mm/dd/yy format with bold day */}
          <p className="small-text-date">{formatDate(content.date)}</p>
          {content.isLive && <p className="live-status">LIVE</p>}
        </div>

        <img
          src={content.homeTeamLogo}
          alt="Home Team Logo"
          className="team-logo"
        />
      </div>
    </div>
  );
});

export default TickerBlock;
