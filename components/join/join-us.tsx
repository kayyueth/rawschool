"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import Stories from "./stories";

export default function JoinUs() {
  return (
    <div className="flex mt-20 ml-20 justify-between">
      {/* nav at left */}
      <div className="w-1/4 ml-20">
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
                <button>Community Stories</button>
                <button>Project Raw School</button>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-xl font-bold">
              Raw School
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col items-start space-y-2">
                <button>Past Events</button>
                <button>Semester Application</button>
                <button>Bookclub Subscription</button>
                <button>Volunteer & Contribution</button>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* content */}
      <div className="w-1/2 mr-40">
        <Stories />
      </div>
    </div>
  );
}
