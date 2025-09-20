import datasetSource from "../data/names.json";
import type {
  DatasetSummary,
  GeneratedName,
  GenderDescriptor,
  GenderKey,
  NameDataset,
  NameGenerationConfig,
  NameGenerationOptions,
  RaceKey,
  StyleDescriptor,
  StyleKey,
  Tonality,
} from "../types/names";

interface WeightedSyllable {
  value: string;
  weight: number;
}

const BASE_DATASET: NameDataset = JSON.parse(JSON.stringify(datasetSource));
let runtimeDataset: NameDataset = JSON.parse(JSON.stringify(BASE_DATASET));

const DEFAULT_MAX_ATTEMPTS = 20;

const tonalityAffixes: Record<Tonality, string[]> = {
  douce: ["ia", "iel", "aea"],
  tranchante: ["-kar", "-zor", "-ash"],
  ancienne: ["us", "eth", "ion"],
  sauvage: ["'gar", "'thok", "'zug"],
  lumineuse: ["-ël", "-orien", "-ael"],
};

function normaliseSyllable(entry: string | { value: string; weight?: number }): WeightedSyllable {
  if (typeof entry === "string") {
    return { value: entry, weight: 1 };
  }
  return { value: entry.value, weight: entry.weight ?? 1 };
}

function pickWeighted(list: (string | { value: string; weight?: number })[], rng: () => number): WeightedSyllable {
  const normalised = list.map(normaliseSyllable);
  const totalWeight = normalised.reduce((acc, item) => acc + item.weight, 0);
  const threshold = rng() * totalWeight;
  let cumulative = 0;
  for (const item of normalised) {
    cumulative += item.weight;
    if (threshold <= cumulative) {
      return item;
    }
  }
  return normalised[normalised.length - 1] ?? { value: "", weight: 1 };
}

function sanitiseName(name: string): string {
  const compact = name.replace(/\s+/g, "");
  if (!compact) {
    return "";
  }
  return `${compact.charAt(0).toUpperCase()}${compact.slice(1)}`;
}

function applyTonality(baseName: string, tonality: Tonality | undefined, rng: () => number): string {
  if (!tonality) {
    return baseName;
  }

  const affixes = tonalityAffixes[tonality];
  const suffix = affixes[Math.floor(rng() * affixes.length)] ?? "";

  switch (tonality) {
    case "douce": {
      const softened = baseName.replace(/r/g, "l");
      return softened + suffix;
    }
    case "tranchante": {
      const emphasised = baseName.endsWith("k") ? baseName : `${baseName}k`;
      return emphasised + suffix;
    }
    case "ancienne": {
      const archaic = baseName.endsWith("us") ? baseName : `${baseName}${suffix}`;
      return archaic;
    }
    case "sauvage": {
      const guttural = baseName
        .replace(/a/g, "â")
        .replace(/o/g, "ô")
        .replace(/e/g, "ë");
      return guttural + suffix;
    }
    case "lumineuse": {
      const luminous = baseName.replace(/[^aeiouyäëïöüâêîôû]/g, (c) => c + "h");
      return luminous + suffix;
    }
    default:
      return baseName;
  }
}

