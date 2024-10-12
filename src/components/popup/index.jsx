import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "./Popup";
import "../css/styles.css";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Popup />);