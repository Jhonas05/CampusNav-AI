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
      <div className="flex min-h-[610px] items-center justify-center bg-[#F5F5F7] p-8 text-center">
        <div className="max-w-md rounded-3xl border border-[#1D1D1F] bg-white p-6">
          <h2 className="text-xl font-semibold">3D view is unavailable</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6E6E73]">Your navigation state is safe. Return to the 2D map to continue.</p>
          <button type="button" onClick={this.props.onReturnTo2D} className="mt-5 rounded-full bg-[#1D1D1F] px-5 py-2.5 text-sm font-medium text-white">Return to 2D View</button>
        </div>
      </div>
    )
  }
}

