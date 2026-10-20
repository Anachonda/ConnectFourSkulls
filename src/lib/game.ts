// Connect-Four game logic + an AI opponent (minimax with alpha-beta).

export type Cell = 0 | 1 | 2; // 0 empty, 1 player (pumpkin), 2 computer (ghost)
export type Board = Cell[][];
export type Player = 1 | 2;

export const ROWS = 6;
export const COLS = 7;

export function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));
}

export function lowestEmptyRow(board: Board, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

export function validCols(board: Board): number[] {
  const out: number[] = [];
  for (let c = 0; c < COLS; c++) if (board[0][c] === 0) out.push(c);
  return out;
}

export function drop(board: Board, col: number, player: Player): { board: Board; row: number } | null {
  const r = lowestEmptyRow(board, col);
  if (r < 0) return null;
  const next = board.map((row) => row.slice());
  next[r][col] = player;
  return { board: next, row: r };
}

export type WinInfo = { player: Player; line: [number, number][] } | null;

const DIRS: [number, number][] = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diag down-right
  [1, -1], // diag down-left
];

export function findWin(board: Board): WinInfo {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c];
      if (p === 0) continue;
      for (const [dr, dc] of DIRS) {
        const line: [number, number][] = [[r, c]];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          if (board[nr][nc] !== p) break;
          line.push([nr, nc]);
        }
        if (line.length >= 4) return { player: p as Player, line: line.slice(0, 4) };
      }
    }
  }
  return null;
}

export function isFull(board: Board): boolean {
  return validCols(board).length === 0;
}

// The reaper mows the bottom row away: every column's bottom piece is
// destroyed and the pieces above fall down by one row (gravity).
export function mowBottomRow(board: Board): { board: Board; mowed: [number, number][] } {
  const next = board.map((row) => row.slice());
  const mowed: [number, number][] = [];
  for (let c = 0; c < COLS; c++) {
    if (next[ROWS - 1][c] !== 0) mowed.push([ROWS - 1, c]);
    for (let r = ROWS - 1; r > 0; r--) {
      next[r][c] = next[r - 1][c];
    }
    next[0][c] = 0;
  }
  return { board: next, mowed };
}

// The reaper claims one skull from each player: finds the lowest piece of
// each player, removes it, and lets the pieces above fall down (gravity).
export function reapSkulls(board: Board): { board: Board; mowed: [number, number][] } {
  const next = board.map((row) => row.slice());
  const mowed: [number, number][] = [];

  for (const player of [1, 2] as Player[]) {
    let target: [number, number] | null = null;
    for (let r = ROWS - 1; r >= 0; r--) {
      for (let c = 0; c < COLS; c++) {
        if (next[r][c] === player) {
          target = [r, c];
          break;
        }
      }
      if (target) break;
    }
    if (target) {
      const [tr, tc] = target;
      next[tr][tc] = 0;
      mowed.push([tr, tc]);
      for (let r = tr; r > 0; r--) {
        next[r][tc] = next[r - 1][tc];
      }
      next[0][tc] = 0;
    }
  }
  return { board: next, mowed };
}

// Evaluate a window of 4 cells for `me`.
function scoreWindow(window: Cell[], me: Player): number {
  const opp = (me === 1 ? 2 : 1) as Player;
  let mine = 0;
  let opps = 0;
  let empties = 0;
  for (const v of window) {
    if (v === me) mine++;
    else if (v === opp) opps++;
    else empties++;
  }
  let s = 0;
  if (mine === 4) s += 100000;
  else if (mine === 3 && empties === 1) s += 120;
  else if (mine === 2 && empties === 2) s += 18;
  if (opps === 3 && empties === 1) s -= 140; // block opponent wins
  else if (opps === 2 && empties === 2) s -= 12;
  return s;
}

function evaluate(board: Board, me: Player): number {
  let score = 0;
  // Center column preference
  const center = Math.floor(COLS / 2);
  for (let r = 0; r < ROWS; r++) if (board[r][center] === me) score += 6;

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += scoreWindow([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]], me);
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      score += scoreWindow([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]], me);
    }
  }
  // Diagonal down-right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += scoreWindow(
        [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]],
        me,
      );
    }
  }
  // Diagonal down-left
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 3; c < COLS; c++) {
      score += scoreWindow(
        [board[r][c], board[r + 1][c - 1], board[r + 2][c - 2], board[r + 3][c - 3]],
        me,
      );
    }
  }
  return score;
}

function orderCols(board: Board): number[] {
  const cols = validCols(board);
  const center = Math.floor(COLS / 2);
  return cols.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  ai: Player,
): number {
  const win = findWin(board);
  if (win) {
    return win.player === ai ? 1_000_000 + depth : -1_000_000 - depth;
  }
  if (isFull(board)) return 0;
  if (depth === 0) return evaluate(board, ai);

  const player: Player = maximizing ? ai : ((ai === 1 ? 2 : 1) as Player);

  if (maximizing) {
    let best = -Infinity;
    for (const c of orderCols(board)) {
      const d = drop(board, c, player);
      if (!d) continue;
      best = Math.max(best, minimax(d.board, depth - 1, alpha, beta, false, ai));
      alpha = Math.max(alpha, best);
      if (alpha >= beta) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const c of orderCols(board)) {
      const d = drop(board, c, player);
      if (!d) continue;
      best = Math.min(best, minimax(d.board, depth - 1, alpha, beta, true, ai));
      beta = Math.min(beta, best);
      if (alpha >= beta) break;
    }
    return best;
  }
}

export type Difficulty = "makkelijk" | "normaal" | "moeilijk";

const DEPTH: Record<Difficulty, number> = { makkelijk: 1, normaal: 4, moeilijk: 6 };

// Pick the AI's best move. On "makkelijk" it mostly plays random with a little
// blocking so a beginner can still win.
export function chooseAiMove(board: Board, ai: Player, difficulty: Difficulty): number {
  const cols = validCols(board);
  if (cols.length === 0) return -1;

  if (difficulty === "makkelijk") {
    // Win if possible, block immediate threat, otherwise random.
    for (const c of cols) {
      const d = drop(board, c, ai);
      if (d && findWin(d.board)?.player === ai) return c;
    }
    const human = (ai === 1 ? 2 : 1) as Player;
    for (const c of cols) {
      const d = drop(board, c, human);
      if (d && findWin(d.board)?.player === human) return c;
    }
    return cols[Math.floor(Math.random() * cols.length)];
  }

  let bestScore = -Infinity;
  let bestCol = cols[Math.floor(cols.length / 2)];
  for (const c of orderCols(board)) {
    const d = drop(board, c, ai);
    if (!d) continue;
    const s = minimax(d.board, DEPTH[difficulty] - 1, -Infinity, Infinity, false, ai);
    if (s > bestScore) {
      bestScore = s;
      bestCol = c;
    }
  }
  return bestCol;
}
