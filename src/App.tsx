import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  type Board,
  type Difficulty,
  type Player,
  COLS,
  chooseAiMove,
  drop,
  emptyBoard,
  findWin,
  isFull,
  lowestEmptyRow,
  mowBottomRow,
} from "@/lib/game";
import {
  playLose,
  playScream,
  playSwoosh,
  playThump,
  playWin,
  randomScream,
  unlockAudio,
} from "@/lib/audio";
import { useBackgroundMusic, unlockMusic } from "@/lib/music";
import { GrimReaper, RottenSkullHead, SkullHead, Spiderweb } from "@/components/Pieces";
import { SpookyScene } from "@/components/SpookyScene";

type Screamer = { id: number; text: string; col: number; row: number; kind: "skull" | "rotten" };
type Winner = "player" | "ai" | "draw" | null;
type WinLine = [number, number][] | null;

const COLS_PX = 7;
const CELL = 64; // px

export default function App() {
  const [screen, setScreen] = useState<"start" | "game">("start");
  const [difficulty, setDifficulty] = useState<Difficulty>("normaal");
  const [soundOn, setSoundOn] = useState(true);

  useBackgroundMusic(soundOn);

  function toggleSound() {
    unlockAudio();
    unlockMusic();
    setSoundOn((p) => !p);
  }

  function startGame(d: Difficulty) {
    setDifficulty(d);
    setScreen("game");
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <SpookyScene />
      {/* Corner spiderwebs */}
      <CornerWebs />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center px-4 py-8">
        {screen === "start" ? (
          <StartScreen
            difficulty={difficulty}
            onChangeDifficulty={setDifficulty}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            onStart={() => {
              unlockAudio();
              unlockMusic();
              startGame(difficulty);
            }}
          />
        ) : (
          <GameScreen
            difficulty={difficulty}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            onExit={() => setScreen("start")}
          />
        )}
      </main>
    </div>
  );
}

/* ---------------- Corner spiderwebs ---------------- */

function CornerWebs() {
  return (
    <>
      <Spiderweb className="pointer-events-none fixed left-0 top-0 z-[5] h-40 w-40 opacity-70 sm:h-56 sm:w-56" />
      <Spiderweb
        className="pointer-events-none fixed right-0 top-0 z-[5] h-40 w-40 opacity-60 sm:h-56 sm:w-56"
        flip="x"
      />
      <Spiderweb
        className="pointer-events-none fixed left-0 bottom-0 z-[5] h-36 w-36 opacity-50 sm:h-48 sm:w-48"
        flip="y"
      />
      <Spiderweb
        className="pointer-events-none fixed right-0 bottom-0 z-[5] h-36 w-36 opacity-50 sm:h-48 sm:w-48"
        flip="xy"
      />
    </>
  );
}

/* ---------------- Start screen ---------------- */

function StartScreen({
  difficulty,
  onChangeDifficulty,
  soundOn,
  onToggleSound,
  onStart,
}: {
  difficulty: Difficulty;
  onChangeDifficulty: (d: Difficulty) => void;
  soundOn: boolean;
  onToggleSound: () => void;
  onStart: () => void;
}) {
  return (
    <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center">
      {/* Title */}
      <div className="mb-2 flex items-center gap-3">
        <SkullHead className="h-12 w-12 flicker sm:h-16 sm:w-16" />
        <RottenSkullHead className="h-12 w-12 floaty sm:h-16 sm:w-16" />
      </div>
      <h1 className="font-nosifer text-4xl leading-tight text-orange-500 sm:text-6xl">
        Vier hoofden
        <br /> op een rij
      </h1>
      <p className="font-creep mt-2 text-xl text-amber-200/90 sm:text-2xl">
        Leg vier afgehakte hoofden op een rij in de urnenmuur.
      </p>

      {/* Difficulty card */}
      <div className="mt-10 w-full max-w-md rounded-2xl border border-purple-900/50 bg-black/50 p-6 backdrop-blur">
        <h2 className="font-creep mb-4 text-2xl text-orange-400">Kies je tegenstander</h2>
        <div className="grid gap-3">
          <DifficultyOption
            label="Sluipend spook"
            sub="Makkelijk"
            value="makkelijk"
            current={difficulty}
            onPick={onChangeDifficulty}
          />
          <DifficultyOption
            label="Wraakzuchtige heks"
            sub="Normaal"
            value="normaal"
            current={difficulty}
            onPick={onChangeDifficulty}
          />
          <DifficultyOption
            label="Grafrover"
            sub="Moeilijk"
            value="moeilijk"
            current={difficulty}
            onPick={onChangeDifficulty}
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={onToggleSound}
            className="btn-spooky flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-amber-100"
          >
            <span>{soundOn ? "🔊" : "🔇"}</span>
            <span>{soundOn ? "Geluid aan" : "Geluid uit"}</span>
          </button>
          <button
            onClick={onStart}
            className="btn-spooky rounded-lg px-6 py-3 font-creep text-xl text-orange-300"
          >
            Betreed de begraafplaats →
          </button>
        </div>
      </div>

      <p className="mt-6 max-w-md text-xs text-amber-200/50">
        Jij speelt met het verse doodshoofd. De computer met een ouder, verrot hoof. Zet je geluid
        aan voor de volle griezelige ervaring.
      </p>
    </div>
  );
}

