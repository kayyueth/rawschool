"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function JoinUs() {
  return (
    <div className="w-full max-w-3xl mx-auto mt-20 px-4">
      <h2 className="text-3xl font-bold mb-8 text-center">Join Raw Bookclub</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-xl">
            What is Raw Bookclub?
          </AccordionTrigger>
          <AccordionContent>
            Raw Bookclub is a community-driven book discussion group focused on
            exploring cutting-edge topics in science, technology, and
            decentralization. We meet monthly to discuss selected readings and
            host special guests from the field.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-xl">How to Join?</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>Join our Discord community</li>
              <li>Attend our monthly virtual meetings</li>
              <li>Participate in book discussions</li>
              <li>Share your thoughts and reviews</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-xl">
            Meeting Schedule
          </AccordionTrigger>
          <AccordionContent>
            We meet every last Thursday of the month at 20:00 UTC. Sessions
            typically last for 1-1.5 hours and include both book discussion and
            Q&A with guest speakers when available.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger className="text-xl">
            Community Guidelines
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be respectful and inclusive</li>
              <li>Engage in constructive discussions</li>
              <li>Share knowledge and experiences</li>
              <li>Support fellow community members</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
