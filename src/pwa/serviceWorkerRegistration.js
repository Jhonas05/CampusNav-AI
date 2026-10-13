import { registerSW } from 'virtual:pwa-register'

const listeners = new Set()
const state = {
  offlineReady: false,
  updateAvailable: false,
  registrationError: null,
}

let activateUpdate = async () => undefined

const notify = () => {
  const snapshot = { ...state }
  listeners.forEach((listener) => listener(snapshot))
}

export const subscribeToServiceWorker = (listener) => {
  listeners.add(listener)
  listener({ ...state })
  return () => listeners.delete(listener)
}

export const getServiceWorkerState = () => ({ ...state })

export const applyServiceWorkerUpdate = () => activateUpdate(true)

export const registerCampusNavServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return

  activateUpdate = registerSW({
    immediate: true,
    onOfflineReady() {
      state.offlineReady = true
      notify()
    },
    onNeedRefresh() {
      state.updateAvailable = true
      notify()
    },
    onRegisterError(error) {
      state.registrationError = error instanceof Error ? error.message : 'Service worker registration failed.'
      notify()
    },
  })
}
