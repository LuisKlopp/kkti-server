type DimensionScore = {
  EI: { E: number; I: number };
  SN: { S: number; N: number };
  TF: { T: number; F: number };
  JP: { J: number; P: number };
};

type DimensionPair = { A: number; B: number };

type TieBreakParams = {
  heavyA: number;
  heavyB: number;
  countA: number;
  countB: number;
  lastChoice: 'A' | 'B';
};

type MbtiRatios = {
  eRatio: number;
  iRatio: number;
  sRatio: number;
  nRatio: number;
  tRatio: number;
  fRatio: number;
  jRatio: number;
  pRatio: number;
};

export function applyTieBreak(
  pair: DimensionPair,
  tie: TieBreakParams,
): 'A' | 'B' {
  if (pair.A !== pair.B) return pair.A > pair.B ? 'A' : 'B';

  if (tie.heavyA !== tie.heavyB) return tie.heavyA > tie.heavyB ? 'A' : 'B';

  if (tie.countA !== tie.countB) return tie.countA > tie.countB ? 'A' : 'B';

  return tie.lastChoice;
}

function calcPercent(a: number, b: number) {
  const total = a + b;
  if (total === 0) return 50;

  const raw = a / total; // 0~1
  return smoothPercent(raw);
}

export function calculateMbtiRatios(scores: DimensionScore): MbtiRatios {
  const e = calcPercent(scores.EI.E, scores.EI.I);
  const s = calcPercent(scores.SN.S, scores.SN.N);
  const t = calcPercent(scores.TF.T, scores.TF.F);
  const j = calcPercent(scores.JP.J, scores.JP.P);

  return {
    eRatio: e,
    iRatio: 100 - e,
    sRatio: s,
    nRatio: 100 - s,
    tRatio: t,
    fRatio: 100 - t,
    jRatio: j,
    pRatio: 100 - j,
  };
}

export function calculateMbtiByWinners(winners: {
  EI: 'A' | 'B';
  SN: 'A' | 'B';
  TF: 'A' | 'B';
  JP: 'A' | 'B';
}): string {
  return (
    (winners.EI === 'A' ? 'E' : 'I') +
    (winners.SN === 'A' ? 'S' : 'N') +
    (winners.TF === 'A' ? 'T' : 'F') +
    (winners.JP === 'A' ? 'J' : 'P')
  );
}

export function calculateExpressedStyle(scores: DimensionScore): string {
  const { S, N } = scores.SN;
  const { T, F } = scores.TF;

  const totalSN = S + N || 1;
  const totalTF = T + F || 1;

  const S_ratio = S / totalSN;
  const N_ratio = N / totalSN;
  const T_ratio = T / totalTF;
  const F_ratio = F / totalTF;

  const isStrong = (r: number) => r >= 0.6;

  const sn_mbti = N >= S ? 'N' : 'S';
  const tf_mbti = T >= F ? 'T' : 'F';

  const sn_expressed =
    sn_mbti === 'N'
      ? isStrong(N_ratio)
        ? 'N'
        : 'S'
      : isStrong(S_ratio)
        ? 'S'
        : 'N';

  const tf_expressed =
    tf_mbti === 'T'
      ? isStrong(T_ratio)
        ? 'T'
        : 'F'
      : isStrong(F_ratio)
        ? 'F'
        : 'T';

  return sn_expressed + tf_expressed;
}

function smoothPercent(raw: number) {
  if (raw >= 0.7 || raw <= 0.3) {
    return Math.round(raw * 100);
  }

  const alpha = 0.8;
  const eased = raw ** alpha / (raw ** alpha + (1 - raw) ** alpha);
  return Math.round(eased * 100);
}
