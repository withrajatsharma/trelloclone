"use client"

import { Eye, EyeOff } from "lucide-react"

export const PasswordToggle = ({ showPassword, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-light-gray hover:text-gray-600 focus:outline-none"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
    </button>
  )
}
