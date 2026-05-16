import { motion } from "framer-motion";

type Props = {
  className?: string;
  waving?: boolean;
};

/**
 * Drapeau du Sénégal animé (effet ondulation).
 * Bandes verticales vert / jaune / rouge avec étoile verte au centre.
 */
export const SenegalFlag = ({ className = "h-10 w-16", waving = true }: Props) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-md shadow-lg ring-1 ring-white/10 ${className}`}
      animate={
        waving
          ? { rotate: [-1.5, 1.5, -1.5], skewY: [-1, 1, -1] }
          : undefined
      }
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "left center" }}
    >
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-[hsl(140,70%,32%)]" />
        <div className="flex-1 bg-[hsl(48,100%,50%)] relative flex items-center justify-center">
          {/* Étoile verte à 5 branches */}
          <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 fill-[hsl(140,70%,32%)] drop-shadow-sm">
            <polygon points="12,2 14.9,9.2 22.5,9.5 16.5,14.2 18.6,21.5 12,17.3 5.4,21.5 7.5,14.2 1.5,9.5 9.1,9.2" />
          </svg>
        </div>
        <div className="flex-1 bg-[hsl(0,75%,45%)]" />
      </div>
      {/* Reflet lumineux animé */}
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        animate={{ x: ["-120%", "320%"] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};
