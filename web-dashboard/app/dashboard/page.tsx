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
import { StatsTrendChart } from '@/components/stats-trend-chart'
import { StatsCardWithChart } from '@/components/stats-card-with-chart'

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalDrivers: '0',
    jobsPostedThisMonth: '0',
    pendingJobs: '0',
    monthlyRevenue: '$0'
  })
  const [monthlyStats, setMonthlyStats] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Simple check for token existence
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      router.replace('/')
      return
    }

    // Fetch dashboard data from backend
    fetchDashboardData(token)

    // Update the API URL to use environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    
    // Fetch monthly stats with error handling
    fetch(`${apiUrl}/dashboard/monthly-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok')
        }
        return res.json()
      })
      .then(data => setMonthlyStats(data))
      .catch(error => {
        console.error('Error fetching monthly stats:', error)
        // Provide mock data as fallback
        setMonthlyStats({
          historicalData: [
            { month: 'Jan', newDrivers: 25, jobsPosted: 30, revenue: 15000 },
            { month: 'Feb', newDrivers: 30, jobsPosted: 35, revenue: 18000 },
            { month: 'Mar', newDrivers: 35, jobsPosted: 32, revenue: 20000 },
            { month: 'Apr', newDrivers: 40, jobsPosted: 38, revenue: 22000 },
            { month: 'May', newDrivers: 45, jobsPosted: 42, revenue: 25000 },
            { month: 'Jun', newDrivers: 50, jobsPosted: 45, revenue: 28000 }
          ],
          changes: {
            driversChange: 11.1,
            jobsChange: 7.1,
            revenueChange: 12.0
          }
        })
      })
  }, [router])

  const fetchDashboardData = async (token) => {
    try {
      // Check if the API URL is configured
      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.warn('API URL not configured. Using fallback data.');
        setDashboardData({
          totalDrivers: '231',
          jobsPostedThisMonth: '47',
          pendingJobs: '32',
          monthlyRevenue: '$52,410'
        });
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        // Fallback to static data if the endpoint isn't available
        console.warn('Dashboard API returned an error. Using fallback data.');
        setDashboardData({
          totalDrivers: '231',
          jobsPostedThisMonth: '47',
          pendingJobs: '32',
          monthlyRevenue: '$52,410'
        });
        setIsLoading(false);
        return;
      }
      
      const data = await response.json()
      setDashboardData({
        totalDrivers: data.totalDrivers || '0',
        jobsPostedThisMonth: data.jobsPostedThisMonth || '0',
        pendingJobs: data.pendingJobs || '0',
        monthlyRevenue: `$${data.monthlyRevenue || '0'}`
      })
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Fallback to static data if there's an error
      setDashboardData({
        totalDrivers: '231',
        jobsPostedThisMonth: '47',
        pendingJobs: '32',
        monthlyRevenue: '$52,410'
      });
      setIsLoading(false)
    }
  }

  const formatChartData = (key: string) => {
    if (!monthlyStats?.historicalData) return [];
    return monthlyStats.historicalData.map((item: any) => ({
      month: item.month,
      value: item[key]
    }));
  };

  const cardData = [
    { 
      title: "Total Drivers", 
      value: dashboardData.totalDrivers, 
      link: "/drivers",
      chartData: monthlyStats ? {
        data: formatChartData('newDrivers'),
        percentageChange: monthlyStats.changes.driversChange
      } : undefined
    },
    { 
      title: "Jobs Posted This Month", 
      value: dashboardData.jobsPostedThisMonth, 
      link: "/job-management",
      chartData: monthlyStats ? {
        data: formatChartData('jobsPosted'),
        percentageChange: monthlyStats.changes.jobsChange
      } : undefined
    },
    { 
      title: "Pending Jobs", 
      value: dashboardData.pendingJobs, 
      link: "/job-management" 
    },
    { 
      title: "Revenue (Monthly)", 
      value: dashboardData.monthlyRevenue, 
      link: null,
      chartData: monthlyStats ? {
        data: formatChartData('revenue'),
        percentageChange: monthlyStats.changes.revenueChange
      } : undefined,
      valuePrefix: "$"
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#F5F3FF]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F3FF] p-6">
            <div className="flex h-full items-center justify-center">
              <div className="text-lg">Loading...</div>
            </div>
          </main>
        </div>
      </div>
    )
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
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {cardData.map((card, index) => (
              <StatsCardWithChart
                key={index}
                title={card.title}
                value={card.value}
                link={card.link}
                chartData={card.chartData}
                valuePrefix={card.valuePrefix}
              />
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

