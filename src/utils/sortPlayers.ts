const GENDER_ORDER: Record<'W' | 'M' | 'null', number> = { W: 0, M: 1, null: 2 }

export function sortPlayersByGenderThenName<T extends { name: string; gender: 'M' | 'W' | null }>(
  players: T[],
): T[] {
  return [...players].sort((a, b) => {
    const genderDiff = GENDER_ORDER[a.gender ?? 'null'] - GENDER_ORDER[b.gender ?? 'null']
    if (genderDiff !== 0) return genderDiff
    return a.name.localeCompare(b.name, 'de')
  })
}
