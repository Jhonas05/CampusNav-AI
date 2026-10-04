import { Html } from "@react-three/drei"

export default function FacilityLabel3D({ position, label, strong = false }) {
  return (
    <Html position={position} center distanceFactor={15} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <span
        className={`block max-w-36 whitespace-nowrap rounded-md px-2 py-0.5 text-center text-[9px] font-semibold leading-tight tracking-tight shadow-[0_2px_8px_rgba(29,31,32,0.12)] ${
          strong ? "border border-ink bg-ink text-on-ink" : "border border-line-strong bg-surface/95 text-ink"
        }`}
      >
        {label}
      </span>
    </Html>
  )
}
