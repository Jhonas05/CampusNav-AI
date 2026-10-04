import { Component } from "react"

export default class Map3DErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    this.props.onFailure?.(error)
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false })
    }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="ink-grid-paper flex h-full min-h-[inherit] items-center justify-center p-8 text-center">
        <div role="alert" className="max-w-md rounded-2xl border border-ink bg-surface p-6">
          <h2 className="font-heading text-xl font-semibold">3D view unavailable</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">Your current location, destination, and route are preserved. Return to the 2D map to continue.</p>
          <button type="button" onClick={this.props.onReturnTo2D} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-5 font-heading text-sm font-semibold text-on-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2">Return to 2D View</button>
        </div>
      </div>
    )
  }
}
