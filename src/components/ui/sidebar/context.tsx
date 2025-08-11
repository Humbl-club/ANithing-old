import * as React from "react"
import type { SidebarState } from "@/hooks/useSidebarState"

export const SidebarContext = React.createContext<SidebarState | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}