import { useState } from "react";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TEAM_LIST } from "@/lib/teams";
import { useFavoriteTeam } from "@/hooks/useFavoriteTeam";
import { TeamFlag } from "./TeamFlag";
import { toast } from "sonner";

export const FavoriteTeamPicker = () => {
  const { team, teamId, setTeamId } = useFavoriteTeam();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative" title={`Équipe favorite : ${team.name}`}>
          <Heart className="h-4 w-4 text-primary fill-primary/40" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" /> Choisir mon équipe favorite
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {TEAM_LIST.map((t) => {
            const selected = t.id === teamId;
            return (
              <button
                key={t.id}
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
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-bold tracking-wider text-primary">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};