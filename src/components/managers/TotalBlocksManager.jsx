// src/components/managers/TotalBlocksManager.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

const TotalBlocksManager = ({ visibleBlocks, setVisibleBlocks }) => {
  const incrementBlocks = () => {
    if (visibleBlocks < 6) {
      const newBlocks = visibleBlocks + 1;
      setVisibleBlocks(newBlocks);
    }
  };

  const decrementBlocks = () => {
    if (visibleBlocks > 3) {
      const newBlocks = visibleBlocks - 1;
      setVisibleBlocks(newBlocks);
    }
  };

  return (
    <div className="total-blocks-manager">
      <label>Blocks:</label>
      <button onClick={decrementBlocks} disabled={visibleBlocks <= 3}>
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <span>{visibleBlocks}</span>
      <button onClick={incrementBlocks} disabled={visibleBlocks >= 6}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
};

export default TotalBlocksManager;
