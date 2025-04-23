import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface ConceptCard {
  id: string;
  title: string;
  frontContent: string;
  backContent: string;
  editor: string;
  chapter: string;
  type: string;
  aiGenerated: boolean;
  date: string;
  bookTitle?: string | null;
  page?: string | null;
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

  .markdown-content a {
    color: #0066cc;
    text-decoration: underline;
    font-weight: 500;
  }

  .markdown-content a:hover {
    color: #004080;
    text-decoration: none;
  }

  .markdown-content ul, .markdown-content ol {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }

  .markdown-content ul {
    list-style-type: disc;
  }

  .markdown-content ol {
    list-style-type: decimal;
  }
`;

const FlipCard: React.FC<FlipCardProps> = ({ card, onViewDetail }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      // Format as YYYY-MM-DD
      return date.toISOString().split("T")[0];
    } catch (error) {
      return dateString;
    }
  };

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
            <div className="md:text-lg text-sm mt-4 flex-grow overflow-y-auto markdown-content">
              <ReactMarkdown>{card.frontContent}</ReactMarkdown>
            </div>
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
            <div className="mt-4 flex-grow overflow-y-auto">
              {card.bookTitle && (
                <p className="md:text-lg text-sm mb-2">
                  Source: {card.bookTitle}
                </p>
              )}
              <p className="md:text-lg text-sm mb-2">Chapter: {card.chapter}</p>
              {card.page && (
                <p className="md:text-lg text-sm mb-2">Page: {card.page}</p>
              )}
              <p className="md:text-lg text-sm mb-2">Editor: {card.editor}</p>
              <p className="md:text-lg text-sm mb-2">Type: {card.type}</p>
              <p className="md:text-lg text-sm mb-2">
                Date: {formatDate(card.date)}
              </p>
              {card.aiGenerated && (
                <p className="md:text-lg text-sm mb-2">AI generated: Yes</p>
              )}
            </div>
            <div className="text-sm">
              <button
                className=" bg-white text-black px-4 py-1 rounded hover:bg-white/70 transition-colors"
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
