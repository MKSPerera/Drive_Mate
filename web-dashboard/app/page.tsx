"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import LoginPage from "./login/page"

/**
 * Home page component
 * Entry point of the application
 * Redirects to dashboard if user is logged in, otherwise shows login page
 */
export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if there's an existing token
    const token = localStorage.getItem('token')
    if (token) {
      router.replace("/dashboard")
    }
    setIsLoading(false)
  }, [router])

  /**
   * Handles successful login
   * Redirects to dashboard if token exists
   */
  const handleLogin = () => {
    const token = localStorage.getItem('token')
    if (token) {
      router.replace("/dashboard")
    }
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  }

  // Show login page by default
  return <LoginPage onLogin={handleLogin} />
}

