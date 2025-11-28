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

export function applyTieBreakToDimension(
  dim: 'EI' | 'SN' | 'TF' | 'JP',
  scores: any,
  tie: any,
) {
  const winner = applyTieBreak(scores, tie);

  switch (dim) {
    case 'EI':
      if (winner === 'A') scores.E += 1;
      else scores.I += 1;
      return scores;

    case 'SN':
      if (winner === 'A') scores.S += 1;
      else scores.N += 1;
      return scores;

    case 'TF':
      if (winner === 'A') scores.T += 1;
      else scores.F += 1;
      return scores;

    case 'JP':
      if (winner === 'A') scores.J += 1;
      else scores.P += 1;
      return scores;
  }
}

export function applyTieBreak(
  pair: DimensionPair,
  tie: TieBreakParams,
): 'A' | 'B' {
  if (pair.A !== pair.B) return pair.A > pair.B ? 'A' : 'B';

  if (tie.heavyA !== tie.heavyB) return tie.heavyA > tie.heavyB ? 'A' : 'B';

  if (tie.countA !== tie.countB) return tie.countA > tie.countB ? 'A' : 'B';

  return tie.lastChoice;
}
export function calculateMbti(scores: DimensionScore): string {
  return (
    (scores.EI.E >= scores.EI.I ? 'E' : 'I') +
    (scores.SN.S >= scores.SN.N ? 'S' : 'N') +
    (scores.TF.T >= scores.TF.F ? 'T' : 'F') +
    (scores.JP.J >= scores.JP.P ? 'J' : 'P')
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

  const isStrong = (ratio: number) => ratio >= 0.6;

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

export function calculateMbtiRatios(scores: DimensionScore): MbtiRatios {
  const ratio = (a: number, b: number) => {
    const total = a + b;
    if (total === 0) return 50;

    const raw = a / total;
    return smoothPercent(raw);
  };

  return {
    eRatio: ratio(scores.EI.E, scores.EI.I),
    iRatio: 100 - ratio(scores.EI.E, scores.EI.I),
    sRatio: ratio(scores.SN.S, scores.SN.N),
    nRatio: 100 - ratio(scores.SN.S, scores.SN.N),
    tRatio: ratio(scores.TF.T, scores.TF.F),
    fRatio: 100 - ratio(scores.TF.T, scores.TF.F),
    jRatio: ratio(scores.JP.J, scores.JP.P),
    pRatio: 100 - ratio(scores.JP.J, scores.JP.P),
  };
}

function smoothPercent(raw: number): number {
  const strength = 10;
  const scaled = 1 / (1 + Math.exp(-strength * (raw - 0.5)));

  return Math.round(scaled * 100);
}

export function logMbtiDebug(
  scores: DimensionScore,
  mbti: string,
  style: string,
) {
  const { E, I } = scores.EI;
  const { S, N } = scores.SN;
  const { T, F } = scores.TF;
  const { J, P } = scores.JP;

  const totalSN = S + N || 1;
  const totalTF = T + F || 1;

  const ratios = calculateMbtiRatios(scores);

  const percent = (val: number, total: number) =>
    ((val / total) * 100).toFixed(1) + '%';

  console.log('-------------------------');
  console.log('🧠 MBTI 비율 결과 디버그');
  console.log(`E: ${ratios.eRatio}% | I: ${ratios.iRatio}%`);
  console.log(`S: ${ratios.sRatio}% | N: ${ratios.nRatio}%`);
  console.log(`T: ${ratios.tRatio}% | F: ${ratios.fRatio}%`);
  console.log(`J: ${ratios.jRatio}% | P: ${ratios.pRatio}%`);
  console.log('-------------------------');
  console.log('🧠 MBTI 비율 결과 디버그');
  console.log(`🔹 E: ${E}, I: ${I}`);
  console.log(`🔹 S: ${S}, N: ${N}`);
  console.log(`🔹 T: ${T}, F: ${F}`);
  console.log(`🔹 J: ${J}, P: ${P}`);
  console.log('-------------------------');
  console.log(
    `📊 S:N = ${S}:${N} → S: ${percent(S, totalSN)}, N: ${percent(N, totalSN)}`,
  );
  console.log(
    `📊 T:F = ${T}:${F} → T: ${percent(T, totalTF)}, F: ${percent(F, totalTF)}`,
  );
  console.log('-------------------------');
  console.log(`✅ 최종 MBTI: ${mbti}`);
  console.log(`✨ 꺼내쓰는 심리기능 (expressedStyle): ${style}`);
}
