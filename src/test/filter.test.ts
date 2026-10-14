import { describe, expect, it } from "vitest";
import { filterProfiles } from "@/lib/filter";
import { seedProfiles } from "@/data/profiles";

const pub = seedProfiles.filter((p) => p.status === "published");

describe("filterProfiles", () => {
  it("filters by city across multi-country availability", () => {
    const r = filterProfiles(pub, { city: "luxembourg-ville" });
    expect(r.map((p) => p.slug).sort()).toEqual(["comtesse-vespera", "duchesse-lilith"]);
  });
  it("mode 'recoit' includes profiles that do both", () => {
    const r = filterProfiles(pub, { mode: "recoit" });
    expect(r.every((p) => p.mode !== "deplace")).toBe(true);
  });
  it("sorts by ascending price", () => {
    const r = filterProfiles(pub, { sort: "priceAsc" });
    expect(r[0].price.perHour).toBe(150);
  });
});
