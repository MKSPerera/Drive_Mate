import { AddJobForm } from "@/components/add-job-form"
import { JobList } from "@/components/job-list"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function JobManagementPage() {
    const [activeTab, setActiveTab] = useState("add-job")
    const [sidebarOpen, setSidebarOpen] = useState(false)
  