function createRng(seed?: number, override?: () => number): () => number {
  if (override) {
    return override;
  }
  if (seed === undefined) {
    return Math.random;
  }
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function mergeDataset(base: NameDataset, extension: NameDataset): NameDataset {
  const merged: NameDataset = JSON.parse(JSON.stringify(base));
  for (const [race, genders] of Object.entries(extension)) {
    merged[race] ??= {};
    const targetRace = merged[race]!;
    for (const [gender, styles] of Object.entries(genders)) {
      targetRace[gender] ??= {};
      const targetGender = targetRace[gender]!;
      for (const [style, payload] of Object.entries(styles)) {
        if (!targetGender[style]) {
          targetGender[style] = JSON.parse(JSON.stringify(payload));
        } else {
          const current = targetGender[style]!;
          current.prefixes = [...current.prefixes, ...payload.prefixes];
          current.suffixes = [...current.suffixes, ...payload.suffixes];
          const forbidden = new Set([...(current.forbiddenSequences ?? []), ...(payload.forbiddenSequences ?? [])]);
          current.forbiddenSequences = Array.from(forbidden);
        }
      }
    }
  }
  return merged;
}

function resolveStyleDescriptor(
  dataset: NameDataset,
  race: RaceKey,
  gender: GenderKey,
  style?: StyleKey,
): { descriptor: StyleDescriptor; styleKey: StyleKey } {
  const raceDescriptor = dataset[race];
  if (!raceDescriptor) {
    throw new Error(`Race inconnue: ${race}`);
  }
  const genderDescriptor: GenderDescriptor | undefined = raceDescriptor[gender];
  if (!genderDescriptor) {
    throw new Error(`Genre inconnu: ${gender} pour la race ${race}`);
  }
  const styleKey = style ?? Object.keys(genderDescriptor)[0];
  if (!styleKey) {
    throw new Error(`Aucun style disponible pour ${race}/${gender}`);
  }
  const descriptor = genderDescriptor[styleKey];
  if (!descriptor) {
    throw new Error(`Style inconnu: ${styleKey} pour ${race}/${gender}`);
  }
  return { descriptor, styleKey };
}

export function resetDataset(): void {
  runtimeDataset = JSON.parse(JSON.stringify(BASE_DATASET));
}

export function extendDataset(extension: NameDataset): void {
  runtimeDataset = mergeDataset(runtimeDataset, extension);
}

export function getDataset(): NameDataset {
  return runtimeDataset;
}

export function listDatasetSummary(dataset: NameDataset = runtimeDataset): DatasetSummary[] {
  return Object.entries(dataset).map(([race, genders]) => ({
    race,
    genders: Object.entries(genders).map(([gender, styles]) => ({
      key: gender,
      styles: Object.keys(styles),
    })),
  }));
}

export function generateName(
  options: NameGenerationOptions,
  config: NameGenerationConfig = {},
): GeneratedName {
  const dataset = config.datasetOverride ?? runtimeDataset;
  const rng = createRng(options.seed, config.random);
  const { descriptor, styleKey } = resolveStyleDescriptor(dataset, options.race, options.gender, options.style);
  const forbidList = new Set(
    [...(descriptor.forbiddenSequences ?? []), ...(options.forbidSequences ?? [])].map((item) => item.toLowerCase()),
  );

  const maxAttempts = config.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  let attempts = 0;
  let prefix: WeightedSyllable | undefined;
  let suffix: WeightedSyllable | undefined;
  let candidate = "";

  let isForbidden = false;
  do {
    prefix = pickWeighted(descriptor.prefixes, rng);
    suffix = pickWeighted(descriptor.suffixes, rng);
    candidate = sanitiseName(`${prefix.value}${suffix.value}`);
    isForbidden = candidate.length === 0 || Array.from(forbidList).some((pattern) => candidate.toLowerCase().includes(pattern));
    attempts += 1;
  } while (attempts < maxAttempts && isForbidden);

  if (!candidate || isForbidden) {
    throw new Error(`Impossible de générer un nom après ${attempts} tentatives`);
  }

  const tonalCandidate = applyTonality(candidate, options.tonality, rng);

  return {
    value: tonalCandidate,
    parts: {
      prefix: prefix?.value ?? "",
      suffix: suffix?.value ?? "",
    },
    metadata: {
      race: options.race,
      gender: options.gender,
      style: styleKey,
      tonality: options.tonality,
    },
  };
}

export function generateBatch(
  options: NameGenerationOptions,
  count: number,
  config: NameGenerationConfig = {},
): GeneratedName[] {
  const results: GeneratedName[] = [];
  const rng = createRng(options.seed, config.random);
  for (let index = 0; index < count; index += 1) {
    const seededOptions = { ...options, seed: options.seed ? options.seed + index : undefined };
    results.push(
      generateName(seededOptions, {
        ...config,
        random: () => rng(),
      }),
    );
  }
  return results;
}

export function listStylesFor(race: RaceKey, gender: GenderKey, dataset: NameDataset = runtimeDataset): StyleKey[] {
  const raceDescriptor = dataset[race];
  if (!raceDescriptor) {
    return [];
  }
  const genderDescriptor = raceDescriptor[gender];
  if (!genderDescriptor) {
    return [];
  }
  return Object.keys(genderDescriptor);
}
