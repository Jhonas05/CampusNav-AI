import * as React from "react"

const FALLBACK_IMAGE_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23f5f5f7'/%3E%3Cpath d='M260 224l52-58 38 42 24-26 50 58H240z' fill='%23d2d2d7'/%3E%3Ccircle cx='274' cy='130' r='18' fill='%23d2d2d7'/%3E%3C/svg%3E"

/** Provider-neutral image with a built-in first-party fallback. */
const Image = React.forwardRef(
  (
    {
      src: source,
      fittingType = "fill",
      focalPointX,
      focalPointY,
      onError,
      style,
      ...props
    },
    ref
  ) => {
    const [failed, setFailed] = React.useState(false)

    React.useEffect(() => setFailed(false), [source])

    const handleError = (event) => {
      if (!failed) {
        setFailed(true)
        onError?.(event)
      }
    }

    const objectPosition =
      typeof focalPointX === "number" && typeof focalPointY === "number"
        ? `${focalPointX * 100}% ${focalPointY * 100}%`
        : undefined

    return (
      <img
        ref={ref}
        src={!source || failed ? FALLBACK_IMAGE_URL : source}
        onError={handleError}
        style={{
          objectFit: fittingType === "fit" ? "contain" : "cover",
          objectPosition,
          ...style,
        }}
        {...props}
      />
    )
  }
)
Image.displayName = "Image"

export { Image }
