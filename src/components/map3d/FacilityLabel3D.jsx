import { Html } from "@react-three/drei"

export default function FacilityLabel3D({ position, label, strong = false }) {
  return (
    <Html position={position} center distanceFactor={15} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <span
        className={`block max-w-32 whitespace-nowrap rounded-full bg-white/95 px-2.5 py-1 text-center text-[9px] font-semibold leading-tight tracking-tight text-[#1D1D1F] shadow-[0_2px_10px_rgba(0,0,0,0.14)] ${
          strong ? "border-[1.5px] border-[#213A92]" : "border border-[#D2D2D7]"
        }`}
      >
        {label}
      </span>
    </Html>
  )
}
