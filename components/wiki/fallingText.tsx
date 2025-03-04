import { useRef, useState, useEffect } from "react";
import Matter from "matter-js";
import "./fallingText.css";

interface FallingTextProps {
  text?: string;
  highlightWords?: string[];
  highlightClass?: string;
  trigger?: "auto" | "scroll" | "click" | "hover";
  backgroundColor?: string;
  wireframes?: boolean;
  gravity?: number;
  mouseConstraintStiffness?: number;
  fontSize?: string;
}

const FallingText: React.FC<FallingTextProps> = ({
  text = "",
  highlightWords = [],
  highlightClass = "highlighted",
  trigger = "auto",
  backgroundColor = "transparent",
  wireframes = false,
  gravity = 1,
  mouseConstraintStiffness = 0.2,
  fontSize = "1rem",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [effectStarted, setEffectStarted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 客户端检查
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!textRef.current) return;
    // 按空格分割词组
    const words = text.split(" ");
    const newHTML = words
      .map((word) => {
        if (!word.trim()) return "";
        const isHighlighted = highlightWords.some((hw) => word.includes(hw));
        // 将每个词组包装在一个span中，内部的字符也各自包装在span中
        const characters = Array.from(word).map(
          (char) => `<span class="character">${char}</span>`
        );
        return `<span class="word-group ${
          isHighlighted ? highlightClass : ""
        }">${characters.join("")}</span>`;
      })
      .filter(Boolean)
      .join(" "); // 添加空格分隔词组
    textRef.current.innerHTML = newHTML;
  }, [text, highlightWords, highlightClass]);

  useEffect(() => {
    if (!isClient) return;

    if (trigger === "auto") {
      setEffectStarted(true);
      return;
    }
    if (trigger === "scroll" && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setEffectStarted(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [trigger, isClient]);

  useEffect(() => {
    if (!isClient || !effectStarted) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } =
      Matter;

    if (
      !containerRef.current ||
      !canvasContainerRef.current ||
      !textRef.current
    )
      return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    if (width <= 0 || height <= 0) {
      console.error("Container has zero dimensions:", { width, height });
      return;
    }

    const engine = Engine.create();
    engine.world.gravity.y = gravity;

    const render = Render.create({
      element: canvasContainerRef.current,
      engine,
      options: {
        width,
        height,
        background: backgroundColor,
        wireframes,
      },
    });

    const boundaryOptions = {
      isStatic: true,
      render: { fillStyle: "transparent" },
    };
    const floor = Bodies.rectangle(
      width / 2,
      height + 25,
      width,
      50,
      boundaryOptions
    );
    const leftWall = Bodies.rectangle(
      -25,
      height / 2,
      50,
      height,
      boundaryOptions
    );
    const rightWall = Bodies.rectangle(
      width + 25,
      height / 2,
      50,
      height,
      boundaryOptions
    );
    const ceiling = Bodies.rectangle(
      width / 2,
      -25,
      width,
      50,
      boundaryOptions
    );

    // 获取所有词组元素
    const wordGroups =
      textRef.current.querySelectorAll<HTMLSpanElement>(".word-group");

    if (wordGroups.length === 0) {
      console.error("No word groups found in:", textRef.current.innerHTML);
      return;
    }

    const wordBodies = Array.from(wordGroups).map((elem) => {
      const rect = elem.getBoundingClientRect();

      // 使用词组的实际宽度和高度
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;

      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        render: { fillStyle: "transparent" },
        restitution: 0.8,
        frictionAir: 0.01,
        friction: 0.2,
      });

      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 5,
        y: 0,
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
      return { elem, body };
    });

    wordBodies.forEach(({ elem, body }) => {
      elem.style.position = "absolute";
      elem.style.left = `${
        body.position.x - body.bounds.max.x + body.bounds.min.x
      }px`;
      elem.style.top = `${
        body.position.y - body.bounds.max.y + body.bounds.min.y
      }px`;
      elem.style.transform = "none";
      elem.style.zIndex = "20";
    });

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: mouseConstraintStiffness,
        render: { visible: false },
      },
    });
    render.mouse = mouse;

    World.add(engine.world, [
      floor,
      leftWall,
      rightWall,
      ceiling,
      mouseConstraint,
      ...wordBodies.map((wb) => wb.body),
    ]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    const updateLoop = () => {
      wordBodies.forEach(({ body, elem }) => {
        const { x, y } = body.position;
        const w = body.bounds.max.x - body.bounds.min.x;
        const h = body.bounds.max.y - body.bounds.min.y;
        elem.style.left = `${x - w / 2}px`;
        elem.style.top = `${y - h / 2}px`;
        elem.style.transform = `rotate(${body.angle}rad)`;
      });
      Matter.Engine.update(engine);
      requestAnimationFrame(updateLoop);
    };
    updateLoop();

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas && canvasContainerRef.current) {
        canvasContainerRef.current.removeChild(render.canvas);
      }
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [
    effectStarted,
    gravity,
    wireframes,
    backgroundColor,
    mouseConstraintStiffness,
    isClient,
  ]);

  const handleTrigger = () => {
    if (!effectStarted && (trigger === "click" || trigger === "hover")) {
      setEffectStarted(true);
    }
  };

  // 初始渲染时只显示静态文本
  if (!isClient) {
    return (
      <div className="falling-text-container" style={{ fontSize }}>
        {text}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="falling-text-container"
      onClick={trigger === "click" ? handleTrigger : undefined}
      onMouseOver={trigger === "hover" ? handleTrigger : undefined}
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        ref={textRef}
        className="falling-text-target"
        style={{
          fontSize: fontSize,
          lineHeight: 1.4,
          display: effectStarted ? "none" : "block",
        }}
      >
        {text}
      </div>
      <div
        ref={canvasContainerRef}
        className="falling-text-canvas"
        style={{
          display: effectStarted ? "block" : "none",
        }}
      />
    </div>
  );
};

export default FallingText;
