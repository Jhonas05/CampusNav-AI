export function supportsWebGL(documentRef = globalThis.document) {
  if (!documentRef?.createElement) return false
  try {
    const canvas = documentRef.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
  } catch {
    return false
  }
}

