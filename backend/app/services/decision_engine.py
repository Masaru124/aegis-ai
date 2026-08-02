from typing import List, Dict, Any
from app.schemas.schemas import DecisionRequest, DecisionResponse, RankedOption


class DecisionIntelligenceEngine:
    """
    Decision Intelligence Engine using Multi-Criteria Decision Analysis (MCDA).
    Processes options, evaluates weighted criteria, calculates risk factors, confidence scores,
    and returns ranked recommendations with detailed explainability.
    """

    @staticmethod
    def evaluate_decision(request: DecisionRequest) -> DecisionResponse:
        options = request.options
        if not options:
            raise ValueError("At least one decision option must be provided.")

        weights = request.criteria_weights or {}
        
        # Discover all unique metric keys if weights not specified
        if not weights:
            all_keys = set()
            for opt in options:
                all_keys.update(opt.metrics.keys())
            if all_keys:
                default_w = 1.0 / len(all_keys)
                weights = {key: default_w for key in all_keys}
            else:
                weights = {"overall_value": 1.0}

        # Normalize weights
        total_w = sum(weights.values()) or 1.0
        normalized_weights = {k: v / total_w for k, v in weights.items()}

        ranked_results: List[RankedOption] = []
        option_scores: Dict[str, float] = {}

        for opt in options:
            score = 0.0
            pros: List[str] = []
            cons: List[str] = []
            risks: List[str] = []

            for criterion, weight in normalized_weights.items():
                val = opt.metrics.get(criterion, 5.0)  # Default rating 5.0 out of 10 if missing
                
                # Support numerical or raw scale values
                try:
                    num_val = float(val)
                except (ValueError, TypeError):
                    num_val = 5.0

                # Determine impact direction (e.g., cost, risk, time usually lower is better)
                is_negative_metric = any(neg in criterion.lower() for neg in ["cost", "risk", "difficulty", "time_months", "expense"])
                
                if is_negative_metric:
                    # Invert 1-10 scale
                    effective_val = max(1.0, 10.0 - num_val)
                    if num_val > 7.0:
                        cons.append(f"High {criterion.replace('_', ' ')} ({num_val})")
                        risks.append(f"Potential risk associated with elevated {criterion}")
                    else:
                        pros.append(f"Favorable low {criterion.replace('_', ' ')}")
                else:
                    effective_val = num_val
                    if num_val >= 7.0:
                        pros.append(f"Strong performance in {criterion.replace('_', ' ')} ({num_val})")
                    elif num_val <= 4.0:
                        cons.append(f"Lower score in {criterion.replace('_', ' ')} ({num_val})")

                score += effective_val * weight

            if not pros:
                pros.append("Provides baseline functionality meeting core criteria.")
            if not cons:
                cons.append("Requires initial onboarding and management effort.")

            option_scores[opt.name] = round(score, 2)
            
            ranked_results.append(
                RankedOption(
                    rank=0,  # Will assign after sorting
                    name=opt.name,
                    score=round(score, 2),
                    pros=pros,
                    cons=cons,
                    risk_factors=risks or ["Standard execution risks apply."]
                )
            )

        # Sort by score descending
        ranked_results.sort(key=lambda x: x.score, reverse=True)
        
        for idx, item in enumerate(ranked_results, 1):
            item.rank = idx

        top_option = ranked_results[0]
        runner_up = ranked_results[1] if len(ranked_results) > 1 else None

        # Confidence calculation based on margin of victory & completeness of data
        score_margin = (top_option.score - runner_up.score) if runner_up else top_option.score
        confidence = min(0.98, max(0.65, 0.75 + (score_margin / 20.0)))

        # Natural Language Explanation
        explanation = (
            f"After evaluating {len(options)} options across criteria ({', '.join(normalized_weights.keys())}), "
            f"'{top_option.name}' emerged as the top recommendation with a score of {top_option.score}/10. "
            f"It excels primarily due to: {', '.join(top_option.pros[:2])}."
        )

        if runner_up:
            explanation += f" Option '{runner_up.name}' is the runner-up with score {runner_up.score}/10."

        predicted_outcomes = {
            "top_choice": top_option.name,
            "expected_success_rate": f"{int(confidence * 100)}%",
            "primary_driver": top_option.pros[0] if top_option.pros else "Balanced metric score",
            "mitigation_advice": top_option.risk_factors[0] if top_option.risk_factors else "Monitor implementation."
        }

        return DecisionResponse(
            title=request.title,
            category=request.category,
            recommended_option=top_option.name,
            confidence_score=round(confidence, 2),
            explanation=explanation,
            ranked_options=ranked_results,
            predicted_outcomes=predicted_outcomes
        )
