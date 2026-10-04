export default function FacilityStatusBadge({ size = "md" }) {
  const sizeClasses = size === "sm" ? "px-2.5 py-1 text-[9px]" : "px-3 py-1 text-[10px]"

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-ink bg-surface font-bold uppercase tracking-[0.1em] text-ink ${sizeClasses}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ink" />
      Floor Verified
    </span>
  )
}
