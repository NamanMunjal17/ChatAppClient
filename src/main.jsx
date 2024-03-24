import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider
    clientId="1067487643732-f4k4d7cnks47e5qffvn0pa12tcq5ipir.apps.googleusercontent.com"
    onSuccess={(credentialResponse) => {
      console.log("hey?");
    }}
    onError={() => {
      console.log("Login Failed");
    }}
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
    ,
  </GoogleOAuthProvider>
);
