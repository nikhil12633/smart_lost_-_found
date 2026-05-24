'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, saveToken } from '../lib/api';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('token')));
  }, []);

  const sendOtp = async () => {
    if (!phone) {
      setMessage('Mobile number is required for OTP login.');
      return;
    }

    try {
      const response = await api.post('/api/otp/send', { phone, name });
      if (response.data.devOtp) {
        alert(`Your OTP is ${response.data.devOtp}`);
      } else {
        alert('OTP sent to your mobile number.');
      }
      setOtpSent(true);
      setMessage('OTP sent. Enter it below to continue.');
    } catch (error) {
      const errMsg = error?.response?.data?.message || error.message || 'Unable to send OTP. Please check your mobile number.';
      setMessage(errMsg);
      console.error('OTP send failed:', error);
    }
  };

  const verifyOtp = async () => {
    if (!phone || !otp) {
      setMessage('Phone and OTP are required.');
      return;
    }

    try {
      const response = await api.post('/api/otp/verify', { phone, otp });
      saveToken(response.data.token);
      setIsLoggedIn(true);
      setMessage('OTP verified. Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error) {
      const errMsg = error?.response?.data?.message || error.message || 'Invalid or expired OTP.';
      setMessage(errMsg);
      console.error('OTP verify failed:', error);
    }
  };

  const loginHandler = async () => {
    if (!phone) {
      setMessage('Mobile number is required.');
      return;
    }

    if (!password) {
      return sendOtp();
    }

    try {
      const response = await api.post('/api/auth/login', { phone, password });
      saveToken(response.data.token);
      setIsLoggedIn(true);
      setMessage('Login successful. Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error) {
      setMessage('Login failed. Please check your mobile number or password.');
    }
  };

  const goProtected = (href) => {
    if (!isLoggedIn) {
      setMessage('Please login first to continue.');
      router.push('/login');
      return;
    }
    router.push(href);
  };

  return (
    <main className="page-shell">
      <div className="page-container">
        <nav className="page-nav">
          <div className="flex items-center gap-3">
            <div className="brand-mark">S</div>
            <div>
              <p className="text-base font-black text-slate-950">Smart Lost & Found</p>
              <p className="text-sm text-slate-500">Railway recovery portal</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => router.push('/track')} className="secondary-btn">
              Track Item
            </button>
            <button onClick={() => goProtected('/dashboard')} className="primary-btn">
              Dashboard
            </button>
          </div>
        </nav>

        <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Secure reporting for passengers, staff, and station admins
            </span>
            <div>
              <h1 className="text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
                Find, verify, and return lost items faster.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                A professional lost-and-found workflow for stations: passengers report items, staff verify matches,
                admins dispatch returns, and everyone tracks status from one clean portal.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="metric-card">
                <p className="text-3xl font-black text-emerald-700">24/7</p>
                <p className="mt-2 text-sm text-slate-600">Self-service reporting</p>
              </div>
              <div className="metric-card">
                <p className="text-3xl font-black text-emerald-700">OTP</p>
                <p className="mt-2 text-sm text-slate-600">Secure delivery handoff</p>
              </div>
              <div className="metric-card">
                <p className="text-3xl font-black text-emerald-700">Live</p>
                <p className="mt-2 text-sm text-slate-600">Status tracking</p>
              </div>
            </div>
          </div>

          <section id="login-panel" className="login-panel">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Login required</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">Continue to reporting</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Login before opening the dashboard or submitting a lost/found report.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="field-label" htmlFor="name">Name</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field"
                  placeholder="Rahul Sharma"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="phone">Mobile Number</label>
                <input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="field"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="password">Password (optional)</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field"
                  placeholder="Leave blank to login with OTP"
                />
              </div>
              {otpSent && (
                <div>
                  <label className="field-label" htmlFor="otp">OTP</label>
                  <input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="field"
                    placeholder="Enter the 6-digit OTP"
                  />
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={loginHandler} className="primary-btn w-full">
                  {password ? 'Login' : otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
                {otpSent && (
                  <button onClick={verifyOtp} className="secondary-btn w-full">
                    Verify OTP
                  </button>
                )}
              </div>
              <p className="text-xs leading-5 text-slate-500">
                If you do not have a password, leave the password field blank and request an OTP to sign up or sign in.
              </p>
              {message && <p className="text-center text-sm font-semibold text-slate-600">{message}</p>}
            </div>
          </section>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          <button onClick={() => goProtected('/report-lost')} className="dashboard-card">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">Passenger</p>
            <h3 className="mt-3 text-2xl font-black text-slate-950">Report Lost Item</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Add owner details, train location, contact, and image proof.</p>
          </button>
          <button onClick={() => goProtected('/report-found')} className="dashboard-card">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Staff</p>
            <h3 className="mt-3 text-2xl font-black text-slate-950">Report Found Item</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Upload received item details and surface possible matches.</p>
          </button>
          <button onClick={() => router.push('/track')} className="dashboard-card">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">Tracking</p>
            <h3 className="mt-3 text-2xl font-black text-slate-950">Track My Item</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Check verification, station arrival, dispatch, and delivery status.</p>
          </button>
        </section>
      </div>
    </main>
  );
}
