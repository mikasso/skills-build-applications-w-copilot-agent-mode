import { isObjectIdOrHexString } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Activity must be an object'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' || !isObjectIdOrHexString(userId) ||
    typeof teamId !== 'string' || !isObjectIdOrHexString(teamId) ||
    typeof type !== 'string' || !type.trim() ||
    typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0
  ) {
    throw Object.assign(new Error('Activity requires valid userId and teamId, a type, and positive minutes'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Team must be an object'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim() || typeof mascot !== 'string' || !mascot.trim()) {
    throw Object.assign(new Error('Team requires a name and mascot'), { status: 400 });
  }
  if (!Array.isArray(members) || !members.every(
    (id: unknown): id is string => typeof id === 'string' && isObjectIdOrHexString(id),
  )) {
    throw Object.assign(new Error('Team members must be an array of user IDs'), { status: 400 });
  }

  const memberIds = [...new Set(members.map((id) => id.toLowerCase()))];
  if (memberIds.length && await User.countDocuments({ _id: { $in: memberIds } }) !== memberIds.length) {
    throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const scores = await Activity.aggregate<{ teamName: string; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: Team.collection.name, localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $sort: { totalPoints: -1, 'team.name': 1, _id: 1 } },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
  ]);
  return scores.map((score, index) => ({ ...score, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('Workout suggestions user was not found'), { status: 404 });
  }

  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).select('type minutes').lean(),
    Workout.find().sort({ title: 1, _id: 1 }).lean(),
  ]);
  const minutesByFocus = new Map<string, number>();
  for (const activity of activities) {
    const type = activity.type.trim().toLowerCase();
    const focus = ['run', 'walk', 'cycle', 'swim', 'cardio'].includes(type) ? 'endurance' : type;
    minutesByFocus.set(focus, (minutesByFocus.get(focus) ?? 0) + activity.minutes);
  }

  const matching = workouts
    .map((workout) => ({ workout, minutes: minutesByFocus.get(workout.focus.trim().toLowerCase()) ?? 0 }))
    .filter(({ minutes }) => minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);
  if (matching.length) {
    return matching.map(({ workout, minutes }) => ({
      ...workout,
      reason: `Matches ${minutes} logged minutes of ${workout.focus} activity`,
    }));
  }

  const goal = user.fitnessGoal.trim().toLowerCase();
  return workouts
    .filter((workout) => workout.focus.trim().toLowerCase() === goal)
    .map((workout) => ({ ...workout, reason: `Matches your ${workout.focus} fitness goal` }));
}

export { User };
