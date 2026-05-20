import { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TEAM_LIST } from "@/lib/teams";
import { useFavoriteTeam } from "@/hooks/useFavoriteTeam";
import { TeamFlag } from "./TeamFlag";
import { toast } from "sonner";

export const FavoriteTeamPicker = () => {
  const { team, teamId, setTeamId } = useFavoriteTeam();
  const [open, setOpen] = useState(false);

  // Raccourci clavier : Shift + F (ignore les champs de saisie)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (inField || target?.isContentEditable) return;
      if (e.shiftKey && (e.key === "F" || e.key === "f")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
          aria-label={`Choisir l'équipe favorite (actuelle : ${team.name}). Raccourci Maj + F`}
          aria-haspopup="dialog"
          aria-keyshortcuts="Shift+F"
          title={`Équipe favorite : ${team.name} — Maj+F`}
        >
          <Heart className="h-4 w-4 text-primary fill-primary/40" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" aria-describedby="fav-team-desc">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" aria-hidden="true" /> Choisir mon équipe favorite
          </DialogTitle>
          <DialogDescription id="fav-team-desc">
            Les couleurs, le drapeau et les libellés du match en direct s'adaptent à ton choix.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2" role="radiogroup" aria-label="Liste des équipes">
          {TEAM_LIST.map((t) => {
            const selected = t.id === teamId;
            return (
              <button
                key={t.id}
                role="radio"
                aria-checked={selected}
                aria-label={`${t.name} — ${t.nickname}`}
                onClick={() => {
                  setTeamId(t.id);
                  toast.success(`Équipe favorite : ${t.name}`);
                  setOpen(false);
                }}
                className={`group relative rounded-xl p-3 text-left transition-all border ${
                  selected
                    ? "border-primary/60 bg-primary/10 glow-primary"
                    : "border-border/40 hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <TeamFlag team={t} className="h-9 w-14 shrink-0" waving={false} />
                  <div className="min-w-0">
                    <div className="font-display font-bold text-sm truncate">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{t.nickname}</div>
                  </div>
                </div>
                {selected && (
                  <span aria-hidden="true" className="absolute top-1.5 right-1.5 text-[9px] font-bold tracking-wider text-primary">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground text-center">
          Astuce : appuie sur <kbd className="px-1 py-0.5 rounded bg-muted font-mono">Maj</kbd> + <kbd className="px-1 py-0.5 rounded bg-muted font-mono">F</kbd> pour rouvrir ce sélecteur.
        </p>
      </DialogContent>
    </Dialog>
  );
};