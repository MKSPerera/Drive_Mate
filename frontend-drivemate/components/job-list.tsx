"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useState } from "react"

type Job = {
  jobId: number
  clientName: string
  nationality: string
  numberOfPassengers: number
  pickupLocation: string
  startDate: string
  endDate: string
  pickupTime: string
  distance: number
  paymentAmount: number
  additionalDetails?: string
  currentState: "PENDING" | "ACCEPTED" | "ONGOING" | "COMPLETED"
  assignedDriver?: {
    firstName: string
    lastName: string
    contactNumber: string
    vehicleType: string
    vehicleLicense: string
  }
}

type JobListProps = {
  status: "PENDING" | "ACCEPTED" | "ONGOING" | "COMPLETED"
}

export function JobList({ status }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null)

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:3333/jobs')
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      const data = await response.json()
      setJobs(data.filter((job: Job) => job.currentState === status))
      setError(null)
    } catch (err) {
      setError('Error fetching jobs')
      console.error('Error fetching jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [status])

  const handleStatusChange = async (jobId: number, newStatus: Job["currentState"]) => {
    try {
      const response = await fetch(`http://localhost:3333/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentState: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update job status')
      }

      // Refresh the jobs list after successful update
      fetchJobs()
    } catch (err) {
      console.error('Error updating job status:', err)
      alert('Failed to update job status. Please try again.')
    }
  }

  const toggleJobDetails = (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client Name</TableHead>
          <TableHead>Nationality</TableHead>
          <TableHead>Passengers</TableHead>
          <TableHead>Pickup Location</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <>
            <TableRow key={job.jobId} className="cursor-pointer" onClick={() => toggleJobDetails(job.jobId)}>
              <TableCell>{job.clientName}</TableCell>
              <TableCell>{job.nationality}</TableCell>
              <TableCell>{job.numberOfPassengers}</TableCell>
              <TableCell>{job.pickupLocation}</TableCell>
              <TableCell>
                {expandedJobId === job.jobId ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </TableCell>
            </TableRow>
            {expandedJobId === job.jobId && (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="p-4 bg-gray-50">
                    <p>
                      <strong>Start Date:</strong> {new Date(job.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>End Date:</strong> {new Date(job.endDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Pickup Time:</strong> {new Date(job.pickupTime).toLocaleTimeString()}
                    </p>
                    <p>
                      <strong>Distance:</strong> {job.distance} km
                    </p>
                    <p>
                      <strong>Payment Amount:</strong> ${job.paymentAmount.toFixed(2)}
                    </p>
                    {job.additionalDetails && (
                      <p>
                        <strong>Additional Details:</strong> {job.additionalDetails}
                      </p>
                    )}
                    {job.assignedDriver && (
                      <div className="mt-2">
                        <p>
                          <strong>Driver:</strong> {job.assignedDriver.firstName} {job.assignedDriver.lastName}
                        </p>
                        <p>
                          <strong>Contact:</strong> {job.assignedDriver.contactNumber}
                        </p>
                        <p>
                          <strong>Vehicle:</strong> {job.assignedDriver.vehicleType} ({job.assignedDriver.vehicleLicense})
                        </p>
                      </div>
                    )}
                    <div className="mt-4">
                      {status === "PENDING" && (
                        <Button onClick={() => handleStatusChange(job.jobId, "ACCEPTED")} className="mr-2">
                          Accept Job
                        </Button>
                      )}
                      {status === "ACCEPTED" && (
                        <Button onClick={() => handleStatusChange(job.jobId, "ONGOING")} className="mr-2">
                          Start Job
                        </Button>
                      )}
                      {status === "ONGOING" && (
                        <Button onClick={() => handleStatusChange(job.jobId, "COMPLETED")}>
                          Complete Job
                        </Button>
                      )}
                      {status === "COMPLETED" && (
                        <Button variant="outline" disabled>
                          Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  )
}

