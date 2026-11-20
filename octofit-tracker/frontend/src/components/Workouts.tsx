import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = {
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason: string;
};

const userEmail = 'mona@example.com';
const loadWorkoutSuggestions = () => getJson<{ suggestions: WorkoutSuggestion[] }>(
  `/api/workouts/suggestions/${encodeURIComponent(userEmail)}`,
);

export default function Workouts() {
  return <CapabilityCard<WorkoutSuggestion>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    load={loadWorkoutSuggestions}
    resource="suggestions"
    emptyMessage="No workout suggestions available."
    renderItem={(suggestion) => <>{suggestion.title}{suggestion.focus && ` — ${suggestion.focus}`}
      {suggestion.minutes !== undefined && `, ${suggestion.minutes} minutes`}
      {suggestion.difficulty && `, ${suggestion.difficulty}`}
      {`. ${suggestion.reason}`}
    </>}
  />;
}
