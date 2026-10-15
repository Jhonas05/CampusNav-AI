// Synthetic, local-only public-projection fixtures. Never seed institutional data.
export const discoveryTime = "2026-10-15T02:00:00.000Z"
export const discoveryProvenance = (overrides = {}) => ({
  lifecycle: "PUBLISHED", publishedAt: "2026-10-01T00:00:00.000Z",
  effectiveAt: null, expiresAt: null, verificationStatus: "VERIFIED", dataStatus: "ACTIVE",
  sourceType: "DEVELOPMENT_TEST", sourceId: "FS4-DISCOVERY-FIXTURE",
  sourceLabel: "DEVELOPMENT / TEST / NOT OFFICIAL", lastVerifiedAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z", ...overrides,
})
export const discoveryService = (code, name, overrides = {}) => ({ code, name, provenance: discoveryProvenance(overrides) })
export const discoveryAlias = (serviceCode, alias, overrides = {}) => ({ serviceCode, alias, provenance: discoveryProvenance(overrides) })
export const discoveryMapping = (serviceCode, facilityId, overrides = {}) => ({
  serviceCode, facilityId, recommendationRank: 100, provenance: discoveryProvenance(overrides),
})
export const discoveryFixtures = () => ({
  services: [
    discoveryService("fixture-records", "Fixture Records Service"),
    discoveryService("fixture-unmapped", "Fixture Unmapped Service"),
    discoveryService("fixture-pending", "Fixture Pending Service", { verificationStatus: "PENDING_VERIFICATION", dataStatus: "PENDING_VERIFICATION" }),
    discoveryService("fixture-demo", "Fixture Demo Service", { verificationStatus: "DEMO_ONLY", dataStatus: "DEMO" }),
  ],
  aliases: [
    discoveryAlias("fixture-records", "Fixture Transcript"),
    discoveryAlias("fixture-records", "Library"),
    discoveryAlias("fixture-records", "Fixture Pending Alias", { verificationStatus: "PENDING_VERIFICATION" }),
    discoveryAlias("fixture-records", "Fixture Demo Alias", { verificationStatus: "DEMO_ONLY", dataStatus: "DEMO" }),
  ],
  mappings: [discoveryMapping("fixture-records", "library"), discoveryMapping("fixture-records", "registrar-office")],
})
