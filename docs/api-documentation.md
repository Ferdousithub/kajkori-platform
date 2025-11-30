# KajKori API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.kajkori.com/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 📱 Authentication Endpoints

### Send OTP
Send verification code to phone number.

**Endpoint:** `POST /auth/send-otp`

**Request Body:**
```json
{
  "phoneNumber": "+8801712345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"  // Only in development mode
}
```

---

### Verify OTP & Login/Register
Verify OTP and create/login user.

**Endpoint:** `POST /auth/verify-otp`

**Request Body:**
```json
{
  "phoneNumber": "+8801712345678",
  "otp": "123456",
  "userType": "job_seeker",  // or "employer"
  "name": "রিমা বেগম",
  "deviceToken": "fcm_token_here"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "isNewUser": false,
  "user": {
    "id": "uuid",
    "phoneNumber": "+8801712345678",
    "name": "রিমা বেগম",
    "userType": "job_seeker",
    "email": null,
    "profilePhoto": null,
    "isVerified": false,
    "language": "bn"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👤 User Profile Endpoints

### Get Profile
Get current user profile.

**Endpoint:** `GET /users/profile`

**Headers:** Authorization required

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "phoneNumber": "+8801712345678",
    "name": "রিমা বেগম",
    "userType": "job_seeker",
    "email": "rima@example.com",
    "profilePhoto": "https://...",
    "isVerified": true,
    "language": "bn"
  },
  "profile": {
    "age": 24,
    "district": "Gazipur",
    "skills": ["Sewing", "Quality Control"],
    "experience": [...],
    "expectedSalaryMin": 12000,
    "expectedSalaryMax": 15000,
    "rating": 4.5,
    "nidVerified": true,
    "profileCompleteness": 85
  }
}
```

---

### Update Profile
Update user profile information.

**Endpoint:** `PUT /users/profile`

**Headers:** Authorization required

**Request Body:**
```json
{
  "name": "রিমা বেগম",
  "age": 24,
  "district": "Gazipur",
  "skills": ["Sewing", "Cutting", "Quality Control"],
  "expectedSalaryMin": 12000,
  "expectedSalaryMax": 15000,
  "bio": "২ বছরের অভিজ্ঞতা সহ দক্ষ সেলাই কর্মী"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {...}
}
```

---

## 💼 Job Endpoints

### List Jobs
Get list of jobs with filters.

**Endpoint:** `GET /jobs`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `district` (string)
- `category` (string)
- `salaryMin` (number)
- `salaryMax` (number)
- `jobType` (full_time|part_time|contract)
- `search` (string)

**Example:**
```
GET /jobs?district=Gazipur&salaryMin=12000&page=1&limit=20
```

**Response:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Sewing Operator",
      "category": "garments",
      "description": "...",
      "salaryMin": 12000,
      "salaryMax": 15000,
      "district": "Gazipur",
      "jobType": "full_time",
      "shift": "day",
      "positions": 5,
      "status": "active",
      "employer": {
        "id": "uuid",
        "businessName": "Apex Garments Ltd.",
        "isVerified": true
      },
      "createdAt": "2024-01-15T10:00:00Z",
      "matchScore": 85  // Only if user is logged in
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### Get Job Details
Get detailed information about a specific job.

**Endpoint:** `GET /jobs/:jobId`

**Response:**
```json
{
  "job": {
    "id": "uuid",
    "title": "Sewing Operator",
    "category": "garments",
    "description": "Full job description...",
    "requirements": "Requirements text...",
    "requiredSkills": ["Sewing", "Quality Control"],
    "salaryMin": 12000,
    "salaryMax": 15000,
    "salaryNegotiable": false,
    "positions": 5,
    "positionsFilled": 2,
    "jobType": "full_time",
    "shift": "day",
    "experienceRequired": 6,
    "district": "Gazipur",
    "subDistrict": "Tongi",
    "address": "Industrial Area, Tongi",
    "location": {
      "lat": 23.8905,
      "lng": 90.4057
    },
    "startDate": "2024-02-01",
    "startDateType": "scheduled",
    "benefits": ["overtime_pay", "transport", "lunch"],
    "status": "active",
    "viewCount": 234,
    "applicationCount": 45,
    "isFeatured": false,
    "isUrgent": true,
    "employer": {
      "id": "uuid",
      "businessName": "Apex Garments Ltd.",
      "businessType": "manufacturing",
      "isVerified": true,
      "rating": 4.2,
      "employeeCount": 500
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "matchScore": 85,
    "matchReasons": [
      "Your location is nearby (5km)",
      "You have required sewing experience",
      "Salary matches your expectations"
    ]
  }
}
```

---

### Create Job (Employer Only)
Post a new job.

