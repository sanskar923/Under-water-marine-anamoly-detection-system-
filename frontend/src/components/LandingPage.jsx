import React from "react";
import vSonar from "../assets/stage1_sonar.mp4";
import vGeo from "../assets/stage2_geospatial.mp4";
import vModem from "../assets/stage3_modem.mp4";
import vHazard from "../assets/stage4_hazard.mp4";
import LandingHero from "./LandingHero";
import HardwareSpecs from "./HardwareSpecs";

export default function LandingPage({ onScrollToConsole, operatorName }) {
  return (
    <div className="w-full flex flex-col bg-transparent">
      <LandingHero onScrollToConsole={onScrollToConsole} operatorName={operatorName} />
      <HardwareSpecs />
    </div>
  );
}
