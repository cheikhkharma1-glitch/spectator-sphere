import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { DEFAULT_TEAM_ID, getTeam, Team } from "@/lib/teams";

const STORAGE_KEY = "fan360.favoriteTeam";

type Ctx = {
  team: Team;
  teamId: string;
  setTeamId: (id: string) => void;
};

const FavoriteTeamContext = createContext<Ctx | null>(null);

export const FavoriteTeamProvider = ({ children }: { children: ReactNode }) => {
  const [teamId, setTeamIdState] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_TEAM_ID;
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_TEAM_ID;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, teamId);
  }, [teamId]);

  return (
    <FavoriteTeamContext.Provider
      value={{ team: getTeam(teamId), teamId, setTeamId: setTeamIdState }}
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