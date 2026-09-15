export default function FacilityStatusBadge({ size = "md" }) {
  const sizeClasses = size === "sm" ? "px-2.5 py-1 text-[9px]" : "px-3 py-1 text-[10px]"

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-green-700 bg-white font-bold uppercase tracking-[0.1em] text-green-800 ${sizeClasses}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green-600" />
      Floor Verified
    </span>
  )
}
