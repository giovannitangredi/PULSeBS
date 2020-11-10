// Import deps
import React, { useEffect, useState } from "react";
import { ReservationPage } from "./ReservationPage";
// Import styles
import "./../styles/styles.css";

// Create App component
export const App = () => {
  return (
    <div className="app">
      <ReservationPage></ReservationPage>
    </div>
  );
};
