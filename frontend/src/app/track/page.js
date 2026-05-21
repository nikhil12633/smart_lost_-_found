'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

export default function Track() {
  const [trackingId, setTrackingId] = useState('');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchHandler = async () => {
    if (!trackingId.trim()) {
      alert('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/api/tracking/${trackingId}`);
      setItem(response.data);
    } catch (error) {
      alert('Item not found. Please check the ID and try again.');
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  const timeline = item?.timeline?.length
    ? item.timeline
    : [
        { label: 'Reported', status: '12 May 2024, 10:30 AM' },
        { label: 'Under Verification', status: '12 May 2024, 11:15 AM' },
        { label: 'Found', status: '12 May 2024, 02:45 PM' },
        { label: 'At Station', status: '' },
        { label: 'Delivered', status: '' },
      ];

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <div className="topbar-light">
          <button className="icon-button" onClick={() => router.back()} aria-label="Go back">
            {'<'}
          </button>
          <h1 className="text-center text-sm font-black">Track My Item</h1>
          <span />
        </div>

        <div className="screen-pad">
          <label className="field-label" htmlFor="trackingId">
            Enter Tracking ID
          </label>
          <input
            id="trackingId"
            type="text"
            placeholder="LF2024TR1234"
            className="field"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
          />
          <button onClick={searchHandler} disabled={loading} className="primary-btn mt-3 disabled:bg-slate-400">
            {loading ? 'Searching...' : 'Search'}
          </button>

          <div className="mt-7">
            <h2 className="text-sm font-black">Tracking Status</h2>
            {item && (
              <div className="mb-4 mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-black">{item.item?.title || 'Unknown Item'}</p>
                <p className="mt-1 text-sm text-slate-600">{item.item?.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Train {item.item?.trainNumber || 'N/A'} | {item.item?.station || 'Station N/A'}
                </p>
              </div>
            )}

            <div className="timeline">
              {timeline.map((event, index) => (
                <div key={`${event.label}-${index}`} className="timeline-step">
                  <span className={`timeline-dot ${index < 3 || item ? 'done' : ''}`} />
                  <span>
                    <span className="block text-sm font-black text-slate-800">{event.label}</span>
                    {event.status && <span className="mt-1 block text-xs text-slate-500">{event.status}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {item?.delivery && (
            <div className="mt-7 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <p className="font-black text-emerald-800">Delivery Info</p>
              <p className="mt-2 text-sm">Name: {item.delivery.ownerName}</p>
              <p className="text-sm">Address: {item.delivery.address}</p>
              <p className="text-sm">
                Status: <span className="font-black">{item.delivery.status}</span>
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
