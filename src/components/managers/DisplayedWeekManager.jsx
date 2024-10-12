// src/components/managers/DisplayedWeekManager.jsx
import React from "react";

const DisplayedWeekManager = ({ weekRange, setWeekRange }) => {
  const handleWeekChange = (e) => {
    const selectedWeek = e.target.value;
    setWeekRange(selectedWeek);
  };

  return (
    <div className="displayed-week-manager">
      <label htmlFor="week-select">Week:</label>
      <select id="week-select" value={weekRange} onChange={handleWeekChange}>
        <option value="previous">Previous</option>
        <option value="current">Current</option>
        <option value="next">Next</option>
      </select>
    </div>
  );
};

export default DisplayedWeekManager;
