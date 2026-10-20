import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "nl" | "en";

export const STRINGS = {
  nl: {
    title: "Vier hoofden op een rij",
    subtitle: "Leg vier afgehakte hoofden op een rij in de urnenmuur.",
    chooseOpponent: "Kies je tegenstander",
    diffEasyLabel: "Sluipend spook",
    diffEasySub: "Makkelijk",
    diffNormalLabel: "Wraakzuchtige heks",
    diffNormalSub: "Normaal",
    diffHardLabel: "Grafrover",
    diffHardSub: "Moeilijk",
    soundOn: "Geluid aan",
    soundOff: "Geluid uit",
    enterGraveyard: "Betreed de begraafplaats",
    startHint:
      "Jij speelt met het verse doodshoofd. De computer met een ouder, verrot hoof. Zet je geluid aan voor de volle griezelige ervaring.",
    you: "Jij",
    draw: "Gelijk",
    ghost: "Spook",
    newGame: "Nieuw potje",
    reset: "Reset",
    menu: "Menu",
    reaperMows: "Magere Hein maait de onderste rij weg!",
    reaperReaps: "Magere Hein haalt van elke speler een doodshoofd weg!",
    revealPlayer: "Vier op een rij! De hoofden juichen...",
    revealAi: "Het spook vormt een rij... het lacht.",
    revealDraw: "De begraafplaats is vol...",
    yourTurn: "Jij bent aan zet — kies een graf.",
    aiThinking: "Het spook voelt aan je nek... het denkt na.",
    youWin: "Jij wint! De hoofden juichen.",
    aiWins: "Het spook lacht je uit... volgend keer beter.",
    drawEnd: "De begraafplaats is vol. Gelijkspel.",
    youSurvived: "JE OVERLEEFDE!",
    ghostWinner: "SPOOK OVERWINNAAR",
    silence: "STILTE IN HET GRAF",
    winPrompt: "De hoofden juichen. Nog een potje?",
    losePrompt: "Het spook lacht je uit. Wraak?",
    drawPrompt: "De urnenmuur is vol. Nog een keer?",
    anotherGame: "Nog een potje",
    youFreshSkull: "Jij — vers doodshoofd",
    ghostRottingHead: "Spook — verrot hoof",
    legendHint:
      "Klik op een urn om een hoofd in het graf te laten vallen. Vier op een rij wint. Let op: om de 10 zetten maait Magere Hein de onderste rij weg!",
    graveHere: "HIER",
    graveDead: "DOOD",
  },
  en: {
    title: "Connect Four Skulls",
    subtitle: "Line up four severed heads in the urn wall.",
    chooseOpponent: "Choose your opponent",
    diffEasyLabel: "Lurking Phantom",
    diffEasySub: "Easy",
    diffNormalLabel: "Vengeful Witch",
    diffNormalSub: "Normal",
    diffHardLabel: "Grave Robber",
    diffHardSub: "Hard",
    soundOn: "Sound on",
    soundOff: "Sound off",
    enterGraveyard: "Enter the graveyard",
    startHint:
      "You play with the fresh skull. The computer plays with an older, rotting head. Turn on your sound for the full spooky experience.",
    you: "You",
    draw: "Draw",
    ghost: "Ghost",
    newGame: "New game",
    reset: "Reset",
    menu: "Menu",
    reaperMows: "The Grim Reaper mows away the bottom row!",
    reaperReaps: "The Grim Reaper takes a skull from each player!",
    revealPlayer: "Four in a row! The heads rejoice...",
    revealAi: "The ghost forms a row... it laughs.",
    revealDraw: "The graveyard is full...",
    yourTurn: "Your turn — choose a grave.",
    aiThinking: "The ghost breathes on your neck... it's thinking.",
    youWin: "You win! The heads rejoice.",
    aiWins: "The ghost laughs at you... better luck next time.",
    drawEnd: "The graveyard is full. It's a draw.",
    youSurvived: "YOU SURVIVED!",
    ghostWinner: "GHOST WINS",
    silence: "SILENCE IN THE GRAVE",
    winPrompt: "The heads rejoice. Another game?",
    losePrompt: "The ghost laughs at you. Revenge?",
    drawPrompt: "The urn wall is full. Once more?",
    anotherGame: "Another game",
    youFreshSkull: "You — fresh skull",
    ghostRottingHead: "Ghost — rotting head",
    legendHint:
      "Click an urn to drop a head into the grave. Four in a row wins. Watch out: every 10 turns the Grim Reaper mows away the bottom row!",
    graveHere: "HERE",
    graveDead: "DEAD",
  },
} as const;

type Dict = (typeof STRINGS)[Lang];

type LangCtx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = STRINGS[lang];
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
