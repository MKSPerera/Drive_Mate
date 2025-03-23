import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityStatus } from '@prisma/client';
import * as path from 'path';
import { PythonShell } from 'python-shell';
import { PrismaService } from '../prisma/prisma.service';
import { JobFeedbackDto } from './dto/job-feedback.dto';

@Injectable()
export class DriverRankingService {
  constructor(private readonly prisma: PrismaService) {}

  // Calculate ranking using Python script
  private async calculateRanking(
    workRate: number,
    feedbackRate: number,
    cancellationRate: number,
    averageRate: number
  ): Promise<number> {
    try {
      // Get the directory of the current file
      const currentDir = __dirname;
      const scriptPath = path.resolve(currentDir, 'ranking.py');
      
      console.log('Looking for Python script at:', scriptPath);
      
      const options = {
        scriptPath: currentDir,
        pythonPath: 'python', // or 'python3' depending on your system
        args: [],
        mode: 'json' as const,
      };

      const pyshell = new PythonShell('ranking.py', options);

      // Send data to Python script
      const inputData = {
        workRate,
        feedbackRate,
        cancellationRate,
        averageRate,
      };

      return new Promise((resolve, reject) => {
        pyshell.send(JSON.stringify(inputData));

        pyshell.on('message', (message) => {
          const result = JSON.parse(message);
          resolve(result.score);
        });

        pyshell.on('error', (error) => {
          console.error('Python script error:', error);
          // Fallback calculation if Python script fails
          console.log('Using fallback calculation method');
          const fallbackScore = this.calculateFallbackRanking(
            workRate, 
            feedbackRate, 
            cancellationRate, 
            averageRate
          );
          resolve(fallbackScore);
        });

        pyshell.end((err) => {
          if (err) {
            console.error('Python shell end error:', err);
            // Use fallback calculation
            const fallbackScore = this.calculateFallbackRanking(
              workRate, 
              feedbackRate, 
              cancellationRate, 
              averageRate
            );
            resolve(fallbackScore);
          }
        });
      });
    } catch (error) {
      console.error('Error calculating ranking:', error);
      // Use fallback calculation
      return this.calculateFallbackRanking(
        workRate, 
        feedbackRate, 
        cancellationRate, 
        averageRate
      );
    }
  }

  // Fallback calculation method if Python script fails
  private calculateFallbackRanking(
    workRate: number,
    feedbackRate: number,
    cancellationRate: number,
    currentAverageRate: number
  ): number {
    // Simple weighted average calculation
    const workRateWeight = 0.4;
    const feedbackRateWeight = 0.3;
    const cancellationRateWeight = -0.3;
    
    // Normalize work rate (0-31 days)
    const normalizedWorkRate = Math.min(workRate, 31) / 31;
    
    // Calculate new score
    let newScore = (normalizedWorkRate * workRateWeight) + 
                  (feedbackRate * feedbackRateWeight) + 
                  (cancellationRate * cancellationRateWeight);
    
    // Blend with current average (if exists)
    if (currentAverageRate !== 0) {
      newScore = (newScore + currentAverageRate) / 2;
    }
    
    // Ensure score is within reasonable bounds
    return Math.max(-1, Math.min(1, newScore));
  }

