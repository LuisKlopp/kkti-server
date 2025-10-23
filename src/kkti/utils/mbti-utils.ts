type DimensionScore = {
  EI: { E: number; I: number };
  SN: { S: number; N: number };
  TF: { T: number; F: number };
  JP: { J: number; P: number };
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
  const percent = (a: number, b: number) =>
    Math.round((a / (a + b || 1)) * 100);

  return {
    eRatio: percent(scores.EI.E, scores.EI.I),
    iRatio: percent(scores.EI.I, scores.EI.E),
    sRatio: percent(scores.SN.S, scores.SN.N),
    nRatio: percent(scores.SN.N, scores.SN.S),
    tRatio: percent(scores.TF.T, scores.TF.F),
    fRatio: percent(scores.TF.F, scores.TF.T),
    jRatio: percent(scores.JP.J, scores.JP.P),
    pRatio: percent(scores.JP.P, scores.JP.J),
  };
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
