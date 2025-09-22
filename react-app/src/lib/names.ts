import rawData from '../data/names.json';
import type { Gender, NamePool, NamesDataset } from '../types/names';

export const dataset = rawData as NamesDataset;

export const genderOrder: Gender[] = ['masculin', 'feminin', 'non-binaire'];

export const genderLabels: Record<Gender, string> = {
  masculin: 'Masculin',
  feminin: 'Féminin',
  'non-binaire': 'Non-binaire',
};

export const DEFAULT_STYLE = 'classique';

export const getRaces = (): string[] => Object.keys(dataset).sort();

export const getAvailableGenders = (race: string): Gender[] => {
  const raceData = dataset[race];
  if (!raceData) {
    return [];
  }

  return genderOrder.filter((gender) => Boolean(raceData[gender]));
};

export const getAvailableStyles = (race: string, gender: Gender): string[] => {
  const genderData = dataset[race]?.[gender];
  return genderData ? Object.keys(genderData) : [];
};

const getPool = (
  race: string,
  gender: Gender,
  style: string,
): NamePool | null => {
  const genderData = dataset[race]?.[gender];
  if (!genderData) {
    return null;
  }

  return genderData[style] ?? null;
};

const randomFrom = <T,>(items: readonly T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

export const composeName = (
  race: string,
  gender: Gender,
  style?: string,
): string | null => {
  const availableStyles = getAvailableStyles(race, gender);
  const resolvedStyle = style && availableStyles.includes(style)
    ? style
    : availableStyles[0];

  if (!resolvedStyle) {
    return null;
  }

  const pool = getPool(race, gender, resolvedStyle);
  if (!pool) {
    return null;
  }

  const prefix = randomFrom(pool.prefixes);
  const suffix = randomFrom(pool.suffixes);
  return `${prefix}${suffix}`;
};

export const generateNames = (
  race: string,
  gender: Gender,
  quantity: number,
  style?: string,
): string[] => {
  const safeQuantity = Number.isFinite(quantity) ? Math.max(1, Math.min(20, Math.floor(quantity))) : 1;
  const names = new Set<string>();

  while (names.size < safeQuantity) {
    const name = composeName(race, gender, style);
    if (!name) {
      break;
    }

    names.add(name);

    if (names.size >= poolSize(race, gender, style)) {
      // Avoid infinite loops when requesting more unique values than available combinations.
      break;
    }
  }

  return Array.from(names);
};

const poolSize = (race: string, gender: Gender, style?: string): number => {
  const availableStyles = getAvailableStyles(race, gender);
  const resolvedStyle = style && availableStyles.includes(style)
    ? style
    : availableStyles[0];
  if (!resolvedStyle) {
    return 0;
  }
  const pool = getPool(race, gender, resolvedStyle);
  if (!pool) {
    return 0;
  }
  return pool.prefixes.length * pool.suffixes.length;
};
