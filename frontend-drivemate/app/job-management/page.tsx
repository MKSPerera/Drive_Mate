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
  
    return (
        <div className="flex h-screen bg-[#F5F3FF]">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F3FF] p-6">
              <h1 className="text-3xl font-bold mb-6 text-[#6B46C1]">Job Management</h1>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 bg-[#E9E3FF] p-1 rounded-lg">
                  <TabsTrigger value="add-job" className="data-[state=active]:bg-[#8C61FF] data-[state=active]:text-white">
                    Add Job
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending-jobs"
                    className="data-[state=active]:bg-[#8C61FF] data-[state=active]:text-white"
                  >
                    Pending Jobs
                  </TabsTrigger>
                  <TabsTrigger
                    value="accepted-jobs"
                    className="data-[state=active]:bg-[#8C61FF] data-[state=active]:text-white"
                  >
                    Accepted Jobs
                  </TabsTrigger>
                  <TabsTrigger
                    value="ongoing-jobs"
                    className="data-[state=active]:bg-[#8C61FF] data-[state=active]:text-white"
                  >
                    Ongoing Jobs
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed-jobs"
                    className="data-[state=active]:bg-[#8C61FF] data-[state=active]:text-white"
                  >
                    Completed Jobs
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="add-job">
                  <Card className="mt-6 border-[#8C61FF] border-2">
                    <CardHeader className="bg-[#F5F3FF]">
                      <CardTitle className="text-[#6B46C1]">Add New Job</CardTitle>
                      <CardDescription>Fill in the details to create a new job.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AddJobForm />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="pending-jobs">
                  <Card className="mt-6 border-[#8C61FF] border-2">
                    <CardHeader className="bg-[#F5F3FF]">
                      <CardTitle className="text-[#6B46C1]">Pending Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <JobList status="PENDING" />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="accepted-jobs">
                  <Card className="mt-6 border-[#8C61FF] border-2">
                    <CardHeader className="bg-[#F5F3FF]">
                      <CardTitle className="text-[#6B46C1]">Accepted Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <JobList status="ACCEPTED" />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="ongoing-jobs">
                  <Card className="mt-6 border-[#8C61FF] border-2">
                    <CardHeader className="bg-[#F5F3FF]">
                      <CardTitle className="text-[#6B46C1]">Ongoing Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <JobList status="ONGOING" />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="completed-jobs">
                  <Card className="mt-6 border-[#8C61FF] border-2">
                    <CardHeader className="bg-[#F5F3FF]">
                      <CardTitle className="text-[#6B46C1]">Completed Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <JobList status="COMPLETED" />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      )
    }
    
    