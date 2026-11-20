// An explicit build flag also permits offline QA against a local production build.
export const mediaPreviewEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MEDIA_PREVIEW === "true"
