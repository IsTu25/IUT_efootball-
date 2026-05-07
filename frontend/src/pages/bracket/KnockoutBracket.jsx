import Avatar from '../../components/common/Avatar';
import { STAGES } from '../../utils/constants';
import MatchCard from '../matches/MatchCard';

const KNOCKOUT_ORDER = ['round_of_16', 'quarter_final', 'semi_final', 'final'];

export default function KnockoutBracket({ matches, onUpdate }) {
  const rounds = {};
  matches.forEach(m => {
    if (!rounds[m.stage]) rounds[m.stage] = [];
    rounds[m.stage].push(m);
  });

  // Sort each round by bracketPosition
  Object.keys(rounds).forEach(r => {
    rounds[r].sort((a, b) => a.bracketPosition - b.bracketPosition);
  });

  const presentRounds = KNOCKOUT_ORDER.filter(r => rounds[r]?.length > 0);

  return (
    <div>
      {/* Visual bracket */}
      <div style={{
        overflowX: 'auto', paddingBottom: 16, marginBottom: 24
      }}>
        <div style={{ display: 'flex', gap: 24, minWidth: 'max-content', padding: '8px 4px' }}>
          {presentRounds.map((stage) => (
            <div key={stage} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
                color: 'var(--accent-green)', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center'
              }}>
                {STAGES[stage]}
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column',
                gap: stage === 'final' ? 0 : 12,
                justifyContent: 'space-around', flex: 1
              }}>
                {rounds[stage].map((match) => {
                  const aWon = match.status === 'completed' && match.scoreA > match.scoreB;
                  const bWon = match.status === 'completed' && match.scoreB > match.scoreA;
                  return (
                    <div key={match._id} className="bracket-match" style={{ minWidth: 220 }}>
                      <div className={`bracket-player ${aWon ? 'winner' : ''}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Avatar user={match.teamA?.captain} size={22} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{match.teamA?.name || '?'}</span>
                        </div>
                        <span className="score">{match.status === 'completed' ? match.scoreA : '—'}</span>
                      </div>
                      <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
                      <div className={`bracket-player ${bWon ? 'winner' : ''}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Avatar user={match.teamB?.captain} size={22} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{match.teamB?.name || '?'}</span>
                        </div>
                        <span className="score">{match.status === 'completed' ? match.scoreB : '—'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Champion */}
          {rounds['final']?.[0]?.status === 'completed' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 12 }}>
                Champion 🏆
              </div>
              <div style={{ padding: '12px 20px', background: 'rgba(245,158,11,0.1)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.3)', textAlign: 'center' }}>
                {(() => {
                  const f = rounds['final'][0];
                  const champ = f.scoreA > f.scoreB ? f.teamA : f.teamB;
                  return (
                    <>
                      <Avatar user={champ?.captain} size={40} style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#f59e0b' }}>
                        {champ?.name}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match cards for result entry */}
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 12, color: 'var(--text-secondary)' }}>
          Knockout Matches
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {matches.map(match => (
            <MatchCard key={match._id} match={match} onUpdate={onUpdate} />
          ))}
        </div>
      </div>
    </div>
  );
}
