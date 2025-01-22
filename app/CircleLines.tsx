"use client";

import dynamic from "next/dynamic";
import React from "react";

const Sketch = dynamic(() => import("react-p5"), {
  ssr: false,
});

interface CircleLinesProps {
  startRadius: number;
  endRadius: number;
  segments: number;
}

export default function CircleLines({
  startRadius,
  endRadius,
  segments,
}: CircleLinesProps) {
  const setup = (p5: any, canvasParentRef: any) => {
    p5.createCanvas(800, 800).parent(canvasParentRef);
  };

  const draw = (p5: any) => {
    p5.clear();
    p5.translate(p5.width / 2, p5.height / 2);

    const segmentAngle = (2 * Math.PI) / segments;

    // 画线
    p5.stroke(0);
    p5.strokeWeight(1);
    for (let i = 0; i < segments; i++) {
      const angle = i * segmentAngle;
      const x = endRadius * Math.cos(angle);
      const y = endRadius * Math.sin(angle);
      p5.line(0, 0, x, y);
    }
  };

  return (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}
