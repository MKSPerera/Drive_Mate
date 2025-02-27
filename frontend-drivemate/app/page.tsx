"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import LoginPage from "./login/page"

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

