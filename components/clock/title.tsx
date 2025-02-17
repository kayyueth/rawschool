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

export default function Title({
  radius,
  text,
  textSize = 9,
  selectedIndex,
  selectedIndices,
  onSelect,
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
      const mouseX = p5.mouseX - p5.width / 2;
      const mouseY = p5.mouseY - p5.height / 2;
      const mouseAngle = Math.atan2(mouseY, mouseX);

      text.forEach((textContent, i) => {
        const angle = i * segmentAngle;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        // 检查鼠标是否在当前文本区域
        const textX = p5.width / 2 + x;
        const textY = p5.height / 2 + y;
        const lines = textContent.match(/.{1,21}/g) || [textContent];
        const totalHeight = lines.length * textSize;
        const maxWidth = Math.max(...lines.map((line) => p5.textWidth(line)));

        const isHovered =
          p5.mouseX > textX - maxWidth / 2 &&
          p5.mouseX < textX + maxWidth / 2 &&
          p5.mouseY > textY - totalHeight / 2 &&
          p5.mouseY < textY + totalHeight / 2;

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
        } else if (selectedIndices.length > 0) {
          // 只有在有选中项时才显示灰色
          if (selectedIndices.includes(i)) {
            p5.fill(0);
          } else {
            p5.fill(180);
          }
        } else {
          // 默认状态显示黑色
          p5.fill(0);
        }

        if (x < 0) {
          p5.rotate(angle + Math.PI);
          p5.textAlign(p5.RIGHT, p5.CENTER);
          lines.forEach((line, index) => {
            p5.text(line, 0, index * textSize);
          });
        } else {
          p5.rotate(angle);
          p5.textAlign(p5.LEFT, p5.CENTER);
          lines.forEach((line, index) => {
            p5.text(line, 0, index * textSize);
          });
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
