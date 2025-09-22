export type Gender = 'masculin' | 'feminin' | 'non-binaire';

export type NamePool = {
  prefixes: string[];
  suffixes: string[];
};

export type NameStyleMap = Record<string, NamePool>;

export type RaceData = Partial<Record<Gender, NameStyleMap>>;

export type NamesDataset = Record<string, RaceData>;
