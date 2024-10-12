// src/managers/ScalingModeManager.jsx
import React from "react";

const ScalingModeManager = ({ scalingMode, setScalingMode }) => {
  const handleChange = (e) => {
    setScalingMode(e.target.value);
  };

  return (
    <div className="scaling-mode-manager">
      <label htmlFor="scaling-mode">Scaling Mode:</label>
      <select id="scaling-mode" value={scalingMode} onChange={handleChange}>
        <option value="classic">Classic</option>
        <option value="large">Large</option>
        <option value="small">Small</option>
      </select>
    </div>
  );
};

export default ScalingModeManager;
