/**
 * Posição das pintas numa grade 3×3, em [linha, coluna].
 * O desenho é CSS puro: nenhuma fonte do sistema decide como o dado aparece.
 */
export const PIPS: Record<number, readonly (readonly [number, number])[]> = {
  1: [[2, 2]],
  2: [
    [1, 1],
    [3, 3],
  ],
  3: [
    [1, 1],
    [2, 2],
    [3, 3],
  ],
  4: [
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3],
  ],
  5: [
    [1, 1],
    [1, 3],
    [2, 2],
    [3, 1],
    [3, 3],
  ],
  6: [
    [1, 1],
    [1, 3],
    [2, 1],
    [2, 3],
    [3, 1],
    [3, 3],
  ],
};

export interface PipsProps {
  value: number;
}

export function Pips({ value }: PipsProps) {
  const pips = PIPS[value];

  if (!pips) return null;

  return (
    <>
      {pips.map(([row, column]) => (
        <span
          key={`${row}-${column}`}
          style={{ gridRow: row, gridColumn: column }}
          className="m-auto size-[78%] rounded-full bg-current"
        />
      ))}
    </>
  );
}
