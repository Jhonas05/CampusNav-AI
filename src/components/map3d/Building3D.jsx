import Floor3D from "./Floor3D"

export default function Building3D(props) {
  return (
    <group>
      {props.floors.map((floor) => <Floor3D key={floor.id} floor={floor} {...props} />)}
    </group>
  )
}

