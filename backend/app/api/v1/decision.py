from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.models import User, Recommendation
from app.schemas.schemas import DecisionRequest, DecisionResponse
from app.api.v1.auth import get_current_user
from app.services.decision_engine import DecisionIntelligenceEngine

router = APIRouter()


@router.post("/evaluate", response_model=DecisionResponse)
async def evaluate_decision(
    req: DecisionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        decision_resp = DecisionIntelligenceEngine.evaluate_decision(req)
        
        # Persist decision evaluation to user recommendations history
        rec = Recommendation(
            user_id=current_user.id,
            category=req.category,
            prompt=req.title,
            recommendation_json=decision_resp.model_dump(),
            confidence=decision_resp.confidence_score
        )
        db.add(rec)
        await db.commit()

        return decision_resp
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decision Engine evaluation failed: {e}")
