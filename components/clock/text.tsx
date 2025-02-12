// 月份数据
export const text1 = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// 建立数据关联关系
interface MonthData {
  month: string;
  names: string[];
  titles: string[];
}

export const monthData: MonthData[] = [
  {
    month: "JAN",
    names: ["Kurt Pan", "7k", "Kay Yu", "larri"],
    titles: [
      "Crypto Wars: Faked Deaths, Missing Billions and Industry Disruption",
      "The Blockchain and the new architecture of digital trust",
      "Cypherpunks: Freedom and the Future of the Internet",
      "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform",
    ],
  },
  {
    month: "FEB",
    names: ["Shiyu", "Fang Ting", "Twone", "Jocelyn"],
    titles: [
      "The Sovereign Individual: Mastering the Transition to the Information Age",
      "Bitcoin: A Peer-to-Peer Electronic Cash System",
      "Blind Signatures for Untraceable Payments",
      "Trusted Third Parties are Security Holes",
    ],
  },
  {
    month: "MAR",
    names: ["Maymay", "Yijing", "Big Song", "17"],
    titles: [
      "Computer Systems Established, Maintained, and Trusted by Mutually Suspicious Groups",
      "The Crypto Anarchist Manifesto",
      "Cyberspace, Crypto Anarchy, and Pushing Limits",
      "The Theory of Money and Credit",
    ],
  },
  {
    month: "APR",
    names: ["Lauran", "Wingo", "York", "Ada"],
    titles: [
      "The Cyphernomicon",
      "Denationalisation of Money: The Argument Refined",
      "The Idea of Smart Contracts",
      "The Theory of Money and Credit",
    ],
  },
  {
    month: "MAY",
    names: ["Nicholas", "935", "Flytoufu", "yifan"],
    titles: [
      "Money, Blockchains, and Social Scalability",
      "d/acc: one year later",
      "Make Ethereum Cypherpunk Again",
      "The Bitcoin Lightning Network: Scalable Off-Chain Instant Payments",
    ],
  },
  {
    month: "JUN",
    names: ["zhoumo", "cube", "Haotian", "raven"],
    titles: [
      "The Revenue-Evil Curve: a different way to think about prioritizing public goods funding",
      "DAOs are not corporations: where decentralization in autonomous organizations matters",
      "In Defense of Bitcoin Maximalism",
      "Design of a Secure Timestamping Service with Minimal Trust Requirements",
    ],
  },
  {
    month: "JUL",
    names: ["Alexis", "cejay", "Survivor", "Aaron"],
    titles: [
      "Crypto Wars: Faked Deaths, Missing Billions and Industry Disruption",
      "The Blockchain and the new architecture of digital trust",
      "Cypherpunks: Freedom and the Future of the Internet",
      "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform",
    ],
  },
  {
    month: "AUG",
    names: ["Alexis", "cejay", "Survivor", "Aaron"],
    titles: [
      "Crypto Wars: Faked Deaths, Missing Billions and Industry Disruption",
      "The Blockchain and the new architecture of digital trust",
      "Cypherpunks: Freedom and the Future of the Internet",
      "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform",
    ],
  },
  {
    month: "SEP",
    names: ["Alexis", "cejay", "Survivor", "Aaron"],
    titles: [
      "Crypto Wars: Faked Deaths, Missing Billions and Industry Disruption",
      "The Blockchain and the new architecture of digital trust",
      "Cypherpunks: Freedom and the Future of the Internet",
      "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform",
    ],
  },
  {
    month: "OCT",
    names: ["Alexis", "cejay", "Survivor", "Aaron"],
    titles: [
      "Crypto Wars: Faked Deaths, Missing Billions and Industry Disruption",
      "The Blockchain and the new architecture of digital trust",
      "Cypherpunks: Freedom and the Future of the Internet",
      "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform",
    ],
  },
  {
    month: "NOV",
    names: ["Alexis", "cejay", "Survivor", "Aaron"],
    titles: [
      "Crypto Wars: Faked Deaths, Missing Billions and Industry Disruption",
      "The Blockchain and the new architecture of digital trust",
      "Cypherpunks: Freedom and the Future of the Internet",
      "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform",
    ],
  },
  {
    month: "DEC",
    names: ["Alexis", "cejay", "Survivor", "Aaron"],
    titles: [
      "Crypto Wars: Faked Deaths, Missing Billions and Industry Disruption",
      "The Blockchain and the new architecture of digital trust",
      "Cypherpunks: Freedom and the Future of the Internet",
      "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform",
    ],
  },
];

// 导出扁平化的数组，用于显示
export const text2 = monthData.reduce(
  (acc, curr) => [...acc, ...curr.names],
  [] as string[]
);
export const text3 = monthData.reduce(
  (acc, curr) => [...acc, ...curr.titles],
  [] as string[]
);

// 辅助函数：根据月份索引获取关联的名字和标题的索引范围
export function getRelatedIndices(monthIndex: number): {
  nameIndices: number[];
  titleIndices: number[];
} {
  let nameStartIndex = 0;
  let titleStartIndex = 0;

  for (let i = 0; i < monthIndex; i++) {
    nameStartIndex += monthData[i].names.length;
    titleStartIndex += monthData[i].titles.length;
  }

  return {
    nameIndices: Array.from(
      { length: monthData[monthIndex].names.length },
      (_, i) => nameStartIndex + i
    ),
    titleIndices: Array.from(
      { length: monthData[monthIndex].titles.length },
      (_, i) => titleStartIndex + i
    ),
  };
}
