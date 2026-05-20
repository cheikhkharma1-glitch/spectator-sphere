export type TeamStripe = { color: string };

export type Team = {
  id: string;
  name: string;
  nickname: string;
  shortCode: string;
  // Couleurs sémantiques (HSL strings sans la fonction hsl())
  primary: string;        // ex. "140 70% 32%"
  secondary: string;
  accent: string;
  // Drapeau : bandes (verticales par défaut) avec étoile/croissant optionnel
  flag: {
    orientation: "vertical" | "horizontal";
    stripes: string[]; // HSL strings
    emblem?: "star" | "crescent" | "none";
    emblemColor?: string;
    emblemPosition?: "center" | "left" | "right";
  };
};

export const TEAMS: Record<string, Team> = {
  juboo: {
    id: "juboo",
    name: "ASC Juboo",
    nickname: "Navétanes Dakar",
    shortCode: "JUB",
    primary: "215 85% 40%",
    secondary: "0 0% 100%",
    accent: "215 60% 25%",
    flag: {
      orientation: "vertical",
      stripes: ["215 85% 40%", "0 0% 100%", "215 85% 40%"],
      emblem: "star",
      emblemColor: "215 85% 40%",
      emblemPosition: "center",
    },
  },
  dissoo: {
    id: "dissoo",
    name: "ASC Dissoo",
    nickname: "Navétanes Dakar",
    shortCode: "DIS",
    primary: "22 100% 50%",
    secondary: "0 0% 8%",
    accent: "22 100% 60%",
    flag: {
      orientation: "vertical",
      stripes: ["22 100% 50%", "0 0% 8%", "22 100% 50%"],
      emblem: "star",
      emblemColor: "22 100% 50%",
      emblemPosition: "center",
    },
  },
};

export const TEAM_LIST: Team[] = Object.values(TEAMS);
export const DEFAULT_TEAM_ID = "juboo";

export const getTeam = (id?: string | null): Team =>
  (id && TEAMS[id]) || TEAMS[DEFAULT_TEAM_ID];

/** Trouve une équipe connue mentionnée dans un libellé libre. */
export const findTeamInLabel = (label: string): Team | undefined => {
  if (!label) return undefined;
  const l = label.toLowerCase();
  return TEAM_LIST.find((t) => {
    const candidates = [t.name, t.nickname, t.shortCode].map((s) => s.toLowerCase());
    return candidates.some((c) => c && l.includes(c));
  });
};

export type MatchSides = {
  homeLabel: string;
  awayLabel: string;
  homeTeam?: Team;
  awayTeam?: Team;
  /** Côté joué par l'équipe favorite, null si elle ne joue pas. */
  favSide: "home" | "away" | null;
};

/**
 * Parse une chaîne "X vs Y" / "X - Y" et détecte les équipes connues.
 * NE FAIT PAS d'inversion : la position domicile/extérieur reste celle de la chaîne.
 */
export const parseMatchTeams = (teams: string, favoriteTeamId: string): MatchSides => {
  const parts = teams.split(/\s+(?:vs|VS|v|-)\s+/i).map((s) => s.trim());
  const homeLabel = parts[0] ?? "";
  const awayLabel = parts[1] ?? "";
  const homeTeam = findTeamInLabel(homeLabel);
  const awayTeam = findTeamInLabel(awayLabel);
  let favSide: "home" | "away" | null = null;
  if (homeTeam?.id === favoriteTeamId) favSide = "home";
  else if (awayTeam?.id === favoriteTeamId) favSide = "away";
  return { homeLabel, awayLabel, homeTeam, awayTeam, favSide };
};