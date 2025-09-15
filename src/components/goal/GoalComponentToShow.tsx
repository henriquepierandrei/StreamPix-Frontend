import React from "react";
import { useParams } from "react-router-dom";
import { useGoalWebSocket } from "./GoalWebSocket";

export const GoalComponentToShow: React.FC = () => {
  const { streamerName } = useParams<{ streamerName: string }>();
  if (!streamerName) return <p>Streamer não definido</p>;

  const goal = useGoalWebSocket(streamerName);

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
