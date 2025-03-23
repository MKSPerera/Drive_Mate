"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { messaging } from "@/lib/firebase"
import { onMessage } from "firebase/messaging"

type Notification = {
  id: number
  title: string
  message: string
  createdAt: string
  status: 'READ' | 'UNREAD'
}

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No auth token found')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Mark notification as read
  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No auth token found')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      // Update local state
      setNotifications(notifications.map((notif) => 
        notif.id === id ? { ...notif, status: 'READ' } : notif
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (notification.status === 'UNREAD') {
      await markAsRead(notification.id)
    }

    // TODO: Add navigation logic based on notification type
    // For example:
    // if (notification.type === 'JOB_REQUEST') {
    //   router.push(`/jobs/${notification.jobId}`)
    // }
  }

  useEffect(() => {
    // Initial fetch
    fetchNotifications()

    // Set up Firebase message listener
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Received foreground message:', payload)
        
        // Add new notification to state
        if (payload.notification) {
          const newNotification = {
            id: Date.now(), // Temporary ID until refresh
            title: payload.notification.title || 'New Notification',
            message: payload.notification.body || '',
            createdAt: new Date().toISOString(),
            status: 'UNREAD' as const
          }
          
          setNotifications(prev => [newNotification, ...prev])
        }
      })

      // Clean up subscription
      return () => unsubscribe()
    }
  }, [])

  return (
    <div className="flex h-screen bg-[#F5F3FF]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F3FF] p-6">
          <h1 className="text-3xl font-bold mb-6 text-[#6B46C1]">Notifications</h1>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No notifications yet</p>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border-l-4 ${
                    notification.status === 'READ' ? "border-l-gray-300" : "border-l-[#8C61FF]"
                  } cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-[#6B46C1]">
                      {notification.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      {notification.status === 'UNREAD' && (
                        <span className="text-sm text-[#8C61FF]">New</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

