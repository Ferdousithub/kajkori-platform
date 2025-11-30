# 🚀 KajKori Quick Start Guide

## Welcome to KajKori!

This guide will help you get the complete KajKori prototype running on your local machine in under 15 minutes.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required:
- **Docker Desktop** (recommended) - [Download](https://www.docker.com/products/docker-desktop/)
  - OR manually install:
  - Node.js 18+ - [Download](https://nodejs.org/)
  - Python 3.10+ - [Download](https://www.python.org/)
  - PostgreSQL 15+ - [Download](https://www.postgresql.org/)
  - Redis 7+ - [Download](https://redis.io/)

### For Mobile Development:
- **React Native CLI** - [Setup Guide](https://reactnative.dev/docs/environment-setup)
- **Android Studio** (for Android) - [Download](https://developer.android.com/studio)
- **Xcode** (for iOS, Mac only) - [Download](https://developer.apple.com/xcode/)

---

## 🎯 Option 1: Docker Setup (Recommended)

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/yourusername/kajkori-prototype.git
cd kajkori-prototype
```

### Step 2: Start All Services

```bash
# Start everything with one command
docker-compose up -d

# Check if all services are running
docker-compose ps
```

You should see these services:
- ✅ kajkori-postgres (port 5432)
- ✅ kajkori-redis (port 6379)
- ✅ kajkori-backend (port 3000)
- ✅ kajkori-ai-service (port 8000)
- ✅ kajkori-admin (port 3001)

### Step 3: Initialize Database

```bash
# Run migrations and seed data
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### Step 4: Verify Everything is Running

Open your browser and check:

- **Backend API:** http://localhost:3000/health
  - Should show: `{"status":"ok"}`

- **AI Service:** http://localhost:8000/health
  - Should show: `{"status":"healthy"}`

- **Admin Dashboard:** http://localhost:3001
  - You should see the login page

### Step 5: Set Up Mobile App

```bash
cd mobile-app

# Install dependencies
npm install

# For iOS (Mac only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start
```

In a new terminal:

```bash
# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios
```

---

## 🛠️ Option 2: Manual Setup

### Step 1: Database Setup

```bash
# Create PostgreSQL database
createdb kajkori

# Import schema
psql kajkori < database/schema.sql
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Required .env variables:**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/kajkori
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key-here
```

```bash
# Run migrations
npm run migrate

# Seed sample data
npm run seed

# Start development server
npm run dev
```

### Step 3: AI Service Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download Bangla NLP models (optional)
python -m spacy download xx_ent_wiki_sm

# Start service
uvicorn api:app --reload --port 8000
```

### Step 4: Admin Dashboard Setup

```bash
cd admin-dashboard

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:3000/api" > .env

# Start development server
npm start
```

### Step 5: Mobile App Setup

(Same as Docker Step 5 above)

---

## 🧪 Testing the Prototype

### Test 1: Create a Job Seeker Account

1. Open mobile app
2. Enter phone: `+880 1712345678`
3. Enter OTP: `123456` (development mode)
4. Select: "কাজ খুঁজছি" (Looking for Job)
5. Enter name: `রিমা বেগম`
6. Complete voice profile setup

### Test 2: Create an Employer Account

1. Open new mobile app instance (or use web)
2. Enter phone: `+880 1812345678`
3. Enter OTP: `123456`
4. Select: "কাজ দিতে চাই" (Giving Job)
5. Enter business name: `Apex Garments`
6. Post a test job

### Test 3: Test Job Matching

1. As job seeker, view job feed
2. Check match scores (should show 60-90%)
3. Apply to a job
4. As employer, view matched candidates
5. Check match breakdowns

### Test 4: Test Chat

1. Employer sends message to applicant
2. Job seeker receives notification
3. Reply from mobile app
4. Verify real-time updates

---

## 📱 Using the Mobile App

### Job Seeker Features:

1. **Profile Setup:**
   - Tap profile icon
   - Use voice to add experience
   - Upload photo
   - Select skills from list

2. **Job Search:**
   - Browse job feed
   - Use filters (district, salary, type)
   - Save jobs for later
   - Apply with one tap

3. **AI Interview Trainer:**
   - Go to "শিখুন" (Learn) tab
   - Select "Interview Practice"
   - Answer questions via voice
   - Get instant feedback

4. **Track Applications:**
   - Go to "আবেদন" (Applications) tab
   - See status of each application
   - Message employers directly

### Employer Features:

1. **Post a Job:**
   - Tap "+" button
   - Fill in basic details (30 seconds)
   - Voice input for description
   - Publish instantly

2. **View Candidates:**
   - See auto-matched candidates
   - Sort by match score
   - Shortlist or reject
   - Schedule interviews

3. **Manage Workforce:**
   - Go to "টিম" (Team) tab
   - Mark attendance
   - Create shift schedules
   - Track hours

---

## 🎨 Admin Dashboard Features

Login at http://localhost:3001 with:
- Email: `admin@kajkori.com`
- Password: `admin123`

Features:
- User management
- Job moderation
- Analytics dashboard
- Verification requests
- Content management

---

## 📊 Sample Data

The seed script creates:
- 50 job seeker profiles
- 10 employer profiles
- 25 job postings
- 100 applications
- 5 training courses

---

## 🐛 Troubleshooting

### Backend won't start:

```bash
# Check database connection
psql kajkori -c "SELECT 1;"

# Check Redis
redis-cli ping

# View backend logs
docker-compose logs backend
# OR
cd backend && npm run dev
```

### Mobile app build fails:

```bash
# Clear cache
cd mobile-app
rm -rf node_modules
npm install

# For Android
cd android && ./gradlew clean && cd ..

# For iOS
cd ios && pod deintegrate && pod install && cd ..
```

### Database migration errors:

```bash
# Drop and recreate database
dropdb kajkori
createdb kajkori
psql kajkori < database/schema.sql
```

### Port already in use:

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env file
PORT=3001
```

---

## 📚 Next Steps

### For Developers:

1. **Read Architecture Docs:**
   - See `docs/architecture.md`
   - Understand data flow
   - Review API endpoints

2. **Customize Features:**
   - Modify matching algorithm weights
   - Add new job categories
   - Create custom CV templates

3. **Add Integrations:**
   - Twilio for SMS
   - bKash for payments
   - Google Maps for locations

### For Product Testing:

1. **Create Test Scenarios:**
   - End-to-end hiring flow
   - Performance with 1000+ users
   - Multi-language support

2. **Gather Feedback:**
   - User testing sessions
   - A/B test different UI flows
   - Measure key metrics

3. **Iterate:**
   - Fix bugs
   - Improve UX
   - Add requested features

---

## 🆘 Getting Help

### Documentation:
- API Docs: `docs/api-documentation.md`
- Architecture: `docs/architecture.md`
- Deployment: `docs/deployment-guide.md`

### Community:
- GitHub Issues: https://github.com/yourusername/kajkori/issues
- Slack: #kajkori-dev
- Email: support@kajkori.com

### Common Commands:

```bash
# View logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]

# Stop all services
docker-compose down

# Reset everything (⚠️ deletes data)
docker-compose down -v
docker-compose up -d

# Run tests
cd backend && npm test
cd ai-service && pytest

# Check database
docker-compose exec postgres psql -U postgres kajkori
```

---

## ✅ Verification Checklist

Before considering setup complete:

- [ ] All Docker containers are running
- [ ] Backend responds at http://localhost:3000/health
- [ ] AI service responds at http://localhost:8000/health
- [ ] Admin dashboard loads at http://localhost:3001
- [ ] Mobile app builds successfully
- [ ] Can register new user via mobile app
- [ ] Can post a job as employer
- [ ] Can see matched jobs as job seeker
- [ ] Can send messages between users
- [ ] Database has sample data

---

## 🎉 Success!

If you've reached this point with all checks passing, congratulations! You now have a fully functional KajKori prototype running locally.

**Ready to start developing?** Check out the contribution guidelines in `CONTRIBUTING.md`

**Ready to deploy?** See the deployment guide in `docs/deployment-guide.md`

---

**Built with ❤️ for Bangladesh's workforce**

Version: 1.0.0-beta
Last Updated: December 2024
