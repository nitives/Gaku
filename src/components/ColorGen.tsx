import Color, { Palette } from "color-thief-react";
import React from "react";

export const ColorGen = ({ src }: { src: string }) => {
  return (
    <div>
      <>
        <Palette
          src={src}
          crossOrigin="anonymous"
          format="hslString"
          quality={1}
          colorCount={2}
        >
          {({ data, loading }) => {
            if (loading) return null;
            if (data) {
              document.documentElement.style.setProperty(
                "--palette-1",
                `${data[0]}`
              );
              document.documentElement.style.setProperty(
                "--palette-2",
                `${data[1]}`
              );
              let hslParts1 = data[0].match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
              if (hslParts1) {
                let hue = hslParts1[1];
                let saturation = hslParts1[2];
                let lightness = Math.min(parseInt(hslParts1[3]) + 20, 85);
                let newHSL = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                document.documentElement.style.setProperty(
                  "--palette-1",
                  newHSL
                );
              }
            }
          }}
        </Palette>
        <Color src={src} crossOrigin="anonymous" format="hslString" quality={1}>
          {({ data, loading }) => {
            if (loading) return null;
            if (data) {
              document.documentElement.style.setProperty("--theme", `${data}`);
              let hslParts = data.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
              if (hslParts) {
                let hue = hslParts[1];
                let saturation = Math.min(parseInt(hslParts[2]) + 25, 100);
                let lightness = Math.min(parseInt(hslParts[3]) + 20, 85);
                let newHSL = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                document.documentElement.style.setProperty("--ambient", newHSL);
              }
            }
          }}
        </Color>
      </>
    </div>
  );
};
