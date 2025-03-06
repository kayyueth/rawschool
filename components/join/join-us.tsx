"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import Stories from "./stories";
import Project from "./project";
import Past from "./past";
import Application from "./application";
import Volunteer from "./volunteer";

export default function JoinUs() {
  const [selectedContent, setSelectedContent] = useState<string>("stories");

  // Content mapping
  const renderContent = () => {
    switch (selectedContent) {
      case "stories":
        return <Stories />;
      case "project":
        return <Project />;
      case "past":
        return <Past />;
      case "application":
        return <Application />;
      case "volunteer":
        return <Volunteer />;
      default:
        return <Stories />;
    }
  };

  return (
    <div className="md:flex md:mt-20 md:ml-20 justify-between">
      {/* nav at left */}
      <div className="md:w-1/5 w-full md:ml-20 px-8 md:px-0">
        <Accordion
          type="multiple"
          defaultValue={["item-1", "item-2"]}
          className=""
        >
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-xl font-bold">
              Uncommons
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col items-start space-y-2">
                <button
                  onClick={() => setSelectedContent("stories")}
                  className={`hover:text-gray-600 transition-colors ${
                    selectedContent === "stories"
                      ? "text-blue-600 font-medium"
                      : ""
                  }`}
                >
                  Community Stories
                </button>
                <button
                  onClick={() => setSelectedContent("project")}
                  className={`hover:text-gray-600 transition-colors ${
                    selectedContent === "project"
                      ? "text-blue-600 font-medium"
                      : ""
                  }`}
                >
                  Project Raw School
                </button>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-xl font-bold">
              Raw School
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col items-start space-y-2">
                <button
                  onClick={() => setSelectedContent("past")}
                  className={`hover:text-gray-600 transition-colors ${
                    selectedContent === "past"
                      ? "text-blue-600 font-medium"
                      : ""
                  }`}
                >
                  Past Events
                </button>
                <button
                  onClick={() => setSelectedContent("application")}
                  className={`hover:text-gray-600 transition-colors ${
                    selectedContent === "application"
                      ? "text-blue-600 font-medium"
                      : ""
                  }`}
                >
                  Application & Subscription
                </button>
                <button
                  onClick={() => setSelectedContent("volunteer")}
                  className={`hover:text-gray-600 transition-colors ${
                    selectedContent === "volunteer"
                      ? "text-blue-600 font-medium"
                      : ""
                  }`}
                >
                  Volunteer & Donation
                </button>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* content */}
      <div className="md:w-[60%] w-full md:mr-40 px-8 md:px-0">
        {renderContent()}
      </div>
    </div>
  );
}
