import { useState } from "react"
import type { Job } from "@/types/job"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import moment from "moment"

interface JobDetailsPanelProps {
  date: Date
  jobs: Job[]
  onClose: () => void
}

export function JobDetailsPanel({ date, jobs, onClose }: JobDetailsPanelProps) {
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null)

  const toggleJobDetails = (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId)
  }

  const formatDate = (dateString: string) => {
    return moment(dateString).format('MMMM D, YYYY')
  }

  const formatTime = (timeString: string) => {
    return moment(timeString).format('h:mm A')
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#6B46C1]">
          Jobs for {moment(date).format('MMMM D, YYYY')}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      {jobs.length === 0 ? (
        <p>No jobs scheduled for this date.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.jobId} className="border rounded-lg p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleJobDetails(job.jobId)}
              >
                <h3 className="text-lg font-medium">{job.clientName}</h3>
                {expandedJobId === job.jobId ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              {expandedJobId === job.jobId && (
                <div className="mt-4 space-y-2">
                  <p>
                    <strong>Nationality:</strong> {job.nationality}
                  </p>
                  <p>
                    <strong>Passengers:</strong> {job.numberOfPassengers}
                  </p>
                  <p>
                    <strong>Pickup Location:</strong> {job.pickupLocation}
                  </p>
                  <p>
                    <strong>End Date:</strong> {formatDate(job.endDate)}
                  </p>
                  <p>
                    <strong>Pickup Time:</strong> {formatTime(job.pickupTime)}
                  </p>
                  <p>
                    <strong>Distance:</strong> {job.distance} km
                  </p>
                  <p>
                    <strong>Payment Amount:</strong> ${job.paymentAmount}
                  </p>
                  {job.additionalDetails && (
                    <p>
                      <strong>Additional Details:</strong> {job.additionalDetails}
                    </p>
                  )}
                  {job.assignedDriver && (
                    <p>
                      <strong>Driver:</strong> {job.assignedDriver.firstName} {job.assignedDriver.lastName}
                    </p>
                  )}
                  <p>
                    <strong>Status:</strong> {job.currentState}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}