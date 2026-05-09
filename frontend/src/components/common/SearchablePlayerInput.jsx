import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import Avatar from './Avatar';
import { Search, X } from 'lucide-react';

export default function SearchablePlayerInput({ onSelect, placeholder, excludeIds = [] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/players?search=${query}`);
        // Filter out excluded IDs
        const filtered = data.filter(p => !excludeIds.includes(p._id) && !excludeIds.includes(p.playerId));
        setResults(filtered);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, excludeIds]);

  const handleSelect = (player) => {
    onSelect(player);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="input"
          style={{ paddingLeft: 38 }}
          placeholder={placeholder || "Search by name or Player ID..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {query && (
          <button 
            type="button" 
            onClick={() => setQuery('')}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          marginTop: 6, background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          maxHeight: 280, overflowY: 'auto', padding: 6
        }}>
          {loading && <div style={{ padding: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Searching...</div>}
          {!loading && results.length === 0 && (
            <div style={{ padding: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>No players found</div>
          )}
          {results.map(player => (
            <div 
              key={player._id} 
              onClick={() => handleSelect(player)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                hover: { background: 'var(--bg-secondary)' }
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar user={player} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{player.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{player.playerId} · {player.position}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
