"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    question: "读书会如何运作？",
    answer:
      "我们每个月会选择一本书进行阅读和讨论。每次活动都会邀请特别嘉宾分享他们的见解和经验。我们鼓励所有成员积极参与讨论，分享自己的想法和感受。",
  },
  {
    question: "如何加入读书会？",
    answer:
      "您可以通过发送邮件到 bookclub@example.com 申请加入。请在邮件中简单介绍自己，以及加入读书会的原因。我们会在收到申请后尽快回复您。",
  },
  {
    question: "活动时间和地点？",
    answer:
      "我们通常在每月的最后一个周六下午2点举行线下活动。具体地点会提前一周通过邮件通知所有成员。同时，我们也会提供线上参与的方式。",
  },
  {
    question: "需要准备什么？",
    answer:
      "主要是阅读当月选定的书籍，并准备一些想要讨论的问题或观点。如果您想要分享更多见解，也可以准备简短的演讲。",
  },
  {
    question: "是否收费？",
    answer:
      "读书会本身不收取会费。但是，您需要自行购买讨论的书籍。有时我们也会组织一些特别活动，可能会收取少量费用用于场地租用等支出。",
  },
];

export function Accordion() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  return (
    <div className="w-full space-y-4">
      {faqItems.map((item, index) => (
        <div
          key={index}
          className="border border-black rounded-lg overflow-hidden"
        >
          <button
            className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
            onClick={() => setOpenItem(openItem === index ? null : index)}
          >
            <span className="text-lg font-semibold">{item.question}</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                openItem === index ? "transform rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`px-6 py-4 bg-white transition-all duration-200 ease-in-out ${
              openItem === index ? "block" : "hidden"
            }`}
          >
            <p className="text-gray-600">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
