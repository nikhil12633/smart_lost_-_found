'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthConfig, parseJwt } from '../../lib/api';

export default function ReportLost() {
  const [ownerName, setOwnerName] = useState('');
  const [pnr, setPnr] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationLost, setLocationLost] = useState('');
  const [station, setStation] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [contact, setContact] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [collectionPreference, setCollectionPreference] = useState('station_pickup');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = token ? parseJwt(token) : null;
    if (!token || !user) {
      setIsLoggedIn(false);
      setCheckedAuth(true);
      return;
    }
    setIsLoggedIn(true);
    setOwnerName(user?.name || '');
    setOwnerEmail(user?.email || '');
    setContact(user?.phone || '');
    setCheckedAuth(true);
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('ownerName', ownerName);
    formData.append('pnr', pnr);
    formData.append('ownerEmail', ownerEmail);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('locationLost', locationLost);
    formData.append('station', station);
    formData.append('trainNumber', trainNumber);
    formData.append('contact', contact);
    formData.append('deliveryAddress', deliveryAddress);
    formData.append('collectionPreference', collectionPreference);
    if (image) formData.append('image', image);

    try {
      await api.post('/api/lost', formData, getAuthConfig());
      setMessage('Lost item reported successfully.');
      setSubmitted(true);
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      setMessage(serverMessage || error?.message || 'Unable to submit report. Please login and try again.');
    }
  };

  if (!checkedAuth) return null;

  if (!isLoggedIn) {
    return <LoginRequired router={router} />;
  }

  if (submitted) {
    return (
      <main className="page-shell">
        <div className="page-container grid min-h-[70vh] place-items-center">
          <section className="card w-full max-w-2xl p-10 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-emerald-50 text-2xl font-black text-emerald-700">
              OK
            </div>
            <h1 className="mt-6 text-4xl font-black text-slate-950">Report submitted successfully</h1>
            <p className="mt-3 text-slate-600">Your tracking ID is ready for follow-up.</p>
            <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
              <p className="text-sm font-semibold text-slate-600">Tracking ID</p>
              <p className="mt-2 text-3xl font-black tracking-wide text-emerald-800">LF2024TR1234</p>
            </div>
            <button onClick={() => router.push('/dashboard')} className="primary-btn mt-8">
              Go to Dashboard
            </button>
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
            <div className="brand-mark">L</div>
            <div>
              <p className="text-base font-black text-slate-950">Report Lost Item</p>
              <p className="text-sm text-slate-500">Passenger report intake</p>
            </div>
          </div>
          <button onClick={() => router.push('/dashboard')} className="secondary-btn">
            Back to Dashboard
          </button>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="card overflow-hidden">
            <div className="bg-gradient-to-br from-orange-500 to-emerald-900 p-8 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-100">Lost report</p>
              <h1 className="mt-4 text-4xl font-black">Tell us what went missing.</h1>
              <p className="mt-4 leading-7 text-orange-50">
                Add passenger identity, item details, last known train or station location, and a photo when available.
              </p>
            </div>
            <div className="grid gap-4 p-6">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-black text-slate-950">1. Passenger details</p>
                <p className="mt-2 text-sm text-slate-600">Name and contact help staff verify ownership.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-black text-slate-950">2. Last seen location</p>
                <p className="mt-2 text-sm text-slate-600">Train, coach, seat, platform, or station details improve matching.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="font-black text-slate-950">3. Image proof</p>
                <p className="mt-2 text-sm text-slate-600">Upload a reference image if you have one.</p>
              </div>
            </div>
          </aside>

          <form onSubmit={submitHandler} className="form-card">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="ownerName">Your Name</label>
                <input
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="field"
                  placeholder="Rahul Sharma"
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="pnr">PNR Number</label>
                <input
                  id="pnr"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value)}
                  className="field"
                  placeholder="PNR / ticket number"
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="contact">Contact Number</label>
                <input
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="field"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="ownerEmail">Email / Gmail for Updates</label>
                <input
                  id="ownerEmail"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="field"
                  type="email"
                  placeholder="yourname@gmail.com"
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="title">Item Name</label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="field"
                  placeholder="Black Wallet"
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="collectionPreference">Return Preference</label>
                <select
                  id="collectionPreference"
                  value={collectionPreference}
                  onChange={(e) => setCollectionPreference(e.target.value)}
                  className="field"
                >
                  <option value="station_pickup">I will collect at station</option>
                  <option value="delivery">Send to my delivery address</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="field-label" htmlFor="deliveryAddress">Delivery Address / Pickup Note</label>
                <textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="textarea-field min-h-[100px]"
                  placeholder="Enter delivery address, or preferred station/counter pickup note."
                />
              </div>
              <div>
                <label className="field-label" htmlFor="station">Color / Identifier</label>
                <input
                  id="station"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  className="field"
                  placeholder="Black leather, initials RS"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="trainNumber">Train Number</label>
                <input
                  id="trainNumber"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  className="field"
                  placeholder="12345"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="locationLost">Last Location</label>
                <input
                  id="locationLost"
                  value={locationLost}
                  onChange={(e) => setLocationLost(e.target.value)}
                  className="field"
                  placeholder="Coach B2, Seat 45"
                />
              </div>
              <div className="md:col-span-2">
                <label className="field-label">Upload Image</label>
                <label className="upload-box">
                  <input type="file" onChange={(e) => setImage(e.target.files?.[0])} />
                  <span>
                    <span className="block text-3xl font-black text-slate-800">Upload</span>
                    <span className="mt-2 block text-sm">{image?.name || 'Click or drop an image reference'}</span>
                  </span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="field-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea-field"
                  placeholder="Lost my wallet containing cards and cash."
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {message && <p className="text-sm font-semibold text-slate-600">{message}</p>}
              <button className="primary-btn sm:ml-auto">Submit Lost Report</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function LoginRequired({ router }) {
  return (
    <main className="page-shell">
      <div className="page-container grid min-h-[70vh] place-items-center">
        <section className="login-panel w-full max-w-xl text-center">
          <h1 className="text-3xl font-black text-slate-950">Login before reporting a lost item</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This protects owner details and keeps your tracking record connected to your account.
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
