// Import React and ReactDOM
import React from "react";
import { createRoot } from "react-dom/client";

// Import tailwind styles
import "./css/tailwind.css";

import "./css/app.scss";

// Import App Component
import App from "./components/app";

// Mount React App
const root = createRoot(document.getElementById("app") as HTMLElement);
root.render(React.createElement(App));
