'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthConfig, parseJwt } from '../../lib/api';

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const decoded = token ? parseJwt(token) : null;
    if (decoded && decoded.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/api/admin/reports', getAuthConfig());
      setItems(response.data?.foundItems || []);
    } catch (error) {
      setItems([]);
    }
  };

  const receivedItems = items.length
    ? items.slice(0, 3)
    : [
        { _id: 'LF2024TR1234', title: 'Black Wallet', trainNumber: '12345', foundDate: '2024-05-12' },
        { _id: 'LF2024TR1240', title: 'Brown Handbag', trainNumber: '12345', foundDate: '2024-05-12' },
      ];

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <div className="topbar">
          <button className="icon-button" aria-label="Open menu">
            =
          </button>
          <h1 className="text-sm font-black">Admin / Station Master</h1>
          <button className="icon-button" aria-label="Notifications">
            o
          </button>
        </div>

        <div className="screen-pad">
          <h2 className="text-sm font-black">Received Items</h2>
          <div className="mt-3 space-y-3">
            {receivedItems.map((item, index) => (
              <div key={item._id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className={`grid h-16 w-16 place-items-center rounded-lg ${index === 0 ? 'bg-slate-800' : 'bg-amber-100'} text-xs font-black text-white`}>
                  {index === 0 ? 'WALLET' : 'BAG'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-600">From Train {item.trainNumber || '12345'}</p>
                  <p className="text-xs text-slate-500">Found on 12 May 2024</p>
                </div>
                <button className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800">
                  Verify
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-black">Delivery Method</h2>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
              <label className="flex items-center gap-3 border-b border-slate-200 bg-white p-4">
                <input
                  type="radio"
                  checked={deliveryMethod === 'pickup'}
                  onChange={() => setDeliveryMethod('pickup')}
                  className="h-4 w-4 accent-emerald-700"
                />
                <span className="text-sm font-semibold">Pickup at Station</span>
              </label>
              <label className="flex items-center gap-3 bg-white p-4">
                <input
                  type="radio"
                  checked={deliveryMethod === 'courier'}
                  onChange={() => setDeliveryMethod('courier')}
                  className="h-4 w-4 accent-emerald-700"
                />
                <span className="text-sm font-semibold">Courier Delivery</span>
              </label>
            </div>
          </div>

          <button onClick={() => router.push('/delivery')} className="primary-btn mt-8">
            Dispatch Item
          </button>
        </div>
      </section>
    </main>
  );
}
