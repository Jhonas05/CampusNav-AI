const eventIdentity = (table, payload) => {
  const record = payload.new?.id ? payload.new : payload.old || {}
  return [table, payload.eventType, record.id, record.updated_at || payload.commit_timestamp || ""].join(":")
}

export const subscribeToTable = (client, { table, onChange, onStatus = (_status) => {} }) => {
  let active = true
  const seen = new Set()
  const order = []
  const channel = client
    .channel(`campusnav-dashboard-${table}-${globalThis.crypto?.randomUUID?.() || Date.now()}`)
    .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
      if (!active) return
      const identity = eventIdentity(table, payload)
      if (seen.has(identity)) return
      seen.add(identity)
      order.push(identity)
      if (order.length > 200) seen.delete(order.shift())
      onChange({ table, payload })
    })
    .subscribe((status) => { if (active) onStatus(status) })

  return () => {
    if (!active) return
    active = false
    client.removeChannel(channel)
  }
}

export const subscribeToAnnouncements = (client, onChange, onStatus) => subscribeToTable(client, { table: "announcements", onChange, onStatus })
export const subscribeToNotifications = (client, onChange, onStatus) => subscribeToTable(client, { table: "notifications", onChange, onStatus })
export const subscribeToFacilityAdvisories = (client, onChange, onStatus) => subscribeToTable(client, { table: "facility_advisories", onChange, onStatus })
export const subscribeToEvents = (client, onChange, onStatus) => subscribeToTable(client, { table: "events", onChange, onStatus })
export const subscribeToAcademicPersonnelUpdates = (client, onChange, onStatus) => subscribeToTable(client, { table: "dashboard_refresh_events", onChange, onStatus })

export const subscribeToDashboardUpdates = (client, onChange, onStatus) => {
  const cleanups = [
    subscribeToAnnouncements(client, onChange, onStatus),
    subscribeToNotifications(client, onChange, onStatus),
    subscribeToFacilityAdvisories(client, onChange, onStatus),
    subscribeToEvents(client, onChange, onStatus),
    subscribeToAcademicPersonnelUpdates(client, onChange, onStatus),
  ]
  return () => cleanups.forEach((cleanup) => cleanup())
}
