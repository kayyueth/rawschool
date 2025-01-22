"use client";

import Center from "./center";
import CircleDot from "./circleDot";
import CircleThick from "./circleThick";
import CircleText from "./circleText";
import CircleText2 from "./circleText2";
import CircleLines from "./CircleLines";
import { text1, text2, text3 } from "./text";

export default function Home() {
  return (
    <div style={{ position: "relative", width: "400px", height: "400px" }}>
      <CircleLines startRadius={60} endRadius={160} segments={36} />
      <Center radius={60} text={"RAW SCHOOL"} />
      <CircleThick radius={195} texts={text1} />
      <CircleDot radius={80} dotSpeed={0.002} text="YEAR" />
      <CircleDot radius={100} dotSpeed={-0.003} text="SEASON" />
      <CircleDot radius={120} dotSpeed={0.004} text="MONTH" />
      <CircleDot radius={140} dotSpeed={-0.005} text="WEEK" />
      <CircleDot radius={160} dotSpeed={0.006} text="DAY" />
      <CircleText radius={220} text={text2} />
      <CircleText2 radius={290} text={text3} />
    </div>
  );
}
