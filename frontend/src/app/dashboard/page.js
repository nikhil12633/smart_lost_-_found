'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthConfig, parseJwt } from '../../lib/api';

const statusText = {
  reported: 'Report filed',
  under_verification: 'Not found yet',
  matched: 'Item found',
  dispatched: 'Dispatched',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [foundForm, setFoundForm] = useState({
    title: '',
    pnr: '',
    locationFound: '',
    station: '',
    trainNumber: '',
    description: '',
    image: null,
  });
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decoded = token ? parseJwt(token) : null;
    if (!decoded) {
      router.push('/login');
      return;
    }
    setUser(decoded);
    fetchReports(decoded.role);
  }, []);

  const fetchReports = async (role = user?.role) => {
    try {
      const endpoint = role === 'staff' || role === 'admin' ? '/api/lost' : '/api/lost/my';
      const response = await api.get(endpoint, getAuthConfig());
      setReports(response.data || []);
    } catch (error) {
      setMessage('Unable to load reports.');
    }
  };

  const markNotFound = async (report) => {
    try {
      await api.put(
        `/api/lost/${report._id}/not-found`,
        { verificationNotes: 'Staff checked this report and has not found the item yet.' },
        getAuthConfig()
      );
      setMessage('Report updated as not found yet.');
      fetchReports();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update report.');
    }
  };

  const openFoundForm = (report) => {
    setSelectedReport(report);
    setFoundForm({
      title: report.title || '',
      pnr: report.pnr || '',
      locationFound: '',
      station: report.station || '',
      trainNumber: report.trainNumber || '',
      description: '',
      image: null,
    });
  };

  const submitFoundMatch = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', foundForm.title);
    formData.append('pnr', foundForm.pnr);
    formData.append('locationFound', foundForm.locationFound);
    formData.append('station', foundForm.station);
    formData.append('trainNumber', foundForm.trainNumber);
    formData.append('description', foundForm.description);
    if (foundForm.image) {
      formData.append('image', foundForm.image, foundForm.image.name);
    }

    try {
      await api.post(`/api/found/match/${selectedReport._id}`, formData, getAuthConfig());
      setMessage('Found item matched. User dashboard will show Item found.');
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'Unable to submit found item details.');
    }
  };

  if (!user) return null;

  const isStaff = user.role === 'staff' || user.role === 'admin';
  const foundCount = reports.filter((item) => item.status === 'matched' || item.status === 'delivered').length;
  const pendingCount = reports.filter((item) => item.status === 'reported' || item.status === 'under_verification').length;

  return (
    <main className="page-shell">
      <div className="page-container">
        <nav className="page-nav">
          <div className="flex items-center gap-3">
            <div className="brand-mark">{isStaff ? 'T' : 'U'}</div>
            <div>
              <p className="text-base font-black text-slate-950">
                {isStaff ? 'Staff Dashboard' : 'User Dashboard'}
              </p>
              <p className="text-sm text-slate-500">
                Welcome{user.name ? `, ${user.name}` : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isStaff && (
              <button onClick={() => router.push('/report-lost')} className="primary-btn">
                File Lost Report
              </button>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="secondary-btn"
            >
              Logout
            </button>
          </div>
        </nav>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="metric-card">
            <p className="text-4xl font-black text-emerald-700">{reports.length}</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">{isStaff ? 'Total user reports' : 'Your reports'}</p>
          </div>
          <div className="metric-card">
            <p className="text-4xl font-black text-amber-700">{pendingCount}</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">Waiting / not found yet</p>
          </div>
          <div className="metric-card">
            <p className="text-4xl font-black text-sky-700">{foundCount}</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">Found or delivered</p>
          </div>
        </section>

        <section className="mt-8 card p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
                {isStaff ? 'All passenger reports' : 'My lost reports'}
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">
                {isStaff ? 'Review and update item status' : 'Track your filed reports'}
              </h1>
            </div>
            {message && <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">{message}</p>}
          </div>

          <div className="grid gap-4">
            {reports.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                No reports yet.
              </div>
            )}

            {reports.map((report) => (
              <article key={report._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-black text-slate-950">{report.title}</h2>
                      <span className="status-pill">{statusText[report.status] || report.status}</span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                      <p><span className="font-bold text-slate-800">PNR:</span> {report.pnr || 'N/A'}</p>
                      <p><span className="font-bold text-slate-800">Train:</span> {report.trainNumber || 'N/A'}</p>
                      <p><span className="font-bold text-slate-800">Contact:</span> {report.contact || report.ownerPhone || 'N/A'}</p>
                      <p><span className="font-bold text-slate-800">Owner:</span> {report.ownerName || 'Passenger'}</p>
                      <p><span className="font-bold text-slate-800">Email:</span> {report.ownerEmail || 'N/A'}</p>
                      <p><span className="font-bold text-slate-800">Last seen:</span> {report.locationLost || 'N/A'}</p>
                      <p><span className="font-bold text-slate-800">Collection:</span> {report.collectionPreference === 'delivery' ? 'Delivery' : 'Station pickup'}</p>
                    </div>
                    {report.deliveryAddress && (
                      <p className="mt-3 text-sm text-slate-600">
                        <span className="font-bold text-slate-800">Delivery address:</span> {report.deliveryAddress}
                      </p>
                    )}
                    {report.verificationNotes && (
                      <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                        {report.verificationNotes}
                      </p>
                    )}
                    {report.imageUrl && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        <img src={report.imageUrl} alt="Lost item" className="h-52 w-full object-cover" />
                      </div>
                    )}
                    {report.matchedFoundItem && (
                      <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                        Found details: {report.matchedFoundItem.locationFound || 'Location added by staff'}.
                      </p>
                    )}
                  </div>

                  {isStaff && (
                    <div className="flex min-w-56 flex-col gap-3">
                      <button onClick={() => openFoundForm(report)} className="primary-btn">
                        Mark Found
                      </button>
                      <button onClick={() => markNotFound(report)} className="secondary-btn">
                        Not Found Yet
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {selectedReport && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4">
            <form onSubmit={submitFoundMatch} className="form-card max-h-[92vh] w-full max-w-3xl overflow-y-auto">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Found item details</p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">Match report: {selectedReport.title}</h2>
                </div>
                <button type="button" onClick={() => setSelectedReport(null)} className="secondary-btn">Close</button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="field-label">PNR</label>
                  <input value={foundForm.pnr} onChange={(e) => setFoundForm({ ...foundForm, pnr: e.target.value })} className="field" required />
                </div>
                <div>
                  <label className="field-label">Item Name</label>
                  <input value={foundForm.title} onChange={(e) => setFoundForm({ ...foundForm, title: e.target.value })} className="field" required />
                </div>
                <div>
                  <label className="field-label">Location Found</label>
                  <input value={foundForm.locationFound} onChange={(e) => setFoundForm({ ...foundForm, locationFound: e.target.value })} className="field" placeholder="Coach B2 / Station counter" />
                </div>
                <div>
                  <label className="field-label">Station</label>
                  <input value={foundForm.station} onChange={(e) => setFoundForm({ ...foundForm, station: e.target.value })} className="field" />
                </div>
                <div>
                  <label className="field-label">Train Number</label>
                  <input value={foundForm.trainNumber} onChange={(e) => setFoundForm({ ...foundForm, trainNumber: e.target.value })} className="field" />
                </div>
                <div>
                  <label className="field-label">Picture</label>
                  <input type="file" onChange={(e) => setFoundForm({ ...foundForm, image: e.target.files?.[0] })} className="field" />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">Found Description</label>
                  <textarea value={foundForm.description} onChange={(e) => setFoundForm({ ...foundForm, description: e.target.value })} className="textarea-field" />
                </div>
              </div>

              <button className="primary-btn mt-6 w-full">Submit Found Match</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
