"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * Job type definition
 * Represents a transportation job with client and driver details
 */
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
    id: number
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

/**
 * JobList component
 * Displays a list of jobs with expandable details
 * Allows filtering and interaction with job entries
 */
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const handleFeedback = async (jobId: number, driverId: number, isPositive: boolean) => {
    try {
      const response = await fetch(`http://localhost:3333/driver-ranking/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          jobId,
          driverId,
          feedback: isPositive ? 'positive' : 'negative'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      alert('Feedback submitted successfully')
      // Refresh the jobs list
      fetchJobs()
    } catch (err) {
      console.error('Error submitting feedback:', err)
      alert('Failed to submit feedback. Please try again.')
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

  const renderActionButtons = (job: Job) => {
    switch (status) {
      case "PENDING":
        return (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="border-[#8C61FF] text-[#8C61FF] hover:bg-[#8C61FF] hover:text-white"
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Implement update functionality
                alert('Update functionality to be implemented')
              }}
            >
              Update
            </Button>
            <Button 
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Are you sure you want to cancel this job?')) {
                  handleStatusChange(job.jobId, "COMPLETED")
                }
              }}
            >
              Cancel
            </Button>
          </div>
        )
      case "ACCEPTED":
        return (
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              className="border-[#8C61FF] text-[#8C61FF] hover:bg-[#8C61FF] hover:text-white"
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Implement update functionality
                alert('Update functionality to be implemented')
              }}
            >
              Update
            </Button>
            <Button 
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Are you sure you want to cancel this job?')) {
                  handleStatusChange(job.jobId, "COMPLETED")
                }
              }}
            >
              Cancel
            </Button>
          </div>
        )
      case "COMPLETED":
        return job.assignedDriver && (
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              onClick={(e) => {
                e.stopPropagation()
                handleFeedback(job.jobId, job.assignedDriver!.id, true)
              }}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Good Job
            </Button>
            <Button 
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={(e) => {
                e.stopPropagation()
                handleFeedback(job.jobId, job.assignedDriver!.id, false)
              }}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Poor Job
            </Button>
          </div>
        )
      default:
        return null
    }
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
                      {renderActionButtons(job)}
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

