"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

export default function PrivateJobPostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams?.get('jobId')
  const startDate = searchParams?.get('startDate')
  const endDate = searchParams?.get('endDate')

  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("rating")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobPosted, setJobPosted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchAvailableDrivers = async () => {
      if (!startDate || !endDate) {
        setError('Missing date range parameters')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('http://localhost:3333/drivers/available', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            startDate,
            endDate
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch available drivers')
        }

        const data = await response.json()
        setDrivers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch drivers')
      } finally {
        setLoading(false)
      }
    }

    fetchAvailableDrivers()
  }, [startDate, endDate])

  const getFilteredDrivers = (drivers: Driver[]) => {
    return drivers.filter(driver => {
      const matchesSearch = (
        `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      return matchesSearch
    })
  }

  const getSortedDrivers = (drivers: Driver[]) => {
    return [...drivers].sort((a, b) => {
      if (sortBy === "name") {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      }
      if (sortBy === "rating") {
        const ratingA = a.driverRanking?.averageRate || 0
        const ratingB = b.driverRanking?.averageRate || 0
        return ratingB - ratingA
      }
      return 0
    })
  }

  const handleSelectDriver = (driver: Driver) => {
    if (selectedDrivers.find(d => d.id === driver.id)) {
      setSelectedDrivers(selectedDrivers.filter((d) => d.id !== driver.id))
    } else {
      setSelectedDrivers([...selectedDrivers, driver])
    }
  }

  const handlePostJob = async () => {
    if (!jobId) {
      setError('No job ID provided')
      return
    }

    if (selectedDrivers.length === 0) {
      setError('Please select at least one driver')
      return
    }

    try {
      const response = await fetch('http://localhost:3333/jobs/private-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          jobId: parseInt(jobId),
          driverIds: selectedDrivers.map(d => d.id)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to assign drivers to job')
      }

      setJobPosted(true)
      setTimeout(() => {
        router.push("/job-management")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post job')
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const filteredAndSortedDrivers = getSortedDrivers(getFilteredDrivers(drivers))

  return (
    <div className="flex h-screen bg-[#F5F3FF]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F3FF] p-6">
          <h1 className="text-3xl font-bold mb-6 text-[#6B46C1]">Post Private Job</h1>
          {jobPosted && (
            <Alert className="bg-green-100 border-green-500 text-green-800 mb-4">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>Job posted successfully. Redirecting to job management...</AlertDescription>
            </Alert>
          )}
          <Card className="border-[#8C61FF] border-2">
            <CardHeader className="bg-[#F5F3FF]">
              <CardTitle className="text-[#6B46C1]">Available Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <Input
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm border-[#8C61FF]"
                />
                <Select onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger className="w-[180px] border-[#8C61FF]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#E9E3FF]">
                    <TableHead></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedDrivers.some(d => d.id === driver.id)}
                          onChange={() => handleSelectDriver(driver)}
                          className="form-checkbox h-4 w-4 text-[#8C61FF] rounded border-[#8C61FF]"
                        />
                      </TableCell>
                      <TableCell>{`${driver.firstName} ${driver.lastName}`}</TableCell>
                      <TableCell>
                        <div>
                          <div>{driver.email}</div>
                          <div className="text-sm text-gray-500">{driver.contactNumber}</div>
                        </div>
                      </TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Selected Drivers: {selectedDrivers.length}
                </div>
                <Button
                  onClick={handlePostJob}
                  className="bg-[#8C61FF] text-white hover:bg-[#6B46C1]"
                  disabled={selectedDrivers.length === 0}
                >
                  Assign Drivers to Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

