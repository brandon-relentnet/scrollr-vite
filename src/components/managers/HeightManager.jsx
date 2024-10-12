// src/components/managers/HeightManager.jsx
import React from "react";

const HeightManager = ({ heightMode, setHeightMode }) => {
  const handleHeightChange = (e) => {
    const newHeightMode = e.target.value;
    setHeightMode(newHeightMode);
  };

  return (
    <div className="height-manager">
      <label>Height:</label>
      <div className="select-wrapper">
        <select value={heightMode} onChange={handleHeightChange}>
          <option value="shorter">Shorter</option>
          <option value="default">Classic</option>
          <option value="taller">Taller</option>
        </select>
      </div>
    </div>
  );
};

export default HeightManager;
