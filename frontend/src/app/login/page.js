'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, saveToken } from '../../lib/api';

export default function Login() {
  const [mode, setMode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const sendOtp = async () => {
    try {
      const response = await api.post('/api/otp/send', { phone, name });
      if (response.data.devOtp) {
        alert(`Your OTP is ${response.data.devOtp}`);
      } else {
        alert('OTP sent to your mobile number.');
      }
      setMessage('OTP sent. Enter it below to continue.');
    } catch (error) {
      setMessage('Unable to send OTP. Please check your mobile number.');
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await api.post('/api/otp/verify', { phone, otp });
      saveToken(response.data.token);
      router.push('/dashboard');
    } catch (error) {
      setMessage('Invalid or expired OTP.');
    }
  };

  const staffLogin = async () => {
    try {
      const response = await api.post('/api/auth/staff-login', {
        staffName,
        password: staffPassword,
      });
      saveToken(response.data.token);
      router.push('/dashboard');
    } catch (error) {
      setMessage('Invalid staff name or password.');
    }
  };

  return (
    <main className="page-shell">
      <div className="page-container">
        <nav className="page-nav">
          <div className="flex items-center gap-3">
            <div className="brand-mark">S</div>
            <div>
              <p className="text-base font-black text-slate-950">Smart Lost & Found</p>
              <p className="text-sm text-slate-500">Choose your access type</p>
            </div>
          </div>
          <button onClick={() => router.push('/')} className="secondary-btn">Back Home</button>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-600">Secure login</p>
            <h1 className="mt-5 text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
              Login as passenger or staff.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Passengers use OTP. Staff use the station staff credentials to review reports, mark not found,
              or match found items with user reports.
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => {
                  setMode('user');
                  setMessage('');
                }}
                className={`dashboard-card ${mode === 'user' ? 'border-emerald-400 ring-2 ring-emerald-100' : ''}`}
              >
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Passenger</p>
                <h2 className="mt-3 text-2xl font-black text-slate-950">User Login</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Use mobile OTP to file and track your lost reports.</p>
              </button>
              <button
                onClick={() => {
                  setMode('staff');
                  setMessage('');
                }}
                className={`dashboard-card ${mode === 'staff' ? 'border-emerald-400 ring-2 ring-emerald-100' : ''}`}
              >
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">Station team</p>
                <h2 className="mt-3 text-2xl font-black text-slate-950">Staff Login</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Use staff name and password to manage reports.</p>
              </button>
            </div>

            {mode === 'user' && (
              <section className="login-panel">
                <h2 className="text-3xl font-black text-slate-950">Passenger OTP Login</h2>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor="name">Your Name</label>
                    <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Rahul Sharma" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="phone">Mobile Number</label>
                    <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="field" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="otp">OTP</label>
                    <input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} className="field" placeholder="6 digit OTP" />
                  </div>
                  <div className="flex items-end gap-3">
                    <button onClick={sendOtp} className="secondary-btn flex-1">Send OTP</button>
                    <button onClick={verifyOtp} className="primary-btn flex-1">Verify</button>
                  </div>
                </div>
              </section>
            )}

            {mode === 'staff' && (
              <section className="login-panel">
                <h2 className="text-3xl font-black text-slate-950">Staff Login</h2>
                <p className="mt-2 text-sm text-slate-600">Default local test login: stationstaff / staff123</p>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor="staffName">Staff Name</label>
                    <input id="staffName" value={staffName} onChange={(e) => setStaffName(e.target.value)} className="field" placeholder="stationstaff" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="staffPassword">Password</label>
                    <input id="staffPassword" type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} className="field" placeholder="staff123" />
                  </div>
                </div>
                <button onClick={staffLogin} className="primary-btn mt-6 w-full">Login as Staff</button>
              </section>
            )}

            {message && <p className="rounded-xl bg-white p-4 text-center text-sm font-semibold text-slate-700 shadow-sm">{message}</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
