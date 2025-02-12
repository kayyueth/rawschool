"use client";

import dynamic from "next/dynamic";
import React, { useState, useCallback } from "react";

const Sketch = dynamic(() => import("react-p5"), {
  ssr: false,
});

interface CircleTextProps {
  radius: number;
  texts: string[];
  setSelectedIndex: (index: number | null) => void;
}

export default function Thick({
  radius,
  texts,
  setSelectedIndex,
}: CircleTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const segmentCount = texts.length;

  const setup = useCallback((p5: any, canvasParentRef: any) => {
    p5.createCanvas(1000, 1000).parent(canvasParentRef);
  }, []);

  const draw = useCallback(
    (p5: any) => {
      p5.clear();
      p5.translate(p5.width / 2, p5.height / 2);

      const segmentAngle = (2 * Math.PI) / texts.length;
      const gapAngle = 4 / radius;

      // 检查鼠标位置
      const mouseX = p5.mouseX - p5.width / 2;
      const mouseY = p5.mouseY - p5.height / 2;
      const mouseAngle = Math.atan2(mouseY, mouseX);
      const mouseDistance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);

      // 计算鼠标是否在圆环附近
      const isNearRing = Math.abs(mouseDistance - radius) < 20;

      // 计算当前鼠标悬停的段索引
      let currentHoveredIndex = null;
      if (isNearRing) {
        let angle = mouseAngle;
        if (angle < 0) angle += 2 * Math.PI;
        currentHoveredIndex = Math.floor(
          (angle / (2 * Math.PI)) * texts.length
        );

        // 添加鼠标点击事件处理
        if (p5.mouseIsPressed) {
          setSelectedIndex(currentHoveredIndex);
        }
      }

      if (currentHoveredIndex !== hoveredIndex) {
        setHoveredIndex(currentHoveredIndex);
      }

      // 绘制圆弧
      p5.strokeCap(p5.SQUARE);
      p5.strokeWeight(20);
      p5.noFill();

      for (let i = 0; i < texts.length; i++) {
        const startAngle = i * segmentAngle + gapAngle / 2;
        const endAngle = (i + 1) * segmentAngle - gapAngle / 2;

        if (i === hoveredIndex) {
          p5.stroke(34, 197, 94); // 绿色
        } else {
          p5.stroke(0); // 黑色
        }

        p5.arc(0, 0, radius * 2, radius * 2, startAngle, endAngle);
      }

      // 文本
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
        p5.fill(i === hoveredIndex ? 252 : 252, 250, 222);
        p5.text(texts[i], 0, 0);
        p5.pop();
      }
    },
    [radius, texts, hoveredIndex, setSelectedIndex]
  );

  return (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}