  // Update driver ranking
  async updateDriverRanking(driverId: number) {
    const ranking = await this.prisma.driverRanking.findFirst({
      where: { driverId },
    });

    if (!ranking) {
      throw new NotFoundException(`Ranking not found for driver with ID ${driverId}`);
    }

    const newScore = await this.calculateRanking(
      ranking.workRate,
      ranking.feedbackRate,
      ranking.cancellationRate,
      ranking.averageRate
    );

    return this.prisma.driverRanking.update({
      where: { id: ranking.id },
      data: { averageRate: newScore },
      include: {
        driver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            contactNumber: true,
          }
        }
      }
    });
  }

  // Get ranking for a specific driver
  async getDriverRanking(driverId: number) {
    const ranking = await this.prisma.driverRanking.findFirst({
      where: { driverId },
      include: {
        driver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            contactNumber: true,
          }
        }
      }
    });

    if (!ranking) {
      throw new NotFoundException(`Ranking not found for driver with ID ${driverId}`);
    }

    return ranking;
  }

  // Get all driver rankings
  async getAllDriverRankings() {
    return this.prisma.driverRanking.findMany({
      include: {
        driver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            contactNumber: true,
          }
        }
      },
      orderBy: {
        averageRate: 'desc'
      }
    });
  }

  // Get top drivers by average rating
  async getTopDrivers(limit: number = 10) {
    return this.prisma.driverRanking.findMany({
      take: limit,
      orderBy: {
        averageRate: 'desc'
      },
      include: {
        driver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            contactNumber: true,
          }
        }
      }
    });
  }

  // Add this new method to initialize a driver's ranking
  async initializeDriverRanking(driverId: number) {
    // Check if ranking already exists
    const existingRanking = await this.prisma.driverRanking.findFirst({
      where: { driverId },
    });

    if (existingRanking) {
      return existingRanking; // Ranking already exists
    }

    // Create new ranking with default values
    return this.prisma.driverRanking.create({
      data: {
        driverId,
        workRate: 0.0,
        feedbackRate: 0.0,
        cancellationRate: 0.0,
        averageRate: 0.0
      }
    });
  }

  // Add a method to update a driver's cancellation rate
  async updateDriverCancellation(driverId: number) {
    const ranking = await this.prisma.driverRanking.findFirst({
      where: { driverId },
    });

    if (!ranking) {
      throw new NotFoundException(`Ranking not found for driver with ID ${driverId}`);
    }

    // Increment cancellation rate by 1
    const updatedCancellationRate = ranking.cancellationRate + 1.0;
    
    // Directly subtract 1.0 from the average rate as per requirements
    const updatedAverageRate = ranking.averageRate - 1.0;

    return this.prisma.driverRanking.update({
      where: { id: ranking.id },
      data: { 
        cancellationRate: updatedCancellationRate,
        averageRate: updatedAverageRate
      },
      include: {
        driver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            contactNumber: true,
          }
        }
      }
    });
  }

  // Add a method to update work rate when a driver completes a job
  async updateDriverWorkRate(driverId: number) {
    const ranking = await this.prisma.driverRanking.findFirst({
      where: { driverId },
    });

    if (!ranking) {
      throw new NotFoundException(`Ranking not found for driver with ID ${driverId}`);
    }

    // Increment work rate (capped at 31 for a month)
    const currentWorkRate = ranking.workRate;
    const updatedWorkRate = Math.min(currentWorkRate + 1.0, 31.0);

    return this.prisma.driverRanking.update({
      where: { id: ranking.id },
      data: { workRate: updatedWorkRate },
      include: {
        driver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            contactNumber: true,
          }
        }
      }
    });
  }

  // Add a method to update feedback rate
  async updateDriverFeedback(driverId: number, isPositive: boolean) {
    const ranking = await this.prisma.driverRanking.findFirst({
      where: { driverId },
    });

    if (!ranking) {
      throw new NotFoundException(`Ranking not found for driver with ID ${driverId}`);
    }

    // Update feedback rate: +1 for positive, -1 for negative
    const feedbackChange = isPositive ? 1.0 : -1.0;
    const updatedFeedbackRate = ranking.feedbackRate + feedbackChange;

    return this.prisma.driverRanking.update({
      where: { id: ranking.id },
      data: { feedbackRate: updatedFeedbackRate },
      include: {
        driver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            contactNumber: true,
          }
        }
      }
    });
  }

  // Perform biannual normalization of all driver rankings
  async performBiannualNormalization() {
    // Get all drivers with their rankings
    const allDriverRankings = await this.prisma.driverRanking.findMany({
      orderBy: {
        averageRate: 'desc'
      }
    });

    const totalDrivers = allDriverRankings.length;
    
    if (totalDrivers <= 1) {
      return { message: 'Not enough drivers for normalization' };
    }

    // Prepare batch data for Python script
    const driversData = allDriverRankings.map(ranking => ({
      workRate: ranking.workRate,
      feedbackRate: ranking.feedbackRate,
      cancellationRate: ranking.cancellationRate,
      averageRate: ranking.averageRate,
      isBiannual: true
    }));

    try {
      const options = {
        scriptPath: path.join(__dirname),
        pythonPath: 'python',
        args: [],
        mode: 'json' as const,
      };

      const pyshell = new PythonShell('ranking.py', options);

      // Send batch data to Python script
      const normalizedScores = await new Promise<number[]>((resolve, reject) => {
        pyshell.send(JSON.stringify(driversData));

        pyshell.on('message', (message) => {
          const result = JSON.parse(message);
          resolve(result.scores);
        });

        pyshell.on('error', (error) => {
          console.error('Python script error:', error);
          reject(error);
        });

        pyshell.end((err) => {
          if (err) reject(err);
        });
      });

      // Update all driver rankings with normalized scores
      const updatePromises = allDriverRankings.map((ranking, index) => {
        return this.prisma.driverRanking.update({
          where: { id: ranking.id },
          data: { averageRate: normalizedScores[index] }
        });
      });

      await Promise.all(updatePromises);
      
      return { 
        message: 'Biannual normalization completed successfully',
        totalDrivers
      };
    } catch (error) {
      console.error('Error performing biannual normalization:', error);
      throw error;
    }
  }

  // Process and update driver work rates based on job availability
  async processDriverWorkRates() {
    try {
      // Get the date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get all JOB availabilities in the last 30 days with both start and end dates
      const jobAvailabilities = await this.prisma.availability.findMany({
        where: {
          status: AvailabilityStatus.JOB,
          startDate: {
            gte: thirtyDaysAgo
          }
        },
        select: {
          driverId: true,
          startDate: true,
          endDate: true
        }
      });

      // Calculate work days for each driver
      const driverWorkDays = new Map<number, number>();
      
      for (const availability of jobAvailabilities) {
        const driverId = availability.driverId;
        
        // Calculate days between start and end date (inclusive)
        const startDate = new Date(availability.startDate);
        const endDate = new Date(availability.endDate || availability.startDate); // Use startDate if endDate is null
        
        // Reset time components to ensure we're only counting calendar days
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        
        // Calculate the difference in days (inclusive of both start and end dates)
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
        
        console.log(`Driver ${driverId}: Job from ${availability.startDate.toISOString()} to ${availability.endDate.toISOString()} = ${diffDays} days`);
        
        // Add to driver's total
        if (!driverWorkDays.has(driverId)) {
          driverWorkDays.set(driverId, 0);
        }
        
        driverWorkDays.set(driverId, driverWorkDays.get(driverId) + diffDays);
      }

      // Process updates for each driver
      const updateResults = [];
      
      for (const [driverId, workDaysCount] of driverWorkDays.entries()) {
        // Find the driver's ranking record
        const ranking = await this.prisma.driverRanking.findFirst({
          where: { driverId }
        });
        
        if (ranking) {
          // Update the work rate (no cap)
          const updatedWorkRate = workDaysCount;
          
          // Calculate new average rate using Python script
          const newAverageRate = await this.calculateRanking(
            updatedWorkRate,
            ranking.feedbackRate,
            ranking.cancellationRate,
            ranking.averageRate
          );
          
          const updatedRanking = await this.prisma.driverRanking.update({
            where: { id: ranking.id },
            data: { 
              workRate: updatedWorkRate,
              averageRate: newAverageRate
            },
            include: {
              driver: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          });
          
          updateResults.push({
            driverId,
            driverName: `${updatedRanking.driver.firstName} ${updatedRanking.driver.lastName}`,
            workDays: workDaysCount,
            updatedWorkRate: updatedRanking.workRate,
            previousAverageRate: ranking.averageRate,
            newAverageRate: updatedRanking.averageRate,
            jobsProcessed: jobAvailabilities.filter(job => job.driverId === driverId).length
          });
        } else {
          // Create a new ranking record if one doesn't exist
          // For new records, calculate initial average rate
          const newAverageRate = await this.calculateRanking(
            workDaysCount, // workRate
            0, // feedbackRate (default for new record)
            0, // cancellationRate (default for new record)
            0  // current averageRate (default for new record)
          );
          
          const newRanking = await this.prisma.driverRanking.create({
            data: {
              driverId,
              workRate: workDaysCount,
              feedbackRate: 0,
              cancellationRate: 0,
              averageRate: newAverageRate
            },
            include: {
              driver: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          });
          
          updateResults.push({
            driverId,
            driverName: `${newRanking.driver.firstName} ${newRanking.driver.lastName}`,
            workDays: workDaysCount,
            updatedWorkRate: newRanking.workRate,
            newAverageRate: newRanking.averageRate,
            jobsProcessed: jobAvailabilities.filter(job => job.driverId === driverId).length,
            isNew: true
          });
        }
      }
      
      // Calculate some statistics for the response
      return {
        status: 'success',
        message: 'Driver work rates processed successfully',
        totalDriversProcessed: updateResults.length,
        totalWorkDaysProcessed: jobAvailabilities.length,
        periodStart: thirtyDaysAgo.toISOString(),
        periodEnd: new Date().toISOString(),
        driverUpdates: updateResults
      };
    } catch (error) {
      console.error('Error processing driver work rates:', error);
      throw error;
    }
  }

  // Add this method to the DriverRankingService class

  async processJobFeedback(jobFeedbackDto: JobFeedbackDto) {
    const { jobId, feedbackValue } = jobFeedbackDto;

    try {
      // Fetch the job and validate it
      const job = await this.prisma.job.findUnique({
        where: { jobId }
      });

      if (!job) {
        throw new NotFoundException(`Job with ID ${jobId} not found`);
      }

      if (job.currentState !== 'COMPLETED') {
        throw new BadRequestException('Feedback can only be submitted for completed jobs');
      }

      if (!job.assignedDriverId) {
        throw new BadRequestException('This job has no assigned driver');
      }

      // Find the driver's ranking record
      const driverRanking = await this.prisma.driverRanking.findFirst({
        where: { driverId: job.assignedDriverId }
      });

      if (!driverRanking) {
        throw new NotFoundException(`Driver ranking record not found for driver ID ${job.assignedDriverId}`);
      }

      // Calculate new feedback rate
      const newFeedbackRate = driverRanking.feedbackRate + feedbackValue;

      // Calculate new average rate using Python script
      const newAverageRate = await this.calculateRanking(
        driverRanking.workRate,
        newFeedbackRate,
        driverRanking.cancellationRate,
        driverRanking.averageRate
      );

      // Update the driver ranking atomically
      const updatedRanking = await this.prisma.driverRanking.update({
        where: { id: driverRanking.id },
        data: {
          feedbackRate: newFeedbackRate,
          averageRate: newAverageRate
        },
        include: {
          driver: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return {
        status: 'success',
        message: 'Driver feedback processed successfully',
        jobId,
        driverId: job.assignedDriverId,
        driverName: `${updatedRanking.driver.firstName} ${updatedRanking.driver.lastName}`,
        previousFeedbackRate: driverRanking.feedbackRate,
        newFeedbackRate: updatedRanking.feedbackRate,
        previousAverageRate: driverRanking.averageRate,
        newAverageRate: updatedRanking.averageRate
      };
    } catch (error) {
      console.error('Error processing job feedback:', error);
      throw error;
    }
  }

  // Add this method to the DriverRankingService class

  /**
   * Updates a driver's ranking when they cancel a job
   * @param driverId The ID of the driver who cancelled the job
   * @returns The updated driver ranking information
   */
  async processJobCancellation(driverId: number) {
    try {
      // Find the driver's ranking record
      const driverRanking = await this.prisma.driverRanking.findFirst({
        where: { driverId }
      });

      if (!driverRanking) {
        throw new NotFoundException(`Driver ranking record not found for driver ID ${driverId}`);
      }

      // Increment cancellation rate
      const newCancellationRate = driverRanking.cancellationRate + 1;

      // Calculate new average rate using Python script
      const newAverageRate = await this.calculateRanking(
        driverRanking.workRate,
        driverRanking.feedbackRate,
        newCancellationRate,
        driverRanking.averageRate
      );

      // Log calculation details for debugging
      console.log('Job Cancellation Ranking Update:');
      console.log(`Driver ID: ${driverId}`);
      console.log(`Work Rate: ${driverRanking.workRate}`);
      console.log(`Feedback Rate: ${driverRanking.feedbackRate}`);
      console.log(`Previous Cancellation Rate: ${driverRanking.cancellationRate}`);
      console.log(`New Cancellation Rate: ${newCancellationRate}`);
      console.log(`Previous Average Rate: ${driverRanking.averageRate}`);
      console.log(`New Average Rate: ${newAverageRate}`);

      // Update the driver ranking atomically
      const updatedRanking = await this.prisma.driverRanking.update({
        where: { id: driverRanking.id },
        data: {
          cancellationRate: newCancellationRate,
          averageRate: newAverageRate
        },
        include: {
          driver: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return {
        status: 'success',
        message: 'Driver ranking updated after job cancellation',
        driverId,
        driverName: `${updatedRanking.driver.firstName} ${updatedRanking.driver.lastName}`,
        previousCancellationRate: driverRanking.cancellationRate,
        newCancellationRate: updatedRanking.cancellationRate,
        previousAverageRate: driverRanking.averageRate,
        newAverageRate: updatedRanking.averageRate
      };
    } catch (error) {
      console.error('Error processing job cancellation:', error);
      throw error;
    }
  }
}
