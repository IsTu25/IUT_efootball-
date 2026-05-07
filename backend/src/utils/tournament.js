const Group = require('../models/Group');
const Match = require('../models/Match');

// Generate all round-robin matches within a group
exports.generateRoundRobinMatches = (teams) => {
  const matches = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({ teamA: teams[i], teamB: teams[j] });
    }
  }
  return matches;
};

// Distribute teams into equal groups
exports.distributeTeamsIntoGroups = (teams, groupCount) => {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const groups = Array.from({ length: groupCount }, () => []);
  shuffled.forEach((team, idx) => {
    groups[idx % groupCount].push(team);
  });
  return groups;
};

// Recalculate standings for a group based on its matches
exports.recalculateGroupStandings = async (groupId) => {
  const group = await Group.findById(groupId).populate('teams');
  const matches = await Match.find({ group: groupId, status: 'completed' });

  const stats = {};
  group.teams.forEach(t => {
    stats[t._id.toString()] = {
      team: t._id,
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
    };
  });

  matches.forEach(m => {
    if (!m.teamA || !m.teamB) return;
    const aId = m.teamA.toString();
    const bId = m.teamB.toString();
    if (!stats[aId] || !stats[bId]) return;
    stats[aId].played++;
    stats[bId].played++;
    stats[aId].goalsFor += m.scoreA;
    stats[aId].goalsAgainst += m.scoreB;
    stats[bId].goalsFor += m.scoreB;
    stats[bId].goalsAgainst += m.scoreA;

    if (m.scoreA > m.scoreB) {
      stats[aId].won++;  stats[aId].points += 3;
      stats[bId].lost++;
    } else if (m.scoreA < m.scoreB) {
      stats[bId].won++;  stats[bId].points += 3;
      stats[aId].lost++;
    } else {
      stats[aId].drawn++; stats[aId].points++;
      stats[bId].drawn++; stats[bId].points++;
    }
    stats[aId].goalDifference = stats[aId].goalsFor - stats[aId].goalsAgainst;
    stats[bId].goalDifference = stats[bId].goalsFor - stats[bId].goalsAgainst;
  });

  group.standings = Object.values(stats).sort((a, b) =>
    b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
  );
  await group.save();
  return group;
};

// Generate knockout bracket from group stage winners
exports.generateKnockoutBracket = async (tournament, groups, advanceCount) => {
  const qualifiers = [];
  for (const group of groups) {
    const sorted = [...group.standings].sort((a, b) =>
      b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
    );
    qualifiers.push(...sorted.slice(0, advanceCount).map(s => s.team));
  }

  // Determine first knockout round
  let stage = 'round_of_16';
  if (qualifiers.length <= 4) stage = 'semi_final';
  else if (qualifiers.length <= 8) stage = 'quarter_final';

  const matches = [];
  for (let i = 0; i < qualifiers.length; i += 2) {
    if (qualifiers[i + 1]) {
      matches.push({
        tournament: tournament._id,
        group: null,
        stage,
        bracketPosition: i / 2,
        teamA: qualifiers[i],
        teamB: qualifiers[i + 1],
      });
    }
  }
  return Match.insertMany(matches);
};
