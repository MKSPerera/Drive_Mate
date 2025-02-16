"use client"

import { useState } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, ReferenceLine, Area } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

// Generate sample data for the month
const generateData = () => {
  return Array.from({ length: 31 }, (_, i) => ({
    date: i + 1,
    jobs: Math.floor(Math.random() * 30) + 10,
  }))
}

const data = generateData()
const maxJobs = Math.max(...data.map((d) => d.jobs))

export function JobStatisticsChart() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleData, setVisibleData] = useState(data.slice(0, 7))
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const updateVisibleData = (startIndex: number) => {
    const endIndex = Math.min(startIndex + 7, data.length)
    setVisibleData(data.slice(startIndex, endIndex))
  }

  const handleScroll = (direction: "left" | "right") => {
    const newIndex = direction === "left" ? Math.max(0, currentIndex - 1) : Math.min(data.length - 7, currentIndex + 1)
    setCurrentIndex(newIndex)
    updateVisibleData(newIndex)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    // Here you would typically fetch jobs for the selected date
    // For now, we'll just log the date
    console.log("Selected date:", date)
  }

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Job Statistics</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll("left")}
            disabled={currentIndex <= 0}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll("right")}
            disabled={currentIndex >= data.length - 7}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-7 w-7">
                <Calendar className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Date</DialogTitle>
              </DialogHeader>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border"
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            jobs: {
              label: "Jobs",
              color: "#8C61FF",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visibleData} margin={{ top: 20, right: 10, left: -20, bottom: 10 }}>
              <defs>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8C61FF" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#8C61FF" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[0, maxJobs]}
              />
              <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
              {visibleData.map((entry) => (
                <ReferenceLine
                  key={entry.date}
                  x={entry.date}
                  stroke="#8C61FF"
                  strokeDasharray="3 3"
                  strokeOpacity={0.2}
                  segment={[
                    { x: entry.date, y: 0 },
                    { x: entry.date, y: entry.jobs },
                  ]}
                />
              ))}
              <Area type="monotone" dataKey="jobs" stroke="none" fill="url(#colorJobs)" fillOpacity={1} />
              <Line
                type="monotone"
                dataKey="jobs"
                stroke="#8C61FF"
                strokeWidth={2}
                dot={{ fill: "#8C61FF", r: 4 }}
                activeDot={{ r: 6, fill: "#8C61FF" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

