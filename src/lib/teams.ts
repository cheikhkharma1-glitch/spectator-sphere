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
  senegal: {
    id: "senegal",
    name: "Sénégal",
    nickname: "Lions de la Téranga",
    shortCode: "SEN",
    primary: "140 70% 32%",
    secondary: "48 100% 50%",
    accent: "0 75% 45%",
    flag: {
      orientation: "vertical",
      stripes: ["140 70% 32%", "48 100% 50%", "0 75% 45%"],
      emblem: "star",
      emblemColor: "140 70% 32%",
      emblemPosition: "center",
    },
  },
  maroc: {
    id: "maroc",
    name: "Maroc",
    nickname: "Lions de l'Atlas",
    shortCode: "MAR",
    primary: "0 75% 40%",
    secondary: "140 70% 30%",
    accent: "0 0% 100%",
    flag: {
      orientation: "vertical",
      stripes: ["0 75% 40%"],
      emblem: "star",
      emblemColor: "140 70% 30%",
      emblemPosition: "center",
    },
  },
  cote_ivoire: {
    id: "cote_ivoire",
    name: "Côte d'Ivoire",
    nickname: "Les Éléphants",
    shortCode: "CIV",
    primary: "20 100% 50%",
    secondary: "0 0% 100%",
    accent: "140 70% 35%",
    flag: {
      orientation: "vertical",
      stripes: ["20 100% 50%", "0 0% 100%", "140 70% 35%"],
      emblem: "none",
    },
  },
  cameroun: {
    id: "cameroun",
    name: "Cameroun",
    nickname: "Lions Indomptables",
    shortCode: "CMR",
    primary: "140 70% 32%",
    secondary: "0 75% 45%",
    accent: "48 100% 50%",
    flag: {
      orientation: "vertical",
      stripes: ["140 70% 32%", "0 75% 45%", "48 100% 50%"],
      emblem: "star",
      emblemColor: "48 100% 50%",
      emblemPosition: "center",
    },
  },
  algerie: {
    id: "algerie",
    name: "Algérie",
    nickname: "Les Fennecs",
    shortCode: "ALG",
    primary: "140 70% 30%",
    secondary: "0 0% 100%",
    accent: "0 75% 50%",
    flag: {
      orientation: "vertical",
      stripes: ["140 70% 30%", "0 0% 100%"],
      emblem: "crescent",
      emblemColor: "0 75% 50%",
      emblemPosition: "center",
    },
  },
};

export const TEAM_LIST: Team[] = Object.values(TEAMS);
export const DEFAULT_TEAM_ID = "senegal";

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