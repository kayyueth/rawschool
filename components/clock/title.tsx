"use client";

import dynamic from "next/dynamic";
import React, { useCallback } from "react";
import { getRelatedIndices } from "./text";

const Sketch = dynamic(() => import("react-p5"), {
  ssr: false,
});

interface CircleExternalProps {
  radius: number;
  text: string[];
  textSize?: number;
  selectedIndex: number | null;
}

export default function Title({
  radius,
  text,
  textSize = 9,
  selectedIndex,
}: CircleExternalProps) {
  const setup = useCallback((p5: any, canvasParentRef: any) => {
    p5.createCanvas(1000, 1000).parent(canvasParentRef);
  }, []);

  const draw = useCallback(
    (p5: any) => {
      p5.clear();
      p5.translate(p5.width / 2, p5.height / 2);
      p5.textSize(textSize);
      p5.textFont("Roboto");
      p5.textStyle(p5.NORMAL);

      const segmentAngle = (2 * Math.PI) / text.length;

      text.forEach((textContent, i) => {
        const angle = i * segmentAngle;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        p5.push();
        p5.translate(x, y);

        if (selectedIndex !== null) {
          const { titleIndices } = getRelatedIndices(selectedIndex);
          if (titleIndices.includes(i)) {
            p5.fill(0);
          } else {
            p5.fill(180);
          }
        } else {
          p5.fill(0);
        }

        if (x < 0) {
          p5.rotate(angle + Math.PI);
          p5.textAlign(p5.RIGHT, p5.CENTER);
          const lines = textContent.match(/.{1,21}/g) || [textContent];
          lines.forEach((line, index) => {
            p5.text(line, 0, index * textSize);
          });
        } else {
          p5.rotate(angle);
          p5.textAlign(p5.LEFT, p5.CENTER);
          const lines = textContent.match(/.{1,21}/g) || [textContent];
          lines.forEach((line, index) => {
            p5.text(line, 0, index * textSize);
          });
        }

        p5.pop();
      });
    },
    [radius, text, textSize, selectedIndex]
  );

  return (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}
