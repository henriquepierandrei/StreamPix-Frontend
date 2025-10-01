import React from "react";
import { useGoalWebSocket } from "./GoalWebSocket";
import { useSearchParams } from "react-router-dom";

export const GoalComponentToShow: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  if (!id) return <p>Streamer não definido</p>;

  const goal = useGoalWebSocket(id);

  const percent =
    goal.balance_to_achieve > 0
      ? Math.min((goal.current_balance / goal.balance_to_achieve) * 100, 100)
      : 0;

  const endText =
    goal.end_at_in_days !== undefined && goal.end_at_in_days !== null
      ? `Termina em ${goal.end_at_in_days} ${
          goal.end_at_in_days === 1 ? "dia" : "dias"
        }`
      : "";

  return (
    <div className="formGroup">
      <p style={{ textAlign: "center", color: "white", fontWeight: 700 }}>
        {endText}
      </p>
      <div className="progress-bar-goal">
        <p>{goal.reason || "---"}</p>
        <div className="bar-goal" style={{ width: `${percent}%` }}></div>
        <p>{`R$ ${goal.current_balance} / R$ ${goal.balance_to_achieve}`}</p>
      </div>
    </div>
  );
};