function DifficultyOption({
  label,
  sub,
  value,
  current,
  onPick,
}: {
  label: string;
  sub: string;
  value: Difficulty;
  current: Difficulty;
  onPick: (d: Difficulty) => void;
}) {
  const active = current === value;
  return (
    <button
      onClick={() => onPick(value)}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
        active
          ? "border-orange-500/80 bg-orange-500/10 shadow-[0_0_22px_rgba(255,120,0,0.25)]"
          : "border-purple-900/40 bg-black/30 hover:border-purple-600/60"
      }`}
    >
      <div>
        <div className="font-creep text-xl text-amber-100">{label}</div>
        <div className="text-xs uppercase tracking-widest text-amber-200/60">{sub}</div>
      </div>
      <span
        className={`h-4 w-4 rounded-full border-2 ${
          active ? "border-orange-400 bg-orange-500" : "border-purple-700 bg-transparent"
        }`}
      />
    </button>
  );
}

/* ---------------- Game screen ---------------- */

function GameScreen({
  difficulty,
  soundOn,
  onToggleSound,
  onExit,
}: {
  difficulty: Difficulty;
  soundOn: boolean;
  onToggleSound: () => void;
  onExit: () => void;
}) {
  const [board, setBoard] = useState<Board>(() => emptyBoard());
  const [turn, setTurn] = useState<Player>(1);
  const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 });
  const [winner, setWinner] = useState<Winner>(null);
  const [winLine, setWinLine] = useState<WinLine>(null);
  const [busy, setBusy] = useState(false);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [screamers, setScreamers] = useState<Screamer[]>([]);
  const [shake, setShake] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [revealWinner, setRevealWinner] = useState<Winner>(null);
  const [reaperActive, setReaperActive] = useState(false);
  const [mowedCells, setMowedCells] = useState<Set<string>>(new Set());

  const screamId = useRef(0);
  const aiTimer = useRef<number | null>(null);
  const aiPending = useRef(false);
  const revealTimer = useRef<number | null>(null);
  const moveCount = useRef(0);
  const reaperTimer = useRef<number | null>(null);

  const muted = !soundOn;
  const gameOver = winner !== null;
  const REAPER_EVERY = 10;

  const clearRevealTimer = useCallback(() => {
    if (revealTimer.current) {
      window.clearTimeout(revealTimer.current);
      revealTimer.current = null;
    }
  }, []);

  const clearReaperTimer = useCallback(() => {
    if (reaperTimer.current) {
      window.clearTimeout(reaperTimer.current);
      reaperTimer.current = null;
    }
  }, []);

  const addScreamer = useCallback((col: number, row: number, kind: "skull" | "rotten") => {
    const id = ++screamId.current;
    const text = randomScream(kind === "skull" ? "pumpkin" : "ghost");
    setScreamers((s) => [...s, { id, text, col, row, kind }]);
    window.setTimeout(() => {
      setScreamers((s) => s.filter((x) => x.id !== id));
    }, 1400);
  }, []);

  const finishMove = useCallback(
    (nextBoard: Board, _movedRow: number, _movedCol: number, mover: Player) => {
      const win = findWin(nextBoard);
      if (win) {
        setBoard(nextBoard);
        setWinLine(win.line);
        const who: Winner = win.player === 1 ? "player" : "ai";
        setRevealWinner(who);
        setRevealing(true);
        setScore((s) =>
          who === "player"
            ? { ...s, player: s.player + 1 }
            : { ...s, ai: s.ai + 1 },
        );
        if (!muted) (who === "player" ? playWin() : playLose());
        // After the line has been highlighted for a moment, show the overlay.
        clearRevealTimer();
        revealTimer.current = window.setTimeout(() => {
          setWinner(who);
          setRevealing(false);
          setBusy(false);
        }, 1200);
        return;
      }
      if (isFull(nextBoard)) {
        setBoard(nextBoard);
        setRevealWinner("draw");
        setRevealing(true);
        setScore((s) => ({ ...s, draws: s.draws + 1 }));
        clearRevealTimer();
        revealTimer.current = window.setTimeout(() => {
          setWinner("draw");
          setRevealing(false);
          setBusy(false);
        }, 1200);
        return;
      }

      moveCount.current += 1;
      setBoard(nextBoard);

      // The Grim Reaper mows the bottom row every REAPER_EVERY moves.
      if (moveCount.current % REAPER_EVERY === 0) {
        const hasBottomPieces = nextBoard[5].some((v) => v !== 0);
        if (hasBottomPieces) {
          setReaperActive(true);
          setBusy(true);
          if (!muted) playSwoosh();
          // Swoosh the scythe, then mow the row and let pieces fall.
          clearReaperTimer();
          reaperTimer.current = window.setTimeout(() => {
            const mowed = mowBottomRow(nextBoard);
            const mowedSet = new Set(mowed.mowed.map(([r, c]) => `${r}-${c}`));
            setMowedCells(mowedSet);
            // Remove the fading markers once the animation finishes.
            window.setTimeout(() => setMowedCells(new Set()), 650);
            setBoard(mowed.board);
            setShake(true);
            window.setTimeout(() => setShake(false), 420);

            // A mow could create an unexpected win; check for it.
            const postWin = findWin(mowed.board);
            if (postWin) {
              const who: Winner = postWin.player === 1 ? "player" : "ai";
              setWinLine(postWin.line);
              setRevealWinner(who);
              setRevealing(true);
              setScore((s) =>
                who === "player"
                  ? { ...s, player: s.player + 1 }
                  : { ...s, ai: s.ai + 1 },
              );
              if (!muted) (who === "player" ? playWin() : playLose());
              clearRevealTimer();
              revealTimer.current = window.setTimeout(() => {
                setWinner(who);
                setRevealing(false);
                setReaperActive(false);
                setBusy(false);
              }, 1200);
              return;
            }

            setReaperActive(false);
            const next = (mover === 1 ? 2 : 1) as Player;
            setTurn(next);
            setBusy(false);
          }, 1100);
          return;
        }
        // No bottom pieces to mow; skip the spectacle.
      }

      setShake(true);
      window.setTimeout(() => setShake(false), 420);
      const next = (mover === 1 ? 2 : 1) as Player;
      setTurn(next);
      setBusy(false);
    },
    [muted, clearRevealTimer, clearReaperTimer],
  );

  const handleDrop = useCallback(
    (col: number) => {
      if (gameOver || busy || turn !== 1) return;
      const row = lowestEmptyRow(board, col);
      if (row < 0) return;
      unlockAudio();
      const res = drop(board, col, 1);
      if (!res) return;
      setBusy(true);
      if (!muted) playScream("pumpkin");
      addScreamer(col, row, "skull");
      window.setTimeout(() => {
        if (!muted) playThump();
        finishMove(res.board, row, col, 1);
      }, 420);
    },
    [board, busy, gameOver, turn, muted, addScreamer, finishMove],
  );

  // AI turn. Re-entry guarded with a ref (not `busy`) so a re-render from
  // setBusy(true) doesn't cancel the very timer we just scheduled.
  useEffect(() => {
    if (gameOver || revealing || reaperActive || turn !== 2) {
      aiPending.current = false;
      return;
    }
    if (aiPending.current) return;
    aiPending.current = true;
    setBusy(true);

    aiTimer.current = window.setTimeout(() => {
      const col = chooseAiMove(board, 2, difficulty);
      if (col < 0) {
        aiPending.current = false;
        setBusy(false);
        return;
      }
      const row = lowestEmptyRow(board, col);
      const res = drop(board, col, 2);
      if (!res) {
        aiPending.current = false;
        setBusy(false);
        return;
      }
      if (!muted) playScream("ghost");
      if (row >= 0) addScreamer(col, row, "rotten");
      window.setTimeout(() => {
        if (!muted) playThump();
        finishMove(res.board, row, col, 2);
        aiPending.current = false;
      }, 480);
    }, 650);

    return () => {
      if (aiTimer.current) {
        window.clearTimeout(aiTimer.current);
        aiTimer.current = null;
      }
      aiPending.current = false;
    };
  }, [turn, gameOver, revealing, reaperActive, board, difficulty, muted, addScreamer, finishMove]);

  const newGame = useCallback(() => {
    if (aiTimer.current) {
      window.clearTimeout(aiTimer.current);
      aiTimer.current = null;
    }
    clearRevealTimer();
    clearReaperTimer();
    aiPending.current = false;
    moveCount.current = 0;
    setBoard(emptyBoard());
    setTurn(1);
    setWinner(null);
    setRevealWinner(null);
    setRevealing(false);
    setReaperActive(false);
    setMowedCells(new Set());
    setWinLine(null);
    setBusy(false);
    setScreamers([]);
  }, [clearRevealTimer, clearReaperTimer]);

  const resetAll = useCallback(() => {
    setScore({ player: 0, ai: 0, draws: 0 });
    newGame();
  }, [newGame]);

  const winSet = useMemo(
    () => (winLine ? new Set(winLine.map(([r, c]) => `${r}-${c}`)) : null),
    [winLine],
  );

  return (
    <>
      {/* Title */}
      <header className="mb-4 text-center">
        <h1 className="font-nosifer text-3xl text-orange-500 sm:text-5xl">
          Vier hoofden op een rij
        </h1>
        <p className="font-creep mt-1 text-lg text-amber-200/80 sm:text-xl">
          Leg vier afgehakte hoofden op een rij in de urnenmuur.
        </p>
      </header>

      {/* Score + controls */}
      <section className="mb-4 flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-900/40 bg-black/40 px-4 py-3 backdrop-blur">
        <ScorePanel
          label="Jij"
          value={score.player}
          badge={<SkullHead className="h-7 w-7" />}
          active={turn === 1 && !gameOver}
          accent="text-orange-400"
        />
        <ScorePanel
          label="Gelijk"
          value={score.draws}
          badge={<span className="text-lg">⚖️</span>}
          active={false}
          accent="text-amber-200"
        />
        <ScorePanel
          label="Spook"
          value={score.ai}
          badge={<RottenSkullHead className="h-7 w-7" />}
          active={turn === 2 && !gameOver}
          accent="text-emerald-300"
        />

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className="btn-spooky rounded-lg px-3 py-2 text-sm text-amber-100"
            aria-label={soundOn ? "Geluid uit" : "Geluid aan"}
            title={soundOn ? "Geluid uit" : "Geluid aan"}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
          <button
            onClick={newGame}
            className="btn-spooky rounded-lg px-3 py-2 text-sm text-amber-100"
          >
            Nieuw potje
          </button>
          <button
            onClick={resetAll}
            className="btn-spooky rounded-lg px-3 py-2 text-sm text-amber-100"
          >
            Reset
          </button>
          <button
            onClick={onExit}
            className="btn-spooky rounded-lg px-3 py-2 text-sm text-amber-100"
          >
            ← Menu
          </button>
        </div>
      </section>

      {/* Turn banner */}
      <div className="mb-3 h-7 text-center font-creep text-xl">
        {reaperActive && (
          <span className="reveal-banner text-red-400">
            Magere Hein maait de onderste rij weg!
          </span>
        )}
        {!reaperActive && revealing && revealWinner === "player" && (
          <span className="reveal-banner text-orange-400">Vier op een rij! De hoofden juichen...</span>
        )}
        {!reaperActive && revealing && revealWinner === "ai" && (
          <span className="reveal-banner text-emerald-300">Het spook vormt een rij... het lacht.</span>
        )}
        {!reaperActive && revealing && revealWinner === "draw" && (
          <span className="reveal-banner text-amber-200">De begraafplaats is vol...</span>
        )}
        {!reaperActive && !revealing && !gameOver && turn === 1 && (
          <span className="text-orange-400">Jij bent aan zet — kies een graf.</span>
        )}
        {!reaperActive && !revealing && !gameOver && turn === 2 && (
          <span className="text-emerald-300">Het spook voelt aan je nek... het denkt na.</span>
        )}
        {!reaperActive && !revealing && gameOver && winner === "player" && (
          <span className="text-orange-400">Jij wint! De hoofden juichen.</span>
        )}
        {!reaperActive && !revealing && gameOver && winner === "ai" && (
          <span className="text-emerald-300">Het spook lacht je uit... volgend keer beter.</span>
        )}
        {!reaperActive && !revealing && gameOver && winner === "draw" && (
          <span className="text-amber-200">De begraafplaats is vol. Gelijkspel.</span>
        )}
      </div>

      {/* Board */}
      <div className={`relative ${shake ? "shake" : ""}`}>
        <Board
          board={board}
          onHoverCol={setHoverCol}
          onPickCol={handleDrop}
          hoverCol={hoverCol}
          interactive={!gameOver && !revealing && !reaperActive && turn === 1 && !busy}
          winSet={winSet}
          screamers={screamers}
          revealing={revealing}
          mowedCells={mowedCells}
        />

        {/* Grim Reaper sweeping across the bottom row */}
        {reaperActive && (
          <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-2xl">
            {/* Scythe glow trail along the bottom */}
            <div
              className="scythe-trail absolute bottom-6 left-0 right-0 h-10"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(200,220,255,0.5) 50%, rgba(255,255,255,0) 100%)",
                filter: "blur(6px)",
              }}
            />
            <div className="reaper-sweep absolute bottom-0 left-0">
              <GrimReaper className="h-48 w-48 sm:h-64 sm:w-64 drop-shadow-[0_0_25px_rgba(255,40,40,0.5)]" />
            </div>
          </div>
        )}

        {/* Game over overlay — only after the reveal phase */}
        {gameOver && !revealing && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/70 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-3 flex items-center justify-center gap-3">
                {winner === "player" && <SkullHead className="h-14 w-14 flicker" />}
                {winner === "ai" && <RottenSkullHead className="h-14 w-14 floaty" />}
                {winner === "draw" && <span className="text-5xl">⚖️</span>}
              </div>
              <h2 className="font-nosifer mb-1 text-3xl text-orange-400">
                {winner === "player"
                  ? "JE OVERLEEFDE!"
                  : winner === "ai"
                    ? "SPOOK OVERWINNAAR"
                    : "STILTE IN HET GRAF"}
              </h2>
              <p className="font-creep mb-4 text-lg text-amber-200/90">
                {winner === "player"
                  ? "De hoofden juichen. Nog een potje?"
                  : winner === "ai"
                    ? "Het spook lacht je uit. Wraak?"
                    : "De urnenmuur is vol. Nog een keer?"}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={newGame}
                  className="btn-spooky rounded-lg px-6 py-3 font-creep text-lg text-orange-300"
                >
                  Nog een potje
                </button>
                <button
                  onClick={onExit}
                  className="btn-spooky rounded-lg px-5 py-3 text-base text-amber-100"
                >
                  ← Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <section className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-amber-100/80">
        <div className="flex items-center gap-2">
          <SkullHead className="h-6 w-6" /> Jij — vers doodshoofd
        </div>
        <div className="flex items-center gap-2">
          <RottenSkullHead className="h-6 w-6" /> Spook — verrot hoof
        </div>
        <p className="basis-full text-center text-xs text-amber-200/60">
          Klik op een urn om een hoofd in het graf te laten vallen. Vier op een rij wint.
          Let op: om de 10 zetten maait Magere Hein de onderste rij weg!
        </p>
      </section>
    </>
  );
}

function ScorePanel({
  label,
  value,
  badge,
  active,
  accent,
}: {
  label: string;
  value: number;
  badge: ReactNode;
  active: boolean;
  accent: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
        active
          ? "border-orange-500/70 bg-orange-500/10 shadow-[0_0_18px_rgba(255,120,0,0.25)]"
          : "border-purple-900/30 bg-black/20"
      }`}
    >
      <div className="flex h-8 w-8 items-center justify-center">{badge}</div>
      <div className="leading-tight">
        <div className={`font-creep text-base ${accent}`}>{label}</div>
        <div className="font-mono text-lg text-amber-50">{value}</div>
      </div>
    </div>
  );
}

