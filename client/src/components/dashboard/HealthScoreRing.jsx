import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "../ui/Skeleton";
export const HealthScoreRing = ({ score, isLoading }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    let timer;
    if (score !== void 0 && !isLoading) {
      timer = setTimeout(() => {
        setAnimatedScore(score);
      }, 100);
    } else {
      timer = setTimeout(() => {
        setAnimatedScore(0);
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [score, isLoading]);
  if (isLoading) {
    return <div className="w-[120px] h-[120px] rounded-full overflow-hidden shrink-0">
        <Skeleton borderRadius="50%" />
      </div>;
  }
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const displayScore = score ?? 0;
  const strokeDashoffset = circumference - animatedScore / 100 * circumference;
  let color = "var(--semantic-danger)";
  if (displayScore >= 80) color = "var(--score-excellent)";
  else if (displayScore >= 60) color = "var(--score-good)";
  else if (displayScore >= 40) color = "var(--score-medium)";
  return <div className="relative w-[120px] h-[120px] flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle
    cx="60"
    cy="60"
    r={radius}
    stroke="var(--surface-border)"
    strokeWidth="8"
    fill="transparent"
  />
        <motion.circle
    cx="60"
    cy="60"
    r={radius}
    stroke={color}
    strokeWidth="8"
    fill="transparent"
    strokeLinecap="round"
    initial={{ strokeDashoffset: circumference }}
    animate={{ strokeDashoffset }}
    transition={{ duration: 1.5, ease: "easeOut" }}
    style={{ strokeDasharray: circumference }}
  />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-display text-text-primary m-0" style={{ fontSize: "32px" }}>
          {displayScore.toFixed(0)}
        </span>
        <span className="text-body text-text-secondary text-sm">/100</span>
      </div>
    </div>;
};
