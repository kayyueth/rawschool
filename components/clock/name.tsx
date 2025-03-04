"use client";

import dynamic from "next/dynamic";
import React, { useCallback } from "react";

const Sketch = dynamic(() => import("react-p5"), {
  ssr: false,
});

interface CircleExternalProps {
  radius: number;
  text: string[];
  textSize?: number;
  selectedIndex: number | null;
  selectedIndices: number[];
  onSelect?: (index: number) => void;
}

export default function Name({
  radius,
  text,
  textSize = 14,
  selectedIndex,
  selectedIndices,
  onSelect,
}: CircleExternalProps) {
  const setup = (p5: any, canvasParentRef: any) => {
    p5.createCanvas(800, 800).parent(canvasParentRef);
  };

  const draw = useCallback(
    (p5: any) => {
      p5.clear();
      p5.translate(p5.width / 2, p5.height / 2);
      p5.textSize(textSize);
      p5.textFont("Roboto");
      p5.textStyle(p5.BOLD);

      const segmentAngle = (2 * Math.PI) / text.length;
      const mouseX = p5.mouseX - p5.width / 2;
      const mouseY = p5.mouseY - p5.height / 2;
      const mouseAngle = Math.atan2(mouseY, mouseX);

      text.forEach((text, i) => {
        const angle = i * segmentAngle;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const lineOffset = p5.textDescent() + 2;

        // 检查鼠标是否在当前文本区域
        const textX = p5.width / 2 + x;
        const textY = p5.height / 2 + y;
        const textWidth = p5.textWidth(text);
        const textHeight = textSize * 1.5;
        const isHovered =
          p5.mouseX > textX - textWidth / 2 &&
          p5.mouseX < textX + textWidth / 2 &&
          p5.mouseY > textY - textHeight / 2 &&
          p5.mouseY < textY + textHeight / 2;

        // 处理点击事件
        if (isHovered && p5.mouseIsPressed && onSelect) {
          onSelect(i);
          p5.mouseIsPressed = false;
        }

        p5.push();
        p5.translate(x, y);

        // 根据选中状态和悬停状态设置颜色
        if (isHovered) {
          p5.fill("#22c55e");
          p5.stroke("#22c55e");
        } else if (selectedIndices.length > 0) {
          // 只有在有选中项时才显示灰色
          if (selectedIndices.includes(i)) {
            p5.fill(0);
            p5.stroke(0);
          } else {
            p5.fill(180);
            p5.stroke(180);
          }
        } else {
          // 默认状态显示黑色
          p5.fill(0);
          p5.stroke(0);
        }

        if (x < 0) {
          p5.rotate(angle + Math.PI);
          p5.textAlign(p5.RIGHT, p5.CENTER);

          // Draw text
          p5.noStroke();
          p5.text(text, 0, 0);

          // Draw underline
          p5.stroke(
            isHovered
              ? "#22c55e"
              : selectedIndices.length > 0
              ? selectedIndices.includes(i)
                ? 0
                : 180
              : 0
          );
          p5.strokeWeight(1);
          const textWidth = p5.textWidth(text);
          p5.line(-textWidth, lineOffset, 0, lineOffset);
        } else {
          p5.rotate(angle + Math.PI * 2);
          p5.textAlign(p5.LEFT, p5.CENTER);

          // Draw text
          p5.noStroke();
          p5.text(text, 0, 0);

          // Draw underline
          p5.stroke(
            isHovered
              ? "#22c55e"
              : selectedIndices.length > 0
              ? selectedIndices.includes(i)
                ? 0
                : 180
              : 0
          );
          p5.strokeWeight(1);
          const textWidth = p5.textWidth(text);
          p5.line(0, lineOffset, textWidth, lineOffset);
        }

        p5.pop();
      });
    },
    [radius, text, textSize, selectedIndex, selectedIndices, onSelect]
  );

  return (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}
