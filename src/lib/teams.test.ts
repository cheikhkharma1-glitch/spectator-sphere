import { describe, it, expect } from "vitest";
import { findTeamInLabel, parseMatchTeams } from "./teams";

describe("findTeamInLabel", () => {
  it("détecte par nom complet", () => {
    expect(findTeamInLabel("Sénégal")?.id).toBe("senegal");
  });
  it("détecte par shortCode", () => {
    expect(findTeamInLabel("SEN")?.id).toBe("senegal");
  });
  it("détecte par surnom", () => {
    expect(findTeamInLabel("Lions de la Téranga")?.id).toBe("senegal");
  });
  it("renvoie undefined si rien ne matche", () => {
    expect(findTeamInLabel("FC Inconnu")).toBeUndefined();
  });
});

describe("parseMatchTeams", () => {
  it("équipe favorite à domicile", () => {
    const r = parseMatchTeams("Sénégal vs Maroc", "senegal");
    expect(r.favSide).toBe("home");
    expect(r.homeTeam?.id).toBe("senegal");
    expect(r.awayTeam?.id).toBe("maroc");
  });
  it("équipe favorite à l'extérieur (ordre inverse, ne pas inverser le score)", () => {
    const r = parseMatchTeams("Maroc vs Sénégal", "senegal");
    expect(r.favSide).toBe("away");
    expect(r.homeLabel).toBe("Maroc");
    expect(r.awayLabel).toBe("Sénégal");
  });
  it("supporte le séparateur tiret", () => {
    const r = parseMatchTeams("Cameroun - Algérie", "algerie");
    expect(r.favSide).toBe("away");
    expect(r.homeTeam?.id).toBe("cameroun");
  });
  it("supporte VS majuscule et espaces multiples", () => {
    const r = parseMatchTeams("Côte d'Ivoire   VS   Sénégal", "cote_ivoire");
    expect(r.favSide).toBe("home");
  });
  it("équipe favorite absente du match", () => {
    const r = parseMatchTeams("Maroc vs Cameroun", "senegal");
    expect(r.favSide).toBeNull();
    expect(r.homeTeam?.id).toBe("maroc");
    expect(r.awayTeam?.id).toBe("cameroun");
  });
  it("libellé inconnu ne casse pas le parse", () => {
    const r = parseMatchTeams("Sénégal vs FC Inconnu", "senegal");
    expect(r.favSide).toBe("home");
    expect(r.awayTeam).toBeUndefined();
    expect(r.awayLabel).toBe("FC Inconnu");
  });
});