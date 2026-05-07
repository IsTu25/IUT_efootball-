import { useState } from 'react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../../components/common/Avatar';
import { StatusBadge } from '../../components/common/Badges';
import { STAGES, formatDateTime } from '../../utils/constants';
import { CheckCircle, Clock, Send, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

function SubmitResultForm({ match, onUpdate, onClose }) {
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (scoreA === '' || scoreB === '') { toast.error('Enter both scores'); return; }
    setSubmitting(true);
    try {
      await api.post(`/matches/${match._id}/submit-result`, {
        scoreA: parseInt(scoreA), scoreB: parseInt(scoreB)
      });
      toast.success('Result submitted!');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal glass-card animate-fadeIn" style={{ maxWidth: 440, padding: 32, border: '1px solid var(--accent-cyan)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.75rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
            Submit <span style={{ color: 'var(--accent-cyan)' }}>Match Score</span>
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Teams Display */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 32,
          padding: '20px', background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)'
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <Avatar user={match.teamA?.captain} size={48} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{match.teamA?.name}</div>
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: 'var(--text-muted)', fontSize: '1.25rem' }}>VS</div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <Avatar user={match.teamB?.captain} size={48} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{match.teamB?.name}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ flex: 1 }}>
              <input
                type="number" min={0} max={99}
                className="input"
                style={{ 
                  fontSize: '2.5rem', fontFamily: "'Barlow Condensed', sans-serif", 
                  textAlign: 'center', fontWeight: 700, height: 80,
                  background: 'var(--bg-card)', border: '2px solid var(--border)'
                }}
                placeholder="0"
                value={scoreA}
                onChange={e => setScoreA(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div style={{ fontSize: '2rem', color: 'var(--border-light)', fontWeight: 700 }}>:</div>
            <div style={{ flex: 1 }}>
              <input
                type="number" min={0} max={99}
                className="input"
                style={{ 
                  fontSize: '2.5rem', fontFamily: "'Barlow Condensed', sans-serif", 
                  textAlign: 'center', fontWeight: 700, height: 80,
                  background: 'var(--bg-card)', border: '2px solid var(--border)'
                }}
                placeholder="0"
                value={scoreB}
                onChange={e => setScoreB(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary glow-gold" disabled={submitting} style={{ flex: 2, justifyContent: 'center', fontSize: '1rem', height: 48 }}>
              <Send size={18} /> {submitting ? 'Submitting...' : 'Confirm Score'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MatchCard({ match, onUpdate }) {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);

  const isAdmin = user?.role === 'admin';
  const userId = user?._id?.toString();

  const isMemberOf = (team) => {
    if (!team || !userId) return false;
    // Check if captain
    if (team.captain?._id?.toString() === userId || team.captain === userId) return true;
    // Check if accepted member
    return team.members?.some(m => 
      (m.user?._id?.toString() === userId || m.user === userId) && 
      m.status === 'accepted'
    );
  };

  const isInTeamA = isMemberOf(match.teamA);
  const isInTeamB = isMemberOf(match.teamB);
  const canSubmit = (isAdmin || isInTeamA || isInTeamB) && match.status === 'scheduled';
  const canApprove = isAdmin && match.status === 'pending_approval';

  const handleApprove = async () => {
    try {
      await api.post(`/matches/${match._id}/approve`);
      toast.success('Result approved!');
      onUpdate();
    } catch (err) {
      toast.error('Failed to approve');
    }
  };

  const stageLabel = STAGES[match.stage] || match.stage;
  const isCompleted = match.status === 'completed';

  return (
    <>
      <div className={`glass-card animate-fadeIn ${isCompleted ? '' : 'glow-cyan'}`} style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        border: isCompleted ? '1px solid var(--border)' : '1px solid var(--border-light)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Visual indicator for status */}
        {!isCompleted && (
          <div style={{ 
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, 
            background: match.status === 'pending_approval' ? 'var(--accent-gold)' : 'var(--accent-cyan)' 
          }} />
        )}

        {/* Team A */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 2, minWidth: 150 }}>
          <Avatar user={match.teamA?.captain} size={36} />
          <span style={{
            fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            color: isCompleted && match.scoreA > match.scoreB ? 'var(--accent-cyan)' : 'var(--text-primary)'
          }}>
            {match.teamA?.name}
          </span>
        </div>

        {/* Score / Center Info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
          {isCompleted ? (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 12, 
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.75rem', fontWeight: 700 
            }}>
              <span style={{ color: match.scoreA >= match.scoreB ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{match.scoreA}</span>
              <span style={{ color: 'var(--border-light)', fontSize: '1.25rem' }}>:</span>
              <span style={{ color: match.scoreB >= match.scoreA ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{match.scoreB}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>VS</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {match.scheduledAt ? formatDateTime(match.scheduledAt) : 'SCHEDULED'}
              </div>
            </div>
          )}
        </div>

        {/* Team B */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 2, minWidth: 150, flexDirection: 'row-reverse' }}>
          <Avatar user={match.teamB?.captain} size={36} />
          <span style={{
            fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right',
            color: isCompleted && match.scoreB > match.scoreA ? 'var(--accent-cyan)' : 'var(--text-primary)'
          }}>
            {match.teamB?.name}
          </span>
        </div>

        {/* Status / Actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 140, justifyContent: 'flex-end' }}>
          <StatusBadge status={match.status} />
          {canSubmit && (
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              onClick={() => setShowForm(true)}>
              <Send size={14} /> Submit Score
            </button>
          )}
          {canApprove && (
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)' }}
              onClick={handleApprove}>
              <Check size={14} /> Approve
            </button>
          )}
        </div>
      </div>

      {showForm && <SubmitResultForm match={match} onUpdate={onUpdate} onClose={() => setShowForm(false)} />}
    </>
  );
}

