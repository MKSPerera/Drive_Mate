"use client"

import { useState, useMemo, useEffect } from "react"
import { Calendar, momentLocalizer, View } from "react-big-calendar"
import moment from "moment"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { JobDetailsPanel } from "@/components/job-details-panel"
import type { Job } from "@/types/job"
import "./styles.css"

import "react-big-calendar/lib/css/react-big-calendar.css"

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedJobs, setSelectedJobs] = useState<Job[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>("month")
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date; action: string }) => {
    if (slotInfo.action === "click") {
      const clickedDate = moment(slotInfo.start).startOf("day").toDate()
      setSelectedDate(clickedDate)
      const jobsOnSelectedDate = jobs.filter((job) => 
        moment(job.startDate).isSame(clickedDate, "day")
      )
      setSelectedJobs(jobsOnSelectedDate)
    }
  }

  const events = useMemo(
    () =>
      jobs.map((job) => ({
        title: "",
        start: new Date(job.startDate),
        end: new Date(job.startDate),
        allDay: true,
        resource: job,
      })),
    [jobs],
  )

  const jobsByDate = useMemo(() => {
    const jobMap = new Map<string, Job[]>()
    jobs.forEach((job) => {
      const dateKey = moment(job.startDate).format("YYYY-MM-DD")
      if (!jobMap.has(dateKey)) {
        jobMap.set(dateKey, [])
      }
      jobMap.get(dateKey)!.push(job)
    })
    return jobMap
  }, [jobs])

  const customDayPropGetter = (date: Date) => {
    const isSelected = selectedDate && moment(date).isSame(selectedDate, "day")
    const isToday = moment(date).isSame(moment(), "day")

    return {
      className: `custom-day-cell ${isSelected ? "selected-day" : ""} ${isToday ? "today" : ""}`,
      style: {
        position: "relative",
        transition: "all 0.3s ease",
      } as React.CSSProperties,
    }
  }

  const CustomEvent = ({ event }: { event: any }) => {
    // Only show one indicator per day
    const isStartDate = moment(event.start).isSame(moment(event.resource.startDate), "day")
    if (!isStartDate) return null

    // Get all jobs for this date
    const jobsOnThisDate = jobs.filter(job => 
      moment(job.startDate).isSame(moment(event.start), "day")
    )

    // If no jobs, don't show indicator
    if (jobsOnThisDate.length === 0) return null

    // Check job statuses - handle uppercase status values
    const hasUnacceptedJob = jobsOnThisDate.some(job => 
      job.currentState !== "ACCEPTED" && job.currentState !== "COMPLETED"
    )
    const allJobsAccepted = jobsOnThisDate.every(job => 
      job.currentState === "ACCEPTED" || job.currentState === "COMPLETED"
    )
    
    // Determine color based on job statuses
    let color;
    if (hasUnacceptedJob) {
      color = "#808080" // gray for any unaccepted jobs
    } else if (allJobsAccepted) {
      color = "#8c61ff" // purple for all accepted jobs
    }

    return (
      <div
        className="job-indicator"
        style={{
          backgroundColor: color,
          height: "16px",
          width: "100%",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 3
        }}
      />
    )
  }

  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
  }

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
          <h1 className="text-3xl font-bold mb-6 text-[#6B46C1]">Job Calendar</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              onSelectSlot={handleSelectSlot}
              selectable
              dayPropGetter={customDayPropGetter}
              view={view}
              onView={setView}
              date={date}
              onNavigate={handleNavigate}
              components={{
                event: CustomEvent,
              }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: "transparent",
                },
              })}
              views={["month", "week", "day"]}
            />
          </div>
          {selectedDate && (
            <JobDetailsPanel date={selectedDate} jobs={selectedJobs} onClose={() => setSelectedDate(null)} />
          )}
        </main>
      </div>
    </div>
  )
}

