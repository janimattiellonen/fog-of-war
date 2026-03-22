export function serializeMap(grid: string[][]): string {
  const lines = ['GRID'];
  for (const row of grid) {
    lines.push(row.join(' '));
  }
  return lines.join('\n') + '\n';
}
