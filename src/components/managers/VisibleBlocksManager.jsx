// src/managers/VisibleBlocksManager.jsx
import React from "react";

const VisibleBlocksManager = ({ visibleBlocks, setVisibleBlocks }) => {
  const handleChange = (e) => {
    const value = Number(e.target.value);
    setVisibleBlocks(value);
  };

  return (
    <div className="visible-blocks-manager">
      <label htmlFor="visible-blocks">Number of Visible Blocks:</label>
      <input
        type="number"
        id="visible-blocks"
        value={visibleBlocks}
        onChange={handleChange}
        min="1"
        max="10"
      />
    </div>
  );
};

export default VisibleBlocksManager;
