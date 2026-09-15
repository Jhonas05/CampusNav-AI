import * as THREE from "three"

export const createExtrudedPolygonGeometry = (points, depth) => {
  const shape = new THREE.Shape()
  points.forEach((point, index) => {
    if (index === 0) shape.moveTo(point.x, -point.z)
    else shape.lineTo(point.x, -point.z)
  })
  shape.closePath()
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1, steps: 1 })
  geometry.rotateX(-Math.PI / 2)
  geometry.computeVertexNormals()
  return geometry
}