**Endpoint:** `POST /jobs`

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "Sewing Operator",
  "category": "garments",
  "description": "We are hiring experienced sewing operators...",
  "requirements": "6+ months experience required",
  "requiredSkills": ["Sewing", "Quality Control"],
  "salaryMin": 12000,
  "salaryMax": 15000,
  "positions": 5,
  "jobType": "full_time",
  "shift": "day",
  "experienceRequired": 6,
  "district": "Gazipur",
  "subDistrict": "Tongi",
  "address": "Industrial Area",
  "startDateType": "immediate",
  "benefits": ["overtime_pay", "transport"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "job": {...},
  "matchedCandidates": 23
}
```

---

## 📝 Application Endpoints

### Apply to Job
Submit application for a job.

**Endpoint:** `POST /applications`

**Headers:** Authorization required

**Request Body:**
```json
{
  "jobId": "uuid",
  "coverLetter": "I am interested in this position...",
  "expectedSalary": 13000,
  "availableFrom": "2024-02-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "id": "uuid",
    "jobId": "uuid",
    "status": "applied",
    "matchScore": 85,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### Get My Applications
Get list of user's applications.

**Endpoint:** `GET /applications`

**Headers:** Authorization required

**Query Parameters:**
- `status` (applied|viewed|shortlisted|hired|rejected)
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "applications": [
    {
      "id": "uuid",
      "status": "shortlisted",
      "matchScore": 85,
      "job": {
        "id": "uuid",
        "title": "Sewing Operator",
        "employer": {
          "businessName": "Apex Garments"
        }
      },
      "viewedByEmployerAt": "2024-01-16T09:00:00Z",
      "shortlistedAt": "2024-01-16T14:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

## 🎯 Matching Endpoints

### Get Matched Jobs (Job Seeker)
Get personalized job recommendations.

**Endpoint:** `GET /matching/jobs`

**Headers:** Authorization required

**Query Parameters:**
- `limit` (default: 20)
- `minScore` (default: 40)

**Response:**
```json
{
  "matches": [
    {
      "job": {...},
      "matchScore": 92,
      "matchReasons": [
        "Location nearby (3km)",
        "Perfect skill match",
        "Salary within range"
      ]
    }
  ]
}
```

---

### Get Matched Candidates (Employer)
Get best matching candidates for a job.

**Endpoint:** `GET /matching/candidates/:jobId`

**Headers:** Authorization required

**Response:**
```json
{
  "candidates": [
    {
      "worker": {
        "id": "uuid",
        "name": "রিমা বেগম",
        "age": 24,
        "district": "Gazipur",
        "skills": ["Sewing", "Quality Control"],
        "rating": 4.5,
        "nidVerified": true
      },
      "matchScore": 92,
      "breakdown": {
        "skills": {"score": 100, "weighted": 30},
        "location": {"score": 90, "weighted": 22.5},
        "experience": {"score": 85, "weighted": 17},
        "salary": {"score": 100, "weighted": 15},
        "availability": {"score": 100, "weighted": 10},
        "bonus": 5,
        "total": 92
      }
    }
  ]
}
```

---

## 💬 Messaging Endpoints

### Send Message
Send a message to another user.

**Endpoint:** `POST /messages`

**Headers:** Authorization required

**Request Body:**
```json
{
  "receiverId": "uuid",
  "applicationId": "uuid",  // optional
  "messageType": "text",
  "content": "When can I come for interview?"
}
```

**Response:**
```json
{
  "success": true,
  "message": {...}
}
```

---

### Get Conversation
Get messages between two users.

**Endpoint:** `GET /messages/:userId`

**Headers:** Authorization required

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "senderId": "uuid",
      "receiverId": "uuid",
      "content": "Message text",
      "isRead": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## 🎓 Course Endpoints

### List Courses
Get available training courses.

**Endpoint:** `GET /courses`

**Query Parameters:**
- `category` (string)
- `difficulty` (beginner|intermediate|advanced)
- `isFree` (boolean)

**Response:**
```json
{
  "courses": [
    {
      "id": "uuid",
      "titleBangla": "নিরাপদ কারখানা অনুশীলন",
      "titleEnglish": "Safe Factory Practices",
      "category": "safety",
      "durationMinutes": 30,
      "difficulty": "beginner",
      "isFree": true,
      "thumbnailUrl": "https://...",
      "rating": 4.5,
      "enrollmentCount": 1250
    }
  ]
}
```

---

## 🔍 Search & Filters

### Districts List
```
GET /meta/districts
```

### Job Categories List
```
GET /meta/categories
```

### Skills List
```
GET /meta/skills
```

---

## Error Responses

All endpoints may return these error formats:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "phoneNumber",
      "message": "Invalid phone number format"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "You don't have permission to access this resource"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details..."
}
```

---

## Rate Limiting

- **General endpoints:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 10 requests per 15 minutes per IP
- **File upload endpoints:** 20 requests per hour per user

---

## WebSocket Events

Connect to: `ws://localhost:3000`

**Events:**
- `message:new` - New message received
- `application:status_changed` - Application status updated
- `job:matched` - New job match found
- `notification:new` - New notification

---

For more details, see the complete API specification at:
https://docs.kajkori.com/api
