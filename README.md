# KajKori (কাজকরি) - Complete Prototype

## 🚀 Project Overview

KajKori is Bangladesh's first Bangla-first job matchmaking platform designed specifically for blue-collar workers and employers. This prototype includes a fully functional mobile app (React Native), backend API, AI matching engine, and admin dashboard.

## 📁 Project Structure

```
kajkori-prototype/
├── mobile-app/              # React Native mobile application
│   ├── src/
│   │   ├── screens/         # All app screens
│   │   ├── components/      # Reusable components
│   │   ├── navigation/      # Navigation setup
│   │   ├── services/        # API services
│   │   ├── utils/           # Helper functions
│   │   └── assets/          # Images, fonts, etc.
│   ├── App.js
│   └── package.json
│
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── services/        # External services
│   │   └── config/          # Configuration
│   ├── server.js
│   └── package.json
│
├── ai-service/              # Python AI/ML service
│   ├── matching/            # Matching algorithm
│   ├── nlp/                 # Bangla NLP processing
│   ├── cv_generator/        # CV generation
│   ├── interview_ai/        # Interview training
│   ├── api.py              # FastAPI server
│   └── requirements.txt
│
├── admin-dashboard/         # React.js admin panel
│   ├── src/
│   │   ├── pages/           # Dashboard pages
│   │   ├── components/      # UI components
│   │   └── services/        # API integration
│   └── package.json
│
├── database/
│   ├── schema.sql           # PostgreSQL schema
│   ├── migrations/          # Database migrations
│   └── seeds/               # Sample data
│
├── docs/
│   ├── api-documentation.md
│   ├── architecture.md
│   ├── deployment-guide.md
│   └── user-manual.md
│
└── docker-compose.yml       # Complete stack setup
```

## 🛠️ Technology Stack

### Mobile App
- **Framework:** React Native 0.72+
- **State Management:** Redux Toolkit
- **Navigation:** React Navigation 6
- **UI Library:** React Native Paper
- **Real-time:** Socket.io Client
- **Voice:** React Native Voice
- **Maps:** React Native Maps

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Queue:** Bull (Redis-based)
- **Auth:** JWT + bcrypt
- **Real-time:** Socket.io
- **Search:** Elasticsearch (optional)

### AI Service
- **Framework:** FastAPI (Python 3.10+)
- **ML Libraries:** 
  - PyTorch
  - Transformers (Hugging Face)
  - spaCy
  - scikit-learn
- **Voice:** Google Speech-to-Text API
- **NLP:** Bangla BERT models

### Admin Dashboard
- **Framework:** React.js 18
- **UI Library:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **State:** Redux Toolkit

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **Monitoring:** Prometheus + Grafana (optional)

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recommended)

### Option 1: Docker Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/kajkori-prototype.git
cd kajkori-prototype

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npm run migrate

# Seed sample data
docker-compose exec backend npm run seed
```

Services will be available at:
- Mobile App (Expo): http://localhost:19000
- Backend API: http://localhost:3000
- AI Service: http://localhost:8000
- Admin Dashboard: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Option 2: Manual Setup

#### 1. Database Setup
```bash
# Create database
createdb kajkori

# Run migrations
cd backend
npm install
npm run migrate
npm run seed
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start server
npm run dev
```

#### 3. AI Service Setup
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start service
uvicorn api:app --reload --port 8000
```

#### 4. Mobile App Setup
```bash
cd mobile-app
npm install

# For iOS
npx pod-install

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

#### 5. Admin Dashboard Setup
```bash
cd admin-dashboard
npm install

