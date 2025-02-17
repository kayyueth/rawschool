"use client";

import dynamic from "next/dynamic";
import React, { useRef } from "react";

const Sketch = dynamic(() => import("react-p5"), {
  ssr: false,
});

interface CircleDotProps {
  radius: number;
  dotSpeed: number;
  text?: string;
}

export default function Dot({
  radius,
  dotSpeed,
  text = "TEXT",
}: CircleDotProps) {
  // 使用 useRef 来保持 angle 的值在重渲染之间保持不变
  const angleRef = useRef(0);

  // 使用 useCallback 来缓存这些函数，防止不必要的重新创建
  const setup = React.useCallback((p5: any, canvasParentRef: any) => {
    p5.createCanvas(800, 800).parent(canvasParentRef);
  }, []);

  const draw = React.useCallback(
    (p5: any) => {
      p5.clear();
      p5.translate(p5.width / 2, p5.height / 2);

      // circle
      p5.noFill();
      p5.stroke(0);
      p5.ellipse(0, 0, radius * 2, radius * 2);

      // 先绘制文本和背景
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(12);

      // 上部文本背景
      p5.fill(252, 250, 222);
      p5.noStroke();
      p5.rect(-30, -radius - 10, 60, 20);

      // 下部文本背景
      p5.rect(-30, radius - 10, 60, 20);

      // 绘制文本
      p5.fill(0);
      p5.text(text, 0, -radius);
      p5.text(text, 0, radius);

      // 最后绘制 dot，确保它在最上层
      const x = radius * Math.cos(angleRef.current);
      const y = radius * Math.sin(angleRef.current);
      p5.fill(0, 0, 0);
      p5.noStroke();
      p5.ellipse(x, y, 10, 10);

      angleRef.current += dotSpeed;
    },
    [radius, dotSpeed, text]
  ); // 添加依赖项

  return (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}
