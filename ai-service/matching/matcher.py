"""
KajKori AI Matching Engine
Advanced job matching algorithm with machine learning capabilities
"""

import math
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class JobMatcher:
    """
    Advanced job matching engine using scoring algorithm
    
    Match Score Formula (0-100):
    - Skill Match: 30%
    - Location Score: 25%
    - Experience Match: 20%
    - Salary Compatibility: 15%
    - Availability Match: 10%
    """
    
    def __init__(self):
        self.weights = {
            'skills': 0.30,
            'location': 0.25,
            'experience': 0.20,
            'salary': 0.15,
            'availability': 0.10
        }
        
        # District proximity map (simplified)
        self.district_proximity = {
            'Dhaka': ['Gazipur', 'Narayanganj', 'Manikganj', 'Munshiganj'],
            'Gazipur': ['Dhaka', 'Mymensingh', 'Tangail'],
            'Chittagong': ["Cox's Bazar", 'Comilla', 'Feni'],
            'Sylhet': ['Moulvibazar', 'Sunamganj', 'Habiganj'],
        }
    
    def calculate_match_score(self, worker: Dict, job: Dict) -> int:
        """Calculate overall match score"""
        
        scores = {
            'skills': self._calculate_skill_match(worker, job),
            'location': self._calculate_location_match(worker, job),
            'experience': self._calculate_experience_match(worker, job),
            'salary': self._calculate_salary_compatibility(worker, job),
            'availability': self._calculate_availability_match(worker, job)
        }
        
        # Calculate weighted total
        total_score = sum(
            scores[key] * self.weights[key] for key in scores
        )
        
        # Add bonus scores
        bonus = self._calculate_bonus_score(worker, job)
        total_score += bonus
        
        # Cap at 100
        return min(round(total_score), 100)
    
    def get_score_breakdown(self, worker: Dict, job: Dict) -> Dict:
        """Get detailed breakdown of match score"""
        
        skills_score = self._calculate_skill_match(worker, job)
        location_score = self._calculate_location_match(worker, job)
        experience_score = self._calculate_experience_match(worker, job)
        salary_score = self._calculate_salary_compatibility(worker, job)
        availability_score = self._calculate_availability_match(worker, job)
        bonus_score = self._calculate_bonus_score(worker, job)
        
        return {
            'skills': {
                'score': skills_score,
                'weighted': skills_score * self.weights['skills'],
                'weight': self.weights['skills'] * 100
            },
            'location': {
                'score': location_score,
                'weighted': location_score * self.weights['location'],
                'weight': self.weights['location'] * 100
            },
            'experience': {
                'score': experience_score,
                'weighted': experience_score * self.weights['experience'],
                'weight': self.weights['experience'] * 100
            },
            'salary': {
                'score': salary_score,
                'weighted': salary_score * self.weights['salary'],
                'weight': self.weights['salary'] * 100
            },
            'availability': {
                'score': availability_score,
                'weighted': availability_score * self.weights['availability'],
                'weight': self.weights['availability'] * 100
            },
            'bonus': bonus_score,
            'total': min(
                round(
                    skills_score * self.weights['skills'] +
                    location_score * self.weights['location'] +
                    experience_score * self.weights['experience'] +
                    salary_score * self.weights['salary'] +
                    availability_score * self.weights['availability'] +
                    bonus_score
                ),
                100
            )
        }
    
    def _calculate_skill_match(self, worker: Dict, job: Dict) -> float:
        """Calculate skill matching score"""
        
        required_skills = job.get('required_skills', [])
        worker_skills = worker.get('skills', [])
        
        if not required_skills:
            return 100.0
        
        if not worker_skills:
            return 30.0
        
        # Normalize to lowercase for comparison
        required_lower = [s.lower() for s in required_skills]
        worker_lower = [s.lower() for s in worker_skills]
        
        # Calculate matching skills
        matching_skills = [
            skill for skill in worker_lower 
            if skill in required_lower
        ]
        
        match_percentage = (len(matching_skills) / len(required_skills)) * 100
        return match_percentage
    
    def _calculate_location_match(self, worker: Dict, job: Dict) -> float:
        """Calculate location proximity score"""
        
        worker_district = worker.get('district', '')
        job_district = job.get('district', '')
        
        # Same district
        if worker_district == job_district:
            # If we have coordinates, calculate distance
            worker_location = worker.get('location')
            job_location = job.get('location')
            
            if worker_location and job_location:
                distance = self._calculate_distance(
                    worker_location,
                    job_location
                )
                
                if distance <= 5:
                    return 100.0
                elif distance <= 10:
                    return 80.0
                elif distance <= 20:
                    return 60.0
                elif distance <= 30:
                    return 40.0
                else:
                    return 20.0
            
            # Same district but no coordinates
            return 60.0
        
        # Check if districts are nearby
        nearby_districts = self.district_proximity.get(job_district, [])
        if worker_district in nearby_districts:
            return 30.0
        
        # Different, non-adjacent districts
        return 10.0
    
    def _calculate_distance(self, point1: Dict, point2: Dict) -> float:
        """Calculate distance between two coordinates in km"""
        
        lat1 = math.radians(point1['lat'])
        lon1 = math.radians(point1['lng'])
        lat2 = math.radians(point2['lat'])
        lon2 = math.radians(point2['lng'])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = (math.sin(dlat / 2) ** 2 + 
             math.cos(lat1) * math.cos(lat2) * 
             math.sin(dlon / 2) ** 2)
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        # Earth's radius in km
        radius = 6371
        
        return radius * c
    
    def _calculate_experience_match(self, worker: Dict, job: Dict) -> float:
        """Calculate experience matching score"""
        
        required_months = job.get('experience_required', 0)
        worker_experience = worker.get('experience', [])
        job_category = job.get('category', '')
        
        # Calculate total experience
        total_months = 0
        relevant_months = 0
        
        for exp in worker_experience:
            months = exp.get('duration', 0)
            total_months += months
            
            # Check if experience is in same category
            if exp.get('category') == job_category:
                relevant_months += months
        
        # If no experience required
        if required_months == 0:
            return 80.0 if total_months > 0 else 70.0
        
        # Worker exceeds requirements
        if total_months >= required_months:
            # Bonus for relevant experience
            if relevant_months >= required_months:
                return 100.0
            return 90.0
        
        # Worker has some experience
        percentage = (total_months / required_months) * 100
        if percentage >= 50:
            return 70.0
        
        return 40.0
    
    def _calculate_salary_compatibility(self, worker: Dict, job: Dict) -> float:
        """Calculate salary range compatibility"""
        
        worker_min = worker.get('expected_salary_min')
        worker_max = worker.get('expected_salary_max')
        job_min = job.get('salary_min', 0)
        job_max = job.get('salary_max', 0)
        
        # If worker hasn't set expectations
        if not worker_min or not worker_max:
            return 70.0
        
        # Check if ranges overlap
        if worker_min <= job_max and worker_max >= job_min:
            return 100.0
        
        # Worker expects slightly more (within 20%)
        if worker_min <= job_max * 1.2:
            return 70.0
        
        # Worker expects moderately more (within 30%)
        if worker_min <= job_max * 1.3:
            return 40.0
        
        # Worker expects significantly more
        return 20.0
    
    def _calculate_availability_match(self, worker: Dict, job: Dict) -> float:
        """Calculate availability and shift compatibility"""
        
        worker_availability = worker.get('availability', 'immediate')
        worker_shifts = worker.get('preferred_shifts', ['day'])
        job_start = job.get('start_date_type', 'immediate')
        job_shift = job.get('shift', 'day')
        
        score = 0.0
        
        # Start date alignment (40%)
        if worker_availability == 'immediate' and job_start == 'immediate':
            score += 40
        elif worker_availability == 'within_week':
            score += 30
        elif worker_availability == 'within_month':
            score += 20
        else:
            score += 10
        
        # Shift compatibility (60%)
        if job_shift in worker_shifts:
            score += 60
        elif 'flexible' in worker_shifts or job_shift == 'flexible':
            score += 40
        else:
            score += 20
        
        return score
    
    def _calculate_bonus_score(self, worker: Dict, job: Dict) -> float:
        """Calculate bonus points for special factors"""
        
        bonus = 0.0
        
        # Verified worker
        if worker.get('nid_verified', False):
            bonus += 5
        
        # High rating
        rating = worker.get('rating', 0.0)
        if rating >= 4.5:
            bonus += 3
        elif rating >= 4.0:
            bonus += 2
        
        # Profile completeness
        completeness = worker.get('profile_completeness', 0)
        if completeness >= 80:
            bonus += 2
        elif completeness >= 60:
            bonus += 1
        
        return bonus
    
    def find_best_matches(
        self, 
        job: Dict, 
        workers: List[Dict], 
        limit: int = 20
    ) -> List[Dict]:
        """Find best matching workers for a job"""
        
        matches = []
        
        for worker in workers:
            score = self.calculate_match_score(worker, job)
            
            if score >= 40:  # Minimum threshold
                matches.append({
                    'worker_id': worker.get('id'),
                    'match_score': score,
                    'breakdown': self.get_score_breakdown(worker, job)
                })
        
        # Sort by score descending
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return matches[:limit]
