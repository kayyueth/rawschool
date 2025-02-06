"use client";

import Center from "./center";
import Dot from "./dot";
import Line from "./line";
import Thick from "./thick";
import Name from "./name";
import Title from "./title";
import { text1, text2, text3 } from "./text";

export default function Clock() {
  return (
    <div style={{ position: "relative", width: "1000px", height: "950px" }}>
      {/* center */}
      <Center radius={60} text={"RAW SCHOOL"} />
      <Line startRadius={60} endRadius={160} segments={36} />
      <Dot radius={80} dotSpeed={0.002} text="YEAR" />
      <Dot radius={100} dotSpeed={-0.003} text="SEASON" />
      <Dot radius={120} dotSpeed={0.004} text="MONTH" />
      <Dot radius={140} dotSpeed={-0.005} text="WEEK" />
      <Dot radius={160} dotSpeed={0.006} text="DAY" />
      {/* outer ring */}
      <Thick radius={195} texts={text1} />
      <Name radius={220} text={text2} />
      <Title radius={290} text={text3} />
    </div>
  );
}
