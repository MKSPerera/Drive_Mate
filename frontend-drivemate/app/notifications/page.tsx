"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Notification = {
  id: string
  title: string
  message: string
  date: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Job Request",
    message: "You have a new job request from John Doe",
    date: "2023-06-15 09:00",
    read: false,
  },
  {
    id: "2",
    title: "Driver Update",
    message: "Driver Jane Smith has updated her profile",
    date: "2023-06-14 14:30",
    read: true,
  },
  {
    id: "3",
    title: "Payment Received",
    message: "Payment of $50 received for job #1234",
    date: "2023-06-13 11:15",
    read: false,
  },
  {
    id: "4",
    title: "System Maintenance",
    message: "Scheduled maintenance on June 20th, 2023",
    date: "2023-06-12 16:45",
    read: true,
  },
]

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  return (
    <div className="flex h-screen bg-[#F5F3FF]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F3FF] p-6">
          <h1 className="text-3xl font-bold mb-6 text-[#6B46C1]">Notifications</h1>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-l-4 ${notification.read ? "border-l-gray-300" : "border-l-[#8C61FF]"}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#6B46C1]">{notification.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">{notification.message}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{notification.date}</span>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-[#8C61FF] hover:text-[#6B46C1]"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

