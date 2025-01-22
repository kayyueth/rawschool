"use client";

import dynamic from "next/dynamic";
import React from "react";

const Sketch = dynamic(() => import("react-p5"), {
  ssr: false,
});

interface CircleExternalProps {
  radius: number;
  text: string[];
  textSize?: number;
}

export default function CircleExternal({
  radius,
  text,
  textSize = 12,
}: CircleExternalProps) {
  const setup = (p5: any, canvasParentRef: any) => {
    p5.createCanvas(800, 800).parent(canvasParentRef);
  };

  const draw = (p5: any) => {
    p5.clear();
    p5.translate(p5.width / 2, p5.height / 2);
    p5.textSize(textSize);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textFont("Roboto");
    p5.textStyle(p5.NORMAL);

    const segmentAngle = (2 * Math.PI) / text.length;

    // text and underline
    text.forEach((text, i) => {
      const angle = i * segmentAngle;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      p5.push();
      p5.translate(x, y);

      if (x < 0) {
        p5.rotate(angle + Math.PI);
      } else {
        p5.rotate(angle + Math.PI * 2);
      }

      // Draw text
      p5.noStroke();
      p5.text(text, 0, 0);

      // Draw underline
      p5.stroke(0);
      p5.strokeWeight(1);
      const textWidth = p5.textWidth(text);
      p5.line(-textWidth / 2, 10, textWidth / 2, 10); // 在文本下方10像素处画线

      p5.pop();
    });
  };

  return (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}