# Start development server
npm start
```

## 📱 Features Implemented

### Job Seeker Side
✅ Phone number registration with OTP
✅ Voice-based profile creation (Bangla)
✅ Job feed with filters and search
✅ AI-powered job matching
✅ One-tap job application
✅ Application tracker with status
✅ In-app chat with employers
✅ Auto-generated CV builder
✅ AI interview trainer (Bangla voice)
✅ Micro skill courses
✅ Salary expectation settings
✅ Location-based job filtering
✅ Push notifications

### Employer Side
✅ Business registration
✅ 30-second job posting
✅ Auto-matched candidate list
✅ Candidate profiles with match scores
✅ In-app messaging/calling
✅ Application management
✅ Workforce management (attendance, shifts)
✅ Analytics dashboard
✅ Candidate ratings and reviews
✅ Bulk hire tools

### AI/ML Features
✅ Smart job matching algorithm
✅ Bangla NLP for skill extraction
✅ Voice-to-text (Bangla)
✅ Auto-CV generation
✅ Interview question generator
✅ Salary benchmarking

### Admin Features
✅ User management
✅ Job moderation
✅ Analytics and reports
✅ Verification management
✅ Content management (courses)
✅ Payment tracking

## 🔐 Sample Credentials

### Job Seeker Account
- Phone: +880 1712345678
- OTP: 123456 (development mode)

### Employer Account
- Phone: +880 1812345678
- OTP: 123456 (development mode)

### Admin Dashboard
- Email: admin@kajkori.com
- Password: admin123

## 📊 Database Schema

Key tables:
- `users` - All users (job seekers + employers + admins)
- `worker_profiles` - Job seeker profiles
- `employer_profiles` - Employer business profiles
- `jobs` - Job postings
- `applications` - Job applications
- `messages` - In-app chat messages
- `courses` - Skill training courses
- `certificates` - Completed course certificates
- `verifications` - User verification records
- `ratings` - User ratings and reviews

See `database/schema.sql` for complete schema.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/refresh` - Refresh JWT token

### Jobs
- `GET /api/jobs` - List jobs with filters
- `POST /api/jobs` - Create job posting
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/applications` - Apply to job
- `GET /api/applications` - List user's applications
- `PUT /api/applications/:id` - Update application status

### Matching
- `POST /api/matching/candidates` - Get matched candidates for job
- `GET /api/matching/jobs` - Get matched jobs for worker

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/cv-generate` - Generate CV

See `docs/api-documentation.md` for complete API reference.

## 🎨 Design System

### Colors
- Primary (Green): #2ECC71
- Secondary (Blue): #3498DB
- Accent (Orange): #E67E22
- Success: #27AE60
- Warning: #F39C12
- Danger: #E74C3C
- Background: #FFFFFF
- Text: #2C3E50
- Text Secondary: #7F8C8D

### Typography
- Bangla: Noto Sans Bengali
- English: Poppins (headings), Inter (body)

### Components
- Buttons: Rounded corners (8px), shadow elevation
- Cards: White background, 12px border radius, subtle shadow
- Input fields: 8px border radius, focus state with primary color
- Icons: Feather Icons (24px standard size)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Mobile App Tests
```bash
cd mobile-app
npm test
```

### AI Service Tests
```bash
cd ai-service
pytest
pytest --cov=. --cov-report=html
```

## 📦 Deployment

### Production Environment Variables

Create `.env.production` files for each service:

**Backend (.env.production):**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/kajkori
REDIS_URL=redis://host:6379
JWT_SECRET=your-super-secret-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
```

**AI Service (.env.production):**
```
ENVIRONMENT=production
DATABASE_URL=postgresql://user:pass@host:5432/kajkori
GOOGLE_CLOUD_API_KEY=your-key
MODEL_PATH=/models
```

### Docker Production Deploy
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Mobile App Release

**Android:**
```bash
cd mobile-app/android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

**iOS:**
```bash
cd mobile-app/ios
xcodebuild -workspace KajKori.xcworkspace -scheme KajKori archive
# Follow Xcode release process
```

## 🤝 Contributing

This is a prototype for demonstration purposes. For a production version:
1. Implement comprehensive error handling
2. Add extensive input validation
3. Implement rate limiting
4. Add comprehensive logging
5. Set up proper monitoring
6. Implement CI/CD pipeline
7. Add E2E tests
8. Implement proper security measures
9. Add data backup strategies
10. Set up disaster recovery

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

- Documentation: https://kajkori.com/docs
- Issues: https://github.com/yourusername/kajkori-prototype/issues
- Email: support@kajkori.com

## 🎯 Roadmap

### Phase 1 (Current - MVP)
- ✅ Core job posting and application
- ✅ Basic matching algorithm
- ✅ Mobile app (Android/iOS)
- ✅ Admin dashboard

### Phase 2 (Next 3 months)
- [ ] Advanced AI matching with ML
- [ ] Video course platform
- [ ] Payment integration (bKash/Nagad)
- [ ] SMS/USSD gateway
- [ ] Employer verification system

### Phase 3 (Months 4-6)
- [ ] Workforce management tools
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] Mobile web (PWA)

### Phase 4 (Months 7-12)
- [ ] Regional expansion features
- [ ] Financial services integration
- [ ] Insurance partnerships
- [ ] Government ID verification
- [ ] Scale to 1M+ users

---

**Built with ❤️ for Bangladesh's workforce**

**Version:** 1.0.0-beta  
**Last Updated:** December 2024
