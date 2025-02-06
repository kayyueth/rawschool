"use client";

import dynamic from "next/dynamic";
import React from "react";

const Sketch = dynamic(() => import("react-p5"), {
  ssr: false,
});

interface CenterProps {
  radius: number;
  text: string;
}

export default function Center({ radius, text }: CenterProps) {
  const setup = (p5: any, canvasParentRef: any) => {
    p5.createCanvas(1000, 1000).parent(canvasParentRef);
  };

  const draw = (p5: any) => {
    p5.clear();
    p5.translate(p5.width / 2, p5.height / 2);

    // 先画一个填充的白色圆形
    p5.fill(252, 250, 222);
    p5.ellipse(0, 0, radius * 2, radius * 2);

    // 文字设置
    p5.fill(0); // 把文字颜色改成黑色，这样在白色背景上更清晰
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(10);

    // 计算每个字符的角度间隔
    const characters = text.split("");
    const anglePerChar = Math.PI / characters.length;

    // 绘制每个字符
    characters.forEach((char, i) => {
      const angle = -Math.PI + i * anglePerChar; // 从-90度开始,这样文字会在圆的上方
      p5.push();
      p5.rotate(angle);
      p5.translate(radius / 1.3, 0);
      p5.rotate(Math.PI / 2);
      p5.text(char, 0, 0);
      p5.pop();
    });
  };

  return (
    <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}
