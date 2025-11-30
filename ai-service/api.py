from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import logging
from datetime import datetime

from matching.matcher import JobMatcher
from nlp.bangla_processor import BanglaTextProcessor
from cv_generator.generator import CVGenerator
from interview_ai.trainer import InterviewTrainer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="KajKori AI Service",
    description="AI-powered job matching, CV generation, and interview training",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
job_matcher = JobMatcher()
bangla_processor = BanglaTextProcessor()
cv_generator = CVGenerator()
interview_trainer = InterviewTrainer()

# Pydantic models
class WorkerProfile(BaseModel):
    skills: List[str]
    experience: List[Dict]
    district: str
    expected_salary_min: Optional[int] = None
    expected_salary_max: Optional[int] = None
    availability: str = "immediate"
    preferred_shifts: List[str] = ["day"]
    location: Optional[Dict] = None
    rating: float = 0.0
    nid_verified: bool = False
    profile_completeness: int = 0

class JobPosting(BaseModel):
    title: str
    category: str
    required_skills: List[str]
    salary_min: int
    salary_max: int
    experience_required: int = 0
    district: str
    job_type: str = "full_time"
    shift: str = "day"
    start_date_type: str = "immediate"
    location: Optional[Dict] = None

class MatchRequest(BaseModel):
    worker: WorkerProfile
    job: JobPosting

class CVGenerationRequest(BaseModel):
    name: str
    phone: str
    district: str
    age: Optional[int] = None
    skills: List[str]
    experience: List[Dict]
    education: Optional[str] = None
    languages: List[str] = ["bn"]
    template: str = "standard"

class InterviewQuestion(BaseModel):
    question_bangla: str
    question_english: str
    category: str
    difficulty: str

class InterviewPracticeRequest(BaseModel):
    job_category: str
    experience_level: str = "entry"
    num_questions: int = 5

class SpeechToTextRequest(BaseModel):
    audio_base64: str
    language: str = "bn-BD"

class SkillExtractionRequest(BaseModel):
    text: str
    language: str = "bn"

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Matching endpoints
@app.post("/api/matching/calculate-score")
async def calculate_match_score(request: MatchRequest):
    """Calculate match score between a worker and a job"""
    try:
        score = job_matcher.calculate_match_score(
            request.worker.dict(),
            request.job.dict()
        )
        return {
            "match_score": score,
            "details": job_matcher.get_score_breakdown(
                request.worker.dict(),
                request.job.dict()
            )
        }
    except Exception as e:
        logger.error(f"Match calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/matching/find-candidates")
async def find_matching_candidates(
    job: JobPosting,
    workers: List[WorkerProfile],
    limit: int = 20
):
    """Find best matching candidates for a job"""
    try:
        matches = job_matcher.find_best_matches(
            job.dict(),
            [w.dict() for w in workers],
            limit
        )
        return {"matches": matches}
    except Exception as e:
        logger.error(f"Candidate matching error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# CV Generation endpoints
@app.post("/api/cv/generate")
async def generate_cv(request: CVGenerationRequest):
    """Generate a professional CV from worker profile"""
    try:
        cv_data = cv_generator.generate(request.dict())
        return {
            "success": True,
            "cv_url": cv_data["url"],
            "cv_text": cv_data["text"]
        }
    except Exception as e:
        logger.error(f"CV generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cv/templates")
async def get_cv_templates():
    """Get available CV templates"""
    return {
        "templates": cv_generator.get_available_templates()
    }

# Interview Training endpoints
@app.post("/api/interview/generate-questions")
async def generate_interview_questions(request: InterviewPracticeRequest):
    """Generate interview questions based on job category"""
    try:
        questions = interview_trainer.generate_questions(
            category=request.job_category,
            level=request.experience_level,
            num_questions=request.num_questions
        )
        return {"questions": questions}
    except Exception as e:
        logger.error(f"Question generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/evaluate-answer")
async def evaluate_interview_answer(
    question: str,
    answer: str,
    job_category: str
):
    """Evaluate an interview answer"""
    try:
        evaluation = interview_trainer.evaluate_answer(
            question=question,
            answer=answer,
            category=job_category
        )
        return evaluation
    except Exception as e:
        logger.error(f"Answer evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# NLP endpoints
@app.post("/api/nlp/extract-skills")
async def extract_skills(request: SkillExtractionRequest):
    """Extract skills from text (Bangla or English)"""
    try:
        skills = bangla_processor.extract_skills(
            text=request.text,
            language=request.language
        )
        return {"skills": skills}
    except Exception as e:
        logger.error(f"Skill extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/nlp/translate")
async def translate_text(
    text: str,
    source_lang: str = "bn",
    target_lang: str = "en"
):
    """Translate text between Bangla and English"""
    try:
        translated = bangla_processor.translate(
            text=text,
            source=source_lang,
            target=target_lang
        )
        return {"translated_text": translated}
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/nlp/sentiment")
async def analyze_sentiment(text: str, language: str = "bn"):
    """Analyze sentiment of text"""
    try:
        sentiment = bangla_processor.analyze_sentiment(text, language)
        return sentiment
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Speech-to-Text endpoint
@app.post("/api/speech/transcribe")
async def transcribe_speech(request: SpeechToTextRequest):
    """Convert speech to text (supports Bangla)"""
    try:
        # This would integrate with Google Cloud Speech-to-Text
        # For prototype, return mock data
        text = bangla_processor.transcribe_audio(
            audio_base64=request.audio_base64,
            language=request.language
        )
        return {
            "text": text,
            "confidence": 0.95,
            "language": request.language
        }
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
