import React, { useState, useCallback, useRef, useEffect } from "react";

interface ConceptCard {
  id: string;
  title: string;
  frontContent: string;
  backContent: string;
  author: string;
  source: string;
  type: string;
  aiGenerated: boolean;
}

interface FlipCardProps {
  card: ConceptCard;
  onViewDetail?: (title: string) => void;
}

const flipCardStyles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  
  .backface-hidden {
    backface-visibility: hidden;
  }
  
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
`;

const FlipCard: React.FC<FlipCardProps> = ({ card, onViewDetail }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Use requestAnimationFrame to batch the state update with the next frame
    animationFrameRef.current = requestAnimationFrame(() => {
      setIsFlipped((prev) => !prev);
    });
  }, []);

  const handleViewDetails = useCallback(
    (e: React.MouseEvent, title: string) => {
      e.stopPropagation();
      if (onViewDetail) {
        onViewDetail(title);
      }
    },
    [onViewDetail]
  );

  return (
    <>
      <style jsx global>
        {flipCardStyles}
      </style>
      <div
        ref={cardRef}
        className="md:h-[400px] h-[280px] w-full perspective-1000 cursor-pointer"
        onClick={handleCardClick}
      >
        <div
          className={`relative w-full md:h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
        >
          {/* card front */}
          <div
            className="absolute w-full md:h-full bg-[#FCFADE] rounded-lg shadow-xl p-6 flex flex-col border border-black"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(0deg)",
            }}
          >
            <h3 className="md:text-2xl text-xl font-bold border-b-2 border-black pb-2">
              {card.title}
            </h3>
            <p className="md:text-lg text-sm mt-4 flex-grow">
              {card.frontContent}
            </p>
            <div className="mt-4 text-sm text-black/60">
              <button
                className="bg-black text-white px-4 py-1 rounded hover:bg-black/70 transition-colors"
                onClick={(e) => handleViewDetails(e, card.title)}
              >
                View Details
              </button>
            </div>
          </div>

          {/* card back */}
          <div
            className="absolute w-full md:h-full bg-black text-white rounded-lg shadow-xl p-6 flex flex-col"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <h3 className="md:text-2xl text-xl font-bold border-b-2 border-white pb-2">
              {card.title}
            </h3>
            <p className="md:text-lg text-sm mt-4 flex-grow">
              {card.backContent}
            </p>
            <div className="mt-4 text-sm">
              <p>作者: {card.author}</p>
              <p>来源: {card.source}</p>
              <button
                className="mt-2 bg-white text-black px-4 py-1 rounded hover:bg-white/70 transition-colors"
                onClick={(e) => handleViewDetails(e, card.title)}
              >
                View Full Content
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(FlipCard);
