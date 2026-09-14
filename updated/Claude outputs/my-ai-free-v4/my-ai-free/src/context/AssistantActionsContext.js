import { createContext, useContext } from 'react'

// Shares the calendar and radio player (both live at the top of the app,
// in App.jsx, so they survive switching tabs) with any component that
// needs to act on a voice/text command — right now, ChatTab.
export const AssistantActionsContext = createContext(null)

export function useAssistantActions() {
  return useContext(AssistantActionsContext)
}
