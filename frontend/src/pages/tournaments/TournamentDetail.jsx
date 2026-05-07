import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../../components/common/Avatar';
import { StatusBadge, PositionBadge, PointsBadge } from '../../components/common/Badges';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, STAGES } from '../../utils/constants';
import { ArrowLeft, Users, Trophy, Swords, Grid3x3, TableProperties, X } from 'lucide-react';
import GroupTable from '../standings/GroupTable';
import KnockoutBracket from '../bracket/KnockoutBracket';
import MatchCard from '../matches/MatchCard';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Groups & Standings', 'Matches', 'Knockout Bracket'];

function RegisterTeamModal({ tournament, onClose, onRegistered }) {
  const isSolo = tournament.teamSize === 1;
  const [teamName, setTeamName] = useState('');
  const [playerIds, setPlayerIds] = useState(Array(tournament.teamSize - 1).fill(''));
  const [saving, setSaving] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isSolo && playerIds.some(id => !id.trim())) {
      toast.error('Please enter all Player IDs to invite');
      return;
    }
    setSaving(true);
    try {
      await api.post('/teams/register', {
        tournamentId: tournament._id,
        name: teamName,
        invitedPlayerIds: isSolo ? [] : playerIds.map(id => id.trim())
      });
      toast.success(isSolo ? 'Registered successfully!' : 'Team created and invites sent!');
      onRegistered();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.25rem', fontWeight: 700 }}>
            {isSolo ? 'Register for Tournament' : 'Create & Register Team'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6, borderRadius: 8 }}><X size={18} /></button>
        </div>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!isSolo && (
            <div className="form-group">
              <label className="form-label">Team Name (Optional)</label>
              <input className="input" placeholder="e.g. Dream Team" value={teamName} onChange={e => setTeamName(e.target.value)} />
            </div>
          )}
          {!isSolo && (
            <div style={{ padding: '12px 14px', background: 'rgba(59,130,246,0.08)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
              This is a {tournament.teamSize}v{tournament.teamSize} tournament. Invite {tournament.teamSize - 1} more players using their Unique Player IDs (e.g., #ABCD123).
            </div>
          )}
          {!isSolo && playerIds.map((val, idx) => (
            <div className="form-group" key={idx}>
              <label className="form-label">Player {idx + 2} ID</label>
              <input className="input" placeholder="e.g. ABCD123" value={val} 
                onChange={e => {
                  const newIds = [...playerIds];
                  newIds[idx] = e.target.value;
                  setPlayerIds(newIds);
                }} required />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 2, justifyContent: 'center' }}>
              {saving ? 'Processing...' : isSolo ? 'Register Now' : 'Send Invites & Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tournament, setTournament] = useState(null);
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showRegister, setShowRegister] = useState(false);

  const fetchAll = async () => {
    try {
      const [tRes, gRes, mRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/tournaments/${id}/groups`),
        api.get(`/tournaments/${id}/matches`),
      ]);
      setTournament(tRes.data);
      setGroups(gRes.data);
      setMatches(mRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  if (loading) return <LoadingSpinner text="Loading tournament..." />;
  if (!tournament) return <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Tournament not found</div>;

  const groupMatches = matches.filter(m => m.stage === 'group');
  const knockoutMatches = matches.filter(m => m.stage !== 'group');

  const tabContents = [
    <div key="overview">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Teams', value: tournament.teams?.length || 0, icon: '👥' },
          { label: 'Format / Size', value: `${tournament.format === 'ucl' ? 'UCL' : 'RR'} / ${tournament.teamSize}v${tournament.teamSize}`, icon: '📊' },
          { label: 'Group Matches', value: groupMatches.length, icon: '⚽' },
          { label: 'Advance Per Group', value: `Top ${tournament.advanceCount}`, icon: '🏆' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem' }}>Registered Teams</h3>
        {tournament.teams?.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No teams registered yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tournament.teams?.map(team => (
              <div key={team._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {team.name}
                    {!team.isComplete && <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: 999 }}>INCOMPLETE</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--accent-gold)' }}>Capt: {team.captain?.name}</span>
                    {team.members?.map(m => (
                      <span key={m.user?._id}>
                        · {m.user?.name} {m.status === 'pending' ? '(Pending)' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,

    // Groups & Standings
    <div key="groups">
      {groups.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Tournament hasn't started yet. Groups will appear here once started.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {groups.map(group => <GroupTable key={group._id} group={group} />)}
        </div>
      )}
    </div>,

    // Matches
    <div key="matches">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {groupMatches.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No group stage matches scheduled yet
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 4 }}>
              {groupMatches.filter(m => m.status === 'completed').length} / {groupMatches.length} completed
            </p>
            {groupMatches.map(match => (
              <MatchCard key={match._id} match={match} onUpdate={fetchAll} />
            ))}
          </>
        )}
      </div>
    </div>,

    // Knockout Bracket
    <div key="bracket">
      {knockoutMatches.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Knockout stage not started yet. Complete the group stage first.
        </div>
      ) : (
        <KnockoutBracket matches={knockoutMatches} onUpdate={fetchAll} />
      )}
    </div>,
  ];

  return (
    <div className="animate-fadeIn">
      <button onClick={() => navigate('/tournaments')} className="btn btn-ghost" style={{ marginBottom: 20, padding: '8px 14px' }}>
        <ArrowLeft size={16} /> Tournaments
      </button>

      {/* Header */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <StatusBadge status={tournament.status} type="tournament" />
              <span className={`badge ${tournament.format === 'ucl' ? 'badge-gold' : 'badge-blue'}`}>
                {tournament.format === 'ucl' ? '⭐ UCL' : '🔄 Round Robin'}
              </span>
            </div>
            <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>
              {tournament.name}
            </h1>
            {tournament.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{tournament.description}</p>
            )}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 6 }}>
              Created by {tournament.createdBy?.name} · {formatDate(tournament.startDate)}
              {tournament.requireApproval && ' · Results require admin approval'}
            </p>
          </div>
          {tournament.status === 'upcoming' && (
            <button className="btn btn-primary" onClick={() => setShowRegister(true)}>
              Register Team
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-secondary)', padding: '4px', borderRadius: 12, width: 'fit-content', flexWrap: 'wrap' }}>
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
              background: activeTab === idx ? 'var(--bg-card)' : 'transparent',
              color: activeTab === idx ? 'var(--accent-green)' : 'var(--text-muted)',
              borderBottom: activeTab === idx ? '2px solid var(--accent-green)' : '2px solid transparent',
            }}>
            {tab}
          </button>
        ))}
      </div>

      {tabContents[activeTab]}

      {showRegister && <RegisterTeamModal tournament={tournament} onClose={() => setShowRegister(false)} onRegistered={fetchAll} />}
    </div>
  );
}
