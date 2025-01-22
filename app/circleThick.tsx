"use client";

import dynamic from "next/dynamic";
import React from "react";

const Sketch = dynamic(() => import("react-p5"), {
  ssr: false,
});

interface CircleTextProps {
  radius: number;
  texts: string[];
}

export default function CircleThick({ radius, texts }: CircleTextProps) {
  const segmentCount = texts.length;

  const setup = (p5: any, canvasParentRef: any) => {
    p5.createCanvas(800, 800).parent(canvasParentRef);
  };

  const draw = (p5: any) => {
    p5.clear();
    p5.translate(p5.width / 2, p5.height / 2);

    const segmentAngle = (2 * Math.PI) / texts.length;
    const gapAngle = 4 / radius;

    // arc
    p5.strokeCap(p5.SQUARE);
    p5.strokeWeight(20);
    p5.noFill();
    p5.stroke(0);

    for (let i = 0; i < texts.length; i++) {
      const startAngle = i * segmentAngle + gapAngle / 2;
      const endAngle = (i + 1) * segmentAngle - gapAngle / 2;

      p5.arc(0, 0, radius * 2, radius * 2, startAngle, endAngle);
    }

    // text
    p5.fill(255, 255, 255);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(12);
    p5.textFont("Roboto");
    p5.textStyle(p5.BOLD);

    for (let i = 0; i < segmentCount; i++) {
      const angle = i * segmentAngle + segmentAngle / 2;
      const textRadius = radius;
      p5.push();
      const x = textRadius * Math.cos(angle);
      const y = textRadius * Math.sin(angle);
      p5.translate(x, y);
      p5.rotate(angle + Math.PI / 2);
      p5.noStroke();
      p5.text(texts[i], 0, 0);
      p5.pop();
    }
  };

  return <Sketch setup={setup} draw={draw} />;
}
