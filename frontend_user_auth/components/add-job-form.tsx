"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function AddJobForm() {
  const [formData, setFormData] = useState({
    passengers: "",
    destination: "",
    pickupLocation: "",
    date: "",
    time: "",
    additionalDetails: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const jobData = {
        numberOfPassengers: parseInt(formData.passengers),
        destination: formData.destination,
        pickupLocation: formData.pickupLocation,
        pickupDate: formData.date,
        pickupTime: formData.time,
        additionalDetails: formData.additionalDetails || undefined,
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

      // Reset form after successful submission
      setFormData({
        passengers: "",
        destination: "",
        pickupLocation: "",
        date: "",
        time: "",
        additionalDetails: "",
      })

      // You might want to add a success message or redirect here
    } catch (error) {
      console.error('Error creating job:', error)
      // You might want to show an error message to the user here
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="destination" className="text-[#6B46C1]">
            Destination
          </Label>
          <Input
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
            className="border-[#8C61FF]"
          />
        </div>
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date" className="text-[#6B46C1]">
            Date
          </Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border-[#8C61FF]"
          />
        </div>
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
      <Button type="submit" className="w-full bg-[#8C61FF] hover:bg-[#6B46C1]">
        Add Job
      </Button>
    </form>
  )
}

