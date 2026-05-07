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
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (scoreA === '' || scoreB === '') { toast.error('Enter both scores'); return; }
    if (!screenshot) { toast.error('Please upload a result screenshot'); return; }
    
    setSubmitting(true);
    try {
      await api.post(`/matches/${match._id}/submit-result`, {
        scoreA: parseInt(scoreA), 
        scoreB: parseInt(scoreB),
        screenshot
      });
      toast.success('Result submitted for approval!');
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
      <div className="modal glass-card animate-fadeIn" style={{ maxWidth: 480, padding: 32, border: '1px solid var(--accent-cyan)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.75rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
            Submit <span style={{ color: 'var(--accent-cyan)' }}>Match Score</span>
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Score Inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>{match.teamA?.name}</div>
              <input
                type="number" min={0} className="input"
                style={{ fontSize: '2rem', fontFamily: "'Barlow Condensed', sans-serif", textAlign: 'center', height: 70 }}
                placeholder="0" value={scoreA} onChange={e => setScoreA(e.target.value)} required
              />
            </div>
            <div style={{ fontSize: '1.5rem', color: 'var(--border-light)', fontWeight: 700, paddingTop: 20 }}>:</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>{match.teamB?.name}</div>
              <input
                type="number" min={0} className="input"
                style={{ fontSize: '2rem', fontFamily: "'Barlow Condensed', sans-serif", textAlign: 'center', height: 70 }}
                placeholder="0" value={scoreB} onChange={e => setScoreB(e.target.value)} required
              />
            </div>
          </div>

          {/* Screenshot Upload */}
          <div style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={14} style={{ color: 'var(--accent-cyan)' }} />
              Proof of Result (Screenshot)
            </label>
            <div style={{ 
              border: '2px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center',
              background: 'rgba(255,255,255,0.02)', position: 'relative', cursor: 'pointer',
              transition: 'all 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <input 
                type="file" accept="image/*" onChange={handleFileChange} 
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
              />
              {screenshot ? (
                <img src={screenshot} alt="Preview" style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8 }} />
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>📸</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click or drag result screenshot</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary glow-gold" disabled={submitting} style={{ flex: 2, justifyContent: 'center' }}>
              {submitting ? 'Uploading...' : 'Confirm & Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MatchDetailModal({ match, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal glass-card animate-fadeIn" style={{ maxWidth: 600, padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.5rem', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>
            Match <span style={{ color: 'var(--accent-cyan)' }}>Details</span>
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: 32 }}>
          {/* Match Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, marginBottom: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar user={match.teamA?.captain} size={64} />
              <div style={{ fontWeight: 700, marginTop: 8 }}>{match.teamA?.name}</div>
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '3rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {match.status === 'completed' || match.status === 'pending_approval' ? `${match.scoreA} : ${match.scoreB}` : 'VS'}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Avatar user={match.teamB?.captain} size={64} />
              <div style={{ fontWeight: 700, marginTop: 8 }}>{match.teamB?.name}</div>
            </div>
          </div>

          {/* Screenshot View */}
          {match.screenshot && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>
                Submission Proof
              </div>
              <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={match.screenshot} alt="Match Proof" style={{ width: '100%', display: 'block' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Status: <StatusBadge status={match.status} />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Played At: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{match.playedAt ? formatDateTime(match.playedAt) : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchCard({ match, onUpdate }) {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isAdmin = user?.role === 'admin';
  const userId = user?._id?.toString();

  const isMemberOf = (team) => {
    if (!team || !userId) return false;
    if (team.captain?._id?.toString() === userId || team.captain === userId) return true;
    return team.members?.some(m => (m.user?._id?.toString() === userId || m.user === userId) && m.status === 'accepted');
  };

  const isInTeamA = isMemberOf(match.teamA);
  const isInTeamB = isMemberOf(match.teamB);
  const canSubmit = (isAdmin || isInTeamA || isInTeamB) && match.status === 'scheduled';
  const canApprove = isAdmin && match.status === 'pending_approval';

  const handleApprove = async (e) => {
    e.stopPropagation();
    try {
      await api.post(`/matches/${match._id}/approve`);
      toast.success('Result approved!');
      onUpdate();
    } catch (err) {
      toast.error('Failed to approve');
    }
  };

  const isCompleted = match.status === 'completed';

  return (
    <>
      <div 
        onClick={() => setShowDetails(true)}
        className={`glass-card animate-fadeIn ${isCompleted ? '' : 'glow-cyan'}`} 
        style={{
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          border: isCompleted ? '1px solid var(--border)' : '1px solid var(--border-light)',
          position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {!isCompleted && (
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: match.status === 'pending_approval' ? 'var(--accent-gold)' : 'var(--accent-cyan)' }} />
        )}

        {/* Team A */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 2, minWidth: 150 }}>
          <Avatar user={match.teamA?.captain} size={36} />
          <span style={{ fontWeight: 700, fontSize: '1rem', color: isCompleted && match.scoreA > match.scoreB ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
            {match.teamA?.name}
          </span>
        </div>

        {/* Score / Center Info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
          {isCompleted || match.status === 'pending_approval' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.75rem', fontWeight: 700 }}>
              <span style={{ color: match.scoreA >= match.scoreB ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{match.scoreA}</span>
              <span style={{ color: 'var(--border-light)', fontSize: '1.25rem' }}>:</span>
              <span style={{ color: match.scoreB >= match.scoreA ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{match.scoreB}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>VS</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{match.scheduledAt ? formatDateTime(match.scheduledAt) : 'SCHEDULED'}</div>
            </div>
          )}
        </div>

        {/* Team B */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 2, minWidth: 150, flexDirection: 'row-reverse' }}>
          <Avatar user={match.teamB?.captain} size={36} />
          <span style={{ fontWeight: 700, fontSize: '1rem', textAlign: 'right', color: isCompleted && match.scoreB > match.scoreA ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
            {match.teamB?.name}
          </span>
        </div>

        {/* Status / Actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 140, justifyContent: 'flex-end' }}>
          <StatusBadge status={match.status} />
          {canSubmit && (
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              onClick={(e) => { e.stopPropagation(); setShowForm(true); }}>
              <Send size={14} /> Submit
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
      {showDetails && <MatchDetailModal match={match} onClose={() => setShowDetails(false)} />}
    </>
  );
}

