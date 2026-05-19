import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Activity, Flame, Goal, Radio, Timer, Users } from "lucide-react";
import { SenegalFlag } from "./SenegalFlag";
import { Progress } from "@/components/ui/progress";

type Props = {
  teams: string;
  venue: string;
  sport: string;
  score?: string | null;
  minute?: number;
  opponentName?: string;
  opponentColor?: string;
  possessionHome?: number;
  shotsHome?: number;
  shotsAway?: number;
  attendance?: number;
  isLive?: boolean;
};

const ScoreDigit = ({ value }: { value: string }) => (
  <motion.span
    key={value}
    initial={{ y: -18, opacity: 0, scale: 0.85 }}
    animate={{ y: 0, opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 320, damping: 22 }}
    className="inline-block font-display text-5xl md:text-6xl font-black tabular-nums"
  >
    {value}
  </motion.span>
);

export const LiveMatchCard = ({
  teams,
  venue,
  sport,
  score,
  minute = 63,
  opponentName = "ADV",
  opponentColor = "hsl(220, 70%, 50%)",
  possessionHome = 58,
  shotsHome = 11,
  shotsAway = 6,
  attendance = 48230,
  isLive = true,
}: Props) => {
  const [home = "0", away = "0"] = (score ?? "0-0").split(/[-:]/).map((s) => s.trim());

  // Live state: minuteur + stats qui évoluent en direct
  const [liveMinute, setLiveMinute] = useState(minute);
  const [livePossession, setLivePossession] = useState(possessionHome);
  const [liveShotsHome, setLiveShotsHome] = useState(shotsHome);
  const [liveShotsAway, setLiveShotsAway] = useState(shotsAway);
  const [liveAttendance, setLiveAttendance] = useState(attendance);
  const [pulseScore, setPulseScore] = useState(false);

  // Sync props -> state lorsque de nouvelles données arrivent (realtime DB)
  useEffect(() => setLiveMinute(minute), [minute]);
  useEffect(() => setLivePossession(possessionHome), [possessionHome]);
  useEffect(() => setLiveShotsHome(shotsHome), [shotsHome]);
  useEffect(() => setLiveShotsAway(shotsAway), [shotsAway]);
  useEffect(() => setLiveAttendance(attendance), [attendance]);

  // Flash visuel lorsque le score change
  useEffect(() => {
    if (!score) return;
    setPulseScore(true);
    const t = setTimeout(() => setPulseScore(false), 1500);
    return () => clearTimeout(t);
  }, [score]);

  // Minuteur du match (+1 min toutes les 60s tant que live)
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => {
      setLiveMinute((m) => (m < 90 ? m + 1 : m));
    }, 60_000);
    return () => clearInterval(id);
  }, [isLive]);

  // Évolution dynamique des stats toutes les 8s
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => {
      setLivePossession((p) => {
        const next = p + Math.round((Math.random() - 0.5) * 4);
        return Math.max(35, Math.min(72, next));
      });
      if (Math.random() > 0.6) setLiveShotsHome((s) => s + 1);
      if (Math.random() > 0.75) setLiveShotsAway((s) => s + 1);
      setLiveAttendance((a) => a + Math.floor(Math.random() * 12));
    }, 8000);
    return () => clearInterval(id);
  }, [isLive]);

  // Détecte le nom de l'équipe Sénégal dans la chaîne "Sénégal vs X"
  const parts = teams.split(/vs|VS|-/i).map((s) => s.trim());
  const homeName = parts[0] || "Sénégal";
  const awayName = parts[1] || opponentName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl glass-card border-primary/30 glow-primary"
    >
      {/* Halo lumineux animé en fond */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: opponentColor, opacity: 0.18 }}
        animate={{ scale: [1.1, 0.95, 1.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header: statut live + lieu */}
      <div className="relative flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2">
          <motion.span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/15 text-destructive text-[10px] font-bold tracking-wider"
            animate={{ boxShadow: ["0 0 0 0 hsl(0 84% 60% / 0.5)", "0 0 0 8px hsl(0 84% 60% / 0)"] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            <Radio className="h-3 w-3" /> EN DIRECT
          </motion.span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Timer className="h-3 w-3" />
            <motion.span
              key={liveMinute}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-mono"
            >
              {liveMinute}'
            </motion.span>
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground truncate max-w-[50%] text-right">{venue}</span>
      </div>

      {/* Scoreboard */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-6">
        {/* Équipe domicile - Sénégal */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <SenegalFlag className="h-14 w-20" />
          <div className="text-center">
            <div className="font-display font-bold text-sm uppercase tracking-wide">{homeName}</div>
            <div className="text-[10px] text-muted-foreground">Lions de la Téranga</div>
          </div>
        </motion.div>

        {/* Score central */}
        <motion.div
          className="flex flex-col items-center px-2 rounded-xl"
          animate={pulseScore ? { scale: [1, 1.08, 1], filter: ["brightness(1)", "brightness(1.4)", "brightness(1)"] } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-gradient"><ScoreDigit value={home} /></span>
            <span className="font-display text-3xl text-muted-foreground/60">:</span>
            <ScoreDigit value={away} />
          </div>
          <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{sport}</span>
        </motion.div>

        {/* Équipe extérieure */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div
            className="h-14 w-20 rounded-md shadow-lg ring-1 ring-white/10 flex items-center justify-center text-white font-display font-black text-lg"
            style={{ backgroundColor: opponentColor }}
          >
            {awayName.slice(0, 3).toUpperCase()}
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-sm uppercase tracking-wide">{awayName}</div>
            <div className="text-[10px] text-muted-foreground">Adversaire</div>
          </div>
        </motion.div>
      </div>

      {/* Possession */}
      <div className="relative px-5">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="flex items-center gap-1 text-primary font-semibold">
            <Activity className="h-3 w-3" /> {livePossession}%
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Possession</span>
          <span className="text-muted-foreground font-semibold">{100 - livePossession}%</span>
        </div>
        <div className="relative h-1.5 rounded-full overflow-hidden bg-muted">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[hsl(140,70%,40%)] via-primary to-[hsl(0,75%,50%)]"
            animate={{ width: `${livePossession}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stats footer */}
      <div className="relative grid grid-cols-3 gap-2 px-5 py-4 mt-4 border-t border-border/40">
        <Stat icon={Goal} label="Tirs" value={`${liveShotsHome} - ${liveShotsAway}`} />
        <Stat icon={Users} label="Affluence" value={liveAttendance.toLocaleString("fr-FR")} />
        <Stat icon={Flame} label="Intensité" value="Élevée" accent />
      </div>
    </motion.div>
  );
};

const Stat = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Goal;
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div className="flex flex-col items-center text-center">
    <Icon className={`h-3.5 w-3.5 mb-1 ${accent ? "text-primary" : "text-muted-foreground"}`} />
    <AnimatePresence mode="popLayout">
      <motion.div
        key={value}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`font-display font-bold text-sm ${accent ? "text-gradient" : ""}`}
      >
        {value}
      </motion.div>
    </AnimatePresence>
    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
  </div>
);
