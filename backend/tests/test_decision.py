import pytest
from app.services.decision_engine import DecisionIntelligenceEngine
from app.schemas.schemas import DecisionRequest, DecisionOptionInput


def test_decision_engine_evaluation():
    req = DecisionRequest(
        title="Job Offer Evaluation",
        category="career",
        criteria_weights={"salary": 0.4, "work_life_balance": 0.4, "commute_time": 0.2},
        options=[
            DecisionOptionInput(
                name="Company A (Tech Startup)",
                metrics={"salary": 9.0, "work_life_balance": 5.0, "commute_time": 8.0}
            ),
            DecisionOptionInput(
                name="Company B (Established Enterprise)",
                metrics={"salary": 7.5, "work_life_balance": 9.0, "commute_time": 4.0}
            )
        ]
    )

    response = DecisionIntelligenceEngine.evaluate_decision(req)

    assert response.title == "Job Offer Evaluation"
    assert response.recommended_option in ["Company A (Tech Startup)", "Company B (Established Enterprise)"]
    assert response.confidence_score > 0.5
    assert len(response.ranked_options) == 2
    assert response.ranked_options[0].rank == 1
    assert "explanation" in response.model_dump()
