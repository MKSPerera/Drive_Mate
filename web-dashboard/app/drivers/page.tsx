"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Driver = {
  id: number
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  vehicleType: string
  vehicleCapacity: number
  vehicleLicense: string
  driverRanking?: {
    averageRate: number
    workRate: number
    feedbackRate: number
    cancellationRate: number
  }
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("averageRate")
  const [filterStatus, setFilterStatus] = useState<"all" | "high" | "low">("all")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch drivers data
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Authentication token not found')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drivers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch drivers')
        }

        const data = await response.json()
        setDrivers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch drivers')
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
  }, [])

  const getFilteredDrivers = (drivers: Driver[]) => {
    return drivers.filter(driver => {
      const matchesSearch = (
        `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase())
      )

      const averageRate = driver.driverRanking?.averageRate || 0
      const matchesFilter = filterStatus === "all" ||
        (filterStatus === "high" && averageRate >= 4.0) ||
        (filterStatus === "low" && averageRate < 4.0)

      return matchesSearch && matchesFilter
    })
  }

  const getSortedDrivers = (drivers: Driver[]) => {
    return [...drivers].sort((a, b) => {
      if (sortBy === "name") {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      }
      if (sortBy === "averageRate") {
        const rateA = a.driverRanking?.averageRate || 0
        const rateB = b.driverRanking?.averageRate || 0
        return rateB - rateA // Sort by highest rating first
      }
      return 0
    })
  }

  const filteredAndSortedDrivers = getSortedDrivers(getFilteredDrivers(drivers))

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="flex h-screen bg-[#F5F3FF]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F3FF] p-6">
          <h1 className="text-3xl font-bold mb-6 text-[#6B46C1]">Drivers</h1>
          <Card className="border-[#8C61FF] border-2">
            <CardHeader className="bg-[#F5F3FF]">
              <CardTitle className="text-[#6B46C1]">Driver Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <Input
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm border-[#8C61FF]"
                />
                <div className="flex items-center space-x-2">
                  <Select onValueChange={(value) => setSortBy(value)}>
                    <SelectTrigger className="w-[180px] border-[#8C61FF]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="averageRate">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={(value) => setFilterStatus(value as "all" | "high" | "low")}>
                    <SelectTrigger className="w-[180px] border-[#8C61FF]">
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="high">High Rating (4.0+)</SelectItem>
                      <SelectItem value="low">Low Rating (&lt;4.0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#E9E3FF]">
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>{driver.id}</TableCell>
                      <TableCell>{`${driver.firstName} ${driver.lastName}`}</TableCell>
                      <TableCell>{driver.email}</TableCell>
                      <TableCell>{driver.contactNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div>{driver.vehicleType}</div>
                          <div className="text-sm text-gray-500">
                            Cap: {driver.vehicleCapacity} | License: {driver.vehicleLicense}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-[#6B46C1]">
                          {(driver.driverRanking?.averageRate || 0).toFixed(1)} ★
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Work Rate: {(driver.driverRanking?.workRate || 0).toFixed(1)}%</div>
                          <div>Feedback: {(driver.driverRanking?.feedbackRate || 0).toFixed(1)}%</div>
                          <div>Cancellation: {(driver.driverRanking?.cancellationRate || 0).toFixed(1)}%</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          className="border-[#8C61FF] text-[#8C61FF] hover:bg-[#8C61FF] hover:text-white"
                          onClick={() => window.location.href = `/drivers/${driver.id}`}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}