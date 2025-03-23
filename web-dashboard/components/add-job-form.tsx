"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function AddJobForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    clientName: "",
    nationality: "",
    passengers: "",
    pickupLocation: "",
    startDate: "",
    endDate: "",
    time: "",
    distance: "",
    paymentAmount: "",
    additionalDetails: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value }

      if (name === "startDate") {
        const today = new Date().toISOString().split("T")[0]
        if (value < today) {
          alert("Start date cannot be earlier than today")
          return prevData
        }
        if (newData.endDate && value > newData.endDate) { 
          alert("Start date must be earlier than or equal to end date")
          return prevData
        }
      }

      if (name === "endDate") {
        if (value < newData.startDate) { 
          alert("End date must be later than or equal to start date")
          return prevData
        }
        const today = new Date().toISOString().split("T")[0]
        if (value < today) {
          alert("End date cannot be earlier than today")
          return prevData
        }
      }

      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent, isPrivate: boolean) => {
    e.preventDefault()
    setLoading(true)

    if (parseFloat(formData.distance) <= 0) {
      alert("Distance must be greater than 0")
      setLoading(false)
      return
    }

    if (parseInt(formData.passengers) <= 0) {
      alert("Number of passengers must be greater than 0")
      setLoading(false)
      return
    }

    try {
      // Create the job
      const startDateTime = new Date(formData.startDate + "T" + formData.time)
      const endDateTime = new Date(formData.endDate + "T23:59:59.999")

      const jobData = {
        clientName: formData.clientName,
        nationality: formData.nationality,
        numberOfPassengers: parseInt(formData.passengers),
        pickupLocation: formData.pickupLocation,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        pickupTime: startDateTime.toISOString(),
        distance: parseFloat(formData.distance),
        paymentAmount: parseFloat(formData.paymentAmount),
        additionalDetails: formData.additionalDetails,
        currentState: "PENDING",
        postType: isPrivate ? "PRIVATE" : "PUBLIC"
      }

      const response = await fetch('http://localhost:3333/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error('Failed to create job')
      }

      const createdJob = await response.json()

      if (isPrivate) {
        // Get available drivers for the date range
        const availabilityResponse = await fetch('http://localhost:3333/drivers/available', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            startDate: startDateTime.toISOString(),
            endDate: endDateTime.toISOString()
          }),
        })

        if (!availabilityResponse.ok) {
          throw new Error('Failed to fetch available drivers')
        }

        // Navigate to private jobs page with the job ID and date range
        router.push(`/private-jobs?jobId=${createdJob.jobId}&startDate=${startDateTime.toISOString()}&endDate=${endDateTime.toISOString()}`)
      } else {
        setFormData({
          clientName: "",
          nationality: "",
          passengers: "",
          pickupLocation: "",
          startDate: "",
          endDate: "",
          time: "",
          distance: "",
          paymentAmount: "",
          additionalDetails: "",
        })
      }
    } catch (error) {
      console.error('Error creating job:', error)
      alert('Failed to create job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName" className="text-[#6B46C1]">Name of Client</Label>
          <Input id="clientName" name="clientName" value={formData.clientName} onChange={handleChange} required className="border-[#8C61FF]" />
        </div>
        <div>
          <Label htmlFor="nationality" className="text-[#6B46C1]">Nationality</Label>
          <Input id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} required className="border-[#8C61FF]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="passengers" className="text-[#6B46C1]">Number of Passengers</Label>
          <Input id="passengers" name="passengers" type="number" value={formData.passengers} onChange={handleChange} required className="border-[#8C61FF]" />
        </div>
        <div>
          <Label htmlFor="pickupLocation" className="text-[#6B46C1]">Pickup Location</Label>
          <Input id="pickupLocation" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} required className="border-[#8C61FF]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate" className="text-[#6B46C1]">Start Date</Label>
          <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required className="border-[#8C61FF]" min={new Date().toISOString().split("T")[0]} />
        </div>
        <div>
          <Label htmlFor="endDate" className="text-[#6B46C1]">End Date</Label>
          <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required className="border-[#8C61FF]" min={formData.startDate} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="time" className="text-[#6B46C1]">Time</Label>
          <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required className="border-[#8C61FF]" />
        </div>
        <div>
          <Label htmlFor="distance" className="text-[#6B46C1]">Distance (km)</Label>
          <Input id="distance" name="distance" type="number" step="0.1" value={formData.distance} onChange={handleChange} required className="border-[#8C61FF]" />
        </div>
      </div>
      <div>
        <Label htmlFor="paymentAmount" className="text-[#6B46C1]">Payment Amount</Label>
        <Input id="paymentAmount" name="paymentAmount" type="number" step="0.01" value={formData.paymentAmount} onChange={handleChange} required className="border-[#8C61FF]" />
      </div>
      <div>
        <Label htmlFor="additionalDetails" className="text-[#6B46C1]">Additional Details</Label>
        <Textarea id="additionalDetails" name="additionalDetails" value={formData.additionalDetails} onChange={handleChange} className="border-[#8C61FF]" />
      </div>
      <div className="flex space-x-4">
        <Button 
          type="submit" 
          className="flex-1 bg-[#8C61FF] hover:bg-[#6B46C1] text-white" 
          onClick={(e) => handleSubmit(e, false)} 
          disabled={loading}
        >
          {loading ? "Creating..." : "Public Post"}
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-[#8C61FF] hover:bg-[#6B46C1] text-white" 
          onClick={(e) => handleSubmit(e, true)} 
          disabled={loading}
        >
          {loading ? "Creating..." : "Private Post"}
        </Button>
      </div>
    </form>
  )
}
