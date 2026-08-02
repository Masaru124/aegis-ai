from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, ConfigDict, Field


# Auth & User Schemas
class UserRegister(BaseModel):
    email: str
    name: str
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfileSchema(BaseModel):
    interests: Optional[Dict[str, Any]] = {}
    work_info: Optional[Dict[str, Any]] = {}
    preferences: Optional[Dict[str, Any]] = {}
    goals: Optional[Dict[str, Any]] = {}
    skills: Optional[Dict[str, Any]] = {}


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileSchema] = None


# Conversation & Chat Schemas
class MessageCreate(BaseModel):
    content: str
    role: str = "user"


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: str
    content: str
    metadata_info: Optional[Dict[str, Any]] = {}
    timestamp: datetime


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[MessageOut] = []


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    provider: Optional[str] = None
    enable_memory: bool = True
    enable_web_search: bool = False


class ChatResponse(BaseModel):
    conversation_id: str
    message: MessageOut
    used_memories: List[str] = []


# Memory & Feedback Schemas
class MemoryCreate(BaseModel):
    content: str
    memory_type: str = "semantic"
    importance: float = 1.0
    is_approved: bool = True


class MemoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    memory_type: str
    content: str
    importance: float
    is_approved: bool
    created_at: datetime


class FeedbackCreate(BaseModel):
    message_id: Optional[str] = None
    recommendation_id: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)  # 1 to 5
    correction: Optional[str] = None
    approve_as_memory: bool = True  # User permission flag for self-learning memory extraction


# Decision Intelligence Schemas
class DecisionOptionInput(BaseModel):
    name: str
    description: Optional[str] = None
    metrics: Dict[str, Any] = {}  # e.g., {"cost": 50000, "time_months": 3, "growth_potential": 8}


class DecisionRequest(BaseModel):
    title: str
    category: str = "general"  # career, financial, business, travel, personal
    criteria_weights: Optional[Dict[str, float]] = None  # e.g. {"cost": 0.4, "growth": 0.6}
    options: List[DecisionOptionInput]


class RankedOption(BaseModel):
    rank: int
    name: str
    score: float
    pros: List[str]
    cons: List[str]
    risk_factors: List[str]


class DecisionResponse(BaseModel):
    title: str
    category: str
    recommended_option: str
    confidence_score: float
    explanation: str
    ranked_options: List[RankedOption]
    predicted_outcomes: Dict[str, Any]


# Task Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"  # low, medium, high, urgent
    deadline: Optional[datetime] = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    description: Optional[str]
    status: str
    priority: str
    deadline: Optional[datetime]
    created_at: datetime
