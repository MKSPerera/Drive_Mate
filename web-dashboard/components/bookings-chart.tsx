"use client"

import { useRef, useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, ReferenceLine, Area } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Generate sample data for the month
const generateData = () => {
  return Array.from({ length: 31 }, (_, i) => ({
    date: i + 1,
    bookings: Math.floor(Math.random() * 30) + 10,
  }))
}

const data = generateData()
const maxBookings = Math.max(...data.map((d) => d.bookings))

export function BookingsChart() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleData, setVisibleData] = useState(data.slice(0, 7))

  const updateVisibleData = (startIndex: number) => {
    const endIndex = Math.min(startIndex + 7, data.length)
    setVisibleData(data.slice(startIndex, endIndex))
  }

  useEffect(() => {
    updateVisibleData(currentIndex)
  }, [currentIndex])

  const handleScroll = (direction: "left" | "right") => {
    const newIndex = direction === "left" ? Math.max(0, currentIndex - 1) : Math.min(data.length - 7, currentIndex + 1)
    setCurrentIndex(newIndex)
  }

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Analytics</CardTitle>
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
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            bookings: {
              label: "Bookings",
              color: "#8C61FF",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visibleData} margin={{ top: 20, right: 10, left: -20, bottom: 10 }}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
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
                domain={[0, maxBookings]}
              />
              <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
              {/* Reference lines from x-axis to data points */}
              {visibleData.map((entry) => (
                <ReferenceLine
                  key={entry.date}
                  x={entry.date}
                  stroke="#8C61FF"
                  strokeDasharray="3 3"
                  strokeOpacity={0.2}
                  segment={[
                    { x: entry.date, y: 0 },
                    { x: entry.date, y: entry.bookings },
                  ]}
                />
              ))}
              {/* Area for gradient fill below the line */}
              <Area type="monotone" dataKey="bookings" stroke="none" fill="url(#colorBookings)" fillOpacity={1} />
              {/* Main line */}
              <Line
                type="monotone"
                dataKey="bookings"
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

