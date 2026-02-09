from sqlalchemy.orm import Session
from app.models.user import User
from app.models.injury import Injury, InjuryStatus
from app.models.athlete_state import AthleteState
from app.models.daily_log import DailyLog
from datetime import date

class RecoveryLogic:
    """
    Sports Science Engine for calculating readiness and managing injuries.
    """

    def calculate_readiness(self, user: User, db: Session) -> dict:
        """
        Calculates a 0-100 score based on Injuries, Fatigue, and Recovery logs.
        """
        score = 100.0
        details = []

        # 1. Injury Penalty
        active_injuries = db.query(Injury).filter(
            Injury.user_id == user.id, 
            Injury.status != InjuryStatus.HEALED.value
        ).all()
        
        injury_penalty = 0
        for injury in active_injuries:
            penalty = injury.pain_level * 5 # simple linear penalty
            if injury.severity == "severe": penalty += 20
            elif injury.severity == "moderate": penalty += 10
            injury_penalty += penalty
            details.append(f"Injury ({injury.body_part}): -{penalty}")

        score -= injury_penalty

        # 2. Fatigue Penalty (from AthleteState)
        state = db.query(AthleteState).filter(AthleteState.user_id == user.id).first()
        if state:
            avg_fatigue = (state.cns_fatigue + state.muscular_fatigue_lower + state.muscular_fatigue_upper) / 3
            # Fatigue is 0-100. Readiness should be negatively impacted by fatigue.
            # Simple model: Fatigue directly subtracts from readiness, but scaled.
            # e.g. 100 fatigue -> -80 readiness (leaving 20 if no other penalties)
            fatigue_penalty = avg_fatigue * 0.8
            if fatigue_penalty > 0:
                score -= fatigue_penalty
                details.append(f"Systemic Fatigue: -{fatigue_penalty:.1f}")

        # 3. Sleep/Recovery Bonus/Penalty (from DailyLog)
        today_log = db.query(DailyLog).filter(DailyLog.user_id == user.id, DailyLog.date == date.today()).first()
        if today_log and today_log.sleep_hours:
            if today_log.sleep_hours < 6:
                score -= 10
                details.append("Poor Sleep: -10")
            elif today_log.sleep_hours > 8:
                score += 5
                details.append("Good Sleep: +5")

        # Clamp score
        final_score = max(0.0, min(100.0, score))
        
        status = "Prime"
        if final_score < 40: status = "Recovery Needed"
        elif final_score < 70: status = "Train with Caution"

        return {
            "score": int(final_score),
            "status": status,
            "breakdown": details,
            "active_injuries": [i.body_part for i in active_injuries]
        }

    def get_blocked_movements(self, user: User, db: Session) -> list:
        """
        Returns a list of keywords/tags to avoid in workout generation.
        """
        blocked = []
        active_injuries = db.query(Injury).filter(
            Injury.user_id == user.id, 
            Injury.status != InjuryStatus.HEALED.value
        ).all()

        for injury in active_injuries:
            part = injury.body_part.lower()
            if part == "shoulder":
                blocked.extend(["overhead", "bench_press", "dips", "heavy_bag"])
            elif part == "knee":
                blocked.extend(["squat", "lunge", "jump", "run"])
            elif part == "lower_back":
                blocked.extend(["deadlift", "bent_row", "situp"])
        
        return list(set(blocked))
