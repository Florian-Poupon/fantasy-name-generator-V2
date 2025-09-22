export type Tonality = "douce" | "tranchante" | "ancienne" | "sauvage" | "lumineuse";

export interface SyllableDescriptor {
  value: string;
  weight?: number;
}

export interface StyleDescriptor {
  prefixes: (string | SyllableDescriptor)[];
  suffixes: (string | SyllableDescriptor)[];
  forbiddenSequences?: string[];
}

export type GenderKey = string;
export type RaceKey = string;
export type StyleKey = string;

export type GenderDescriptor = Record<StyleKey, StyleDescriptor>;
export type RaceDescriptor = Record<GenderKey, GenderDescriptor>;
export type NameDataset = Record<RaceKey, RaceDescriptor>;

export interface NameGenerationOptions {
  race: RaceKey;
  gender: GenderKey;
  style?: StyleKey;
  tonality?: Tonality;
  forbidSequences?: string[];
  seed?: number;
}

export interface NameGenerationConfig {
  datasetOverride?: NameDataset;
  random?: () => number;
  maxAttempts?: number;
}

export interface GeneratedName {
  value: string;
  parts: {
    prefix: string;
    suffix: string;
  };
  metadata: {
    race: RaceKey;
    gender: GenderKey;
    style: StyleKey;
    tonality?: Tonality;
  };
}

export interface DatasetSummary {
  race: RaceKey;
  genders: {
    key: GenderKey;
    styles: StyleKey[];
  }[];
}
