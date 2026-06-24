'use client'

import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  show: (toast: Omit<Toast, 'id'>) => string
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const duration = toast.duration ?? 4000
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    if (duration > 0) {
      setTimeout(() => get().dismiss(id), duration)
    }
    return id
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// İstifadə rahatlığı üçün shortcut-lar
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().show({ type: 'success', title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().show({ type: 'error', title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().show({ type: 'info', title, description }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().show({ type: 'warning', title, description }),
}
