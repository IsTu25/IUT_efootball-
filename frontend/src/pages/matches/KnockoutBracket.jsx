import React from 'react';
import MatchCard from './MatchCard';

export default function KnockoutBracket({ matches, onUpdate }) {
  // Sort matches into rounds
  const rounds = {
    round_of_16: matches.filter(m => m.stage === 'round_of_16'),
    quarter_final: matches.filter(m => m.stage === 'quarter_final'),
    semi_final: matches.filter(m => m.stage === 'semi_final'),
    final: matches.filter(m => m.stage === 'final'),
  };

  const activeRounds = Object.entries(rounds).filter(([_, m]) => m.length > 0);

  if (activeRounds.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏆</div>
        <p style={{ fontSize: '1rem', fontWeight: 500 }}>Knockout stage hasn't started yet</p>
        <p style={{ fontSize: '0.8rem' }}>Matches will appear here once the group stage is complete</p>
      </div>
    );
  }

  return (
    <div className="bracket-container" style={{ 
      display: 'flex', gap: 40, overflowX: 'auto', padding: '20px 0',
      minHeight: 500, alignItems: 'center'
    }}>
      {activeRounds.map(([roundKey, roundMatches], index) => (
        <div key={roundKey} style={{ 
          display: 'flex', flexDirection: 'column', gap: 24, 
          minWidth: 320, flexShrink: 0, justifyContent: 'space-around'
        }}>
          <div style={{ 
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.25rem', 
            fontWeight: 700, color: 'var(--accent-gold)', textAlign: 'center',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12,
            padding: '4px 12px', background: 'var(--bg-secondary)', borderRadius: 8,
            border: '1px solid var(--border)'
          }}>
            {roundKey.replace(/_/g, ' ')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {roundMatches.map(match => (
              <div key={match._id} style={{ position: 'relative' }}>
                <MatchCard match={match} onUpdate={onUpdate} />
                
                {/* Visual connectors for bracket (simplified) */}
                {index < activeRounds.length - 1 && (
                  <div style={{
                    position: 'absolute', right: -40, top: '50%',
                    width: 40, height: 1, background: 'var(--border-light)',
                    zIndex: -1
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
