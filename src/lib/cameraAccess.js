export const CAMERA_PERMISSION_MESSAGE = "Camera permission is required to scan a CampusNav checkpoint."
export const CAMERA_UNAVAILABLE_MESSAGE = "CampusNav could not start the camera. Set your location manually instead."

export function getCameraAccessMessage(error) {
  const permissionDenied = error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError"
  return permissionDenied ? CAMERA_PERMISSION_MESSAGE : CAMERA_UNAVAILABLE_MESSAGE
}
