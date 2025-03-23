"use client"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Area } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useRef, useState } from "react"

// Update the generateData function to use day numbers instead of dates
const generateData = () => {
  return Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    jobs: Math.floor(Math.random() * 30) + 10,
  }))
}

const data = generateData()
const maxJobs = Math.max(...data.map((d) => d.jobs))

export function JobStatisticsChart() {
  const scrollContainer = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 7 })

  const handleScroll = (direction: "left" | "right") => {
    setVisibleRange((prev) => {
      const newStart = direction === "left" ? Math.max(0, prev.start - 1) : Math.min(23, prev.start + 1)
      return { start: newStart, end: newStart + 7 }
    })
  }

  const visibleData = data.slice(visibleRange.start, visibleRange.end)

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Job Statistics</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll("left")}
            disabled={visibleRange.start === 0}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll("right")}
            disabled={visibleRange.end >= 30}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-hidden" ref={scrollContainer}>
          <div className="border border-gray-300 rounded-lg p-4">
            <ChartContainer
              config={{
                jobs: {
                  label: "Jobs",
                  color: "#8C61FF",
                },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={visibleData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8C61FF" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#8C61FF" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 30, right: 30 }}
                    tickFormatter={(value) => `${value}`}
                    interval={0}
                    tickMargin={10}
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

