import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = {
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason: string;
};

const userEmail = 'mona@example.com';

export default function Workouts() {
  return <CapabilityCard<WorkoutSuggestion>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint={`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`}
    resource="suggestions"
    emptyMessage="No workout suggestions available."
    renderItem={(suggestion) => <>{suggestion.title}{suggestion.focus && ` — ${suggestion.focus}`}
      {suggestion.minutes !== undefined && `, ${suggestion.minutes} minutes`}
      {suggestion.difficulty && `, ${suggestion.difficulty}`}
      {`. ${suggestion.reason}`}
    </>}
  />;
}
