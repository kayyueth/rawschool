"use client";

import dynamic from "next/dynamic";
import React, { useState, useCallback } from "react";

const Sketch = dynamic(() => import("react-p5"), {
  ssr: false,
});

interface ThickProps {
  radius: number;
  texts: string[];
  setSelectedIndex: (index: number) => void;
}

export default function Thick({ radius, texts, setSelectedIndex }: ThickProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const setup = useCallback((p5: any, canvasParentRef: any) => {
    p5.createCanvas(1000, 1000).parent(canvasParentRef);
  }, []);

  const draw = useCallback(
    (p5: any) => {
      p5.clear();
      p5.translate(p5.width / 2, p5.height / 2);

      // 首先对texts数组进行处理，找出重复的月份
      const monthGroups = texts.reduce(
        (acc: { [key: string]: number[] }, text: string, index: number) => {
          if (!acc[text]) {
            acc[text] = [];
          }
          acc[text].push(index);
          return acc;
        },
        {}
      );

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

        // 修改点击事件处理
        if (isNearRing && p5.mouseIsPressed) {
          const clickedMonth = texts[currentHoveredIndex];
          const monthIndices = monthGroups[clickedMonth];
          setSelectedIndex(monthIndices[0]);
          // 添加防抖，避免多次触发
          p5.mouseIsPressed = false;
        }
      }

      if (currentHoveredIndex !== hoveredIndex) {
        setHoveredIndex(currentHoveredIndex);
      }

      // 绘制圆弧
      p5.strokeCap(p5.SQUARE);
      p5.strokeWeight(20);
      p5.noFill();

      // 使用monthGroups绘制合并后的圆弧
      Object.entries(monthGroups).forEach(([month, indices]) => {
        indices.sort((a, b) => a - b);

        let segments: number[][] = [];
        let currentSegment: number[] = [indices[0]];

        for (let i = 1; i < indices.length; i++) {
          if (indices[i] === indices[i - 1] + 1) {
            currentSegment.push(indices[i]);
          } else {
            segments.push([...currentSegment]);
            currentSegment = [indices[i]];
          }
        }
        segments.push(currentSegment);

        // 绘制每个连续段
        segments.forEach((segment) => {
          const startAngle = segment[0] * segmentAngle + gapAngle / 2;
          const endAngle =
            (segment[segment.length - 1] + 1) * segmentAngle - gapAngle / 2;

          // 修改这里的条件判断
          const isHovered = segment.some((idx) => idx === hoveredIndex);
          const isInCurrentMonth =
            currentHoveredIndex !== null &&
            texts[currentHoveredIndex] === month;

          if (isHovered || isInCurrentMonth) {
            p5.stroke(34, 197, 94); // 绿色
          } else {
            p5.stroke(0); // 黑色
          }

          p5.arc(0, 0, radius * 2, radius * 2, startAngle, endAngle);
        });
      });

      // 文本绘制 - 只为每个不同的月份绘制一次文本
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(12);
      p5.textFont("Roboto");
      p5.textStyle(p5.BOLD);

      Object.entries(monthGroups).forEach(([month, indices]) => {
        // 为每组月份选择中间位置显示文本
        const midIndex = indices[Math.floor(indices.length / 2)];
        const angle = midIndex * segmentAngle + segmentAngle / 2;
        const textRadius = radius;

        p5.push();
        const x = textRadius * Math.cos(angle);
        const y = textRadius * Math.sin(angle);
        p5.translate(x, y);
        p5.rotate(angle + Math.PI / 2);
        p5.noStroke();
        p5.fill(indices.includes(hoveredIndex ?? -1) ? 252 : 252, 250, 222);
        p5.text(month, 0, 0);
        p5.pop();
      });
    },
    [radius, texts, hoveredIndex, setSelectedIndex]
  );

  return (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}
