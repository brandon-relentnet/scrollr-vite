// src/components/managers/BorderRadiusManager.jsx
import React from "react";

const BorderRadiusManager = ({ borderRadius, setBorderRadius }) => {
  const getNextBorderRadius = () => {
    return borderRadius === "0" ? "6" : borderRadius === "6" ? "18" : "0";
  };

  const toggleBorderRadius = () => {
    const newBorderRadius = getNextBorderRadius();
    setBorderRadius(newBorderRadius);
  };

  return (
    <button className="border-radius-toggle" onClick={toggleBorderRadius}>
      <div
        style={{
          width: "32px",
          height: "32px",
          transition: "box-shadow 0.3s ease, border-radius 0.3s ease",
          border: "2px solid var(--subtext0)",
          borderRadius:
            borderRadius === "0"
              ? "0px"
              : borderRadius === "6"
              ? "6px"
              : "18px",
        }}
      ></div>
    </button>
  );
};

export default BorderRadiusManager;
