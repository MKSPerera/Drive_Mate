"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Driver = {
  id: string
  name: string
  email: string
  phone: string
  rating: number
  status: "active" | "inactive"
}

// Mock data - replace with actual data fetching in a real application
const mockDrivers: Driver[] = [
  { id: "D001", name: "John Doe", email: "john@example.com", phone: "123-456-7890", rating: 4.5, status: "active" },
  { id: "D002", name: "Jane Smith", email: "jane@example.com", phone: "098-765-4321", rating: 4.8, status: "active" },
  { id: "D003", name: "Bob Johnson", email: "bob@example.com", phone: "111-222-3333", rating: 4.2, status: "inactive" },
  { id: "D004", name: "Alice Brown", email: "alice@example.com", phone: "444-555-6666", rating: 4.7, status: "active" },
]

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<keyof Driver>("name")
  const [filterStatus, setFilterStatus] = useState<Driver["status"] | "all">("all")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredAndSortedDrivers = drivers
    .filter(
      (driver) =>
        (driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === "all" || driver.status === filterStatus),
    )
    .sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1
      if (a[sortBy] > b[sortBy]) return 1
      return 0
    })

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
                  <Select onValueChange={(value) => setSortBy(value as keyof Driver)}>
                    <SelectTrigger className="w-[180px] border-[#8C61FF]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">ID</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={(value) => setFilterStatus(value as Driver["status"] | "all")}>
                    <SelectTrigger className="w-[180px] border-[#8C61FF]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
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
                    <TableHead>Phone</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>{driver.id}</TableCell>
                      <TableCell>{driver.name}</TableCell>
                      <TableCell>{driver.email}</TableCell>
                      <TableCell>{driver.phone}</TableCell>
                      <TableCell>{driver.rating}</TableCell>
                      <TableCell>{driver.status}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          className="border-[#8C61FF] text-[#8C61FF] hover:bg-[#8C61FF] hover:text-white"
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