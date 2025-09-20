import { describe, expect, it } from "vitest";
import {
  extendDataset,
  generateBatch,
  generateName,
  getDataset,
  listDatasetSummary,
  listStylesFor,
  resetDataset,
} from "../nameGenerator";
import type { NameDataset } from "../../types/names";

describe("nameGenerator", () => {
  it("génère un nom valide pour chaque race de base", () => {
    const summary = listDatasetSummary();
    for (const race of summary) {
      for (const gender of race.genders) {
        const generated = generateName({
          race: race.race,
          gender: gender.key,
          style: gender.styles[0],
        });
        expect(generated.value).toBeTypeOf("string");
        expect(generated.value.length).toBeGreaterThan(2);
      }
    }
  });

  it("applique la tonalité douce en remplaçant certaines consonnes", () => {
    const name = generateName({ race: "orc", gender: "masculin", tonality: "douce" });
    expect(name.value.toLowerCase()).not.toContain("rk");
  });

  it("respecte les séquences interdites", () => {
    const dataset: NameDataset = {
      test: {
        neutre: {
          mystique: {
            prefixes: ["Ka"],
            suffixes: ["ra"],
            forbiddenSequences: ["kara"],
          },
        },
      },
    };
    extendDataset(dataset);
    expect(() => generateName({ race: "test", gender: "neutre", style: "mystique" }, { maxAttempts: 2 })).toThrow();
    resetDataset();
  });

  it("permet de fusionner des jeux de données additionnels", () => {
    const dataset: NameDataset = {
      humain: {
        masculin: {
          exotique: {
            prefixes: ["Xa"],
            suffixes: ["lor"],
          },
        },
      },
    };
    extendDataset(dataset);
    const styles = listStylesFor("humain", "masculin");
    expect(styles).toContain("exotique");
    resetDataset();
  });

  it("peut générer un lot de suggestions avec une graine déterministe", () => {
    const batchA = generateBatch({ race: "elfe", gender: "feminin" }, 3, { maxAttempts: 10, random: () => 0.5 });
    const batchB = generateBatch({ race: "elfe", gender: "feminin" }, 3, { maxAttempts: 10, random: () => 0.5 });
    expect(batchA.map((item) => item.value)).toEqual(batchB.map((item) => item.value));
  });

  it("expose le jeu de données courant", () => {
    const dataset = getDataset();
    expect(Object.keys(dataset).length).toBeGreaterThan(0);
  });
});
