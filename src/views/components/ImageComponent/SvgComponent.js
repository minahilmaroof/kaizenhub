import React from "react";
import { SvgXml } from "react-native-svg";
import { View } from "react-native";
import AppText from "../AppText";

export default function SvgComponent({ svgMarkup, setWidth, setHeight }) {
  // Ensure svgMarkup is defined and non-empty
  if (!svgMarkup || typeof svgMarkup !== "string") {
    console.error("Invalid or missing SVG markup");
    return (
      <View>
        <AppText>Invalid SVG</AppText>
      </View>
    ); // Optionally render a fallback or error message
  }

  const SvgImage = () => (
    <SvgXml xml={svgMarkup} width={setWidth} height={setHeight} />  );

  return <SvgImage />;
}
