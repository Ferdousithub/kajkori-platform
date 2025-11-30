-- KajKori Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table (All user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('job_seeker', 'employer', 'admin')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    profile_photo VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    device_token VARCHAR(500),
    language VARCHAR(5) DEFAULT 'bn' CHECK (language IN ('bn', 'en')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(is_active);

-- Worker Profiles
CREATE TABLE worker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER CHECK (age >= 16 AND age <= 70),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    district VARCHAR(100) NOT NULL,
    sub_district VARCHAR(100),
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    skills TEXT[],
    experience JSONB DEFAULT '[]'::jsonb,
    education VARCHAR(255),
    expected_salary_min INTEGER,
    expected_salary_max INTEGER,
    availability VARCHAR(20) DEFAULT 'immediate' CHECK (availability IN ('immediate', 'within_week', 'within_month', 'negotiable')),
    preferred_job_types TEXT[],
    preferred_shifts TEXT[] DEFAULT ARRAY['day'],
    rating DECIMAL(2,1) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    cv_url VARCHAR(500),
    bio TEXT,
    languages TEXT[] DEFAULT ARRAY['bn'],
    nid_number VARCHAR(20),
    nid_verified BOOLEAN DEFAULT FALSE,
    profile_completeness INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_worker_user ON worker_profiles(user_id);
CREATE INDEX idx_worker_district ON worker_profiles(district);
CREATE INDEX idx_worker_skills ON worker_profiles USING GIN (skills);
CREATE INDEX idx_worker_location ON worker_profiles USING GIST (location);

-- Employer Profiles
CREATE TABLE employer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    sub_district VARCHAR(100),
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    trade_license VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    employee_count INTEGER,
    established_year INTEGER,
    description TEXT,
    website VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employer_user ON employer_profiles(user_id);
CREATE INDEX idx_employer_district ON employer_profiles(district);
CREATE INDEX idx_employer_verified ON employer_profiles(is_verified);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    required_skills TEXT[],
    salary_min INTEGER NOT NULL,
    salary_max INTEGER NOT NULL,
    salary_negotiable BOOLEAN DEFAULT FALSE,
    positions INTEGER DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    job_type VARCHAR(20) DEFAULT 'full_time' CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship')),
    shift VARCHAR(20) DEFAULT 'day' CHECK (shift IN ('day', 'night', 'rotational', 'flexible')),
    experience_required INTEGER DEFAULT 0,
    education_required VARCHAR(255),
    district VARCHAR(100) NOT NULL,
    sub_district VARCHAR(100),
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    start_date DATE,
    start_date_type VARCHAR(20) DEFAULT 'immediate' CHECK (start_date_type IN ('immediate', 'scheduled')),
    benefits TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'paused', 'filled')),
    expires_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP,
    is_urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_district ON jobs(district);
CREATE INDEX idx_jobs_skills ON jobs USING GIN (required_skills);
CREATE INDEX idx_jobs_location ON jobs USING GIST (location);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);

-- Applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(30) DEFAULT 'applied' CHECK (status IN (
        'applied', 'viewed', 'shortlisted', 'interview_scheduled', 
        'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'
    )),
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    cover_letter TEXT,
    expected_salary INTEGER,
    available_from DATE,
    interview_date TIMESTAMP,
    interview_location VARCHAR(255),
    interview_notes TEXT,
    rejection_reason VARCHAR(500),
    viewed_by_employer_at TIMESTAMP,
    shortlisted_at TIMESTAMP,
    interviewed_at TIMESTAMP,
    hired_at TIMESTAMP,
    rejected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, worker_id)
);

CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_worker ON applications(worker_id);
CREATE INDEX idx_applications_employer ON applications(employer_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_score ON applications(match_score DESC);
CREATE INDEX idx_applications_created ON applications(created_at DESC);

-- Messages table (Chat)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id),
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice')),
    content TEXT NOT NULL,
    file_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_application ON messages(application_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_bangla VARCHAR(255) NOT NULL,
    title_english VARCHAR(255),
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    video_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    is_free BOOLEAN DEFAULT TRUE,
    price INTEGER DEFAULT 0,
    lessons JSONB,
    tags TEXT[],
    view_count INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_active ON courses(is_active);

-- Course Enrollments
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    certificate_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, user_id)
);

CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);

-- Verifications table
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('nid', 'reference', 'skill_test', 'business')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    document_url VARCHAR(500),
    notes TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verifications_user ON verifications(user_id);
CREATE INDEX idx_verifications_type ON verifications(verification_type);
CREATE INDEX idx_verifications_status ON verifications(status);

-- Ratings and Reviews
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rater_id UUID NOT NULL REFERENCES users(id),
    ratee_id UUID NOT NULL REFERENCES users(id),
    application_id UUID REFERENCES applications(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    categories JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rater_id, ratee_id, application_id)
);

CREATE INDEX idx_ratings_ratee ON ratings(ratee_id);
CREATE INDEX idx_ratings_application ON ratings(application_id);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Saved Jobs
CREATE TABLE saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

CREATE INDEX idx_saved_user ON saved_jobs(user_id);
CREATE INDEX idx_saved_job ON saved_jobs(job_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_profiles_updated_at BEFORE UPDATE ON employer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user
INSERT INTO users (phone_number, user_type, name, email, is_verified, is_active)
VALUES ('+8801700000000', 'admin', 'Admin User', 'admin@kajkori.com', true, true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ KajKori database schema created successfully!';
END $$;