/* ---------------- Board styled as an urn wall (columbarium) ---------------- */

function Board({
  board,
  onHoverCol,
  onPickCol,
  hoverCol,
  interactive,
  winSet,
  screamers,
  revealing,
  mowedCells,
}: {
  board: Board;
  onHoverCol: (c: number | null) => void;
  onPickCol: (c: number) => void;
  hoverCol: number | null;
  interactive: boolean;
  winSet: Set<string> | null;
  screamers: Screamer[];
  revealing: boolean;
  mowedCells: Set<string>;
}) {
  return (
    <div className="urn-wall rounded-2xl p-3 sm:p-5">
      {/* Top ledge */}
      <div className="urn-ledge mb-2 h-3 rounded-t" />
      <div className="relative">
        {/* Column hover ghost-piece preview */}
        {interactive && hoverCol !== null && <PreviewPiece col={hoverCol} board={board} />}

        <div
          className="grid gap-1 sm:gap-1.5"
          style={{ gridTemplateColumns: `repeat(${COLS_PX}, minmax(0, 1fr))` }}
          onMouseLeave={() => onHoverCol(null)}
        >
          {board.map((rowArr, r) =>
            rowArr.map((cell, c) => {
              const key = `${r}-${c}`;
              const isWin = winSet?.has(key) ?? false;
              const screamer = screamers.find((s) => s.col === c && s.row === r);
              const mowed = mowedCells.has(key);
              return (
                <div
                  key={key}
                  className="col-hover relative"
                  onMouseEnter={() => onHoverCol(c)}
                  onClick={() => interactive && onPickCol(c)}
                  style={{ cursor: interactive ? "pointer" : "default" }}
                >
                  {/* Column highlight */}
                  <div
                    className="col-glow pointer-events-none absolute inset-x-0 -inset-y-2 rounded"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,140,0,0.10) 0%, rgba(255,140,0,0) 100%)",
                    }}
                  />
                  {/* Urn niche */}
                  <UrnNiche isWin={isWin} revealing={revealing}>
                    {cell === 1 && (
                      <SkullHead
                        className={`drop-in h-[86%] w-[86%] ${isWin ? "win-pulse" : ""}`}
                        style={{ ["--drop-from" as string]: `-${(r + 1) * 90}px` }}
                      />
                    )}
                    {cell === 2 && (
                      <RottenSkullHead
                        className={`drop-in floaty h-[86%] w-[86%] ${isWin ? "win-pulse" : ""}`}
                        style={{ ["--drop-from" as string]: `-${(r + 1) * 90}px` }}
                      />
                    )}
                    {/* Mowed-piece fade-out ghost (shown briefly over the niche) */}
                    {mowed && (
                      <div className="mow-fade pointer-events-none absolute inset-0 flex items-center justify-center">
                        <SkullHead className="h-[86%] w-[86%] opacity-80" />
                      </div>
                    )}
                    {/* Scream text bubble */}
                    {screamer && (
                      <div
                        className="scream-pop pointer-events-none absolute z-20 whitespace-nowrap font-creep text-lg"
                        style={{
                          color: screamer.kind === "skull" ? "#ff5a4a" : "#7CFBD8",
                          textShadow: "0 0 8px rgba(0,0,0,0.95)",
                          top: "-6px",
                        }}
                      >
                        {screamer.text}
                      </div>
                    )}
                  </UrnNiche>
                </div>
              );
            }),
          )}
        </div>
      </div>
      {/* Bottom ledge / base */}
      <div className="urn-ledge mt-2 h-4 rounded-b" />
    </div>
  );
}

function UrnNiche({
  children,
  isWin,
  revealing,
}: {
  children: ReactNode;
  isWin: boolean;
  revealing: boolean;
}) {
  return (
    <div
      className={`urn-niche relative flex items-center justify-center rounded-full ${
        isWin && revealing ? "win-ring" : ""
      }`}
      style={{ width: CELL, height: CELL, maxWidth: "14vw", maxHeight: "14vw" }}
    >
      {/* Inner shadow ring (niche opening) */}
      <div className="absolute inset-0 rounded-full ring-2 ring-stone-900/80" />
      {/* Stone frame ring */}
      <div className="absolute inset-0 rounded-full ring-1 ring-stone-500/30" />
      {children}
    </div>
  );
}

function PreviewPiece({ col, board }: { col: number; board: Board }) {
  const r = lowestEmptyRow(board, col);
  if (r < 0) return null;
  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        left: `calc(${(col / COLS) * 100}% )`,
        width: `calc(${100 / COLS}% )`,
        top: -6,
      }}
    >
      <div className="flex justify-center">
        <SkullHead className="h-10 w-10 opacity-70 floaty" />
      </div>
    </div>
  );
}
