'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthConfig, parseJwt } from '../../lib/api';

export default function ReportFound() {
  const [title, setTitle] = useState('');
  const [pnr, setPnr] = useState('');
  const [description, setDescription] = useState('');
  const [locationFound, setLocationFound] = useState('');
  const [station, setStation] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [image, setImage] = useState(null);
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState('');
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = token ? parseJwt(token) : null;
    setIsStaff(user?.role === 'staff' || user?.role === 'admin');
    setCheckedAuth(true);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('pnr', pnr);
    formData.append('description', description);
    formData.append('locationFound', locationFound);
    formData.append('station', station);
    formData.append('trainNumber', trainNumber);
    if (image) formData.append('image', image);

    try {
      const response = await api.post('/api/found', formData, getAuthConfig());
      setMatches(response.data.matches || []);
      setMessage('Found item uploaded successfully.');
      setTitle('');
      setPnr('');
      setDescription('');
      setLocationFound('');
      setStation('');
      setTrainNumber('');
      setImage(null);
    } catch (error) {
      setMessage('Unable to upload. Please try again.');
    }
  };

  if (!checkedAuth) return null;

  if (!isStaff) {
    return (
      <main className="page-shell">
        <div className="page-container grid min-h-[70vh] place-items-center">
          <section className="login-panel w-full max-w-xl text-center">
            <h1 className="text-3xl font-black text-slate-950">Staff login required</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Found item intake is restricted to station staff.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button onClick={() => router.push('/login')} className="primary-btn">Go to Login</button>
              <button onClick={() => router.push('/')} className="secondary-btn">Back Home</button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <nav className="page-nav">
          <div className="flex items-center gap-3">
            <div className="brand-mark">F</div>
            <div>
              <p className="text-base font-black text-slate-950">Report Found Item</p>
              <p className="text-sm text-slate-500">Found item intake and matching</p>
            </div>
          </div>
          <button onClick={() => router.push('/dashboard')} className="secondary-btn">
            Back to Dashboard
          </button>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <form onSubmit={submitHandler} className="form-card">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="field-label">Upload Image</label>
                <label className="upload-box">
                  <input type="file" onChange={(e) => setImage(e.target.files?.[0])} />
                  <span>
                    <span className="block text-3xl font-black text-slate-800">Upload</span>
                    <span className="mt-2 block text-sm">{image?.name || 'Click or drop the found item image'}</span>
                  </span>
                </label>
              </div>
              <div>
                <label className="field-label" htmlFor="title">Item Name</label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  placeholder="Brown Handbag"
                  className="field"
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="pnr">PNR Number</label>
                <input
                  id="pnr"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value)}
                  type="text"
                  placeholder="PNR / ticket number"
                  className="field"
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="locationFound">Location Found</label>
                <input
                  id="locationFound"
                  value={locationFound}
                  onChange={(e) => setLocationFound(e.target.value)}
                  type="text"
                  placeholder="Coach B2, Seat 46"
                  className="field"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="station">Station</label>
                <input
                  id="station"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  type="text"
                  placeholder="Central Station"
                  className="field"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="trainNumber">Train Number</label>
                <input
                  id="trainNumber"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  type="text"
                  placeholder="12345"
                  className="field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="field-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Found a brown handbag near seat 46."
                  className="textarea-field"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {message && <p className="text-sm font-semibold text-slate-600">{message}</p>}
              <button className="primary-btn sm:ml-auto">Submit Found Report</button>
            </div>
          </form>

          <aside className="card p-8">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-600">Matching workspace</p>
            <h1 className="mt-4 text-4xl font-black text-slate-950">Keep found items organized.</h1>
            <p className="mt-4 leading-7 text-slate-600">
              Add train, station, and item details so the system can compare this report with passenger lost reports.
            </p>

            <div className="mt-8 grid gap-4">
              {(matches.length ? matches : [
                { _id: 'demo-1', title: 'Black Wallet', description: 'Possible owner report from Train 12345.' },
                { _id: 'demo-2', title: 'Phone', description: 'Recent lost report near Coach B2.' },
              ]).map((item) => (
                <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="font-black text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
