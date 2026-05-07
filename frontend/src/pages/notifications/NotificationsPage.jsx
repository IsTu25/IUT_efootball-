import { useEffect, useState } from 'react';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import { Bell, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetch = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleRespond = async (id, status) => {
    setProcessing(id);
    try {
      await api.post(`/notifications/${id}/respond`, { status });
      toast.success(status === 'accepted' ? 'Invite accepted!' : 'Invite declined.');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond');
    } finally {
      setProcessing(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetch();
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  if (loading) return <LoadingSpinner text="Loading notifications..." />;

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell /> Notifications
            {unreadCount > 0 && (
              <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'var(--accent-green)', color: '#000', borderRadius: 999, fontWeight: 700 }}>
                {unreadCount} new
              </span>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <Bell size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>You have no notifications.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map(n => (
            <div key={n._id} className="glass-card" style={{ 
              padding: '16px 20px', 
              display: 'flex', alignItems: 'flex-start', gap: 16,
              borderLeft: n.status === 'unread' ? '3px solid var(--accent-green)' : '1px solid var(--border)',
              opacity: n.status === 'unread' ? 1 : 0.7
            }}>
              <Avatar user={n.sender} size={40} />
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    {n.type === 'team_invite' ? 'Team Invitation' : 'Notification'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: n.status === 'unread' && n.type === 'team_invite' ? 12 : 0 }}>
                  {n.message}
                </p>

                {n.type === 'team_invite' && n.status === 'unread' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      disabled={processing === n._id}
                      onClick={() => handleRespond(n._id, 'accepted')}
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      disabled={processing === n._id}
                      onClick={() => handleRespond(n._id, 'declined')}
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                )}
                {n.type === 'team_invite' && n.status === 'accepted' && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Check size={12} /> Accepted
                  </span>
                )}
                {n.type === 'team_invite' && n.status === 'declined' && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <X size={12} /> Declined
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
