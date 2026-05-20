import { describe, it, expect } from "vitest";
import { findTeamInLabel, parseMatchTeams } from "./teams";

describe("findTeamInLabel", () => {
  it("détecte par nom complet", () => {
    expect(findTeamInLabel("ASC Juboo")?.id).toBe("juboo");
  });
  it("détecte par shortCode", () => {
    expect(findTeamInLabel("DIS")?.id).toBe("dissoo");
  });
  it("détecte insensible à la casse", () => {
    expect(findTeamInLabel("asc dissoo de Dakar")?.id).toBe("dissoo");
  });
  it("renvoie undefined si rien ne matche", () => {
    expect(findTeamInLabel("FC Inconnu")).toBeUndefined();
  });
});

describe("parseMatchTeams", () => {
  it("équipe favorite à domicile", () => {
    const r = parseMatchTeams("ASC Juboo vs ASC Dissoo", "juboo");
    expect(r.favSide).toBe("home");
    expect(r.homeTeam?.id).toBe("juboo");
    expect(r.awayTeam?.id).toBe("dissoo");
  });
  it("équipe favorite à l'extérieur (ordre inverse, ne pas inverser le score)", () => {
    const r = parseMatchTeams("ASC Dissoo vs ASC Juboo", "juboo");
    expect(r.favSide).toBe("away");
    expect(r.homeLabel).toBe("ASC Dissoo");
    expect(r.awayLabel).toBe("ASC Juboo");
  });
  it("supporte le séparateur tiret", () => {
    const r = parseMatchTeams("ASC Juboo - ASC Dissoo", "dissoo");
    expect(r.favSide).toBe("away");
    expect(r.homeTeam?.id).toBe("juboo");
  });
  it("supporte VS majuscule et espaces multiples", () => {
    const r = parseMatchTeams("ASC Juboo   VS   ASC Dissoo", "juboo");
    expect(r.favSide).toBe("home");
  });
  it("équipe favorite absente du match", () => {
    const r = parseMatchTeams("ASC Juboo vs ASC Dissoo", "fcinconnu");
    expect(r.favSide).toBeNull();
    expect(r.homeTeam?.id).toBe("juboo");
    expect(r.awayTeam?.id).toBe("dissoo");
  });
  it("libellé inconnu ne casse pas le parse", () => {
    const r = parseMatchTeams("ASC Juboo vs FC Inconnu", "juboo");
    expect(r.favSide).toBe("home");
    expect(r.awayTeam).toBeUndefined();
    expect(r.awayLabel).toBe("FC Inconnu");
  });
});