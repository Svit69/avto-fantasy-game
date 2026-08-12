export const playerPositions = {
  goalkeeper: "ВРАТАРЬ",
  defender: "ЗАЩИТНИКИ",
  forward: "НАПАДАЮЩИЕ",
};

export function normalizePlayerPosition(position) {
  const positionMap = {
    вратарь: playerPositions.goalkeeper,
    защитник: playerPositions.defender,
    нападающий: playerPositions.forward,
  };

  return positionMap[position] ?? position;
}
