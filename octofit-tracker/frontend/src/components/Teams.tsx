import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot: string; members: unknown[] };

const loadTeams = () => getJson<{ teams: Team[] }>('/api/teams');

export default function Teams() {
  return <CapabilityCard<Team>
    title="Teams"
    description="Manage teams and members."
    load={loadTeams}
    resource="teams"
    emptyMessage="No teams yet."
    renderItem={(team) => <>{team.name} — {team.mascot}, {team.members.length} members</>}
  />;
}
