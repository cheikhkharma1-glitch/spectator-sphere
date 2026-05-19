import { motion } from "framer-motion";
import { Team } from "@/lib/teams";

type Props = {
  team: Team;
  className?: string;
  waving?: boolean;
};

/** Drapeau générique animé (bandes + emblème). */
export const TeamFlag = ({ team, className = "h-10 w-16", waving = true }: Props) => {
  const { stripes, orientation, emblem, emblemColor, emblemPosition = "center" } = team.flag;
  const isVertical = orientation === "vertical";

  return (
    <motion.div
      className={`relative overflow-hidden rounded-md shadow-lg ring-1 ring-white/10 ${className}`}
      animate={waving ? { rotate: [-1.5, 1.5, -1.5], skewY: [-1, 1, -1] } : undefined}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "left center" }}
    >
      <div className={`absolute inset-0 flex ${isVertical ? "flex-row" : "flex-col"}`}>
        {stripes.map((color, i) => {
          const isEmblemStripe =
            emblem && emblem !== "none" &&
            ((emblemPosition === "center" && i === Math.floor(stripes.length / 2)) ||
              (emblemPosition === "left" && i === 0) ||
              (emblemPosition === "right" && i === stripes.length - 1));
          return (
            <div
              key={i}
              className="flex-1 relative flex items-center justify-center"
              style={{ background: `hsl(${color})` }}
            >
              {isEmblemStripe && emblem === "star" && (
                <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 drop-shadow-sm" style={{ fill: `hsl(${emblemColor})` }}>
                  <polygon points="12,2 14.9,9.2 22.5,9.5 16.5,14.2 18.6,21.5 12,17.3 5.4,21.5 7.5,14.2 1.5,9.5 9.1,9.2" />
                </svg>
              )}
              {isEmblemStripe && emblem === "crescent" && (
                <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 drop-shadow-sm" style={{ fill: `hsl(${emblemColor})` }}>
                  <path d="M16 4a8 8 0 100 16 6.5 6.5 0 010-16z" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
      {/* Reflet animé */}
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        animate={{ x: ["-120%", "320%"] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};