import { useEffect, useState } from 'react';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MatchCard from './MatchCard';
import KnockoutBracket from './KnockoutBracket';
import { useAuthStore } from '../../store/authStore';
import { Filter, Swords, Calendar, Trophy, List } from 'lucide-react';

export default function MatchesPage() {
  const { user } = useAuthStore();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | scheduled | pending | completed
  const [myMatchesOnly, setMyMatchesOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('groups'); // groups | knockouts

  const fetchMatches = () => {
    const params = {};
    if (filter !== 'all') params.status = filter;
    if (myMatchesOnly && user?._id) params.player = user._id;
    api.get('/matches', { params })
      .then(res => setMatches(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); fetchMatches(); }, [filter, myMatchesOnly]);

  const filterBtns = [
    { value: 'all', label: 'All' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'pending_approval', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  // Separate Group Stage vs Knockouts
  const groupMatches = matches.filter(m => m.stage === 'group');
  const knockoutMatches = matches.filter(m => m.stage !== 'group');

  // Group stage matches by group name
  const groupedGroupMatches = groupMatches.reduce((acc, match) => {
    const key = match.group?.name || 'Group Stage';
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  const groupNames = Object.keys(groupedGroupMatches).sort((a, b) => a.localeCompare(b));

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Swords size={28} style={{ color: 'var(--accent-cyan)' }} />
            Match Schedule
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {matches.length} matches across all stages
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveTab('groups')}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: 10, cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
              background: activeTab === 'groups' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'groups' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              boxShadow: activeTab === 'groups' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            <List size={16} /> Group Stage
          </button>
          <button 
            onClick={() => setActiveTab('knockouts')}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: 10, cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
              background: activeTab === 'knockouts' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'knockouts' ? 'var(--accent-gold)' : 'var(--text-muted)',
              boxShadow: activeTab === 'knockouts' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            <Trophy size={16} /> Knockouts
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '12px 16px', marginBottom: 32, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-secondary)', padding: '4px', borderRadius: 10 }}>
          {filterBtns.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              style={{
                padding: '8px 16px', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s',
                background: filter === value ? 'var(--accent-cyan)' : 'transparent',
                color: filter === value ? '#080c18' : 'var(--text-secondary)',
              }}>
              {label}
            </button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)', userSelect: 'none' }}>
          <input 
            type="checkbox" 
            checked={myMatchesOnly} 
            onChange={e => setMyMatchesOnly(e.target.checked)}
            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent-cyan)' }} 
          />
          Show my matches only
        </label>
      </div>

      {loading ? <LoadingSpinner text="Loading matches..." /> : (
        <div className="animate-fadeIn">
          {activeTab === 'groups' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {groupMatches.length === 0 ? (
                <div className="glass-card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>📅</div>
                  <p style={{ fontSize: '1rem', fontWeight: 500 }}>No group stage matches found</p>
                </div>
              ) : (
                groupNames.map(groupName => (
                  <div key={groupName} className="animate-fadeIn">
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, 
                      paddingBottom: 8, borderBottom: '1px solid var(--border)' 
                    }}>
                      <h2 style={{ 
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.5rem', 
                        fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', 
                        letterSpacing: '0.05em', margin: 0 
                      }}>
                        {groupName}
                      </h2>
                      <div className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                        {groupedGroupMatches[groupName].length} Matches
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                      {groupedGroupMatches[groupName].sort((a, b) => (a.roundNumber || 0) - (b.roundNumber || 0)).map(match => (
                        <MatchCard key={match._id} match={match} onUpdate={fetchMatches} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <KnockoutBracket matches={knockoutMatches} onUpdate={fetchMatches} />
          )}
        </div>
      )}
    </div>
  );
}


