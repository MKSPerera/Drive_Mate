"use client"

import { JobStatisticsChart } from "@/components/job-statistics-chart"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simple check for token existence
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      router.replace('/')
      return
    }

    // If we have both token and user data, we can proceed
    setIsLoading(false)
  }, [router])

  const cardData = [
    { title: "Total Drivers", value: "231", link: "/drivers" },
    { title: "Active Jobs", value: "47", link: "/job-management" },
    { title: "Available Vehicles", value: "89", link: null },
    { title: "Revenue (Monthly)", value: "$52,410", link: null },
  ]

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  }

  return (
    <div className="flex h-screen bg-[#F5F3FF]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F3FF] p-6">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Overview</h3>
            <Link href="/job-management" passHref>
              <Button className="bg-[#8C61FF] hover:bg-[#6B46C1]">
                <Plus className="mr-2 h-4 w-4" /> New Job
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cardData.map((card, index) => (
              <Card
                key={index}
                className={`${card.link ? "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105" : ""}`}
              >
                {card.link ? (
                  <Link href={card.link}>
                    <CardContent className="p-6">
                      <CardTitle className="text-sm font-medium text-[#6B46C1]">{card.title}</CardTitle>
                      <div className="text-2xl font-bold mt-2">{card.value}</div>
                    </CardContent>
                  </Link>
                ) : (
                  <CardContent className="p-6">
                    <CardTitle className="text-sm font-medium text-[#6B46C1]">{card.title}</CardTitle>
                    <div className="text-2xl font-bold mt-2">{card.value}</div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Job Statistics Chart */}
          <div className="mt-6">
            <JobStatisticsChart />
          </div>
        </main>
      </div>
    </div>
  )
}

