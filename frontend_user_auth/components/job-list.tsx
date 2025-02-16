"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"

type Job = {
  jobId: number
  numberOfPassengers: number
  destination: string
  pickupLocation: string
  pickupDate: string
  pickupTime: string
  additionalDetails?: string
  currentState: "PENDING" | "ACCEPTED" | "ONGOING" | "COMPLETED"
}

type JobListProps = {
  status: "PENDING" | "ACCEPTED" | "ONGOING" | "COMPLETED"
}

export function JobList({ status }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = async () => {
    try {
      const response = await fetch(`http://localhost:3333/jobs`)
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
      const response = await fetch(`http://localhost:3001/jobs/${jobId}`, {
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
      // You might want to show an error message to the user here
    }
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
          <TableHead>Passengers</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Pickup Location</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.jobId}>
            <TableCell>{job.numberOfPassengers}</TableCell>
            <TableCell>{job.destination}</TableCell>
            <TableCell>{job.pickupLocation}</TableCell>
            <TableCell>{new Date(job.pickupDate).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(job.pickupTime).toLocaleTimeString()}</TableCell>
            <TableCell>
              {status === "PENDING" && (
                <Button onClick={() => handleStatusChange(job.jobId, "ACCEPTED")}>Accept</Button>
              )}
              {status === "ACCEPTED" && (
                <Button onClick={() => handleStatusChange(job.jobId, "ONGOING")}>Start Job</Button>
              )}
              {status === "ONGOING" && (
                <Button onClick={() => handleStatusChange(job.jobId, "COMPLETED")}>Complete Job</Button>
              )}
              {status === "COMPLETED" && (
                <Button variant="outline" disabled>
                  Completed
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

