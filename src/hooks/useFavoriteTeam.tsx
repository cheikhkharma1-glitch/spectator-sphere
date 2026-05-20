import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { DEFAULT_TEAM_ID, getTeam, Team } from "@/lib/teams";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "fan360.favoriteTeam";

type Ctx = {
  team: Team;
  teamId: string;
  setTeamId: (id: string) => void;
  syncing: boolean;
};

const FavoriteTeamContext = createContext<Ctx | null>(null);

export const FavoriteTeamProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [teamId, setTeamIdState] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_TEAM_ID;
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_TEAM_ID;
  });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, teamId);
  }, [teamId]);

  // Charge la préférence depuis le profil quand l'utilisateur est connecté
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("favorite_team_id")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const remote = (data as { favorite_team_id?: string | null } | null)?.favorite_team_id;
      if (remote) setTeamIdState(remote);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const setTeamId = (id: string) => {
    setTeamIdState(id);
    if (!user) return;
    setSyncing(true);
    supabase
      .from("profiles")
      .update({ favorite_team_id: id } as never)
      .eq("id", user.id)
      .then(() => setSyncing(false));
  };

  return (
    <FavoriteTeamContext.Provider
      value={{ team: getTeam(teamId), teamId, setTeamId, syncing }}
    >
      {children}
    </FavoriteTeamContext.Provider>
  );
};

export const useFavoriteTeam = () => {
  const ctx = useContext(FavoriteTeamContext);
  if (!ctx) throw new Error("useFavoriteTeam must be used within FavoriteTeamProvider");
  return ctx;
};