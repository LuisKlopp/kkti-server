type DimensionScore = {
  EI: { E: number; I: number };
  SN: { S: number; N: number };
  TF: { T: number; F: number };
  JP: { J: number; P: number };
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

  const percent = (val: number, total: number) =>
    ((val / total) * 100).toFixed(1) + '%';

  console.log('🧠 MBTI 계산 결과 디버그');
  console.log('-------------------------');
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
