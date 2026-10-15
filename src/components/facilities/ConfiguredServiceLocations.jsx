import FacilityCard from "./FacilityCard"

/** Presentation only: eligibility and configured order belong to FacilityService. */
export default function ConfiguredServiceLocations({ services, hasConfiguredMappings, directoryById, operationalLoading }) {
  return (
    <section aria-label="Configured service locations" className="mt-4 border-t border-line pt-3">
      <h2 className="text-sm font-semibold text-ink">Configured locations for this service</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">Administrator-defined order, separate from search matches and operating status.</p>
      {services.length === 0 && <p className="mt-2 text-[13px] text-ink-soft">{hasConfiguredMappings ? "Search a service or approved alias to see its configured locations." : "No configured service locations are available yet."}</p>}
      {services.map(({ code, name, result }) => (
        <div key={code} className="mt-3">
          <h3 className="break-words text-sm font-semibold text-ink">{name}</h3>
          <p role="status" className="mb-2 mt-1 text-[13px] text-ink-soft">{result.ok ? `${result.data.recommendations.length} configured locations with these filters.` : "Configured service locations are temporarily unavailable."}</p>
          {result.ok && result.data.recommendations.length === 0 && <p className="text-[13px] text-ink-soft">No configured service locations match. No destination is inferred.</p>}
          {result.ok && <ol aria-label={`Configured order for ${name}`} className="grid grid-cols-1 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] sm:gap-4">
            {result.data.recommendations.map(({ facility }, position) => (
              <li key={facility.id} className="min-w-0">
                <p className="mb-1 text-xs text-ink-soft">Configured location {position + 1}</p>
                <FacilityCard headingLevel={4} facility={facility} operational={directoryById.get(facility.id) || null} operationalLoading={operationalLoading} />
              </li>
            ))}
          </ol>}
        </div>
      ))}
    </section>
  )
}
