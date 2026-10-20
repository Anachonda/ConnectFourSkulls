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
  reapSkulls,
} from "@/lib/game";
import {
  playFootsteps,
  playLose,
  playReaper,
  playScream,
  playSwoosh,
  playThump,
  playWin,
  randomScream,
  unlockAudio,
} from "@/lib/audio";
import { useBackgroundMusic, unlockMusic } from "@/lib/music";
import { useLang, type Lang } from "@/lib/i18n";
import { GrimReaper, RottenSkullHead, SkullHead, Spiderweb } from "@/components/Pieces";
import { SpookyScene } from "@/components/SpookyScene";

type Screamer = { id: number; text: string; col: number; row: number; kind: "skull" | "rotten" };
type Winner = "player" | "ai" | "draw" | null;
type WinLine = [number, number][] | null;

const COLS_PX = 7;
const CELL = 64; // px

export default function App() {
  const { lang, setLang, t } = useLang();
  const [screen, setScreen] = useState<"start" | "game">("start");
  const [difficulty, setDifficulty] = useState<Difficulty>("normaal");
  const [soundOn, setSoundOn] = useState(false);

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

      {/* Language switcher */}
      <LangSwitcher lang={lang} onPick={setLang} />

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

/* ---------------- Language switcher ---------------- */

function LangSwitcher({ lang, onPick }: { lang: Lang; onPick: (l: Lang) => void }) {
  return (
    <div className="fixed right-3 top-3 z-50 flex gap-1.5">
      <button
        onClick={() => onPick("en")}
        className={`rounded-md px-2.5 py-1 text-sm font-semibold transition-all ${
          lang === "en"
            ? "bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/50"
            : "bg-black/40 text-amber-200/60 hover:text-amber-100"
        }`}
        aria-label="English"
      >
        EN
      </button>
      <button
        onClick={() => onPick("nl")}
        className={`rounded-md px-2.5 py-1 text-sm font-semibold transition-all ${
          lang === "nl"
            ? "bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/50"
            : "bg-black/40 text-amber-200/60 hover:text-amber-100"
        }`}
        aria-label="Nederlands"
      >
        NL
      </button>
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
  const { t } = useLang();
  return (
    <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center">
      {/* Title */}
      <div className="mb-2 flex items-center gap-3">
        <SkullHead className="h-12 w-12 flicker sm:h-16 sm:w-16" />
        <RottenSkullHead className="h-12 w-12 floaty sm:h-16 sm:w-16" />
      </div>
      <h1 className="font-nosifer text-4xl leading-tight text-orange-500 sm:text-6xl">
        {t.title}
      </h1>
      <p className="font-creep mt-2 text-xl text-amber-200/90 sm:text-2xl">
        {t.subtitle}
      </p>

      {/* Difficulty card */}
      <div className="mt-10 w-full max-w-md rounded-2xl border border-purple-900/50 bg-black/50 p-6 backdrop-blur">
        <h2 className="font-creep mb-4 text-2xl text-orange-400">{t.chooseOpponent}</h2>
        <div className="grid gap-3">
          <DifficultyOption
            label={t.diffEasyLabel}
            sub={t.diffEasySub}
            value="makkelijk"
            current={difficulty}
            onPick={onChangeDifficulty}
          />
          <DifficultyOption
            label={t.diffNormalLabel}
            sub={t.diffNormalSub}
            value="normaal"
            current={difficulty}
            onPick={onChangeDifficulty}
          />
          <DifficultyOption
            label={t.diffHardLabel}
            sub={t.diffHardSub}
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
            <span>{soundOn ? t.soundOn : t.soundOff}</span>
          </button>
          <button
            onClick={onStart}
            className="btn-spooky rounded-lg px-6 py-3 font-creep text-xl text-orange-300"
          >
            {t.enterGraveyard} →
          </button>
        </div>
      </div>

      <p className="mt-6 max-w-md text-xs text-amber-200/50">
        {t.startHint}
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
  const { t } = useLang();
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
  const [reaperMode, setReaperMode] = useState<"mow" | "reap">("mow");
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

      const turnMod = moveCount.current % REAPER_EVERY;
      const doMow = turnMod === 0 && nextBoard[5].some((v) => v !== 0);
      const doReap = !doMow && turnMod !== 0 && moveCount.current >= 5 && Math.random() < 0.08;

      if (doMow || doReap) {
        const mode: "mow" | "reap" = doMow ? "mow" : "reap";
        const hasTargets =
          mode === "mow"
            ? nextBoard[5].some((v) => v !== 0)
            : nextBoard.some((row) => row.some((v) => v === 1)) &&
              nextBoard.some((row) => row.some((v) => v === 2));
        if (!hasTargets) {
          // Fallback: if the preferred mode has no targets, try the other.
          const altMode: "mow" | "reap" = mode === "mow" ? "reap" : "mow";
          const altTargets =
            altMode === "mow"
              ? nextBoard[5].some((v) => v !== 0)
              : nextBoard.some((row) => row.some((v) => v === 1)) &&
                nextBoard.some((row) => row.some((v) => v === 2));
          if (!altTargets) {
            setShake(true);
            window.setTimeout(() => setShake(false), 420);
            const next = (mover === 1 ? 2 : 1) as Player;
            setTurn(next);
            setBusy(false);
            return;
          }
          setReaperMode(altMode);
        } else {
          setReaperMode(mode);
        }
        const activeMode = hasTargets ? mode : (mode === "mow" ? "reap" : "mow");
        const result = activeMode === "mow" ? mowBottomRow(nextBoard) : reapSkulls(nextBoard);
        if (findWin(result.board)) {
          setShake(true);
          window.setTimeout(() => setShake(false), 420);
          const next = (mover === 1 ? 2 : 1) as Player;
          setTurn(next);
          setBusy(false);
          return;
        }
        setReaperActive(true);
        setBusy(true);
        if (!muted) playFootsteps();
        clearReaperTimer();
        reaperTimer.current = window.setTimeout(() => {
          if (!muted) playReaper();
          reaperTimer.current = window.setTimeout(() => {
            const mowedSet = new Set(result.mowed.map(([r, c]) => `${r}-${c}`));
            setMowedCells(mowedSet);
            window.setTimeout(() => setMowedCells(new Set()), 650);
            setBoard(result.board);
          setShake(true);
          window.setTimeout(() => setShake(false), 420);

            setReaperActive(false);
            const next = (mover === 1 ? 2 : 1) as Player;
            setTurn(next);
            setBusy(false);
          }, 500);
        }, 3600);
        return;
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
    setReaperMode("mow");
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
      <header className="mb-4 text-center">
        <h1 className="font-nosifer text-3xl text-orange-500 sm:text-5xl">
          {t.title}
        </h1>
        <p className="font-creep mt-1 text-lg text-amber-200/80 sm:text-xl">
          {t.subtitle}
        </p>
      </header>

      <section className="mb-4 flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-900/40 bg-black/40 px-4 py-3 backdrop-blur">
        <ScorePanel
          label={t.you}
          value={score.player}
          badge={<SkullHead className="h-7 w-7" />}
          active={turn === 1 && !gameOver}
          accent="text-orange-400"
        />
        <ScorePanel
          label={t.draw}
          value={score.draws}
          badge={<span className="text-lg">⚖️</span>}
          active={false}
          accent="text-amber-200"
        />
        <ScorePanel
          label={t.ghost}
          value={score.ai}
          badge={<RottenSkullHead className="h-7 w-7" />}
          active={turn === 2 && !gameOver}
          accent="text-emerald-300"
        />

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className="btn-spooky rounded-lg px-3 py-2 text-sm text-amber-100"
            aria-label={soundOn ? t.soundOff : t.soundOn}
            title={soundOn ? t.soundOff : t.soundOn}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
          <button
            onClick={newGame}
            className="btn-spooky rounded-lg px-3 py-2 text-sm text-amber-100"
          >
            {t.newGame}
          </button>
          <button
            onClick={resetAll}
            className="btn-spooky rounded-lg px-3 py-2 text-sm text-amber-100"
          >
            {t.reset}
          </button>
          <button
            onClick={onExit}
            className="btn-spooky rounded-lg px-3 py-2 text-sm text-amber-100"
          >
            ← {t.menu}
          </button>
        </div>
      </section>

      {/* Turn banner */}
      <div className="mb-3 h-7 text-center font-creep text-xl">
        {reaperActive && reaperMode === "mow" && (
          <span className="reveal-banner text-red-400">
            {t.reaperMows}
          </span>
        )}
        {reaperActive && reaperMode === "reap" && (
          <span className="reveal-banner text-red-400">
            {t.reaperReaps}
          </span>
        )}
        {!reaperActive && revealing && revealWinner === "player" && (
          <span className="reveal-banner text-orange-400">{t.revealPlayer}</span>
        )}
        {!reaperActive && revealing && revealWinner === "ai" && (
          <span className="reveal-banner text-emerald-300">{t.revealAi}</span>
        )}
        {!reaperActive && revealing && revealWinner === "draw" && (
          <span className="reveal-banner text-amber-200">{t.revealDraw}</span>
        )}
        {!reaperActive && !revealing && !gameOver && turn === 1 && (
          <span className="text-orange-400">{t.yourTurn}</span>
        )}
        {!reaperActive && !revealing && !gameOver && turn === 2 && (
          <span className="text-emerald-300">{t.aiThinking}</span>
        )}
        {!reaperActive && !revealing && gameOver && winner === "player" && (
          <span className="text-orange-400">{t.youWin}</span>
        )}
        {!reaperActive && !revealing && gameOver && winner === "ai" && (
          <span className="text-emerald-300">{t.aiWins}</span>
        )}
        {!reaperActive && !revealing && gameOver && winner === "draw" && (
          <span className="text-amber-200">{t.drawEnd}</span>
        )}
      </div>

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

        {reaperActive && (
          <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-2xl">
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
                  ? t.youSurvived
                  : winner === "ai"
                    ? t.ghostWinner
                    : t.silence}
              </h2>
              <p className="font-creep mb-4 text-lg text-amber-200/90">
                {winner === "player"
                  ? t.winPrompt
                  : winner === "ai"
                    ? t.losePrompt
                    : t.drawPrompt}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={newGame}
                  className="btn-spooky rounded-lg px-6 py-3 font-creep text-lg text-orange-300"
                >
                  {t.anotherGame}
                </button>
                <button
                  onClick={onExit}
                  className="btn-spooky rounded-lg px-5 py-3 text-base text-amber-100"
                >
                  ← {t.menu}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-amber-100/80">
        <div className="flex items-center gap-2">
          <SkullHead className="h-6 w-6" /> {t.youFreshSkull}
        </div>
        <div className="flex items-center gap-2">
          <RottenSkullHead className="h-6 w-6" /> {t.ghostRottingHead}
        </div>
        <p className="basis-full text-center text-xs text-amber-200/60">
          {t.legendHint}
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
      <div className="urn-ledge mb-2 h-3 rounded-t" />
      <div className="relative">
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
                  <div
                    className="col-glow pointer-events-none absolute inset-x-0 -inset-y-2 rounded"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,140,0,0.10) 0%, rgba(255,140,0,0) 100%)",
                    }}
                  />
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
                    {mowed && (
                      <div className="mow-fade pointer-events-none absolute inset-0 flex items-center justify-center">
                        <SkullHead className="h-[86%] w-[86%] opacity-80" />
                      </div>
                    )}
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
      <div className="absolute inset-0 rounded-full ring-2 ring-stone-900/80" />
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
