import React, { useMemo, useState } from 'react';
import type { NewsItem } from '../types/football';

type FeedFilter = 'ALL' | 'MATCH' | 'TRANSFER' | 'CLUB' | 'WORLD';

interface CareerNewsFeedProps {
  items: NewsItem[];
  compact?: boolean;
  className?: string;
  title?: string;
}

const FILTERS: Array<{ id: FeedFilter; label: string }> = [
  { id: 'ALL', label: 'ALL' },
  { id: 'MATCH', label: 'MATCHES' },
  { id: 'TRANSFER', label: 'TRANSFERS' },
  { id: 'CLUB', label: 'CLUB' },
  { id: 'WORLD', label: 'WORLD' },
];

const categoryFor = (category: NewsItem['category']): FeedFilter => {
  if (category === 'MATCH') return 'MATCH';
  if (category === 'TRANSFER') return 'TRANSFER';
  if (category === 'INTERNATIONAL' || category === 'AWARD') return 'WORLD';
  return 'CLUB';
};

const labelFor = (category: NewsItem['category']) => category.replace(/_/g, ' ');

export const CareerNewsFeed: React.FC<CareerNewsFeedProps> = ({
  items,
  compact = false,
  className = '',
  title = 'FOOTBALL NEWS',
}) => {
  const [filter, setFilter] = useState<FeedFilter>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filtered = useMemo(
    () => items.filter((item) => filter === 'ALL' || categoryFor(item.category) === filter),
    [items, filter],
  );
  const selected = filtered.find((item) => item.id === selectedId);
  const visible = filtered.slice(0, compact ? 5 : 7);

  return (
    <section className={`fd-news-feed ${compact ? 'is-compact' : ''} ${className}`}>
      <header className="fd-news-feed-head">
        <div><small>THE LATEST FROM THE FOOTBALL WORLD</small><h3>{title}</h3></div>
        <span>{filtered.length} STORIES</span>
      </header>
      <nav className="fd-news-feed-filters" aria-label="Filter football news">
        {FILTERS.map((item) => (
          <button key={item.id} type="button" aria-pressed={filter === item.id}
            className={filter === item.id ? 'is-active' : ''}
            onClick={() => { setFilter(item.id); setSelectedId(null); }}>
            {item.label}
          </button>
        ))}
      </nav>
      {selected ? (
        <article className="fd-news-feed-story">
          <button type="button" className="fd-news-back" onClick={() => setSelectedId(null)}>← BACK TO HEADLINES</button>
          <div className="fd-news-meta"><span>{labelFor(selected.category)}</span><time>SEASON {selected.season} · WEEK {selected.week}</time></div>
          <h4>{selected.headline}</h4>
          <p>{selected.body}</p>
        </article>
      ) : (
        <div className="fd-news-feed-list">
          {visible.map((item) => (
            <button type="button" className="fd-news-feed-item" key={item.id} onClick={() => setSelectedId(item.id)}>
              <span className={`fd-news-category fd-news-${categoryFor(item.category).toLowerCase()}`}>{labelFor(item.category)}</span>
              <strong>{item.headline}</strong>
              <small>S{item.season} · W{item.week}</small>
              <i>›</i>
            </button>
          ))}
          {!visible.length && <p className="fd-news-empty">No stories in this section yet. New reports will appear as your career develops.</p>}
        </div>
      )}
    </section>
  );
};

export default CareerNewsFeed;
