const { Op } = require('sequelize');
const WorkerProfile = require('../models/WorkerProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const logger = require('../utils/logger');

/**
 * KajKori Job Matching Algorithm
 * 
 * Match Score Formula (0-100):
 * - Skill Match: 30%
 * - Location Score: 25%
 * - Experience Match: 20%
 * - Salary Compatibility: 15%
 * - Availability Match: 10%
 */

class MatchingService {
  /**
   * Calculate match score between a worker and a job
   */
  calculateMatchScore(workerProfile, job) {
    let totalScore = 0;
    
    // 1. Skill Match (30 points max)
    const skillScore = this.calculateSkillMatch(workerProfile.skills, job.requiredSkills);
    totalScore += skillScore * 0.30;
    
    // 2. Location Score (25 points max)
    const locationScore = this.calculateLocationScore(
      workerProfile.location,
      job.location,
      workerProfile.district,
      job.district
    );
    totalScore += locationScore * 0.25;
    
    // 3. Experience Match (20 points max)
    const experienceScore = this.calculateExperienceMatch(
      workerProfile.experience,
      job.experienceRequired,
      job.category
    );
    totalScore += experienceScore * 0.20;
    
    // 4. Salary Compatibility (15 points max)
    const salaryScore = this.calculateSalaryCompatibility(
      workerProfile.expectedSalaryMin,
      workerProfile.expectedSalaryMax,
      job.salaryMin,
      job.salaryMax
    );
    totalScore += salaryScore * 0.15;
    
    // 5. Availability Match (10 points max)
    const availabilityScore = this.calculateAvailabilityMatch(
      workerProfile.availability,
      workerProfile.preferredShifts,
      job.startDateType,
      job.shift
    );
    totalScore += availabilityScore * 0.10;
    
    // Apply bonus multipliers
    totalScore += this.calculateBonusScore(workerProfile, job);
    
    // Cap at 100
    return Math.min(Math.round(totalScore), 100);
  }

  /**
   * Calculate skill match score
   */
  calculateSkillMatch(workerSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) return 100;
    if (!workerSkills || workerSkills.length === 0) return 30;
    
    const matchingSkills = workerSkills.filter(skill => 
      requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
    );
    
    const matchPercentage = (matchingSkills.length / requiredSkills.length) * 100;
    return matchPercentage;
  }

  /**
   * Calculate location score based on distance and district
   */
  calculateLocationScore(workerLocation, jobLocation, workerDistrict, jobDistrict) {
    // Same district is a baseline
    if (workerDistrict !== jobDistrict) return 10;
    
    // If we have coordinates, calculate distance
    if (workerLocation && jobLocation) {
      const distance = this.calculateDistance(workerLocation, jobLocation);
      
      if (distance <= 5) return 100;
      if (distance <= 10) return 80;
      if (distance <= 20) return 60;
      if (distance <= 30) return 40;
      return 20;
    }
    
    // Same district but no coordinates
    return 60;
  }

  /**
   * Calculate distance between two coordinates (in km)
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(point2.coordinates[1] - point1.coordinates[1]);
    const dLon = this.deg2rad(point2.coordinates[0] - point1.coordinates[0]);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.coordinates[1])) * 
      Math.cos(this.deg2rad(point2.coordinates[1])) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Calculate experience match
   */
  calculateExperienceMatch(workerExperience, requiredExperience, jobCategory) {
    // Calculate total months of experience
    let totalExperience = 0;
    let relevantExperience = 0;
    
    if (workerExperience && Array.isArray(workerExperience)) {
      workerExperience.forEach(exp => {
        const months = exp.duration || 0;
        totalExperience += months;
        
        // Check if experience is in same category
        if (exp.category === jobCategory) {
          relevantExperience += months;
        }
      });
    }
    
    const requiredMonths = requiredExperience || 0;
    
    if (totalExperience >= requiredMonths) return 100;
    if (requiredMonths === 0) return 80;
    
    const percentage = (totalExperience / requiredMonths) * 100;
    
    if (percentage >= 50) return 70;
    return 40;
  }

  /**
   * Calculate salary compatibility
   */
  calculateSalaryCompatibility(workerMin, workerMax, jobMin, jobMax) {
    // If worker hasn't set expectations, neutral score
    if (!workerMin || !workerMax) return 70;
    
    // Check if ranges overlap
    if (workerMin <= jobMax && workerMax >= jobMin) return 100;
    
    // Worker expects slightly more (within 20%)
    if (workerMin <= jobMax * 1.2) return 70;
    
    // Worker expects significantly more
    if (workerMin <= jobMax * 1.3) return 40;
    
    return 20;
  }

  /**
   * Calculate availability match
   */
  calculateAvailabilityMatch(workerAvailability, workerShifts, jobStartType, jobShift) {
    let score = 0;
    
    // Start date alignment (40% of availability score)
    if (workerAvailability === 'immediate' && jobStartType === 'immediate') {
      score += 40;
    } else if (workerAvailability === 'within_week') {
      score += 30;
    } else {
      score += 20;
    }
    
    // Shift compatibility (60% of availability score)
    if (workerShifts && workerShifts.includes(jobShift)) {
      score += 60;
    } else if (workerShifts && workerShifts.includes('flexible')) {
      score += 40;
    } else {
      score += 20;
    }
    
    return score;
  }

  /**
   * Calculate bonus score for special factors
   */
  calculateBonusScore(workerProfile, job) {
    let bonus = 0;
    
    // Verified worker
    if (workerProfile.nidVerified) bonus += 5;
    
    // High rating
    if (workerProfile.rating >= 4.5) bonus += 3;
    
    // Profile completeness
    if (workerProfile.profileCompleteness >= 80) bonus += 2;
    
    return bonus;
  }

  /**
   * Find best matching workers for a job
   */
  async findMatchingWorkers(jobId, limit = 20) {
    try {
      const job = await Job.findByPk(jobId);
      if (!job) throw new Error('Job not found');
      
      // Find workers in same district or nearby
      const workers = await WorkerProfile.findAll({
        where: {
          district: {
            [Op.in]: [job.district, ...this.getNearbyDistricts(job.district)]
          }
        },
        include: [{
          model: User,
          where: { 
            userType: 'job_seeker',
            isActive: true
          }
        }],
        limit: 100 // Get more for filtering
      });
      
      // Calculate match scores
      const matches = workers.map(worker => ({
        worker,
        matchScore: this.calculateMatchScore(worker, job)
      }))
      .filter(m => m.matchScore >= 40) // Minimum 40% match
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
      
      return matches;
      
    } catch (error) {
      logger.error('Find matching workers error:', error);
      throw error;
    }
  }

  /**
   * Find best matching jobs for a worker
   */
  async findMatchingJobs(workerId, limit = 20) {
    try {
      const workerProfile = await WorkerProfile.findOne({
        where: { userId: workerId }
      });
      
      if (!workerProfile) throw new Error('Worker profile not found');
      
      // Find jobs in same district or nearby
      const jobs = await Job.findAll({
        where: {
          status: 'active',
          district: {
            [Op.in]: [workerProfile.district, ...this.getNearbyDistricts(workerProfile.district)]
          },
          expiresAt: {
            [Op.or]: [
              { [Op.gt]: new Date() },
              { [Op.is]: null }
            ]
          }
        },
        limit: 100
      });
      
      // Calculate match scores
      const matches = jobs.map(job => ({
        job,
        matchScore: this.calculateMatchScore(workerProfile, job)
      }))
      .filter(m => m.matchScore >= 40)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
      
      return matches;
      
    } catch (error) {
      logger.error('Find matching jobs error:', error);
      throw error;
    }
  }

  /**
   * Get nearby districts (simplified - in production, use actual geographic data)
   */
  getNearbyDistricts(district) {
    const districtMap = {
      'Dhaka': ['Gazipur', 'Narayanganj', 'Manikganj'],
      'Gazipur': ['Dhaka', 'Mymensingh'],
      'Chittagong': ['Cox\'s Bazar', 'Comilla'],
      // Add more as needed
    };
    
    return districtMap[district] || [];
  }
}

module.exports = new MatchingService();
