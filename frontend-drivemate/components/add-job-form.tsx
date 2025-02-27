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
        if (newData.endDate && value >= newData.endDate) {
          alert("Start date must be earlier than end date")
          return prevData
        }
      }

      if (name === "endDate") {
        if (value <= newData.startDate) {
          alert("End date must be later than start date")
          return prevData
        }
      }

      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent, isPrivate: boolean) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Format the data to match the backend schema
      const jobData = {
        clientName: formData.clientName,
        nationality: formData.nationality,
        numberOfPassengers: parseInt(formData.passengers),
        pickupLocation: formData.pickupLocation,
        startDate: new Date(formData.startDate + "T" + formData.time).toISOString(),
        endDate: new Date(formData.endDate + "T" + formData.time).toISOString(),
        pickupTime: new Date(formData.startDate + "T" + formData.time).toISOString(),
        distance: parseFloat(formData.distance),
        paymentAmount: parseFloat(formData.paymentAmount),
        additionalDetails: formData.additionalDetails,
        currentState: "PENDING"
      }

      const response = await fetch('http://localhost:3333/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error('Failed to create job')
      }

      if (isPrivate) {
        router.push("/drivers")
      } else {
        // Reset form after public submission
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
          <Label htmlFor="clientName" className="text-[#6B46C1]">
            Name of Client
          </Label>
          <Input
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            required
            className="border-[#8C61FF]"
          />
        </div>
        <div>
          <Label htmlFor="nationality" className="text-[#6B46C1]">
            Nationality
          </Label>
          <Input
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            required
            className="border-[#8C61FF]"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="passengers" className="text-[#6B46C1]">
            Number of Passengers
          </Label>
          <Input
            id="passengers"
            name="passengers"
            type="number"
            value={formData.passengers}
            onChange={handleChange}
            required
            className="border-[#8C61FF]"
          />
        </div>
        <div>
          <Label htmlFor="pickupLocation" className="text-[#6B46C1]">
            Pickup Location
          </Label>
          <Input
            id="pickupLocation"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleChange}
            required
            className="border-[#8C61FF]"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate" className="text-[#6B46C1]">
            Start Date
          </Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="border-[#8C61FF]"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div>
          <Label htmlFor="endDate" className="text-[#6B46C1]">
            End Date
          </Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="border-[#8C61FF]"
            min={formData.startDate}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="time" className="text-[#6B46C1]">
            Time
          </Label>
          <Input
            id="time"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="border-[#8C61FF]"
          />
        </div>
        <div>
          <Label htmlFor="distance" className="text-[#6B46C1]">
            Distance (km)
          </Label>
          <Input
            id="distance"
            name="distance"
            type="number"
            step="0.1"
            value={formData.distance}
            onChange={handleChange}
            required
            className="border-[#8C61FF]"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="paymentAmount" className="text-[#6B46C1]">
          Payment Amount
        </Label>
        <Input
          id="paymentAmount"
          name="paymentAmount"
          type="number"
          step="0.01"
          value={formData.paymentAmount}
          onChange={handleChange}
          required
          className="border-[#8C61FF]"
        />
      </div>
      <div>
        <Label htmlFor="additionalDetails" className="text-[#6B46C1]">
          Additional Details
        </Label>
        <Textarea
          id="additionalDetails"
          name="additionalDetails"
          value={formData.additionalDetails}
          onChange={handleChange}
          className="border-[#8C61FF]"
        />
      </div>
      <div className="flex space-x-4">
        <Button
          type="submit"
          className="flex-1 bg-[#8C61FF] hover:bg-[#6B46C1]"
          onClick={(e) => handleSubmit(e, false)}
          disabled={loading}
        >
          {loading ? "Creating..." : "Public Post"}
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-[#6B46C1] hover:bg-[#5D3FD3]" 
          onClick={(e) => handleSubmit(e, true)}
          disabled={loading}
        >
          {loading ? "Creating..." : "Private Post"}
        </Button>
      </div>
    </form>
  )
}

