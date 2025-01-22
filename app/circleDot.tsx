"use client";

import dynamic from "next/dynamic";
import React from "react";

const Sketch = dynamic(() => import("react-p5"), {
  ssr: false,
});

interface CircleDotProps {
  radius: number;
  dotSpeed: number;
}

export default function CircleDot({ radius, dotSpeed }: CircleDotProps) {
  let angle = 0;

  const setup = (p5: any, canvasParentRef: any) => {
    p5.createCanvas(800, 800).parent(canvasParentRef);
  };

  const draw = (p5: any) => {
    p5.clear();
    p5.translate(p5.width / 2, p5.height / 2);

    // circle
    p5.noFill();
    p5.stroke(0);
    p5.ellipse(0, 0, radius * 2, radius * 2); // circle

    // dot
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    p5.fill(0, 0, 0); // dot color
    p5.noStroke();
    p5.ellipse(x, y, 10, 10); // dot size

    angle += dotSpeed; // dot speed
  };

  return (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}
