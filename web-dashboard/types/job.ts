export interface Job {
  jobId: number
  clientName: string
  nationality: string
  numberOfPassengers: number
  pickupLocation: string
  startDate: string
  endDate: string
  pickupTime: string
  distance: number
  paymentAmount: number
  additionalDetails?: string
  currentState: 'PENDING' | 'ACCEPTED' | 'ONGOING' | 'COMPLETED'
  assignedDriver?: {
    firstName: string
    lastName: string
  }
}